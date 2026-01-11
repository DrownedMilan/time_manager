from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timezone
from app.database import get_session
from app.models import User, Clock, ClockCreate, ClockPublic

router = APIRouter(prefix="/clocks", tags=["clocks"])


@router.post("/", response_model=ClockPublic)
async def create_clock(
    clock: ClockCreate,
    session: Session = Depends(get_session)
) -> ClockPublic:

    db_user = session.get(User, clock.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check active clock
    statement = select(Clock).where(
        Clock.user_id == clock.user_id,
        Clock.clock_out == None  # noqa: E711
    )
    db_clock = session.exec(statement).first()

    # Close active clock if exists
    if db_clock:
        db_clock.clock_out = datetime.now(timezone.utc)
        session.add(db_clock)
        session.commit()
        session.refresh(db_clock)
        return ClockPublic.model_validate(db_clock)

    # Create new clock
    new_clock = Clock(**clock.model_dump())
    session.add(new_clock)
    session.commit()
    session.refresh(new_clock)
    return ClockPublic.model_validate(new_clock)


@router.get("/", response_model=list[ClockPublic])
async def read_clocks(
    session: Session = Depends(get_session)
) -> list[ClockPublic]:

    db_clocks = session.exec(select(Clock)).all()
    return [ClockPublic.model_validate(c) for c in db_clocks]


@router.get("/{clock_id}", response_model=ClockPublic)
async def read_clock(
    clock_id: int,
    session: Session = Depends(get_session)
) -> ClockPublic:

    db_clock = session.get(Clock, clock_id)
    if not db_clock:
        raise HTTPException(status_code=404, detail="Clock not found")

    return ClockPublic.model_validate(db_clock)
