from django.db import models
from users.models import User


class Match(models.Model):
    STATUS_CHOICES = [
        ('draft',    '草稿'),
        ('open',     '报名中'),
        ('paused',   '已暂停'),
        ('ongoing',  '进行中'),
        ('finished', '已结束'),
        ('cancelled','已取消'),
    ]
    TYPE_CHOICES = [
        ('rotation_doubles', '多人轮转双打'),
        ('round_robin',      '单打循环赛'),
        ('knockout',         '单打淘汰赛'),
        ('group',            '单打分组赛'),
        # 以下赛制预留，暂不支持
        # ('doubles_knockout', '双打淘汰赛'),
        # ('team',             '团体赛'),
        # ('mixed',            '混合双打赛'),
    ]

    sport          = models.CharField(max_length=20, default='badminton')
    name           = models.CharField(max_length=100)
    location       = models.CharField(max_length=200, blank=True, default='')
    country        = models.CharField(max_length=30, blank=True, default='中国')
    province       = models.CharField(max_length=30, blank=True, default='')
    city           = models.CharField(max_length=30, blank=True, default='')
    district       = models.CharField(max_length=30, blank=True, default='')
    address        = models.CharField(max_length=200, blank=True, default='')
    latitude       = models.FloatField(null=True, blank=True)
    longitude      = models.FloatField(null=True, blank=True)
    description    = models.TextField(blank=True, default='')
    match_type     = models.CharField(max_length=20, choices=TYPE_CHOICES, default='round_robin')
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    max_players    = models.IntegerField(default=16)
    group_size     = models.IntegerField(default=4)
    levels         = models.JSONField(default=list)
    fee            = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    need_approve   = models.BooleanField(default=False)
    allow_team     = models.BooleanField(default=False)
    contact_name   = models.CharField(max_length=50, blank=True, default='')
    contact_phone  = models.CharField(max_length=20, blank=True, default='')
    register_start = models.DateTimeField(null=True, blank=True)
    start_time     = models.DateTimeField(null=True, blank=True)
    organizer      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_matches')
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'matches'
        verbose_name = '赛事'
        verbose_name_plural = '赛事列表'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def registered_count(self):
        return self.registrations.filter(status='approved').count()


class Game(models.Model):
    STATUS_CHOICES = [
        ('pending',  '待赛'),
        ('ongoing',  '进行中'),
        ('finished', '已完成'),
    ]

    match    = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='games')
    round_num = models.IntegerField(default=1)
    # 队伍1：player1 + partner1（双打时有搭档）
    player1   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='games_as_p1')
    partner1  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='games_as_partner1')
    # 队伍2：player2 + partner2
    player2   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='games_as_p2')
    partner2  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='games_as_partner2')
    score1       = models.IntegerField(null=True, blank=True)
    score2       = models.IntegerField(null=True, blank=True)
    winner_team  = models.CharField(max_length=10, null=True, blank=True,
                       choices=[('team1','队伍1'),('team2','队伍2'),('draw','平局')])
    winner       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
    status    = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at= models.DateTimeField(auto_now_add=True)
    updated_at= models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'games'
        verbose_name = '场次'
        verbose_name_plural = '场次列表'
        ordering = ['round_num', 'id']

    def __str__(self):
        p1 = self.player1.nickname if self.player1 else '待定'
        p2 = self.player2.nickname if self.player2 else '待定'
        return f'{self.match.name} | {p1} vs {p2}'
