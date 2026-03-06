from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    isOrganizer = serializers.BooleanField(source='is_organizer', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'openid', 'nickname', 'avatar', 'phone', 'level', 'isOrganizer', 'created_at']
        read_only_fields = ['id', 'openid', 'isOrganizer', 'created_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    sportPref = serializers.CharField(source='sport_pref', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['nickname', 'avatar', 'phone', 'level', 'sportPref']
