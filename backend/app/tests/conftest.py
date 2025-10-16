# backend/app/tests/conftest.py
import pytest
from fastapi.testclient import TestClient # simule un vrai client HTTP pour tester ton API sans serveur.
from sqlmodel import SQLModel, create_engine, Session
from app.main import app # importe ton application FastAPI
from app.database import get_session

#  Base SQLite in-memory pour les tests
TEST_DATABASE_URL = "sqlite:///:memory:" #base de donnée temporaire
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False}) # nécessaire pour que plusieurs threads (pytest et FastAPI) puissent accéder à la base.

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    # On empêche l’appel au on_startup() de se connecter à PostgreSQL
    def fake_on_startup():
        SQLModel.metadata.create_all(engine)
    app.router.on_startup.clear()
    app.add_event_handler("startup", fake_on_startup)

    def get_session_override():
        yield session

    app.dependency_overrides[get_session] = get_session_override

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
