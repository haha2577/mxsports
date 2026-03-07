from django.db import models


class User(models.Model):
    openid       = models.CharField(max_length=64, unique=True, db_index=True)
    nickname     = models.CharField(max_length=50, default='羽球选手')
    avatar       = models.CharField(max_length=255, blank=True, default='')
    phone        = models.CharField(max_length=20, blank=True, default='')
    level        = models.CharField(max_length=20, default='B组（中级）')
    sport_pref   = models.CharField(max_length=20, blank=True, default='')
    active_sport = models.CharField(max_length=20, default='badminton')  # 当前激活运动（both用户可切换）
    is_organizer = models.BooleanField(default=False)
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = '用户列表'

    def __str__(self):
        return f'{self.nickname} ({self.openid[:8]}...)'
