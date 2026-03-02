from django.contrib import admin
from .models import Registration

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'match', 'level', 'status', 'created_at']
    list_filter  = ['status']
