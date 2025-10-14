from sqladmin import Admin, ModelView
from app.main import app
from app.database import engine

try:
    from app.models import User, Team, Clock
except ImportError:  
    from app.models import User, Team, Clock

# ---- Vues d'administration ----

class UserAdmin(ModelView, model=User):
    # colonnes affichées dans la liste
    column_list = [
        User.id, User.first_name, User.last_name, User.email,
        User.phone_number, User.team_id, User.created_at
    ]
    # champs recherchables
    column_searchable_list = [
        User.first_name, User.last_name, User.email, User.phone_number
    ]
    # tri
    column_sortable_list = [User.id, User.created_at]
    # éviter d'éditer les relations complexes depuis le formulaire
    form_excluded_columns = [User.clocks, User.managed_team, User.team]

class TeamAdmin(ModelView, model=Team):
    column_list = [Team.id, Team.name, Team.manager_id, Team.created_at]
    column_searchable_list = [Team.name, Team.description]
    column_sortable_list = [Team.id, Team.created_at]
    form_excluded_columns = [Team.members, Team.manager]

class ClockAdmin(ModelView, model=Clock):
    column_list = [Clock.id, Clock.user_id, Clock.clock_in, Clock.clock_out]
    column_sortable_list = [Clock.clock_in, Clock.clock_out]

# ---- Initialisation SQLAdmin ----
# Ton FastAPI a root_path="/api" => le panneau sera servi sous /api/admin
admin = Admin(app, engine, base_url="/admin")
admin.add_view(UserAdmin)
admin.add_view(TeamAdmin)
admin.add_view(ClockAdmin)
