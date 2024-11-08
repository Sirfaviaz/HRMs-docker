from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.serializers import UserRegistrationSerializer, UserLoginSerializer
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.usecases.password_reset import PasswordResetUseCase

class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')
        response, status_code = PasswordResetUseCase.send_password_reset_email(email)
        return Response(response, status=status_code)

class PasswordResetView(APIView):
    def post(self, request):
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        response, status_code = PasswordResetUseCase.reset_password(uidb64, token, new_password)
        return Response(response, status=status_code)

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import User
from .serializers import UserPermissionSerializer

class UserPermissionViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = request.user
        if not (user.is_admin or user.is_hr):
            return Response({'error': 'You do not have permission to update user permissions.'}, status=403)

        instance = self.get_object()
        instance._changed_by = user  # Set the user who is making the change

        return super().update(request, *args, **kwargs)
