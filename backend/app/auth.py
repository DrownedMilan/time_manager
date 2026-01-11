import os
import requests
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlmodel import Session, select
from jose import jwt, JWTError

from app.database import get_session
from app.models import User, UserPublic

# ==========================================
# CONFIG
# ==========================================
load_dotenv()

bearer_scheme = HTTPBearer()

KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "time-manager")
KEYCLOAK_PUBLIC_URL = os.getenv("KEYCLOAK_PUBLIC_URL")
KEYCLOAK_INTERNAL_URL = os.getenv("KEYCLOAK_INTERNAL_URL")
KEYCLOAK_AUDIENCE = os.getenv("KEYCLOAK_AUDIENCE", "account")

KEYCLOAK_ISSUER = f"{KEYCLOAK_PUBLIC_URL}/realms/{KEYCLOAK_REALM}"
KEYCLOAK_JWKS_URL = (
    f"{KEYCLOAK_INTERNAL_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"
)

# Only keep business roles that the app uses
BUSINESS_ROLES = {"employee", "manager", "organization"}

# ==========================================
# JWKS CACHE
# ==========================================
jwks_cache = None


def get_jwks():
    """
    Load the list of Keycloak public keys.
    Cache the response to avoid spamming the IDP.
    """
    global jwks_cache

    if jwks_cache is None:
        resp = requests.get(KEYCLOAK_JWKS_URL)
        resp.raise_for_status()
        jwks_cache = resp.json()

    return jwks_cache


# ==========================================
# TOKEN VALIDATION
# ==========================================
def get_current_user(
    credentials=Depends(bearer_scheme),
    session: Session = Depends(get_session),
):
    """
    1. Retrieve the Bearer token
    2. Retrieve the Keycloak public key (JWKS)
    3. Decode + validate the JWT
    4. Extract user information
    5. Map Keycloak → User DB
    """

    token = credentials.credentials
    jwks = get_jwks()

    try:
        # Read the JWT header to retrieve the kid
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        if kid is None:
            raise HTTPException(status_code=401, detail="Invalid token header: missing kid")

        # Find the correct key in the JWKS
        rsa_key = next((key for key in jwks["keys"] if key["kid"] == kid), None)
        if rsa_key is None:
            raise HTTPException(status_code=401, detail="Invalid token key ID")

        # Decode the Keycloak token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=KEYCLOAK_AUDIENCE,
            issuer=KEYCLOAK_ISSUER,
        )

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    # ==========================================
    # EXTRACTION DES INFOS DU PROFIL KEYCLOAK
    # ==========================================
    keycloak_id = payload.get("sub")
    email = payload.get("email")
    first_name = payload.get("given_name", "")
    last_name = payload.get("family_name", "")

    if not keycloak_id:
        raise HTTPException(status_code=401, detail="Token missing subject (sub)")

    # Roles: filter only those that the app needs
    full_roles = payload.get("realm_access", {}).get("roles", [])
    realm_roles = [r for r in full_roles if r in BUSINESS_ROLES]

    # ==========================================
    # USER DB : fetch ou auto-create
    # ==========================================
    stmt = select(User).where(User.keycloak_id == keycloak_id)
    user = session.exec(stmt).first()

    if not user:
        user = User(
            keycloak_id=keycloak_id,
            email=email or f"{keycloak_id}@unknown.local",
            first_name=first_name,
            last_name=last_name,
            phone_number=None,
            realm_roles=realm_roles,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    else:
        # Update roles if changed on Keycloak side
        if user.realm_roles != realm_roles:
            user.realm_roles = realm_roles
            session.add(user)
            session.commit()
            session.refresh(user)

    # ==========================================
    # USER PUBLIC
    # ==========================================
    user_public = UserPublic.model_validate(user)
    user_public.realm_roles = realm_roles

    return user_public
