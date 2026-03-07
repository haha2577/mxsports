import httpx
import logging
import random
import string
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from rest_framework.permissions import BasePermission

class IsJWTAuthenticated(BasePermission):
    """检查 JWTUserMiddleware 注入的 user_obj"""
    def has_permission(self, request, view):
        return bool(getattr(request, 'user_obj', None))
from .serializers import UserSerializer, UserUpdateSerializer

logger = logging.getLogger('users')


def ok(data=None, message='success'):
    return Response({'code': 0, 'data': data, 'message': message})

def err(message, status=400):
    return Response({'code': -1, 'data': None, 'message': message}, status=status)

def make_token(user):
    refresh = RefreshToken()
    refresh['user_id'] = user.id
    return str(refresh.access_token)

def user_data(user):
    """登录成功后返回的用户信息"""
    return {
        'token': make_token(user),
        'user': {
            'id': user.id,
            'nickname': user.nickname,
            'phone': user.phone or '',
            'avatar': user.avatar or '',
            'sportPref': user.sport_pref or '',
            'activeSport': user.active_sport or 'badminton',
            'canSwitch': user.sport_pref == 'both',
        }
    }


# ─── 微信登录 ─────────────────────────────────────────────
class WxLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return err('缺少 code 参数')

        if settings.WX_SECRET:
            with httpx.Client() as client:
                resp = client.get(
                    'https://api.weixin.qq.com/sns/jscode2session',
                    params={
                        'appid': settings.WX_APPID,
                        'secret': settings.WX_SECRET,
                        'js_code': code,
                        'grant_type': 'authorization_code',
                    }
                )
            wx = resp.json()
            if wx.get('errcode'):
                return err(f"微信登录失败: {wx.get('errmsg')}")
            openid = wx['openid']
        else:
            openid = f'dev_{code}'

        user, created = User.objects.get_or_create(
            openid=openid,
            defaults={'nickname': '运动员'}
        )
        data = user_data(user)
        data['user']['isNew'] = created
        return ok(data, '登录成功')


# ─── 发送短信验证码 ────────────────────────────────────────
class SendSmsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        if not phone or len(phone) != 11 or not phone.startswith('1'):
            return err('请输入正确的手机号')

        # 频率限制：60秒内只能发一次
        cache_key = f'sms_limit_{phone}'
        if cache.get(cache_key):
            return err('验证码已发送，请稍后再试')

        # 生成6位验证码
        code = ''.join(random.choices(string.digits, k=6))

        # 缓存验证码（5分钟有效）
        cache.set(f'sms_code_{phone}', code, timeout=300)
        cache.set(cache_key, True, timeout=60)

        # ── 实际项目替换为真实短信服务（阿里云/腾讯云）──
        if settings.DEBUG:
            # 开发模式：直接返回验证码（方便测试）
            print(f'[SMS DEV] {phone} 的验证码: {code}')
            return ok({'dev_code': code}, f'验证码已发送（开发模式：{code}）')

        # TODO: 接入真实短信 SDK
        # sms_client.send(phone, code)
        return ok(None, '验证码已发送')


# ─── 手机号 + 验证码登录 ────────────────────────────────────
class PhoneLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        code  = request.data.get('code', '').strip()

        if not phone or not code:
            return err('手机号和验证码不能为空')

        # 验证码校验（6688 为后门万能码）
        if code != '6688':
            cached_code = cache.get(f'sms_code_{phone}')
            if not cached_code:
                return err('验证码已过期，请重新获取')
            if cached_code != code:
                return err('验证码错误')

        # 清除已使用的验证码
        cache.delete(f'sms_code_{phone}')

        # 查找或创建用户
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                'openid': f'phone_{phone}',
                'nickname': f'用户{phone[-4:]}'
            }
        )
        if not created and not user.phone:
            user.phone = phone
            user.save(update_fields=['phone'])

        d = user_data(user)
        d['isNew'] = created
        return ok(d, '登录成功')


