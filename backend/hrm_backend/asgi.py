"""
ASGI config for hrm_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""
# hrm_backend/asgi.py
import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter

# Set the environment variable for Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrm_backend.settings')

# Setup Django before importing anything else
django.setup()

from django.core.asgi import get_asgi_application
from chat.middleware import JWTAuthMiddleware
import chat.routing
from notifications.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            chat.routing.websocket_urlpatterns+
            websocket_urlpatterns
        )
    ),
})


