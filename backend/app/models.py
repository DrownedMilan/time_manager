from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr, field_validator
from typing import Optional
from datetime import datetime, timezone
import phonenumbers

# *** User model ***
class User(SQLModel, table=True):
	__tablename__ = "users"

	id: Optional[int] = Field(default=None, primary_key=True)
	first_name: str = Field(index=True, nullable=False)
	last_name: str = Field(index=True, nullable=False)
	email: EmailStr = Field(index=True, unique=True, nullable=False)
	phone_number: str = Field(index=True, unique=True)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

	clocks: list["Clock"] = Relationship(back_populates="user")
	team_id: Optional[int] = Field(default=None, foreign_key="teams.id")

	team: Optional["Team"] = Relationship(
		back_populates="members",
		sa_relationship_kwargs={"foreign_keys": "[User.team_id]"}
	)
	managed_team: Optional["Team"] = Relationship(
		back_populates="manager",
		sa_relationship_kwargs={"foreign_keys": "[Team.manager_id]"}
	)

	# - Validators -

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
	def validate_phone_number(cls, v):
		try:
			number = phonenumbers.parse(v, "FR")
			if not phonenumbers.is_valid_number(number):
				raise ValueError("Invalid phone number")
			return phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164)
		except phonenumbers.NumberParseException:
			raise ValueError("Invalid phone number format")

	# - Utilities -

	@property
	def full_name(self) -> str:
		return f"{self.first_name} {self.last_name}"
	
# * User schemas *
class UserCreate(SQLModel):
	first_name: str
	last_name: str
	email: EmailStr
	phone_number: str

class UserPublic(SQLModel):
	id: int
	first_name: str
	last_name: str
	email: str
	phone_number: str
	created_at: datetime
	clocks: list["ClockPublic"]
	managed_team: Optional["Team"]
	team: Optional["Team"]

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

# *** Clock model ***
class Clock(SQLModel, table=True):
	__tablename__ = "clocks"
	
	id: Optional[int] = Field(default=None, primary_key=True)
	user_id: int = Field(foreign_key="users.id", index=True)
	clock_in: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
	clock_out: Optional[datetime] = Field(default=None)
	user: Optional[User] = Relationship(back_populates="clocks")

# - Clock schemas -
class ClockCreate(SQLModel):
	user_id: int

class ClockPublic(SQLModel):
	id: int
	user_id: int
	clock_in: datetime
	clock_out: Optional[datetime]
	user: Optional[UserMinimal]

# *** Team model ***
class Team(SQLModel, table=True):
	__tablename__ = "teams"

	id: Optional[int] = Field(default=None, primary_key=True)
	name: str = Field(index=True, unique=True, nullable=False)
	description: str = Field(index=True, nullable=False)
	manager_id: Optional[int] = Field(default=None, foreign_key="users.id")
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

	manager: Optional["User"] = Relationship(
		back_populates="managed_team",
		sa_relationship_kwargs={"foreign_keys": "[Team.manager_id]"}
	)
	members: list["User"] = Relationship(
		back_populates="team",
		sa_relationship_kwargs={"foreign_keys": "[User.team_id]"}
	)

class TeamCreate(SQLModel):
	name: str
	description: str
	manager_id: Optional[int] = None
	
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

class TeamMinimal(SQLModel):
	id: int
	name: str
	manager: Optional[UserMinimal]