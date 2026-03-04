from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Racket

class RacketListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Racket.objects.filter(is_active=True)

        sport   = request.GET.get('sport')
        brand   = request.GET.get('brand')
        budget  = request.GET.get('budget')       # max price
        gender  = request.GET.get('gender')
        skill   = request.GET.get('skill')
        height  = request.GET.get('height')
        weight  = request.GET.get('weight')
        age     = request.GET.get('age')

        if sport:   qs = qs.filter(sport=sport)
        if brand:   qs = qs.filter(brand__icontains=brand)
        if gender and gender != 'unisex':
            qs = qs.filter(gender__in=[gender, 'unisex'])
        if skill:   qs = qs.filter(skill_level=skill)
        if budget:
            try: qs = qs.filter(price__lte=int(budget))
            except ValueError: pass
        if height:
            try:
                h = int(height)
                qs = qs.filter(suitable_height_min__lte=h, suitable_height_max__gte=h)
            except ValueError: pass
        if weight:
            try:
                w = int(weight)
                qs = qs.filter(suitable_weight_min__lte=w, suitable_weight_max__gte=w)
            except ValueError: pass
        if age:
            try:
                a = int(age)
                qs = qs.filter(suitable_age_min__lte=a, suitable_age_max__gte=a)
            except ValueError: pass

        data = [{
            'id': r.id, 'sport': r.sport, 'brand': r.brand, 'model': r.model,
            'image': r.image, 'price': r.price,
            'weight_g': r.weight_g, 'balance': r.balance,
            'flex': r.flex, 'skill_level': r.skill_level, 'gender': r.gender,
            'shaft_material': r.shaft_material, 'frame_material': r.frame_material,
            'string_tension': r.string_tension, 'head_size_cm2': r.head_size_cm2,
            'length_mm': r.length_mm,
            'description': r.description,
            'highlights': r.highlights, 'tags': r.tags,
            'balance_label': r.get_balance_display(),
            'flex_label':    r.get_flex_display(),
            'skill_label':   r.get_skill_level_display(),
        } for r in qs]

        return Response({'code': 0, 'data': {'list': data, 'total': len(data)}})
