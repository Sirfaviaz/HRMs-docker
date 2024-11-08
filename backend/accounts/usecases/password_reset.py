from accounts.token_generators import password_reset_token_generator  # Import the custom token generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from accounts.models import User
from django.conf import settings
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator

from django.template.loader import render_to_string

class PasswordResetUseCase:
    @staticmethod
    def send_password_reset_email(email):
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return {"detail": "No user found with this email."}, 404

        # Generate the password reset token
        token = password_reset_token_generator.make_token(user)

        # Encode the user ID
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create a password reset link
        password_reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        print("pwd",password_reset_link)

        # Render the email template with context
        email_html_message = render_to_string('emails/password_reset.html', {
            'user': user,
            'password_reset_link': password_reset_link
        })

        # Send the password reset email
        send_mail(
            'Password Reset Request',
            '',  # Text content can be left empty if you're only using HTML
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=email_html_message,  # Add the HTML message here
            fail_silently=False,
        )

        return {"detail": "Password reset link sent successfully."}, 200
    
    
    @staticmethod
    def reset_password(uidb64, token, new_password):
        try:
            # Decode the user ID
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return {"detail": "Invalid user."}, 400

        # Check if the token is valid
        if not default_token_generator.check_token(user, token):
            return {"detail": "Invalid or expired token."}, 400

        # Set the new password
        user.set_password(new_password)
        user.save()

        return {"detail": "Password has been reset successfully."}, 200