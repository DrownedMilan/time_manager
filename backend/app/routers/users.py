from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, UserCreate, UserPublic, UserUpdate, Clock, ClockPublic

router = APIRouter(prefix="/users", tags=["users"])

# *** Users ***
@router.post("/", response_model=UserPublic)
async def create_user(user: UserCreate, session: Session = Depends(get_session)) -> UserPublic:
	existing_user = session.exec(select(User).where((User.email == user.email) | (User.phone_number == user.phone_number))).first()
	if existing_user:
		raise HTTPException(status_code=409, detail="User already exists")
	db_user = User(**user.model_dump())
	# ✅ user.model_dump() → converts your UserCreate Pydantic model → dict
	# ✅ User(**dict) → constructs your ORM model from that dict
	# ✅ Together: bridge between Pydantic (validation layer) and SQLModel (database layer)
	session.add(db_user)
	session.commit()
	session.refresh(db_user)
	return db_user

@router.get("/", response_model=list[UserPublic])
async def read_users(session: Session = Depends(get_session)) -> list[UserPublic]:
	db_users = session.exec(select(User)).all()
	return db_users

@router.get("/{user_id}", response_model=UserPublic)
async def read_user(user_id: int, session: Session = Depends(get_session)) -> UserPublic:
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")
	return db_user

@router.put("/{user_id}", response_model=UserPublic)
async def update_user(user_id: int, user: UserUpdate, session: Session = Depends(get_session)) -> UserPublic:
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")
	user_data = user.model_dump(exclude_unset=True)
	db_user.sqlmodel_update(user_data)
	session.add(db_user)
	session.commit()
	session.refresh(db_user)
	return db_user

@router.get("/{user_id}/clocks/", response_model=list[ClockPublic])
async def read_user_clocks(user_id: int, session: Session = Depends(get_session)) -> list[ClockPublic]:
	statement = select(Clock).where(Clock.user_id == user_id)
	user_clocks = session.exec(statement).all()
	return user_clocks

@router.delete("/{user_id}", response_model=UserPublic)
async def delete_user(user_id: int, session: Session = Depends(get_session)) -> UserPublic:
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")
	session.delete(db_user)
	session.commit()
	return db_user
