from fastapi import Depends, HTTPException, status
from app.auth import get_current_user
from app.models import UserPublic

def requires_role(required_role: str):
    def dependency(user: UserPublic = Depends(get_current_user)):
        if required_role not in user.realm_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required role: {required_role}"
            )
        return user
    return dependency
