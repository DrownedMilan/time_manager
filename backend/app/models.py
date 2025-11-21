from __future__ import annotations

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, VARCHAR
from sqlalchemy.dialects.postgresql import JSON
from pydantic import EmailStr, field_validator
from datetime import datetime, timezone
from typing import Optional, List, ClassVar
import phonenumbers


# =====================================================
#                      USER (DB MODEL)
# =====================================================

class User(SQLModel, table=True):
    __tablename__: ClassVar[str] = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    first_name: str = Field(
        sa_column=Column("first_name", VARCHAR, nullable=False)
    )

    last_name: str = Field(
        sa_column=Column("last_name", VARCHAR, nullable=False)
    )

    email: EmailStr = Field(
        sa_column=Column("email", VARCHAR, unique=True, nullable=False, index=True)
    )

    phone_number: Optional[str] = Field(
        default=None,
        sa_column=Column("phone_number", VARCHAR, unique=True, nullable=True)
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("created_at", nullable=False)
    )

    keycloak_id: str = Field(
        default="",
        sa_column=Column("keycloak_id", VARCHAR, unique=True, nullable=False, index=True)
    )

    # Roles stockés en JSON (Keycloak)
    realm_roles: List[str] = Field(
        sa_column=Column(JSON, nullable=False, default=list)
    )

    # Relations
    clocks: list["Clock"] = Relationship(back_populates="user")

    team_id: Optional[int] = Field(default=None, foreign_key="teams.id")
    team: Optional["Team"] = Relationship(back_populates="members")

    managed_team: Optional["Team"] = Relationship(back_populates="manager")

    # Validators
    @field_validator("first_name")
    def normalize_first_name(cls, v: str) -> str:
        return v.strip().capitalize()

    @field_validator("last_name")
    def normalize_last_name(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("email")
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("phone_number")
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        try:
            number = phonenumbers.parse(v, "FR")
            if not phonenumbers.is_valid_number(number):
                raise ValueError("Invalid phone number")
            return phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164)
        except Exception:
            raise ValueError("Invalid phone number format")

    # Utility properties
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


# =====================================================
#                      USER SCHEMAS
# =====================================================

class UserCreate(SQLModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str


class UserUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None


class UserMinimal(SQLModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr


class UserMe(SQLModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    realm_roles: list[str]


class UserPublic(SQLModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str]
    created_at: datetime
    keycloak_id: str
    realm_roles: list[str]


# =====================================================
#                      CLOCK MODEL
# =====================================================

class Clock(SQLModel, table=True):
    __tablename__: ClassVar[str] = "clocks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")

    clock_in: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("clock_in", nullable=False)
    )

    clock_out: Optional[datetime] = Field(
        default=None,
        sa_column=Column("clock_out", nullable=True)
    )

    user: Optional[User] = Relationship(back_populates="clocks")


class ClockCreate(SQLModel):
    user_id: int


class ClockPublic(SQLModel):
    id: int
    user_id: int
    clock_in: datetime
    clock_out: Optional[datetime]
    user: Optional[UserMinimal]


# =====================================================
#                      TEAM MODEL
# =====================================================

class Team(SQLModel, table=True):
    __tablename__: ClassVar[str] = "teams"

    id: Optional[int] = Field(default=None, primary_key=True)

    name: str = Field(
        sa_column=Column("name", VARCHAR, unique=True, nullable=False)
    )

    description: str = Field(
        sa_column=Column("description", VARCHAR, nullable=False)
    )

    manager_id: Optional[int] = Field(default=None, foreign_key="users.id")

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("created_at", nullable=False)
    )

    manager: Optional[User] = Relationship(back_populates="managed_team")
    members: list[User] = Relationship(back_populates="team")


class TeamCreate(SQLModel):
    name: str
    description: str
    manager_id: Optional[int] = None


class TeamMinimal(SQLModel):
    id: int
    name: str
    manager: Optional[UserMinimal]


class TeamPublic(SQLModel):
    id: int
    name: str
    description: str
    manager_id: Optional[int]
    created_at: datetime
    manager: Optional[UserMinimal]
    members: list[UserMinimal]


class TeamUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None
