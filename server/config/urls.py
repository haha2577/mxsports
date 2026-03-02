from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from web_views import index
import os

WEB_DIR = settings.BASE_DIR.parent / 'web'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('matches.urls')),
    path('api/', include('registrations.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Web 静态资源
    re_path(r'^web/(?P<path>.*)$', serve, {'document_root': str(WEB_DIR)}),

    # SPA 入口 — 所有其他路径返回 index.html
    re_path(r'^(?!api/).*$', index),
]
