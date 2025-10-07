from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

class User(models.Model):
	first_name=models.CharField(max_length=128)
	last_name=models.CharField(max_length=128)
	email_address=models.EmailField(max_length=128)
	phone_number=PhoneNumberField(region='FR')