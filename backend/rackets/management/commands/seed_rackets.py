from django.core.management.base import BaseCommand
from rackets.models import Racket
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from rackets.fixtures_data import RACKETS

class Command(BaseCommand):
    help = '导入球拍数据'
    def handle(self, *args, **kwargs):
        Racket.objects.all().delete()
        for d in RACKETS:
            Racket.objects.create(**d)
        self.stdout.write(self.style.SUCCESS(f'✅ 导入 {len(RACKETS)} 款球拍'))
