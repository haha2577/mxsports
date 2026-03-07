from django.db import models

class Venue(models.Model):
    SPORT_CHOICES = [('badminton','羽毛球'),('tennis','网球'),('both','综合')]
    FLOOR_CHOICES = [('wood','木地板'),('plastic','塑胶'),('cement','水泥'),('clay','红土'),('grass','草地'),('other','其他')]

    name            = models.CharField(max_length=100)
    sport           = models.CharField(max_length=20, choices=SPORT_CHOICES)
    country         = models.CharField(max_length=30, default='中国')
    province        = models.CharField(max_length=30, default='广东省')
    city            = models.CharField(max_length=30, default='深圳市')
    district        = models.CharField(max_length=30, blank=True, default='')
    address         = models.CharField(max_length=200)
    latitude        = models.FloatField(null=True, blank=True)
    longitude       = models.FloatField(null=True, blank=True)
    phone           = models.CharField(max_length=30, blank=True, default='')
    business_hours  = models.CharField(max_length=100, blank=True, default='')
    price_from      = models.IntegerField(default=0, help_text='起步价(元/小时)')
    court_count     = models.IntegerField(default=1, help_text='场地数')
    floor_type      = models.CharField(max_length=20, choices=FLOOR_CHOICES, default='wood')
    has_parking     = models.BooleanField(default=False)
    parking_sufficient = models.BooleanField(default=False)
    has_shower      = models.BooleanField(default=False)
    has_locker      = models.BooleanField(default=False)
    has_ac          = models.BooleanField(default=True)
    is_indoor       = models.BooleanField(default=True)
    rating          = models.FloatField(default=4.5)
    review_count    = models.IntegerField(default=0)
    description     = models.TextField(blank=True, default='')
    image_url       = models.URLField(max_length=500, blank=True, default='')
    is_active       = models.BooleanField(default=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'venues'
        ordering = ['name']
        verbose_name = '场馆'
        verbose_name_plural = '场馆列表'

    def __str__(self):
        return self.name
