from django.urls import path
from .views import MatchListCreateView, MatchDetailView, GenerateDrawView, UpdateScoreView, MyMatchesView

urlpatterns = [
    path('matches',                              MatchListCreateView.as_view()),
    path('matches/mine',                         MyMatchesView.as_view()),
    path('matches/<int:pk>',                     MatchDetailView.as_view()),
    path('matches/<int:pk>/generate-draw',       GenerateDrawView.as_view()),
    path('matches/<int:pk>/games/<int:game_id>/score', UpdateScoreView.as_view()),
]
