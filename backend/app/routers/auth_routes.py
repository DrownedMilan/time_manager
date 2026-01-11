from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models import UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])

# @router.get("/me")
# def auth_me(user: UserPublic = Depends(get_current_user)):
#     return {
#         "id": user.id,
#         "email": user.email,
#         "keycloak_id": user.keycloak_id,
#         "roles": user.realm_roles,
#     }
