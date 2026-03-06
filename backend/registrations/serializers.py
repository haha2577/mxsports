from rest_framework import serializers
from .models import Registration


class RegistrationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Registration
        fields = ['level', 'remark']


class RegistrationSerializer(serializers.ModelSerializer):
    userId   = serializers.IntegerField(source='user_id', read_only=True)
    nickname = serializers.CharField(source='user.nickname', read_only=True)
    avatar   = serializers.CharField(source='user.avatar', read_only=True)
    createdAt= serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model  = Registration
        fields = ['id', 'userId', 'nickname', 'avatar', 'level', 'remark', 'status', 'createdAt']


class MyRegistrationSerializer(serializers.ModelSerializer):
    id           = serializers.IntegerField(source='match.id', read_only=True)
    name         = serializers.CharField(source='match.name', read_only=True)
    location     = serializers.CharField(source='match.location', read_only=True)
    startTime    = serializers.DateTimeField(source='match.start_time', read_only=True)
    status       = serializers.CharField(source='match.status', read_only=True)
    sport        = serializers.CharField(source='match.sport', read_only=True)
    matchType    = serializers.CharField(source='match.match_type', read_only=True)
    maxPlayers   = serializers.IntegerField(source='match.max_players', read_only=True)
    registrationStatus = serializers.CharField(source='status', read_only=True)
    role         = serializers.SerializerMethodField()

    def get_role(self, obj):
        request_user = self.context.get('request_user')
        if request_user and obj.match.organizer_id == request_user.id:
            return 'organizer'
        return 'participant'

    class Meta:
        model  = Registration
        fields = ['id', 'name', 'location', 'startTime', 'status', 'sport',
                  'matchType', 'maxPlayers', 'registrationStatus', 'role']
