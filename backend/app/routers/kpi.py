from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.auth import get_current_user
from app.models import UserPublic, User, Team, Clock

router = APIRouter(prefix="/kpi", tags=["kpi"])


class KPISummary(BaseModel):
    totalEmployees: int
    totalTeams: int
    totalHoursThisWeek: float
    avgHoursPerShift: float
    avgLateTimeMinutes: float
    avgOvertimeHours: float


def start_of_week_utc(now: datetime) -> datetime:
    """
    ISO week: Monday 00:00 UTC -> now
    """
    # now is timezone-aware (UTC)
    monday = now - timedelta(days=now.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


@router.get("/summary", response_model=KPISummary)
def kpi_summary(
    session: Session = Depends(get_session),
):
    # --- Base counts ---
    total_employees = len(session.exec(select(User)).all())
    total_teams = len(session.exec(select(Team)).all())

    # --- Week range ---
    now = datetime.now(timezone.utc)
    week_start = start_of_week_utc(now)

    # Get clocks from the week (clock_in within the week)
    week_clocks = session.exec(
        select(Clock).where(Clock.clock_in >= week_start)
    ).all()

    # Active clocks = clock_out is NULL (regardless of week, or you can filter by week)
    active_clocks = len(session.exec(select(Clock).where(Clock.clock_out == None)).all())  # noqa: E711

    # --- Durations (in Python, simple to understand) ---
    completed_week_clocks = [c for c in week_clocks if c.clock_out is not None]

    total_hours_week = 0.0
    for c in completed_week_clocks:
        diff = (c.clock_out - c.clock_in).total_seconds()
        total_hours_week += diff / 3600.0

    avg_hours_per_shift = (
        total_hours_week / len(completed_week_clocks)
        if completed_week_clocks else 0.0
    )

    # Late time: arrival after 09:00
    late_clocks = []
    for c in week_clocks:
        clock_in = c.clock_in.astimezone(timezone.utc)
        if clock_in.hour > 9 or (clock_in.hour == 9 and clock_in.minute > 0):
            late_clocks.append(c)

    avg_late_minutes = 0.0
    if late_clocks:
        total_late_minutes = 0.0
        for c in late_clocks:
            clock_in = c.clock_in.astimezone(timezone.utc)
            scheduled = clock_in.replace(hour=9, minute=0, second=0, microsecond=0)
            total_late_minutes += (clock_in - scheduled).total_seconds() / 60.0
        avg_late_minutes = total_late_minutes / len(late_clocks)

    # Overtime: departure after 17:00 (only completed clocks)
    overtime_clocks = []
    for c in completed_week_clocks:
        clock_out = c.clock_out.astimezone(timezone.utc)
        if clock_out.hour > 17 or (clock_out.hour == 17 and clock_out.minute > 0):
            overtime_clocks.append(c)

    avg_overtime_hours = 0.0
    if overtime_clocks:
        total_overtime_hours = 0.0
        for c in overtime_clocks:
            clock_out = c.clock_out.astimezone(timezone.utc)
            scheduled = clock_out.replace(hour=17, minute=0, second=0, microsecond=0)
            total_overtime_hours += (clock_out - scheduled).total_seconds() / 3600.0
        avg_overtime_hours = total_overtime_hours / len(overtime_clocks)

    return KPISummary(
        totalEmployees=total_employees,
        totalTeams=total_teams,
        activeClocks=active_clocks,
        totalHoursThisWeek=round(total_hours_week, 2),
        avgHoursPerShift=round(avg_hours_per_shift, 2),
        avgLateTimeMinutes=round(avg_late_minutes, 1),
        avgOvertimeHours=round(avg_overtime_hours, 2),
    )
