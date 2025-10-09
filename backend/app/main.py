from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, Session, select
from app.database import engine, get_session
from app.models import User

app = FastAPI(
	title="Time Manager API",
	description="API for managing users in a PostgreSQL database using FastAPI and SQLAlchemy.",
	version="1.0.0",
	docs_url="/Documentation" #swagger direct à la racine
)

from fastapi.middleware.cors import CORSMiddleware

# 🔹 Autoriser le front (React) à communiquer avec le back
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
	SQLModel.metadata.create_all(engine)

@app.get("/")
async def root():
	return {"message": "Connected to PostgreSQL via SQLModel!"}

# 'USERS' Methods
@app.post("/users/", response_model=User)
async def create_user(user: User, session: Session = Depends(get_session)) -> User:
	session.add(user)
	session.commit()
	session.refresh(user)
	return user

@app.get("/users/", response_model=list[User])
async def get_users(session: Session = Depends(get_session)) -> list[User]:
	users = session.exec(select(User)).all()
	return users

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int, session: Session = Depends(get_session)) -> User:
	user = session.get(User, user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	return user

@app.put("/users/{user_id}", response_model=User)
async def put_user(user_id: int, user: User, session: Session = Depends(get_session)) -> User:
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")
	user_data = user.model_dump(exclude_unset=True)
	db_user.sqlmodel_update(user_data)
	session.add(db_user)
	session.commit()
	session.refresh(db_user)
	return db_user

@app.delete("/users/{user_id}", response_model=User)
async def delete_user(user_id: int, session: Session = Depends(get_session)) -> User:
	db_user = session.get(User, user_id)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")
	session.delete(db_user)
	session.commit()
	return {"ok": True}