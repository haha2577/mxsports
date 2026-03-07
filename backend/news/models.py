from django.db import models

class News(models.Model):
    SPORT_CHOICES = [('badminton','羽毛球'),('tennis','网球'),('both','综合')]
    CAT_CHOICES = [('international','国际赛事'),('national','国内赛事'),('local','当地赛事')]

    title        = models.CharField(max_length=200)
    sport        = models.CharField(max_length=20, choices=SPORT_CHOICES)
    category     = models.CharField(max_length=20, choices=CAT_CHOICES)
    city         = models.CharField(max_length=30, blank=True, default='', help_text='当地赛事所属城市')
    summary      = models.TextField(blank=True, default='')
    content      = models.TextField(blank=True, default='')
    source_url   = models.URLField(max_length=500, blank=True, default='')
    image_url    = models.URLField(max_length=500, blank=True, default='')
    published_at = models.DateTimeField(null=True, blank=True)
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'news'
        ordering = ['-published_at']
        verbose_name = '资讯'
        verbose_name_plural = '资讯列表'

    def __str__(self):
        return self.title
