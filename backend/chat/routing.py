from django.urls import re_path
from .consumers import ChatConsumer  # Import the ChatConsumer class directly

from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/$', ChatConsumer.as_asgi()),  # General chat list updates
    re_path(r'ws/chat/(?P<chat_room_id>\w+)/$', ChatConsumer.as_asgi()),  # Specific chat rooms
]
