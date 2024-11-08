from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q

def authenticate_user(identifier, password):
    """
    Authenticate user using email or username.

    If the identifier is an email, fetch the username associated with it.
    Then use the username to authenticate.
    """
    User = get_user_model()

    try:
        # Attempt to find the user by email or username
        user_obj = User.objects.get(Q(email=identifier) | Q(username=identifier))
        email = user_obj.email
        
        # Now authenticate using the username
        user = authenticate(username=email, password=password)
    except User.DoesNotExist:
        # No user found with the given identifier
        user = None

    return user

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    # Add custom claims to refresh token
    refresh['username'] = user.username
    refresh['is_admin'] = user.is_admin
    refresh['is_hr'] = user.is_hr
    refresh['is_manager'] = user.is_manager

    # Add custom claims to access token
    access_token = refresh.access_token
    access_token['username'] = user.username
    access_token['is_admin'] = user.is_admin
    access_token['is_hr'] = user.is_hr
    access_token['is_manager'] = user.is_manager

    return {
        'refresh': str(refresh),
        'access': str(access_token),
    }
