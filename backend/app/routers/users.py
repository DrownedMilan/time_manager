from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.auth import get_current_user
from app.models import (
    User, UserCreate, UserPublic, UserUpdate,
    Clock, ClockPublic, UserMe
)

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserMe)
def get_me(user: UserPublic = Depends(get_current_user)):
    return UserMe(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        realm_roles=user.realm_roles,
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

    db_users = session.exec(select(User)).all()
    return [UserPublic.model_validate(u) for u in db_users]


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

    session.delete(db_user)
    session.commit()

    # Still valid in memory → convert before returning
    return UserPublic.model_validate(db_user)

