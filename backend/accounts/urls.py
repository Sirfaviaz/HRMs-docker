from django.urls import path, include
from accounts.views import UserPermissionViewSet, UserRegistrationView, UserLoginView, PasswordResetRequestView, PasswordResetView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'permissions', UserPermissionViewSet)

urlpatterns = [

    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
     # Route to request password reset (sending reset link via email)
    path('send-password-reset/', PasswordResetRequestView.as_view(), name='send-password-reset'),
    
    # Route to actually reset the password using the token and uidb64
    path('reset-password/', PasswordResetView.as_view(), name='reset-password'),

    
   
]
