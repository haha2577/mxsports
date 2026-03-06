import random
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from users.views import IsJWTAuthenticated
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


def gen_rotation_doubles(players):
    """
    多人轮转双打：随机配对成若干组，每组2人作为一支队伍，
    所有队伍之间进行循环赛（每支队伍都和其他队伍对阵一次）。
    若人数为奇数，最后一人暂时轮空（不影响生成）。
    """
    shuffled = players[:]
    random.shuffle(shuffled)
    # 两两配对成队伍
    pairs = []
    for i in range(0, len(shuffled) - 1, 2):
        pairs.append((shuffled[i], shuffled[i + 1]))
    # 奇数人时最后一人单独成队（partner 为 None）
    if len(shuffled) % 2 == 1:
        pairs.append((shuffled[-1], None))

    # 所有队伍之间循环对阵
    games = []
    for i in range(len(pairs) - 1):
        for j in range(i + 1, len(pairs)):
            p1, pt1 = pairs[i]
            p2, pt2 = pairs[j]
            games.append(Game(
                player1=p1, partner1=pt1,
                player2=p2, partner2=pt2,
                round_num=1,
            ))
    return games


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
        return [IsJWTAuthenticated()]

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


class MyMatchesView(APIView):
    """我创建的活动"""
    permission_classes = [IsJWTAuthenticated]

    def get(self, request):
        qs = Match.objects.filter(organizer=request.user_obj).order_by('-created_at')
        return ok(MatchListSerializer(qs, many=True).data)


class MatchDetailView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsJWTAuthenticated()]

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


class MatchStatusView(APIView):
    """组织者暂停/恢复/取消报名"""
    permission_classes = [IsJWTAuthenticated]

    def post(self, request, pk):
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            return err('赛事不存在', 404)
        user = request.user_obj
        if match.organizer_id != user.id and not user.is_organizer:
            return err('无权操作', 403)
        action = request.data.get('action')
        if action == 'pause':
            if match.status != 'open':
                return err('只有报名中的活动才能暂停')
            match.status = 'paused'
        elif action == 'resume':
            if match.status != 'paused':
                return err('只有已暂停的活动才能恢复')
            match.status = 'open'
        elif action == 'cancel':
            if match.status in ('finished', 'cancelled'):
                return err('活动已结束或已取消')
            match.status = 'cancelled'
        else:
            return err('无效操作')
        match.save(update_fields=['status'])
        return ok({'status': match.status}, '操作成功')

    def delete(self, request, pk):
        """彻底删除活动"""
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            return err('赛事不存在', 404)
        user = request.user_obj
        if match.organizer_id != user.id and not user.is_organizer:
            return err('无权操作', 403)
        match.delete()
        return ok(message='活动已删除')


def _serialize_draft_game(g, idx):
    def p(u): return {'id': u.id, 'name': u.nickname} if u else None
    return {
        'idx': idx,
        'team1': [p(g.player1), p(g.partner1)],
        'team2': [p(g.player2), p(g.partner2)],
    }


class GenerateDrawView(APIView):
    """
    preview=true  → 只返回草稿，不保存，match 保持 open
    preview=false → 接收前端确认的 games 列表，保存并开始
    """
    permission_classes = [IsJWTAuthenticated]

    def post(self, request, pk):
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            return err('赛事不存在', 404)

        user = request.user_obj
        if match.organizer_id != user.id and not user.is_organizer:
            return err('无权操作', 403)

        from users.models import User as UserModel
        players = list(
            Registration.objects.filter(match=match, status='approved')
            .values_list('user_id', flat=True)
        )
        player_objs = list(UserModel.objects.filter(id__in=players))

        draw_type = request.data.get('type', match.match_type)
        preview   = request.data.get('preview', True)

        # ── 预览模式：生成草稿返回，不保存 ──
        if preview:
            if draw_type == 'rotation_doubles':
                if len(player_objs) < 4:
                    return err('多人轮转双打至少需要4名选手')
                games = gen_rotation_doubles(player_objs)
            elif draw_type == 'round_robin':
                games = gen_round_robin(player_objs)
            elif draw_type == 'knockout':
                games = gen_knockout(player_objs)
            else:
                games = gen_group(player_objs, match.group_size)
            draft = [_serialize_draft_game(g, i) for i, g in enumerate(games)]
            # 统计场次分布
            count_map = {}
            for g in draft:
                for p in g['team1'] + g['team2']:
                    if p:
                        count_map[p['id']] = count_map.get(p['id'], 0) + 1
            players_info = [{'id': u.id, 'name': u.nickname, 'games': count_map.get(u.id, 0)}
                            for u in player_objs]
            return ok({'draft': draft, 'players': players_info, 'type': draw_type})

        # ── 确认模式：接收 games 列表，保存并开始 ──
        provided = request.data.get('games')
        if not provided:
            return err('缺少 games 数据')

        id_map = {u.id: u for u in player_objs}

        @transaction.atomic
        def confirm():
            match.games.all().delete()
            to_create = []
            for row in provided:
                t1 = row.get('team1', [])
                t2 = row.get('team2', [])
                def uid(cell): return cell.get('id') if cell else None
                to_create.append(Game(
                    match=match,
                    player1=id_map.get(uid(t1[0] if len(t1) > 0 else None)),
                    partner1=id_map.get(uid(t1[1] if len(t1) > 1 else None)),
                    player2=id_map.get(uid(t2[0] if len(t2) > 0 else None)),
                    partner2=id_map.get(uid(t2[1] if len(t2) > 1 else None)),
                    round_num=1,
                ))
            Game.objects.bulk_create(to_create)
            match.match_type = draw_type
            match.status = 'ongoing'
            match.save(update_fields=['status', 'match_type'])
            return len(to_create)

        n = confirm()
        return ok({'gamesCount': n, 'type': draw_type}, '比赛已开始')


