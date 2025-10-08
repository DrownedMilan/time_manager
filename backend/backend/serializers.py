from rest_framework import serializers
from .models import User, Team


class UserSerializer(serializers.ModelSerializer):
	team_info = serializers.SerializerMethodField()

	class Meta:
		model = User
		fields = ['id', 'first_name', 'last_name', 'email_address', 'phone_number', 'team_info']
	
	def get_team_info(self, obj):
		if not obj.team:
			return None
		return {
				'team': obj.team.id if obj.team else None,
				'team_name': obj.team.name if obj.team else None,
				'is_manager': getattr(obj, 'is_manager', False)
		}

class TeamSerializer(serializers.ModelSerializer):
	id = serializers.ReadOnlyField()
	manager = serializers.StringRelatedField()
	members = serializers.StringRelatedField(many=True, read_only=True)

	class Meta:
		model = Team
		fields = ['id', 'name', 'description', 'manager', 'members']
