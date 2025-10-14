from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, Clock, ClockCreate, ClockPublic
from datetime import datetime, timezone

router = APIRouter(prefix="/clocks", tags=["clocks"])

# *** Clocks ***
# Each user can have only one active clock (i.e., a clock with clock_out == None) at a time.
# If an active clock exists for the user, it will be closed (clock_out set to now) before a new clock is created.
@router.post("/", response_model=ClockPublic)
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

@router.get("/", response_model=list[ClockPublic])
async def read_clocks(session: Session = Depends(get_session)) -> list[ClockPublic]:
	db_clocks = session.exec(select(Clock)).all()
	return db_clocks

@router.get("/{clock_id}", response_model=ClockPublic)
async def read_clock(clock_id: int, session: Session = Depends(get_session)) -> ClockPublic:
	db_clock = session.get(Clock, clock_id)
	if not db_clock:
		raise HTTPException(status_code=404, detail="Clock not found")
	return db_clock
