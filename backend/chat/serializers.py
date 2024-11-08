from rest_framework import serializers
from .models import ChatRoom, Message
from accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model, used to display user information."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email','first_name', 'last_name']

class ChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for ChatRoom model to handle chat room data."""
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    last_message_timestamp = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'participants', 'is_private', 'last_message', 'last_message_timestamp']

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        return last_message.content if last_message else None

    def get_last_message_timestamp(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        return last_message.timestamp if last_message else None

class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model to handle chat messages."""
    sender = UserSerializer(read_only=True)
    chat_room = serializers.PrimaryKeyRelatedField(queryset=ChatRoom.objects.all())

    class Meta:
        model = Message
        fields = ['id', 'sender', 'chat_room', 'content', 'timestamp']
