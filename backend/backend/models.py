from django.core.exceptions import ValidationError
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField


class User(models.Model):
	first_name=models.CharField(max_length=128)
	last_name=models.CharField(max_length=128)
	email_address=models.EmailField(max_length=64)
	phone_number=PhoneNumberField(region='FR')
	team=models.ForeignKey(
		'Team',
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='members'
	)
		
	@property
	def is_manager(self):
			return getattr(self, 'managed_team', None) is not None

	def __str__(self):
		return f"{self.first_name} {self.last_name}"
	
class Team(models.Model):
	name=models.CharField(max_length=64, unique=True)
	description=models.CharField(max_length=256)
	manager=models.OneToOneField(
		User, 
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='managed_team'
	)

	def __str__(self):
		return self.name
