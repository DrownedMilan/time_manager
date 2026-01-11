from sqladmin import Admin, ModelView
from sqlalchemy.orm import joinedload
from typing import Any

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
        "id",
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "team_name",
        "created_at",
        "realm_roles_display",
    ]

    form_columns = [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "team",
    ]

    form_ajax_refs = {
        "team": {"fields": ["name"]}
    }

    column_formatters = {
        "realm_roles_display": lambda m, a: ", ".join(m.realm_roles or []),
    }

    def realm_roles_display(self, obj):
        return ", ".join(obj.realm_roles or [])

    def team_name(self, obj):
        return obj.team.name if obj.team else "—"

    def get_model_repr(self, obj):
        return f"{obj.last_name} {obj.first_name}"


# ============================================
#                  TEAM ADMIN
# ============================================

class TeamAdmin(ModelView, model=Team):
    name = "Team"
    name_plural = "Teams"
    icon = "fa-solid fa-users"

    column_list = [
        "id",
        "name",
        "manager_id",
        "created_at",
    ]

    column_searchable_list = [
        "name",
        "description",
    ]

    column_sortable_list = [
        "id",
        "created_at",
    ]

    form_excluded_columns = [
        "members",
        "manager",
    ]


# ============================================
#                  CLOCK ADMIN
# ============================================

class ClockAdmin(ModelView, model=Clock):
    name = "Clock"
    name_plural = "Clocks"
    icon = "fa-regular fa-clock"

    async def get_list_query(self, request: Any):  # type: ignore[override]
        stmt = await super().get_list_query(request)  # type: ignore[attr-defined]
        return stmt.options(
            joinedload(getattr(Clock, "user"))  # ✔ Fixed, typed, accepted by Pylance
        )

    column_list = [
        "id",
        "user.last_name",
        "user.email",
        "clock_in",
        "clock_out",
    ]

    column_sortable_list = [
        "id",
        "user.last_name",
        "user.email",
        "clock_in",
        "clock_out",
    ]

    column_labels = {
        "id": "Clock ID",
        "user.last_name": "User Name",
        "user.email": "Email",
        "clock_in": "Clock In",
        "clock_out": "Clock Out",
    }

    column_formatters = {
        "user.last_name": lambda m, a: (
            f"{m.user.last_name} {m.user.first_name}" if m.user else "—"
        ),
    }


# ============================================
#         INITIALIZATION
# ============================================

def setup_admin(app, base_url="/admin"):
    admin = Admin(app, engine, base_url=base_url)
    admin.add_view(UserAdmin)
    admin.add_view(TeamAdmin)
    admin.add_view(ClockAdmin)
