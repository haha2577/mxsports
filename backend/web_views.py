from django.http import FileResponse, HttpResponse
from django.conf import settings
import os

def index(request):
    """所有非 /api/ 路径都返回 Web SPA 入口页"""
    index_path = settings.BASE_DIR.parent / 'web' / 'index.html'
    return FileResponse(open(index_path, 'rb'), content_type='text/html')
