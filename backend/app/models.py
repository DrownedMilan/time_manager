from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
	__tablename__ = "users"

	id: int | None = Field(default=None, primary_key=True)
	first_name: str = Field(index=True, nullable=False)
	last_name: str = Field(index=True, nullable=False)
	email: str = Field(index=True, nullable=False)
	phone_number: str = Field(index=True, nullable=False)