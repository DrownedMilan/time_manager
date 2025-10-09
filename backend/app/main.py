from fastapi import FastAPI, Depends, Body
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
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

Base.metadata.create_all(bind=engine)

def get_db():
	db = SessionLocal()
	try:
		yield db	
	finally:
		db.close()

# @app.get("/")
# def read_root(db: Session = Depends(get_db)):
#	return {"message": "Connected to PostgreSQL!"}


# voir tous les utilisateurs
@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
	users = db.query(User).all()
	return users

# créer un nouvel utilisateur
@app.post("/users/")
def create_user(
	username: str = Body(...),
	email: str = Body(...),
	hashed_password: str = Body(...),
	db: Session = Depends(get_db)
):
	user = User(
		username=username,
		email=email,
		hashed_password=hashed_password
	)
	db.add(user)
	db.commit()
	db.refresh(user)
	return user