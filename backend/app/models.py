from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, VARCHAR, DateTime
from sqlalchemy.dialects.postgresql import JSON
from pydantic import EmailStr, field_validator
from datetime import datetime, timezone
from typing import Optional, List
import phonenumbers


# =====================================================
#                      USER MODEL
# =====================================================

class User(SQLModel, table=True):
    __tablename__: str = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    first_name: str = Field(sa_column=Column("first_name", VARCHAR, nullable=False))
    last_name: str = Field(sa_column=Column("last_name", VARCHAR, nullable=False))

    email: EmailStr = Field(
        sa_column=Column("email", VARCHAR, unique=True, nullable=False, index=True)
    )

    phone_number: Optional[str] = Field(
        default=None,
        sa_column=Column("phone_number", VARCHAR, unique=True, nullable=True),
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False
        )
    )

    keycloak_id: str = Field(
        default="",
        sa_column=Column("keycloak_id", VARCHAR, unique=True, nullable=False, index=True),
    )

    realm_roles: List[str] = Field(
        sa_column=Column("realm_roles", JSON, nullable=False, default=list)
    )

    # Relations
    clocks: List["Clock"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    team_id: Optional[int] = Field(default=None, foreign_key="teams.id")
    
    team: Optional["Team"] = Relationship(
        back_populates="members",
        sa_relationship_kwargs={"foreign_keys": "User.team_id"}
    )

    managed_team: Optional["Team"] = Relationship(
        back_populates="manager",
        sa_relationship_kwargs={"foreign_keys": "Team.manager_id"}
    )

    # Validators
    @field_validator("first_name")
    def normalize_first_name(cls, v):
        return v.strip().capitalize()

    @field_validator("last_name")
    def normalize_last_name(cls, v):
        return v.strip().upper()

    @field_validator("email")
    def normalize_email(cls, v):
        return v.strip().lower()

    @field_validator("phone_number")
    def validate_phone(cls, v):
        if not v:
            return None
        try:
            number = phonenumbers.parse(v, "FR")
            if not phonenumbers.is_valid_number(number):
                raise ValueError("Invalid phone number")
            return phonenumbers.format_number(
                number,
                phonenumbers.PhoneNumberFormat.E164
            )
        except Exception:
            raise ValueError("Invalid phone number format")


# =====================================================
#                      CLOCK MODEL
# =====================================================

class Clock(SQLModel, table=True):
    __tablename__: str = "clocks"

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(foreign_key="users.id")

    clock_in: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            "clock_in",
            DateTime(timezone=True),
            nullable=False
        )
    )

    clock_out: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            "clock_out",
            DateTime(timezone=True),
            nullable=True
        )
    )

    user: Optional[User] = Relationship(back_populates="clocks")


# =====================================================
#                      TEAM MODEL
# =====================================================

class Team(SQLModel, table=True):
    __tablename__: str = "teams"

    id: Optional[int] = Field(default=None, primary_key=True)

    name: str = Field(sa_column=Column("name", VARCHAR, unique=True, nullable=False))
    description: str = Field(sa_column=Column("description", VARCHAR, nullable=False))

    manager_id: Optional[int] = Field(default=None, foreign_key="users.id")

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False
        )
    )

    manager: Optional[User] = Relationship(
        back_populates="managed_team",
        sa_relationship_kwargs={"foreign_keys": "Team.manager_id"}
    )

    members: List[User] = Relationship(
        back_populates="team",
        sa_relationship_kwargs={"foreign_keys": "User.team_id"}
    )



# =====================================================
#                     SCHEMAS
# =====================================================

# Simple team info for UserPublic (no manager to avoid circular ref)
class TeamBasic(SQLModel):
    id: int
    name: str


class UserPublic(SQLModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str]
    created_at: datetime
    keycloak_id: str
    realm_roles: List[str]
    team_id: Optional[int] = None
    team: Optional[TeamBasic] = None
    managed_team: Optional[TeamBasic] = None  # Add this


class UserMinimal(SQLModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    realm_roles: List[str] = []


class UserCreate(SQLModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    keycloak_id: str = ""
    realm_roles: List[str] = []

class UserUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None


class ClockCreate(SQLModel):
    user_id: int


class ClockPublic(SQLModel):
    id: int
    user_id: int
    clock_in: datetime
    clock_out: Optional[datetime]
    user: Optional[UserMinimal]


class TeamMinimal(SQLModel):
    id: int
    name: str
    manager: Optional[UserMinimal] = None


class TeamPublic(SQLModel):
    id: int
    name: str
    description: str
    manager_id: Optional[int]
    created_at: datetime
    manager: Optional[UserMinimal]
    members: List[UserMinimal]


class TeamCreate(SQLModel):
    name: str
    description: str
    manager_id: Optional[int] = None


class TeamUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None


class UserMe(SQLModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    role: str
    created_at: datetime
    team: Optional[TeamMinimal] = None