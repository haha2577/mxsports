from django.urls import path
from .views import NewsListView, NewsDetailView

urlpatterns = [
    path('news', NewsListView.as_view()),
    path('news/<int:pk>', NewsDetailView.as_view()),
]
