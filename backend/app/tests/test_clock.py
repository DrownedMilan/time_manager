from datetime import datetime, timezone
from app.models import Clock, User

def test_clock_creation(session):
    user = User(
        first_name="Léo",
        last_name="Dupont",
        email="leo@dupont.fr",
        phone_number="+33611112222"
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    clock = Clock(user_id=user.id)
    session.add(clock)
    session.commit()
    session.refresh(clock)

    assert clock.id is not None

    # ✅ correction : rendre clock_in "timezone-aware"
    clock_in_aware = clock.clock_in.replace(tzinfo=timezone.utc)
    assert clock_in_aware <= datetime.now(timezone.utc)
