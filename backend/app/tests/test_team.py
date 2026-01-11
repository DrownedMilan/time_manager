# backend/app/tests/test_team.py
from app.models import Team, User

def test_team_relationships(session):
    manager = User(first_name="Marc", last_name="Durand", email="marc@durand.fr", phone_number="+33633334444")
    session.add(manager)
    session.commit()
    session.refresh(manager)

    team = Team(name="Developers", description="Backend Team", manager_id=manager.id)
    session.add(team)
    session.commit()
    session.refresh(team)

    assert team.manager_id == manager.id
    assert team.name == "Developers"
