from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.database import get_session
from app.auth import get_current_user
from app.models import (
    User, UserMinimal, TeamMinimal, TeamBasic, UserCreate, UserPublic, UserUpdate,
    Clock, ClockPublic, UserMe
)

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

# Create User
@router.post("/", response_model=UserPublic)
async def create_user(
    user: UserCreate,
    session: Session = Depends(get_session)
) -> UserPublic:

    existing_user = session.exec(
        select(User).where(
            (User.email == user.email) |
            (User.phone_number == user.phone_number)
        )
    ).first()

    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    db_user = User(**user.model_dump())
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return UserPublic.model_validate(db_user)


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

    session.delete(db_user)
    session.commit()

    return response

