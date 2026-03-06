from django.urls import path
from .views import (
    MatchListCreateView, MyMatchesView, MatchDetailView,
    MatchStatusView, GenerateDrawView,
    MatchGamesView, UpdateScoreView, LeaderboardView, FinishMatchView,
)

urlpatterns = [
    path('matches',                                    MatchListCreateView.as_view()),
    path('matches/mine',                               MyMatchesView.as_view()),
    path('matches/<int:pk>',                           MatchDetailView.as_view()),
    path('matches/<int:pk>/status',                    MatchStatusView.as_view()),
    path('matches/<int:pk>/generate-draw',             GenerateDrawView.as_view()),
    path('matches/<int:pk>/games',                     MatchGamesView.as_view()),
    path('matches/<int:pk>/games/<int:game_id>/score', UpdateScoreView.as_view()),
    path('matches/<int:pk>/leaderboard',               LeaderboardView.as_view()),
    path('matches/<int:pk>/finish',                    FinishMatchView.as_view()),
]
