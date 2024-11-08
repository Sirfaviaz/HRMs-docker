import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

@database_sync_to_async
def get_user(token):
    """
    This function decodes the JWT token and retrieves the user associated with it.
    """
    try:
        # Decode the JWT token using the project's secret key
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(id=payload['user_id'])
        return user
    except jwt.ExpiredSignatureError:
        print("Token has expired")
    except jwt.InvalidTokenError:
        print("Invalid token")
    except User.DoesNotExist:
        print("User does not exist")
    return None


class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware to handle WebSocket JWT authentication.
    """

    async def __call__(self, scope, receive, send):
        # Get headers and query string from the scope
        headers = dict(scope.get("headers", []))
        query_string = scope.get("query_string", b"").decode()

        token = None

        # Check if the token is in the Authorization header
        if b"authorization" in headers:
            auth_header = headers[b"authorization"].decode().split()
            if len(auth_header) == 2 and auth_header[0].lower() == "bearer":
                token = auth_header[1]

        # Check if the token is in the query string (for WebSocket connections)
        elif "token=" in query_string:
            token = query_string.split("token=")[-1]

        if token:
            # Attempt to retrieve the user associated with the token
            user = await get_user(token)
            if user:
                scope["user"] = user
            else:
                # If token is invalid or user is not found, set to AnonymousUser
                scope["user"] = AnonymousUser()
        else:
            # No token found, set to AnonymousUser
            scope["user"] = AnonymousUser()

        # Proceed to the next middleware or consumer
        return await super().__call__(scope, receive, send)

