import math
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import Venue

import sys, os
sys.path.insert(0, os.path.dirname(__file__) + '/..')
from users.views import ok
try:
    from users.views import err
except ImportError:
    from rest_framework.response import Response
    def err(msg, code=400): return Response({'code':1,'message':msg}, status=code)


def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    p = math.pi / 180
    a = 0.5 - math.cos((lat2 - lat1) * p) / 2 + \
        math.cos(lat1 * p) * math.cos(lat2 * p) * \
        (1 - math.cos((lon2 - lon1) * p)) / 2
    return 2 * R * math.asin(math.sqrt(a))


class VenueListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Venue.objects.filter(is_active=True)
        sport = request.query_params.get('sport')
        city = request.query_params.get('city')
        if sport and sport != 'both':
            qs = qs.filter(sport__in=[sport, 'both'])
        if city:
            qs = qs.filter(city__icontains=city)

        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        venues = list(qs)
        results = []
        for v in venues:
            d = {
                'id': v.id, 'name': v.name, 'sport': v.sport,
                'city': v.city, 'district': v.district,
                'address': v.address,
                'latitude': v.latitude, 'longitude': v.longitude,
                'phone': v.phone, 'businessHours': v.business_hours,
                'priceFrom': v.price_from, 'courtCount': v.court_count,
                'floorType': v.floor_type, 'floorLabel': v.get_floor_type_display(),
                'hasParking': v.has_parking, 'parkingSufficient': v.parking_sufficient,
                'hasShower': v.has_shower, 'hasLocker': v.has_locker,
                'hasAc': v.has_ac, 'isIndoor': v.is_indoor,
                'rating': v.rating, 'reviewCount': v.review_count,
                'description': v.description,
            }
            if lat and lng:
                try:
                    dist = haversine(float(lat), float(lng), v.latitude or 0, v.longitude or 0)
                    d['distance'] = round(dist)
                    d['distanceLabel'] = f'{dist/1000:.1f}km' if dist >= 1000 else f'{int(dist)}m'
                except:
                    d['distance'] = 999999
                    d['distanceLabel'] = ''
            results.append(d)

        if lat and lng:
            results.sort(key=lambda x: x.get('distance', 999999))

        return ok(results)


class VenueDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            v = Venue.objects.get(pk=pk, is_active=True)
        except Venue.DoesNotExist:
            return err('场馆不存在', 404)
        return ok({
            'id': v.id, 'name': v.name, 'sport': v.sport,
            'country': v.country, 'province': v.province,
            'city': v.city, 'district': v.district, 'address': v.address,
            'latitude': v.latitude, 'longitude': v.longitude,
            'phone': v.phone, 'businessHours': v.business_hours,
            'priceFrom': v.price_from, 'courtCount': v.court_count,
            'floorType': v.floor_type, 'floorLabel': v.get_floor_type_display(),
            'hasParking': v.has_parking, 'parkingSufficient': v.parking_sufficient,
            'hasShower': v.has_shower, 'hasLocker': v.has_locker,
            'hasAc': v.has_ac, 'isIndoor': v.is_indoor,
            'rating': v.rating, 'reviewCount': v.review_count,
            'description': v.description,
        })
