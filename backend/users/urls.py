from django.urls import path
from .views import WxLoginView, SendSmsView, PhoneLoginView, WxPhoneLoginView, ProfileView, FriendsView, AvatarUploadView, DeleteAccountView

urlpatterns = [
    path('auth/wx-login',        WxLoginView.as_view()),
    path('auth/send-sms',        SendSmsView.as_view()),
    path('auth/phone-login',     PhoneLoginView.as_view()),
    path('auth/wx-phone-login',  WxPhoneLoginView.as_view()),
    path('auth/profile',         ProfileView.as_view()),
    path('auth/update-profile',  ProfileView.as_view()),
    path('auth/upload-avatar',   AvatarUploadView.as_view()),
    path('auth/delete-account',  DeleteAccountView.as_view()),
    path('users/friends',        FriendsView.as_view()),
]
