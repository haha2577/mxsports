import random
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination

from .models import Match, Game
from .serializers import (
    MatchListSerializer, MatchDetailSerializer,
    MatchCreateSerializer, ScoreUpdateSerializer
)
from registrations.models import Registration


def ok(data=None, message='success'):
    return Response({'code': 0, 'data': data, 'message': message})

def err(message, status=400):
    return Response({'code': -1, 'data': None, 'message': message}, status=status)


# ─── 对阵生成算法 ─────────────────────────────────────────
def gen_round_robin(players):
    games = []
    for i in range(len(players) - 1):
        for j in range(i + 1, len(players)):
            games.append(Game(player1=players[i], player2=players[j], round_num=1))
    return games

def gen_knockout(players):
    shuffled = players[:]
    random.shuffle(shuffled)
    games, round_num = [], 1
    while len(shuffled) > 1:
        next_round = []
        for i in range(0, len(shuffled), 2):
            p1 = shuffled[i]
            p2 = shuffled[i + 1] if i + 1 < len(shuffled) else None
            games.append(Game(player1=p1, player2=p2, round_num=round_num,
                              status='finished' if not p2 else 'pending'))
            next_round.append(None)
        shuffled = next_round
        round_num += 1
    return games

def gen_group(players, group_size=4):
    shuffled = players[:]
    random.shuffle(shuffled)
    groups = [shuffled[i:i+group_size] for i in range(0, len(shuffled), group_size)]
    return [g for group in groups for g in gen_round_robin(group)]


# ─── 分页 ─────────────────────────────────────────────────
class MatchPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'size'

    def get_paginated_data(self, data):
        return {
            'list': data,
            'total': self.page.paginator.count,
            'hasMore': self.get_next_link() is not None,
        }


# ─── 视图 ─────────────────────────────────────────────────
class MatchListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        qs = Match.objects.all()
        status = request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)

        paginator = MatchPagination()
        page = paginator.paginate_queryset(qs, request)
        data = MatchListSerializer(page, many=True).data
        return ok(paginator.get_paginated_data(data))

    def post(self, request):
        s = MatchCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        match = s.save(organizer=request.user_obj)
        return ok({'id': match.id}, '创建成功')


class MatchDetailView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_match(self, pk):
        try:
            return Match.objects.prefetch_related('games', 'registrations__user').get(pk=pk)
        except Match.DoesNotExist:
            return None

    def get(self, request, pk):
        match = self.get_match(pk)
        if not match:
            return err('赛事不存在', 404)
        return ok(MatchDetailSerializer(match).data)

    def put(self, request, pk):
        match = self.get_match(pk)
        if not match:
            return err('赛事不存在', 404)
        user = request.user_obj
        if match.organizer_id != user.id and not user.is_organizer:
            return err('无权操作', 403)
        s = MatchCreateSerializer(match, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return ok(message='更新成功')


class GenerateDrawView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            return err('赛事不存在', 404)

        user = request.user_obj
        if match.organizer_id != user.id and not user.is_organizer:
            return err('无权操作', 403)

        players = list(
            Registration.objects.filter(match=match, status='approved')
            .select_related('user')
            .values_list('user', flat=True)
        )
        from users.models import User as UserModel
        player_objs = list(UserModel.objects.filter(id__in=players))

        if len(player_objs) < 2:
            return err('至少需要2名报名选手')

        # 删除旧对阵
        match.games.all().delete()

        draw_type = request.data.get('type', match.match_type)
        if draw_type == 'round_robin':
            games = gen_round_robin(player_objs)
        elif draw_type == 'knockout':
            games = gen_knockout(player_objs)
        else:
            games = gen_group(player_objs, match.group_size)

        for g in games:
            g.match = match
        Game.objects.bulk_create(games)

        match.status = 'ongoing'
        match.save(update_fields=['status'])
        return ok({'gamesCount': len(games)}, '对阵生成成功')


class UpdateScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk, game_id):
        try:
            match = Match.objects.get(pk=pk)
            game = Game.objects.get(pk=game_id, match=match)
        except (Match.DoesNotExist, Game.DoesNotExist):
            return err('记录不存在', 404)

        user = request.user_obj
        if match.organizer_id != user.id and not user.is_organizer:
            return err('仅组织者可录入比分', 403)

        s = ScoreUpdateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data

        game.score1    = d['score1']
        game.score2    = d['score2']
        game.winner_id = d['winnerId']
        game.status    = 'finished'
        game.save()

        # 所有场次结束则赛事完结
        if not match.games.exclude(status='finished').exists():
            match.status = 'finished'
            match.save(update_fields=['status'])

        return ok(message='比分已更新')
