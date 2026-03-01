from django.urls import path
from .views import RegisterView, RegistrationListView, MyRegistrationView

urlpatterns = [
    path('matches/<int:pk>/register',       RegisterView.as_view()),
    path('matches/<int:pk>/registrations',  RegistrationListView.as_view()),
    path('registrations/mine',              MyRegistrationView.as_view()),
]
