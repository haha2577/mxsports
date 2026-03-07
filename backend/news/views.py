from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import News

import sys, os
sys.path.insert(0, os.path.dirname(__file__) + '/..')
from users.views import ok, err


class NewsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = News.objects.filter(is_active=True)
        sport = request.query_params.get('sport')
        category = request.query_params.get('category')
        city = request.query_params.get('city')

        if sport and sport != 'both':
            qs = qs.filter(sport__in=[sport, 'both'])
        if category:
            qs = qs.filter(category=category)
        if city:
            qs = qs.filter(city__icontains=city)

        results = []
        for n in qs[:50]:
            results.append({
                'id': n.id,
                'title': n.title,
                'sport': n.sport,
                'category': n.category,
                'categoryLabel': n.get_category_display(),
                'city': n.city,
                'summary': n.summary,
                'imageUrl': n.image_url,
                'publishedAt': n.published_at.strftime('%m-%d') if n.published_at else '',
                'sourceUrl': n.source_url,
            })
        return ok(results)


class NewsDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            n = News.objects.get(pk=pk, is_active=True)
        except News.DoesNotExist:
            return err('资讯不存在', 404)
        return ok({
            'id': n.id,
            'title': n.title,
            'sport': n.sport,
            'category': n.category,
            'categoryLabel': n.get_category_display(),
            'city': n.city,
            'summary': n.summary,
            'content': n.content or n.summary,
            'imageUrl': n.image_url,
            'sourceUrl': n.source_url,
            'publishedAt': n.published_at.strftime('%Y-%m-%d %H:%M') if n.published_at else '',
        })
