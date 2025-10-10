from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, Session, select
from app.database import engine, get_session
from app.models import User, Clock, UserCreate, UserPublic, ClockCreate, ClockPublic
from datetime import datetime, timezone

app = FastAPI(
	title="Time Manager API",
	description="API for managing users in a PostgreSQL database using FastAPI and SQLModel.",
	version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

# 🔹 Autoriser le front (React) à communiquer avec le back
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
	SQLModel.metadata.create_all(engine)

@app.get("/")
async def root():
	return {"message": "Connected to PostgreSQL via SQLModel!"}

# --- Users ---
@app.post("/users/", response_model=UserPublic)
async def create_user(user: UserCreate, session: Session = Depends(get_session)) -> UserPublic:
	db_user = User.model_validate(user)
	session.add(db_user)
	session.commit()
	session.refresh(db_user)
	return db_user

@app.get("/users/", response_model=list[UserPublic])
async def read_users(session: Session = Depends(get_session)) -> list[UserPublic]:
	users = session.exec(select(User)).all()
	return users

@app.get("/users/{user_id}", response_model=UserPublic)
async def read_user(user_id: int, session: Session = Depends(get_session)) -> UserPublic:
	user = session.get(User, user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	return user

@app.put("/users/{user_id}", response_model=UserPublic)
async def update_user(user_id: int, user: UserCreate, session: Session = Depends(get_session)) -> UserPublic:
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")
	user_data = user.model_dump(exclude_unset=True)
	db_user.sqlmodel_update(user_data)
	session.add(db_user)
	session.commit()
	session.refresh(db_user)
	return db_user

@app.get("/users/{user_id}/clocks/", response_model=list[ClockPublic])
async def read_user_clocks(user_id : int, session: Session = Depends(get_session)) -> list[ClockPublic]:
	statement = select(Clock).where(Clock.user_id == user_id)
	user_clocks = session.exec(statement).all()
	return user_clocks

@app.delete("/users/{user_id}", response_model=UserPublic)
async def delete_user(user_id: int, session: Session = Depends(get_session)) -> UserPublic:
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")
	session.delete(db_user)
	session.commit()
	return db_user

# --- Clocks ---
@app.post("/clocks/", response_model=ClockPublic)
async def create_clock(clock: ClockCreate, session: Session = Depends(get_session)) -> ClockPublic:
	statement = select(Clock).where(Clock.user_id == clock.user_id, Clock.clock_out.is_(None))
	existing_clock = session.exec(statement).first()

	if existing_clock:
		existing_clock.clock_out = datetime.now(timezone.utc)
		session.add(existing_clock)
		session.commit()
		session.refresh(existing_clock)
		return existing_clock
	new_clock = Clock.model_validate(clock)
	session.add(new_clock)
	session.commit()
	session.refresh(new_clock)
	return new_clock

@app.get("/clocks/", response_model=list[ClockPublic])
async def read_clocks(session: Session = Depends(get_session)) -> list[ClockPublic]:
	db_clocks = session.exec(select(Clock)).all()
	return db_clocks

# Teams