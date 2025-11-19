from sqladmin import Admin, ModelView
from sqlalchemy.orm import joinedload

from app.database import engine
from app.models import User, Team, Clock


# ============================================
#                  USER ADMIN
# ============================================
class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"

    column_list = [
        User.id,
        User.first_name,
        User.last_name,
        User.email,
        User.phone_number,
        User.team_id,
        User.created_at,
        "realm_roles_display",
    ]

    column_labels = {
        User.first_name: "First Name",
        User.last_name: "Last Name",
        User.email: "Email",
        User.phone_number: "Phone Number",
        User.team_id: "Team",
        User.created_at: "Created At",
        "realm_roles_display": "Roles",
    }

    column_searchable_list = [
        User.first_name,
        User.last_name,
        User.email,
        User.phone_number,
    ]

    column_sortable_list = [
        User.id,
        User.created_at,
        User.last_name,
    ]

    form_columns = [
        User.first_name,
        User.last_name,
        User.email,
        User.phone_number,
        User.team_id,
    ]

    column_formatters = {
        "realm_roles_display": lambda m, a: ", ".join(m.realm_roles or []),
    }

    def get_model_repr(self, obj):
        return f"{obj.last_name} {obj.first_name}"

    def realm_roles_display(self, obj):
        return ", ".join(obj.realm_roles or [])


# ============================================
#                  TEAM ADMIN
# ============================================
class TeamAdmin(ModelView, model=Team):
    name = "Team"
    name_plural = "Teams"
    icon = "fa-solid fa-users"

    column_list = [
        Team.id,
        Team.name,
        Team.manager_id,
        Team.created_at,
    ]

    column_searchable_list = [
        Team.name,
        Team.description,
    ]

    column_sortable_list = [
        Team.id,
        Team.created_at,
    ]

    form_excluded_columns = [
        Team.members,
        Team.manager,
    ]


# ============================================
#                  CLOCK ADMIN
# ============================================
class ClockAdmin(ModelView, model=Clock):
    name = "Clock"
    name_plural = "Clocks"
    icon = "fa-regular fa-clock"

    async def get_list_query(self, request):
        stmt = await super().get_list_query(request)
        return stmt.options(joinedload(Clock.user))

    column_list = [
        Clock.id,
        "user.last_name",
        "user.email",
        Clock.clock_in,
        Clock.clock_out,
    ]

    column_sortable_list = [
        Clock.id,
        "user.last_name",
        "user.email",
        Clock.clock_in,
        Clock.clock_out,
    ]

    column_labels = {
        Clock.id: "Clock ID",
        "user.last_name": "User Name",
        "user.email": "Email",
        Clock.clock_in: "Clock In",
        Clock.clock_out: "Clock Out",
    }

    column_formatters = {
        "user.last_name": lambda m, a: (
            f"{m.user.last_name} {m.user.first_name}" if m.user else "—"
        ),
    }


# ============================================
#         INITIALISATION (fix import loop)
# ============================================
def setup_admin(app):
    admin = Admin(app, engine, base_url="/admin")
    admin.add_view(UserAdmin)
    admin.add_view(TeamAdmin)
    admin.add_view(ClockAdmin)
