from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from users.models import User


class JWTUserMiddleware:
    """把 JWT token 解析为 User 对象，挂到 request.user_obj"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user_obj = None
        auth = request.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            token_str = auth.split(' ', 1)[1]
            try:
                token = AccessToken(token_str)
                user_id = token.get('user_id')
                if user_id:
                    request.user_obj = User.objects.filter(id=user_id, is_active=True).first()
            except TokenError:
                pass
        return self.get_response(request)
