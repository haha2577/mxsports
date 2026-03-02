from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from users.views import IsJWTAuthenticated

from .models import Registration
from .serializers import RegistrationCreateSerializer, RegistrationSerializer, MyRegistrationSerializer
from matches.models import Match


def ok(data=None, message='success'):
    return Response({'code': 0, 'data': data, 'message': message})

def err(message, status=400):
    return Response({'code': -1, 'data': None, 'message': message}, status=status)


class RegisterView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def post(self, request, pk):
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            return err('赛事不存在', 404)

        if match.status != 'open':
            return err('该赛事当前不接受报名')
        if match.registered_count >= match.max_players:
            return err('报名人数已满')

        user = request.user_obj
        if Registration.objects.filter(match=match, user=user).exists():
            return err('您已报名此赛事')

        s = RegistrationCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        reg_status = 'pending' if match.need_approve else 'approved'
        Registration.objects.create(match=match, user=user, status=reg_status, **s.validated_data)
        return ok({'status': reg_status}, '报名成功')

    def delete(self, request, pk):
        user = request.user_obj
        reg = Registration.objects.filter(match_id=pk, user=user).first()
        if not reg:
            return err('未找到报名记录', 404)
        reg.delete()
        return ok(message='已取消报名')


class RegistrationListView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def get(self, request, pk):
        regs = Registration.objects.filter(match_id=pk).select_related('user')
        return ok(RegistrationSerializer(regs, many=True).data)


class MyRegistrationView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def get(self, request):
        regs = (Registration.objects
                .filter(user=request.user_obj)
                .select_related('match')
                .order_by('-created_at'))
        return ok(MyRegistrationSerializer(regs, many=True).data)
