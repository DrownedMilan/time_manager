from sqladmin import Admin, ModelView
from app.main import app
from app.database import engine
from app.models import User, Team, Clock

# ---- Vues d'administration ----

class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"

    column_list = [
        User.id, User.first_name, User.last_name, User.email,
        User.phone_number, User.team_id, User.created_at
    ]
    column_searchable_list = [
        User.first_name, User.last_name, User.email, User.phone_number
    ]
    column_sortable_list = [User.id, User.created_at]
    
    form_columns = [
        User.first_name,
        User.last_name,
        User.email,
        User.phone_number,
        User.team_id,
        User.clocks,
        User.managed_team,
        User.team
    ]

    form_args = {
    "first_name": {"label": "First Name"},
    "last_name": {"label": "Last Name"},
    "email": {"label": "Email Address"},
    "phone_number": {"label": "Phone Number"},
    "team_id": {"label": "Team"},
    "clocks": {"label": "Clocks"},
    "Managed Team": {"label": "Managed Team"},
    "Team": {"label": "Team"},
}

class TeamAdmin(ModelView, model=Team):
    name = "Team"
    name_plural = "Teams"
    icon = "fa-solid fa-users"

    column_list = [Team.id, Team.name, Team.manager_id, Team.created_at]
    column_searchable_list = [Team.name, Team.description]
    column_sortable_list = [Team.id, Team.created_at]
    form_excluded_columns = [Team.members, Team.manager]

class ClockAdmin(ModelView, model=Clock):
    name = "Clock"
    name_plural = "Clocks"
    icon = "fa-regular fa-clock"

    column_list = [Clock.id, Clock.user_id, Clock.clock_in, Clock.clock_out]
    column_sortable_list = [Clock.clock_in, Clock.clock_out]

# ---- Initialisation SQLAdmin ----
# Ton FastAPI a root_path="/api" => le panneau sera servi sous /api/admin
admin = Admin(app, engine, base_url="/admin")
admin.add_view(UserAdmin)
admin.add_view(TeamAdmin)
admin.add_view(ClockAdmin)
