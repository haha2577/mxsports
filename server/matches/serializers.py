from rest_framework import serializers
from .models import Match, Game
from users.models import User


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nickname', 'avatar', 'level']


class GameSerializer(serializers.ModelSerializer):
    player1   = PlayerSerializer(read_only=True)
    player2   = PlayerSerializer(read_only=True)
    winnerId  = serializers.IntegerField(source='winner_id', read_only=True)
    roundNum  = serializers.IntegerField(source='round_num', read_only=True)

    class Meta:
        model = Game
        fields = ['id', 'roundNum', 'player1', 'player2', 'score1', 'score2', 'winnerId', 'status']


class MatchListSerializer(serializers.ModelSerializer):
    matchType       = serializers.CharField(source='match_type')
    maxPlayers      = serializers.IntegerField(source='max_players')
    registeredCount = serializers.IntegerField(source='registered_count', read_only=True)
    startTime       = serializers.DateTimeField(source='start_time')
    organizerId     = serializers.IntegerField(source='organizer_id', read_only=True)

    class Meta:
        model  = Match
        fields = ['id', 'name', 'location', 'matchType', 'status',
                  'maxPlayers', 'registeredCount', 'startTime', 'fee', 'organizerId']


class MatchDetailSerializer(serializers.ModelSerializer):
    matchType       = serializers.CharField(source='match_type')
    maxPlayers      = serializers.IntegerField(source='max_players')
    groupSize       = serializers.IntegerField(source='group_size')
    registeredCount = serializers.IntegerField(source='registered_count', read_only=True)
    startTime       = serializers.DateTimeField(source='start_time')
    registerStart   = serializers.DateTimeField(source='register_start')
    organizerId     = serializers.IntegerField(source='organizer_id', read_only=True)
    needApprove     = serializers.BooleanField(source='need_approve')
    allowTeam       = serializers.BooleanField(source='allow_team')
    contactName     = serializers.CharField(source='contact_name')
    contactPhone    = serializers.CharField(source='contact_phone')
    createdAt       = serializers.DateTimeField(source='created_at', read_only=True)
    games           = GameSerializer(many=True, read_only=True)
    players         = serializers.SerializerMethodField()

    class Meta:
        model  = Match
        fields = ['id', 'name', 'location', 'description', 'matchType', 'status',
                  'maxPlayers', 'groupSize', 'registeredCount', 'levels', 'fee',
                  'needApprove', 'allowTeam', 'contactName', 'contactPhone',
                  'startTime', 'registerStart', 'organizerId', 'games', 'players', 'createdAt']

    def get_players(self, obj):
        regs = obj.registrations.filter(status='approved').select_related('user')
        return [{'id': r.user.id, 'name': r.user.nickname,
                 'avatar': r.user.avatar, 'level': r.level} for r in regs]


class MatchCreateSerializer(serializers.ModelSerializer):
    matchType    = serializers.CharField(source='match_type', required=False)
    maxPlayers   = serializers.IntegerField(source='max_players', required=False)
    groupSize    = serializers.IntegerField(source='group_size', required=False)
    needApprove  = serializers.BooleanField(source='need_approve', required=False)
    allowTeam    = serializers.BooleanField(source='allow_team', required=False)
    contactName  = serializers.CharField(source='contact_name', required=False)
    contactPhone = serializers.CharField(source='contact_phone', required=False)
    startTime    = serializers.DateTimeField(source='start_time', required=False, allow_null=True)
    registerStart= serializers.DateTimeField(source='register_start', required=False, allow_null=True)

    class Meta:
        model  = Match
        fields = ['name', 'location', 'description', 'matchType', 'status',
                  'maxPlayers', 'groupSize', 'levels', 'fee',
                  'needApprove', 'allowTeam', 'contactName', 'contactPhone',
                  'startTime', 'registerStart']


class ScoreUpdateSerializer(serializers.Serializer):
    score1   = serializers.IntegerField(min_value=0)
    score2   = serializers.IntegerField(min_value=0)
    winnerId = serializers.IntegerField()
