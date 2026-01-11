"""
Script to generate mock clock data for all users for the past 7 days.
Run with: docker exec -it backend python -m app.generate_mock_clocks
"""
from sqlmodel import Session, select
from datetime import datetime, timezone, timedelta
import random
from app.database import engine
from app.models import User, Clock


def generate_mock_clocks():
    with Session(engine) as session:
        # Get all users
        users = session.exec(select(User)).all()
        
        if not users:
            print("No users found in database")
            return
        
        # Delete existing clocks (optional - comment out to keep existing data)
        # session.exec(delete(Clock))
        # session.commit()
        
        clocks_created = 0
        today = datetime.now(timezone.utc).date()
        
        for user in users:
            print(f"Generating clocks for {user.first_name} {user.last_name}...")
            
            # Generate clocks for the past 7 days (excluding weekends)
            for days_ago in range(7, 0, -1):
                day = today - timedelta(days=days_ago)
                
                # Skip weekends
                if day.weekday() >= 5:  # Saturday = 5, Sunday = 6
                    continue
                
                # Random chance to "miss" a day (10% chance)
                if random.random() < 0.1:
                    continue
                
                # Random clock in time between 8:30 and 9:30
                clock_in_hour = 8 if random.random() < 0.5 else 9
                clock_in_minute = random.randint(0, 59) if clock_in_hour == 9 else random.randint(30, 59)
                
                # Add some variation - occasionally late (after 9:00)
                if random.random() < 0.2:  # 20% chance of being late
                    clock_in_hour = 9
                    clock_in_minute = random.randint(5, 45)
                
                clock_in = datetime(
                    day.year, day.month, day.day,
                    clock_in_hour, clock_in_minute,
                    random.randint(0, 59),
                    tzinfo=timezone.utc
                )
                
                # Random clock out time between 17:00 and 19:00
                clock_out_hour = random.choice([17, 17, 17, 18, 18, 19])  # Weighted towards 17-18
                clock_out_minute = random.randint(0, 59)
                
                # Ensure minimum 7 hours worked
                min_clock_out = clock_in + timedelta(hours=7)
                
                clock_out = datetime(
                    day.year, day.month, day.day,
                    clock_out_hour, clock_out_minute,
                    random.randint(0, 59),
                    tzinfo=timezone.utc
                )
                
                # Make sure clock_out is after minimum
                if clock_out < min_clock_out:
                    clock_out = min_clock_out + timedelta(minutes=random.randint(0, 60))
                
                # Create the clock entry
                clock = Clock(
                    user_id=user.id,
                    clock_in=clock_in,
                    clock_out=clock_out
                )
                session.add(clock)
                clocks_created += 1
        
        session.commit()
        print(f"\n✅ Generated {clocks_created} clock entries for {len(users)} users")


if __name__ == "__main__":
    generate_mock_clocks()