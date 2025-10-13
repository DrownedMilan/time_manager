from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, Session, select
from app.database import engine, get_session
from .models import User, UserCreate, UserPublic, UserUpdate, Clock, ClockCreate, ClockPublic, Team, TeamCreate, TeamUpdate, TeamPublic
from datetime import datetime, timezone

app = FastAPI(
	title="Time Manager API",
	description="API for managing users in a PostgreSQL database using FastAPI and SQLModel.",
	version="1.0.0",
	root_path="/api"
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

# *** Users ***
@app.post("/users/", response_model=UserPublic)
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

@app.get("/users/", response_model=list[UserPublic])
async def read_users(session: Session = Depends(get_session)) -> list[UserPublic]:
	db_users = session.exec(select(User)).all()
	return db_users

@app.get("/users/{user_id}", response_model=UserPublic)
async def read_user(user_id: int, session: Session = Depends(get_session)) -> UserPublic:
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")
	return db_user

@app.put("/users/{user_id}", response_model=UserPublic)
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

@app.get("/users/{user_id}/clocks/", response_model=list[ClockPublic])
async def read_user_clocks(user_id: int, session: Session = Depends(get_session)) -> list[ClockPublic]:
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

# *** Clocks ***
# Each user can have only one active clock (i.e., a clock with clock_out == None) at a time.
# If an active clock exists for the user, it will be closed (clock_out set to now) before a new clock is created.
@app.post("/clocks/", response_model=ClockPublic)
async def create_clock(clock: ClockCreate, session: Session = Depends(get_session)) -> ClockPublic:
	db_user = session.get(User, clock.user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")

	statement = select(Clock).where(Clock.user_id == clock.user_id, Clock.clock_out.is_(None))
	db_clock = session.exec(statement).first()

	if db_clock:
		db_clock.clock_out = datetime.now(timezone.utc)
		session.add(db_clock)
		session.commit()
		session.refresh(db_clock)
		return db_clock
	new_clock = Clock(**clock.model_dump())
	session.add(new_clock)
	session.commit()
	session.refresh(new_clock)
	return new_clock

@app.get("/clocks/", response_model=list[ClockPublic])
async def read_clocks(session: Session = Depends(get_session)) -> list[ClockPublic]:
	db_clocks = session.exec(select(Clock)).all()
	return db_clocks

@app.get("/clocks/{clock_id}", response_model=ClockPublic)
async def read_clock(clock_id: int, session: Session = Depends(get_session)) -> ClockPublic:
	db_clock = session.get(Clock, clock_id)
	if not db_clock:
		raise HTTPException(status_code=404, detail="Clock not found")
	return db_clock

# *** Teams ***
@app.post("/teams/", response_model=TeamPublic)
async def create_team(team: TeamCreate, session: Session = Depends(get_session)) -> TeamPublic:
	if team.manager_id:
		db_user = session.get(User, team.manager_id)
		if not db_user:
			raise HTTPException(status_code=404, detail="User not found")
	existing_team = session.exec(select(Team).where(Team.name == team.name)).first()
	if existing_team:
		raise HTTPException(status_code=409, detail="Team already exists")
	db_team = Team(**team.model_dump())
	session.add(db_team)
	session.commit()
	session.refresh(db_team)
	return db_team

@app.get("/teams/", response_model=list[TeamPublic])
async def read_teams(session: Session = Depends(get_session)) -> list[TeamPublic]:
	db_teams = session.exec(select(Team)).all()
	return db_teams

@app.get("/teams/{team_id}", response_model=TeamPublic)
async def read_team(team_id: int, session: Session = Depends(get_session)) -> TeamPublic:
	db_team = session.get(Team, team_id)
	if not db_team:
		raise HTTPException(status_code=404, detail="Team not found")
	return db_team

@app.put("/teams/{team_id}", response_model=TeamPublic)
async def update_team(team_id: int, team: TeamUpdate, session: Session = Depends(get_session)) -> TeamPublic:
	db_team = session.get(Team, team_id)
	if not db_team:
		raise HTTPException(status_code=404, detail="Team not found")
		
	team_data = team.model_dump(exclude_unset=True)
	db_team.sqlmodel_update(team_data)
	session.add(db_team)
	session.commit()
	session.refresh(db_team)
	return db_team

# Add team member
@app.post("/teams/{team_id}/members/{user_id}", response_model=TeamPublic)
async def create_team_member(team_id: int, user_id: int, session: Session = Depends(get_session)) -> TeamPublic:
	db_team = session.get(Team, team_id)
	if not db_team:
		raise HTTPException(status_code=404, detail=f"[{team_id}] Team not found")
	
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail=f"[{user_id}] User not found")
	
	db_user.team_id = team_id
	session.add(db_user)
	session.commit()
	return db_team

# Delete team member
@app.delete("/teams/{team_id}/members/{user_id}", response_model=TeamPublic)
async def delete_team_member(team_id: int, user_id: int, session: Session = Depends(get_session)) -> TeamPublic:
	db_team = session.get(Team, team_id)
	if not db_team:
		raise HTTPException(status_code=404, detail=f"[{team_id}] Team not found")

	db_user = session.get(User, user_id)
	if not db_user or db_user.team_id != team_id:
		raise HTTPException(status_code=404, detail=f"[{user_id}] User not found in this team")
	
	db_user.team_id = None
	session.add(db_user)
	session.commit()
	return db_team

@app.delete("/teams/{team_id}", response_model=TeamPublic)
async def delete_team(team_id: int, session: Session = Depends(get_session)) -> TeamPublic:
	db_team = session.get(Team, team_id)
	if not db_team:
		raise HTTPException(status_code=404, detail="Team not found")
	session.delete(db_team)
	session.commit()
	return db_team