from fastapi import FastAPI
from sqlmodel import SQLModel
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.admin_panel import setup_admin
from app.routers import users, clocks, teams
# from app.routers import auth_routes


app = FastAPI(
    title="Time Manager API",
    description="API for managing users, teams and clocks.",
    version="1.0.0",
    redirect_slashes=False,
)


# ==============================
#             CORS
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # à restreindre en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
#          DATABASE INIT
# ==============================
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


# ==============================
#           ROOT ROUTE
# ==============================
@app.get("/")
async def root():
    return {"message": "Connected to Time Manager API"}


# ==============================
#           ROUTERS
# ==============================
app.include_router(users.router)
app.include_router(clocks.router)
app.include_router(teams.router)
# app.include_router(auth_routes.router)


# ==============================
#        SQLADMIN PANEL
# ==============================
setup_admin(app, base_url="/api/admin")
