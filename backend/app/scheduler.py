from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlmodel import Session, select
from datetime import datetime, timezone
from app.database import engine
from app.models import Clock

scheduler = AsyncIOScheduler()

def auto_clock_out_past_midnight():
    """
    Close any clock entries that are still open from before today.
    Sets clock_out to 23:59:59 of the clock_in day.
    """
    with Session(engine) as session:
        # Get current date at midnight (start of today)
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Find all open clocks where clock_in is before today
        statement = select(Clock).where(
            Clock.clock_out.is_(None),
            Clock.clock_in < today_start
        )
        open_clocks = session.exec(statement).all()
        
        for clock in open_clocks:
            # Set clock_out to 23:59:59 of the clock_in day
            clock_in_date = clock.clock_in.date()
            clock.clock_out = datetime.combine(
                clock_in_date,
                datetime.max.time().replace(microsecond=0),  # 23:59:59
                tzinfo=timezone.utc
            )
            session.add(clock)
        
        if open_clocks:
            session.commit()
            print(f"[Scheduler] Auto clocked out {len(open_clocks)} users who stayed past midnight")
        else:
            print("[Scheduler] No open clocks from previous days found")

def start_scheduler():
    # Run every day at 00:01 UTC
    scheduler.add_job(
        auto_clock_out_past_midnight,
        CronTrigger(hour=0, minute=1),
        id="auto_clock_out",
        replace_existing=True
    )
    scheduler.start()
    print("[Scheduler] Started - auto clock-out job scheduled for 00:01 daily")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Shutdown complete")