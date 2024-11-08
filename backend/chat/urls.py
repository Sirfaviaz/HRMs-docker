from django.urls import path
from .views import ChatRoomListView, MessageListView, ContactListView, PrivateChatRoomView, current_user

urlpatterns = [
    path('chat-rooms/', ChatRoomListView.as_view(), name='chat-room-list'),
    path('chat-rooms/<int:chat_room_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('contacts/', ContactListView.as_view(), name='contact-list'),
    path('private-chat/', PrivateChatRoomView.as_view(), name='private-chat'),
    path('current_user/', current_user, name='current_user'),
]