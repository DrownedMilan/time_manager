from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, Team, TeamCreate, TeamUpdate, TeamPublic

router = APIRouter(prefix="/teams", tags=["teams"])


# Create Team
@router.post("/", response_model=TeamPublic)
async def create_team(
    team: TeamCreate,
    session: Session = Depends(get_session)
) -> TeamPublic:

    if team.manager_id:
        db_user = session.get(User, team.manager_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

    existing_team = session.exec(
        select(Team).where(Team.name == team.name)
    ).first()

    if existing_team:
        raise HTTPException(status_code=409, detail="Team already exists")

    db_team = Team(**team.model_dump())
    session.add(db_team)
    session.commit()
    session.refresh(db_team)

    return TeamPublic.model_validate(db_team)


# Read All Teams
@router.get("/", response_model=list[TeamPublic])
async def read_teams(session: Session = Depends(get_session)) -> list[TeamPublic]:
    db_teams = session.exec(select(Team)).all()
    return [TeamPublic.model_validate(t) for t in db_teams]


# Read Team by ID
@router.get("/{team_id}", response_model=TeamPublic)
async def read_team(team_id: int, session: Session = Depends(get_session)) -> TeamPublic:
    db_team = session.get(Team, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    return TeamPublic.model_validate(db_team)


# Update Team
@router.put("/{team_id}", response_model=TeamPublic)
async def update_team(
    team_id: int,
    team: TeamUpdate,
    session: Session = Depends(get_session)
) -> TeamPublic:

    db_team = session.get(Team, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")

    team_data = team.model_dump(exclude_unset=True)
    db_team.sqlmodel_update(team_data)

    session.add(db_team)
    session.commit()
    session.refresh(db_team)

    return TeamPublic.model_validate(db_team)


# Add Member
@router.post("/{team_id}/members/{user_id}", response_model=TeamPublic)
async def create_team_member(
    team_id: int,
    user_id: int,
    session: Session = Depends(get_session)
) -> TeamPublic:

    db_team = session.get(Team, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail=f"[{team_id}] Team not found")

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail=f"[{user_id}] User not found")

    db_user.team_id = team_id
    session.add(db_user)
    session.commit()
    session.refresh(db_team)

    return TeamPublic.model_validate(db_team)


# Delete Member
@router.delete("/{team_id}/members/{user_id}", response_model=TeamPublic)
async def delete_team_member(
    team_id: int,
    user_id: int,
    session: Session = Depends(get_session)
) -> TeamPublic:

    db_team = session.get(Team, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail=f"[{team_id}] Team not found")

    db_user = session.get(User, user_id)
    if not db_user or db_user.team_id != team_id:
        raise HTTPException(status_code=404, detail=f"[{user_id}] User not in this team")

    db_user.team_id = None
    session.add(db_user)
    session.commit()
    session.refresh(db_team)

    return TeamPublic.model_validate(db_team)


# Delete Team
@router.delete("/{team_id}", response_model=TeamPublic)
async def delete_team(team_id: int, session: Session = Depends(get_session)) -> TeamPublic:
    db_team = session.get(Team, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")

    session.delete(db_team)
    session.commit()

    # db_team still exists in memory → return its public version
    return TeamPublic.model_validate(db_team)
