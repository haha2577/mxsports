from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from web_views import index

WEB_DIR = settings.BASE_DIR.parent / 'web'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('matches.urls')),
    path('api/', include('registrations.urls')),
    path('api/', include('rackets.urls')),
    path('api/', include('venues.urls')),
    path('api/', include('news.urls')),

    # 用户上传媒体文件
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': str(settings.MEDIA_ROOT)}),

    # UniApp H5 静态资源（assets/ static/ 等）
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': str(WEB_DIR / 'assets')}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': str(WEB_DIR / 'static')}),

    # SPA 入口 — 所有非 api/ 路径返回 index.html
    re_path(r'^(?!api/).*$', index),
]
