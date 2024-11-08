from rest_framework import serializers
from accounts.models import User
from accounts.usecases.authentication import get_tokens_for_user, authenticate_user
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'is_admin', 'is_hr', 'is_manager')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, attrs):
        identifier = attrs.get('identifier')
        password = attrs.get('password')

        user = authenticate_user(identifier, password)
        if not user:
            raise serializers.ValidationError('Invalid credentials')

        tokens = get_tokens_for_user(user)
        return {
            'access': tokens['access'],
            'refresh': tokens['refresh'],
        }

from rest_framework import serializers
from accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'username')


class UserPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__" 

    def validate(self, data):
        request_user = self.context['request'].user
        if not (request_user.is_admin or request_user.is_hr):
            raise serializers.ValidationError("You do not have permission to set user permissions.")
        return data