class MatchGamesView(APIView):
    """获取活动所有场次"""
    permission_classes = [IsJWTAuthenticated]

    def get(self, request, pk):
        from .serializers import GameSerializer
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            return err('活动不存在', 404)
        games = match.games.select_related('player1','partner1','player2','partner2').all()
        return ok(GameSerializer(games, many=True).data)


class UpdateScoreView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def put(self, request, pk, game_id):
        try:
            match = Match.objects.get(pk=pk)
            game  = Game.objects.get(pk=game_id, match=match)
        except (Match.DoesNotExist, Game.DoesNotExist):
            return err('记录不存在', 404)

        user = request.user_obj
        if match.organizer_id != user.id and not user.is_organizer:
            return err('仅组织者可录入比分', 403)

        score1 = request.data.get('score1')
        score2 = request.data.get('score2')
        if score1 is None or score2 is None:
            return err('请填写双方比分')

        game.score1 = int(score1)
        game.score2 = int(score2)
        if game.score1 > game.score2:
            game.winner_team = 'team1'
        elif game.score2 > game.score1:
            game.winner_team = 'team2'
        else:
            game.winner_team = 'draw'
        game.status = 'finished'
        game.save()

        return ok({'winnerTeam': game.winner_team}, '比分已更新')


class LeaderboardView(APIView):
    """积分排行榜"""
    permission_classes = [IsJWTAuthenticated]

    def get(self, request, pk):
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            return err('活动不存在', 404)

        games = match.games.filter(status='finished').select_related(
            'player1','partner1','player2','partner2')

        # 积分统计：胜2分，平1分，负0分
        stats = {}

        def add(user, win, draw):
            if user is None:
                return
            uid = user.id
            if uid not in stats:
                stats[uid] = {'id': uid, 'name': user.nickname,
                              'played': 0, 'wins': 0, 'draws': 0, 'losses': 0, 'points': 0,
                              'scored': 0, 'conceded': 0}
            s = stats[uid]
            s['played'] += 1
            if win:
                s['wins'] += 1; s['points'] += 2
            elif draw:
                s['draws'] += 1; s['points'] += 1
            else:
                s['losses'] += 1

        for g in games:
            wt = g.winner_team
            for u in [g.player1, g.partner1]:
                add(u, wt=='team1', wt=='draw')
            for u in [g.player2, g.partner2]:
                add(u, wt=='team2', wt=='draw')
            # 得失分
            for u in [g.player1, g.partner1]:
                if u and u.id in stats:
                    stats[u.id]['scored']    += g.score1 or 0
                    stats[u.id]['conceded']  += g.score2 or 0
            for u in [g.player2, g.partner2]:
                if u and u.id in stats:
                    stats[u.id]['scored']    += g.score2 or 0
                    stats[u.id]['conceded']  += g.score1 or 0

        board = sorted(stats.values(),
                       key=lambda x: (-x['points'], -(x['scored']-x['conceded']), -x['scored']))
        for i, row in enumerate(board):
            row['rank'] = i + 1

        return ok(board)


class FinishMatchView(APIView):
    """结束比赛"""
    permission_classes = [IsJWTAuthenticated]

    def post(self, request, pk):
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            return err('活动不存在', 404)
        user = request.user_obj
        if match.organizer_id != user.id and not user.is_organizer:
            return err('无权操作', 403)
        if match.status != 'ongoing':
            return err('只有进行中的活动才能结束')
        match.status = 'finished'
        match.save(update_fields=['status'])
        return ok({'status': 'finished'}, '比赛已结束')
