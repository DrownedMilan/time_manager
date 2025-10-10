from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr, field_validator
from typing import Optional
from datetime import datetime, timezone
import phonenumbers

# --- User model ---
class User(SQLModel, table=True):
	__tablename__ = "users"

	id: Optional[int] = Field(default=None, primary_key=True)
	first_name: str = Field(index=True, nullable=False)
	last_name: str = Field(index=True, nullable=False)
	email: EmailStr = Field(index=True, unique=True, nullable=False)
	phone_number: str = Field(index=True, unique=True)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

	clocks: list["Clock"] = Relationship(back_populates="user")

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

	# - Utilitites -

	@property
	def full_name(self) -> str:
		return f"{self.first_name} {self.last_name}"
	
# * User schemas *

class UserCreate(SQLModel):
	first_name: str
	last_name: str
	email: str
	phone_number: str

class UserPublic(SQLModel):
	id: int
	first_name: str
	last_name: str
	email: str
	phone_number: str
	created_at: datetime
	clocks: list["ClockPublic"]

class UserMinimal(SQLModel):
	id: int
	first_name: str
	last_name: str
	email: str

# --- Clock model ---
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
	clock_out: datetime | None
	user: Optional[UserMinimal]
