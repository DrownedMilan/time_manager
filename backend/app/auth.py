import requests
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from sqlmodel import Session, select
import os
from dotenv import load_dotenv

from app.database import get_session
from app.models import User, UserPublic

bearer_scheme = HTTPBearer()

load_dotenv()

KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "time-manager")
KEYCLOAK_PUBLIC_URL = os.getenv("KEYCLOAK_PUBLIC_URL")
KEYCLOAK_INTERNAL_URL = os.getenv("KEYCLOAK_INTERNAL_URL")
KEYCLOAK_AUDIENCE = os.getenv("KEYCLOAK_AUDIENCE", "account")

KEYCLOAK_ISSUER = f"{KEYCLOAK_PUBLIC_URL}/realms/{KEYCLOAK_REALM}"

KEYCLOAK_JWKS_URL = (
    f"{KEYCLOAK_INTERNAL_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"
)

jwks_cache = None


def get_jwks():
    global jwks_cache
    if jwks_cache is None:
        resp = requests.get(KEYCLOAK_JWKS_URL)
        resp.raise_for_status()
        jwks_cache = resp.json()
    return jwks_cache


def get_current_user(
    credentials=Depends(bearer_scheme),
    session: Session = Depends(get_session),
):
    token = credentials.credentials
    jwks = get_jwks()

    # ---- Decode + validate token ----
    try:
        header = jwt.get_unverified_header(token)
        rsa_key = next((key for key in jwks["keys"] if key["kid"] == header["kid"]), None)

        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid token headers")

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=KEYCLOAK_AUDIENCE,   # ← petite correction
            issuer=KEYCLOAK_ISSUER,
        )

        realm_roles = payload.get("realm_access", {}).get("roles", [])

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token {e}")

    # ---- Extract Keycloak fields ----
    keycloak_id = payload.get("sub")
    email = payload.get("email")
    first_name = payload.get("given_name", "")
    last_name = payload.get("family_name", "")

    if not keycloak_id:
        raise HTTPException(status_code=401, detail="Token missing subject")

    # ---- Check if user exists in DB ----
    stmt = select(User).where(User.keycloak_id == keycloak_id)
    user = session.exec(stmt).first()

    # ---- Auto-provision if not exists ----
    if not user:
        user = User(
            keycloak_id=keycloak_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number="0000000000",
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    # ---- Convert SQLModel → UserPublic and attach roles ----
    user_public = UserPublic.model_validate(user)
    user_public.realm_roles = realm_roles

    return user_public
