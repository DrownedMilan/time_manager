from django.contrib import admin
from .models import User, Team

class UserAdmin(admin.ModelAdmin):
	list_display = ("first_name", "last_name", "email_address", "is_manager")
	search_fields = ('first_name', 'last_name', "email_address", "is_manager")
	list_filter = ("team",)

	model = User
	extra = 0
	fields = ('first_name', 'last_name', 'email_address', 'phone_number', 'team', 'is_manager_display')
	readonly_fields = ('is_manager_display',)

	def is_manager_display(self, obj):
			return "✅" if obj.team and obj.team.manager_id == obj.id else "❌"

	is_manager_display.short_description = "Manager"

class UserInline(admin.StackedInline):
	model = User
	extra = 0
	max_num = 0
	show_change_link=False
	fields = ('email_address', 'phone_number')
	readonly_fields = fields

class TeamAdmin(admin.ModelAdmin):
	list_display = ('name', 'manager', 'member_count')
	search_fields = ('name', 'manager__first_name', 'manager__last_name')
	inlines = [UserInline]

	def member_count(self, obj):
			return obj.members.count()
	member_count.short_description = "Number of members"

admin.site.register(User, UserAdmin)
admin.site.register(Team, TeamAdmin)