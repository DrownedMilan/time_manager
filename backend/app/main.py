from fastapi import FastAPI
from sqlmodel import SQLModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.scheduler import start_scheduler, shutdown_scheduler


from app.database import engine
from app.admin_panel import setup_admin
from app.routers import users, clocks, teams, kpi
# from app.routers import auth_routes


app = FastAPI(
    title="Time Manager API",
    description="API for managing users, teams and clocks.",
    version="1.0.0",
    redirect_slashes=False,
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema["servers"] = [{"url": "/api"}]
    app.openapi_schema = schema
    return app.openapi_schema

app.openapi = custom_openapi


# ==============================
#             CORS
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
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
    start_scheduler()  # Add this line


@app.on_event("shutdown")
def on_shutdown():
    shutdown_scheduler()  # Add this event


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
app.include_router(kpi.router)
# app.include_router(auth_routes.router)


# ==============================
#        SQLADMIN PANEL
# ==============================
setup_admin(app, base_url="/api/admin")
