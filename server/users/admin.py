from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'nickname', 'openid', 'level', 'is_organizer', 'created_at']
    list_filter  = ['is_organizer', 'level']
    search_fields= ['nickname', 'openid']
