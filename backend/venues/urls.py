from django.urls import path
from .views import VenueListView, VenueDetailView

urlpatterns = [
    path('venues', VenueListView.as_view()),
    path('venues/<int:pk>', VenueDetailView.as_view()),
]
