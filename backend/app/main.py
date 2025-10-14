from fastapi import FastAPI
from sqlmodel import SQLModel
from app.database import engine
from app.routers import users, clocks, teams

app = FastAPI(
	title="Time Manager API",
	description="API for managing users in a PostgreSQL database using FastAPI and SQLModel.",
	version="1.0.0",
	# root_path="/api", Add in production
	redirect_slashes=False
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
	return {"message": "Connected to the PostgreSQL DB via SQLModel!"}

app.include_router(users.router)
app.include_router(clocks.router)
app.include_router(teams.router)