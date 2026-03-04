from django.db import models

class Racket(models.Model):
    SPORT_CHOICES   = [('badminton','羽毛球'),('tennis','网球')]
    GENDER_CHOICES  = [('male','男性'),('female','女性'),('unisex','通用')]
    SKILL_CHOICES   = [('beginner','入门'),('intermediate','进阶'),('advanced','专业')]
    BALANCE_CHOICES = [('head_heavy','攻击型（头重）'),('even','均衡型'),('head_light','速度型（头轻）')]
    FLEX_CHOICES    = [('flexible','柔性'),('medium','中等'),('stiff','硬性')]

    sport         = models.CharField(max_length=20, choices=SPORT_CHOICES)
    brand         = models.CharField(max_length=50)
    model         = models.CharField(max_length=100)
    image         = models.URLField(max_length=500, blank=True)
    price         = models.IntegerField(help_text='人民币建议零售价')
    weight_g      = models.IntegerField(help_text='克')
    balance       = models.CharField(max_length=20, choices=BALANCE_CHOICES)
    flex          = models.CharField(max_length=20, choices=FLEX_CHOICES)
    skill_level   = models.CharField(max_length=20, choices=SKILL_CHOICES)
    gender        = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    shaft_material= models.CharField(max_length=100, blank=True)
    frame_material= models.CharField(max_length=100, blank=True)
    string_tension= models.CharField(max_length=50, blank=True, help_text='如 20-28磅')
    head_size_cm2 = models.IntegerField(null=True, blank=True, help_text='拍框面积 cm²')
    length_mm     = models.IntegerField(null=True, blank=True)
    description   = models.TextField()
    highlights    = models.JSONField(default=list, help_text='卖点列表，最多3条')
    tags          = models.JSONField(default=list, help_text='标签如 [进攻,扣杀]')

    # 适用人群范围（用于智能推荐）
    suitable_height_min = models.IntegerField(default=140)
    suitable_height_max = models.IntegerField(default=220)
    suitable_weight_min = models.IntegerField(default=40)
    suitable_weight_max = models.IntegerField(default=120)
    suitable_age_min    = models.IntegerField(default=10)
    suitable_age_max    = models.IntegerField(default=80)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['brand', 'price']

    def __str__(self):
        return f"{self.brand} {self.model}"
