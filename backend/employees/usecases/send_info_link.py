from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import User

class SendInfoLinkUseCase:
    @staticmethod
    def send_link(email):
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return {"detail": "No user found with this email."}, 404

        # Generate the token
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)

        # Pad user ID before encoding to avoid short results like 'NA'
        padded_user_id = str(user.pk).zfill(6)  # Pad user ID with zeroes to make it at least 6 digits
        uid = urlsafe_base64_encode(force_bytes(padded_user_id))
        
        print(f"User PK: {user.pk}, Padded UID: {padded_user_id}, Encoded UID: {uid}")

        # Create the link (the link should point to the frontend page for filling personal info)
        info_link = f"{settings.FRONTEND_URL}/fill-info/{uid}/{token}"

        # Send the email
        send_mail(
            'Fill Personal Info',
            f'Click the link below to fill your personal information:\n{info_link}\nThis link will expire in 24 hours.',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return {"detail": "Info link sent successfully."}, 200
