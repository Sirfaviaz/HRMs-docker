# views.py
from rest_framework import generics, permissions
from accounts.models import User
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import OuterRef, Subquery

class ChatRoomListView(generics.ListAPIView):
    """List all chat rooms the current user is a participant in."""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Fetch chat rooms where the current user is a participant
        queryset = ChatRoom.objects.filter(participants=self.request.user)

        # Get the latest message for each chat room
        latest_message_subquery = Message.objects.filter(
            chat_room=OuterRef('pk')
        ).order_by('-timestamp').values('content')[:1]

        queryset = queryset.annotate(last_message=Subquery(latest_message_subquery))
        return queryset

class MessageListView(generics.ListAPIView):
    """List all messages in a specific chat room."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chat_room_id = self.kwargs['chat_room_id']
        return Message.objects.filter(chat_room__id=chat_room_id).order_by('timestamp')


class ContactListView(APIView):
    """View to list all users as contacts."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        contacts = User.objects.all()
        serializer = UserSerializer(contacts, many=True)
        return Response(serializer.data)
    

class PrivateChatRoomView(APIView):
    """View to get or create a private chat room between two users."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user1 = request.user
        user2_id = request.data.get('user_id')

        if not user2_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user2 = User.objects.get(id=user2_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user1 == user2:
            return Response({"error": "Cannot create a chat with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a private chat room already exists
        chat_room = ChatRoom.objects.filter(
            participants=user1
        ).filter(
            participants=user2
        ).filter(
            is_private=True
        ).first()

        if not chat_room:
            # Create a new private chat room
            chat_room = ChatRoom.objects.create(is_private=True)
            chat_room.participants.add(user1, user2)

        serializer = ChatRoomSerializer(chat_room)
        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer  # Create this serializer
from django.contrib.auth import get_user_model   

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)