# backend/app/tests/conftest.py
import pytest
from fastapi.testclient import TestClient  # simulates a real HTTP client to test your API without a server
from sqlmodel import SQLModel, create_engine, Session
from app.main import app  # import your FastAPI application
from app.database import get_session

# SQLite in-memory database for tests
TEST_DATABASE_URL = "sqlite:///:memory:"  # temporary database
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})  # necessary so multiple threads (pytest and FastAPI) can access the database

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    # Prevent the on_startup() call from connecting to PostgreSQL
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