# ─── 微信手机号一键登录 ─────────────────────────────────────
class WxPhoneLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_code = request.data.get('phone_code')
        wx_code    = request.data.get('wx_code')
        logger.info('[wx-phone-login] 收到请求 phone_code=%s wx_code=%s',
                    bool(phone_code), bool(wx_code))

        if not phone_code or not wx_code:
            logger.warning('[wx-phone-login] 参数缺失 data=%s', request.data)
            return err('参数缺失')

        if not settings.WX_SECRET:
            # 开发模式：mock 一个手机号
            phone = '13800138000'
            openid = f'dev_{wx_code}'
            logger.info('[wx-phone-login] 开发模式 openid=%s phone=%s', openid, phone)
        else:
            # 1. 用 wx_code 换取 openid
            logger.info('[wx-phone-login] 调用微信 jscode2session wx_code=%s', wx_code)
            with httpx.Client() as client:
                wx_resp = client.get(
                    'https://api.weixin.qq.com/sns/jscode2session',
                    params={
                        'appid': settings.WX_APPID,
                        'secret': settings.WX_SECRET,
                        'js_code': wx_code,
                        'grant_type': 'authorization_code',
                    }
                )
            wx_data = wx_resp.json()
            logger.info('[wx-phone-login] jscode2session 返回: %s', wx_data)
            if wx_data.get('errcode'):
                logger.error('[wx-phone-login] jscode2session 失败: %s', wx_data)
                return err(f"微信登录失败: {wx_data.get('errmsg')}")

            openid = wx_data['openid']

            # 2. 用 phone_code 换取手机号
            access_token = self._get_access_token()
            logger.info('[wx-phone-login] 调用 getuserphonenumber phone_code=%s', phone_code)
            with httpx.Client() as client:
                phone_resp = client.post(
                    'https://api.weixin.qq.com/wxa/business/getuserphonenumber',
                    params={'access_token': access_token},
                    json={'code': phone_code}
                )
            phone_data = phone_resp.json()
            logger.info('[wx-phone-login] getuserphonenumber 返回: %s', phone_data)
            if phone_data.get('errcode', 0) != 0:
                logger.error('[wx-phone-login] 获取手机号失败: %s', phone_data)
                return err(f"获取手机号失败: {phone_data.get('errmsg')}")

            phone = phone_data['phone_info']['phoneNumber']

        # 查找或创建用户
        user = User.objects.filter(openid=openid).first()
        if not user:
            user = User.objects.filter(phone=phone).first()
        if not user:
            user = User.objects.create(
                openid=openid,
                phone=phone,
                nickname=f'用户{phone[-4:]}'
            )
            logger.info('[wx-phone-login] 新建用户 id=%s phone=%s', user.id, phone)
        else:
            updated = False
            if not user.phone and phone:
                user.phone = phone; updated = True
            if not user.openid.startswith('phone_') and openid:
                user.openid = openid; updated = True
            if updated:
                user.save()
            logger.info('[wx-phone-login] 已有用户 id=%s updated=%s', user.id, updated)

        logger.info('[wx-phone-login] 登录成功 user_id=%s', user.id)
        return ok(user_data(user), '登录成功')

    def _get_access_token(self):
        cached = cache.get('wx_access_token')
        if cached:
            return cached
        with httpx.Client() as client:
            resp = client.get(
                'https://api.weixin.qq.com/cgi-bin/token',
                params={
                    'grant_type': 'client_credential',
                    'appid': settings.WX_APPID,
                    'secret': settings.WX_SECRET,
                }
            )
        data = resp.json()
        token = data.get('access_token', '')
        cache.set('wx_access_token', token, timeout=data.get('expires_in', 7200) - 60)
        return token


# ─── 头像上传 ──────────────────────────────────────────────
class AvatarUploadView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def post(self, request):
        import os, uuid
        f = request.FILES.get('avatar')
        if not f:
            return err('未上传文件')
        ext = os.path.splitext(f.name)[1].lower() or '.jpg'
        if ext not in ('.jpg', '.jpeg', '.png', '.webp'):
            return err('仅支持 jpg/png/webp 格式')
        filename = f'{uuid.uuid4().hex}{ext}'
        media_dir = os.path.join(os.path.dirname(__file__), '..', 'media', 'avatars')
        os.makedirs(media_dir, exist_ok=True)
        path = os.path.join(media_dir, filename)
        with open(path, 'wb') as out:
            for chunk in f.chunks():
                out.write(chunk)
        url = f'/media/avatars/{filename}'
        request.user_obj.avatar = url
        request.user_obj.save(update_fields=['avatar'])
        return ok({'url': url}, '头像上传成功')


# ─── 注销账号 ──────────────────────────────────────────────
class DeleteAccountView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def delete(self, request):
        user = request.user_obj
        # 匿名化处理（保留历史数据一致性）
        import uuid
        user.nickname = f'已注销用户_{uuid.uuid4().hex[:6]}'
        user.phone = ''
        user.openid = f'deleted_{uuid.uuid4().hex}'
        user.avatar = ''
        user.is_active = False
        user.save()
        return ok(message='账号已注销')


# ─── 我的球友 ──────────────────────────────────────────────
class FriendsView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def get(self, request):
        from registrations.models import Registration
        from collections import defaultdict

        user = request.user_obj
        # 找我参加过的所有活动
        my_match_ids = Registration.objects.filter(
            user=user, status='approved'
        ).values_list('match_id', flat=True)

        # 找这些活动中的其他人（含match信息）
        other_regs = (
            Registration.objects
            .filter(match_id__in=my_match_ids, status='approved')
            .exclude(user=user)
            .select_related('user', 'match')
        )

        # 按用户分组，找最近共同活动
        latest = defaultdict(lambda: None)
        for reg in other_regs:
            cur = latest[reg.user_id]
            match_time = reg.match.start_time or reg.match.created_at
            if cur is None or match_time > (cur.match.start_time or cur.match.created_at):
                latest[reg.user_id] = reg

        result = []
        for reg in latest.values():
            m = reg.match
            result.append({
                'id': reg.user.id,
                'nickname': reg.user.nickname,
                'avatar': reg.user.avatar or '',
                'lastMatch': {
                    'id': m.id,
                    'name': m.name,
                    'location': m.location,
                    'startTime': m.start_time.isoformat() if m.start_time else None,
                }
            })

        # 按最近活动时间倒序
        result.sort(key=lambda x: x['lastMatch']['startTime'] or '', reverse=True)
        return ok(result)


# ─── 用户信息 ──────────────────────────────────────────────
class ProfileView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def get(self, request):
        u = request.user_obj
        return ok({
            'id': u.id,
            'openid': u.openid,
            'nickname': u.nickname,
            'avatar': u.avatar,
            'phone': u.phone,
            'level': u.level,
            'isOrganizer': u.is_organizer,
            'sportPref': u.sport_pref or '',
            'activeSport': u.active_sport or 'badminton',
            'canSwitch': u.sport_pref == 'both',
        })

    def put(self, request):
        s = UserUpdateSerializer(request.user_obj, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return ok(message='更新成功')
