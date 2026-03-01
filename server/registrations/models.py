from django.db import models
from users.models import User
from matches.models import Match


class Registration(models.Model):
    STATUS_CHOICES = [
        ('pending',  '待审核'),
        ('approved', '已通过'),
        ('rejected', '已拒绝'),
    ]

    match      = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='registrations')
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    level      = models.CharField(max_length=30, blank=True, default='')
    remark     = models.TextField(blank=True, default='')
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'registrations'
        verbose_name = '报名记录'
        verbose_name_plural = '报名列表'
        unique_together = ('match', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.nickname} → {self.match.name}'
