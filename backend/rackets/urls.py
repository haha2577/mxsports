from django.urls import path
from .views import RacketListView

urlpatterns = [
    path('rackets/', RacketListView.as_view()),
]
