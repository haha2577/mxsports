from django.contrib import admin
from .models import Match, Game

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'match_type', 'status', 'max_players', 'registered_count', 'start_time']
    list_filter  = ['status', 'match_type']
    search_fields= ['name', 'location']

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['id', 'match', 'round_num', 'player1', 'player2', 'score1', 'score2', 'status']
    list_filter  = ['status']
