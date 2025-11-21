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

# On ne garde QUE les rôles métier que ton app utilise
BUSINESS_ROLES = {"employee", "manager", "organization"}

# ==========================================
# JWKS CACHE
# ==========================================
jwks_cache = None


def get_jwks():
    """
    Charge la liste des clés publiques Keycloak.
    Cache la réponse pour éviter de spam l’IDP.
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
    1. Récupère le token Bearer
    2. Récupère la clé publique Keycloak (JWKS)
    3. Décode + valide le JWT
    4. Extrait les infos utilisateur
    5. Mappe Keycloak → User DB
    """

    token = credentials.credentials
    jwks = get_jwks()

    try:
        # Lire le header JWT pour récupérer le kid
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        if kid is None:
            raise HTTPException(status_code=401, detail="Invalid token header: missing kid")

        # Trouver la bonne clé dans le JWKS
        rsa_key = next((key for key in jwks["keys"] if key["kid"] == kid), None)
        if rsa_key is None:
            raise HTTPException(status_code=401, detail="Invalid token key ID")

        # Décodage du token Keycloak
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

    # Rôles : on filtre uniquement ceux dont ton app a besoin
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
        # Mise à jour des rôles si changés côté Keycloak
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
