from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.database import get_session
from app.auth import get_current_user
from app.models import (
    User, UserMinimal, TeamMinimal, TeamBasic, UserCreate, UserPublic, UserUpdate,
    Clock, ClockPublic, UserMe, PasswordChange, PasswordReset
)
from app.keycloak_admin import (
    create_keycloak_user,
    delete_keycloak_user,
    change_keycloak_user_password,
    verify_user_password,
)
import secrets
import string
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserMe)
def get_me(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Fetch the full user with team relationship from DB
    db_user = session.get(User, user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    roles = [r.lower() for r in db_user.realm_roles]

    if "organization" in roles:
        role = "organization"
    elif "manager" in roles:
        role = "manager"
    else:
        role = "employee"

    # Build team info if user has a team
    team_info = None
    if db_user.team:
        manager_info = None
        if db_user.team.manager:
            manager_info = UserMinimal(
                id=db_user.team.manager.id,
                first_name=db_user.team.manager.first_name,
                last_name=db_user.team.manager.last_name,
                email=db_user.team.manager.email,
                phone_number=db_user.team.manager.phone_number
            )
        team_info = TeamMinimal(
            id=db_user.team.id,
            name=db_user.team.name,
            manager=manager_info
        )

    return UserMe(
        id=db_user.id,
        email=db_user.email,
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        phone_number=db_user.phone_number,
        role=role,
        created_at=db_user.created_at,
        team=team_info
    )

# Create User (only for organization role)
@router.post("/", response_model=UserPublic)
async def create_user(
    user: UserCreate,
    current_user: UserPublic = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> UserPublic:
    # Check if user has permission to create users (only organization role)
    user_roles = [r.lower() for r in current_user.realm_roles]
    if "organization" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can create users"
        )

    existing_user = session.exec(
        select(User).where(
            (User.email == user.email) |
            (User.phone_number == user.phone_number)
        )
    ).first()

    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    # Generate a temporary password if not provided
    # Format: Bank{year}{special_char}{5_random_chars}
    # Use secrets for cryptographically secure random generation
    special_chars = '@#$%&'
    year = datetime.now().year
    
    # Create alphabet without ambiguous characters (i, I, l, L, o, O, 0, 1)
    alphabet = (
        string.ascii_letters.replace('i', '').replace('I', '').replace('l', '').replace('L', '').replace('o', '').replace('O', '') +
        string.digits.replace('0', '').replace('1', '')
    )
    
    # Generate 5 random characters using secrets (cryptographically secure)
    random_chars = ''.join(secrets.choice(alphabet) for _ in range(5))
    
    # Generate random special character
    random_special = secrets.choice(special_chars)
    
    temp_password = f"Bank{year}{random_special}{random_chars}"

    # Create user in Keycloak first
    try:
        # Use email as username if keycloak_id is not provided or is a placeholder
        username = user.email.split('@')[0] if not user.keycloak_id or user.keycloak_id.startswith('manual-') else user.keycloak_id
        
        keycloak_id = create_keycloak_user(
            email=user.email,
            username=username,
            password=temp_password,
            first_name=user.first_name,
            last_name=user.last_name,
            phone_number=user.phone_number if user.phone_number else None,
            realm_roles=user.realm_roles if user.realm_roles else [],
        )
    except Exception as e:
        error_msg = str(e)
        print(f"Error creating user in Keycloak: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Failed to create user in Keycloak: {error_msg}")

    # Create user in database with the Keycloak ID
    user_data = user.model_dump()
    user_data["keycloak_id"] = keycloak_id
    db_user = User(**user_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    # Return user with temporary password
    user_public = UserPublic.model_validate(db_user)
    user_public.temp_password = temp_password
    return user_public


# Read all users
@router.get("/", response_model=list[UserPublic])
async def read_users(session: Session = Depends(get_session)) -> list[UserPublic]:
    statement = select(User).options(
        selectinload(User.team),
        selectinload(User.managed_team)
    )
    db_users = session.exec(statement).all()
    
    result = []
    for u in db_users:
        user_data = UserPublic(
            id=u.id,
            email=u.email,
            first_name=u.first_name,
            last_name=u.last_name,
            phone_number=u.phone_number,
            created_at=u.created_at,
            keycloak_id=u.keycloak_id,
            realm_roles=u.realm_roles,
            team_id=u.team_id,
            team=TeamBasic(id=u.team.id, name=u.team.name) if u.team else None,
            managed_team=TeamBasic(id=u.managed_team.id, name=u.managed_team.name) if u.managed_team else None
        )
        result.append(user_data)
    
    return result


# Read single user
@router.get("/{user_id}", response_model=UserPublic)
async def read_user(
    user_id: int,
    session: Session = Depends(get_session)
) -> UserPublic:

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserPublic.model_validate(db_user)


# Update user
@router.put("/{user_id}", response_model=UserPublic)
async def update_user(
    user_id: int,
    user: UserUpdate,
    session: Session = Depends(get_session)
) -> UserPublic:

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user.model_dump(exclude_unset=True)
    db_user.sqlmodel_update(user_data)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return UserPublic.model_validate(db_user)


# Read user's clocks
@router.get("/{user_id}/clocks/", response_model=list[ClockPublic])
async def read_user_clocks(
    user_id: int,
    session: Session = Depends(get_session)
) -> list[ClockPublic]:

    statement = select(Clock).where(Clock.user_id == user_id)
    db_clocks = session.exec(statement).all()

    return [ClockPublic.model_validate(c) for c in db_clocks]


# Change password (for current user)
@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: UserPublic = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Change the password for the currently authenticated user.
    Requires the current password for verification.
    """
    # Get the user from database
    db_user = session.get(User, current_user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has a Keycloak ID
    if not db_user.keycloak_id or db_user.keycloak_id.startswith('manual-'):
        raise HTTPException(
            status_code=400,
            detail="Cannot change password: user is not managed by Keycloak"
        )
    
    # Verify current password
    if not verify_user_password(db_user.keycloak_id, password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    if password_data.current_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )
    
    # Change password in Keycloak
    try:
        change_keycloak_user_password(db_user.keycloak_id, password_data.new_password, temporary=False)
    except Exception as e:
        error_msg = str(e)
        print(f"Error changing password in Keycloak: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {error_msg}"
        )
    
    return {"message": "Password changed successfully"}


# Reset password (for organization/manager roles only)
@router.post("/{user_id}/reset-password", response_model=PasswordReset)
async def reset_user_password(
    user_id: int,
    current_user: UserPublic = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> PasswordReset:
    """
    Reset a user's password to a temporary password.
    Only accessible by organization or manager roles.
    """
    # Check if user has permission (organization or manager role)
    user_roles = [r.lower() for r in current_user.realm_roles]
    if "organization" not in user_roles and "manager" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins and managers can reset user passwords"
        )
    
    # Get the user from database
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has a Keycloak ID
    if not db_user.keycloak_id or db_user.keycloak_id.startswith('manual-'):
        raise HTTPException(
            status_code=400,
            detail="Cannot reset password: user is not managed by Keycloak"
        )
    
    # Prevent users from resetting their own password (they should use change-password)
    if db_user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot reset your own password. Use the change-password endpoint instead."
        )
    
    # Generate a temporary password
    # Format: Bank{year}{special_char}{5_random_chars}
    special_chars = '@#$%&'
    year = datetime.now().year
    alphabet = (
        string.ascii_letters.replace('i', '').replace('I', '').replace('l', '').replace('L', '').replace('o', '').replace('O', '') +
        string.digits.replace('0', '').replace('1', '')
    )
    random_chars = ''.join(secrets.choice(alphabet) for _ in range(5))
    random_special = secrets.choice(special_chars)
    temp_password = f"Bank{year}{random_special}{random_chars}"
    
    # Reset password in Keycloak (mark as temporary)
    try:
        change_keycloak_user_password(db_user.keycloak_id, temp_password, temporary=True)
    except Exception as e:
        error_msg = str(e)
        print(f"Error resetting password in Keycloak: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {error_msg}"
        )
    
    return PasswordReset(temp_password=temp_password)


# Delete user
@router.delete("/{user_id}", response_model=UserPublic)
async def delete_user(
    user_id: int,
    session: Session = Depends(get_session)
) -> UserPublic:

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # If user is a manager, unassign them from the team first
    if db_user.managed_team:
        db_user.managed_team.manager_id = None
        session.add(db_user.managed_team)

    # Delete all user's clocks first
    for clock in db_user.clocks:
        session.delete(clock)

    # Create response before deletion (while object is still valid)
    response = UserPublic.model_validate(db_user)

    # Delete user from Keycloak if keycloak_id exists and is not a placeholder
    if db_user.keycloak_id and not db_user.keycloak_id.startswith('manual-'):
        try:
            delete_keycloak_user(db_user.keycloak_id)
        except Exception as e:
            # Log error but continue with database deletion
            print(f"Warning: Failed to delete user from Keycloak: {e}")

    session.delete(db_user)
    session.commit()

    return response

