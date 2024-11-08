from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.timezone import now


class ExpiringPasswordResetTokenGenerator(PasswordResetTokenGenerator):
    def __init__(self, expiration_minutes=5):
        self.expiration_minutes = expiration_minutes
        super().__init__()

    def _check_token(self, user, token):
        """
        Override the token check to ensure the token is no older than 5 minutes.
        """
        # Check if token is valid using the parent method
        if not super().check_token(user, token):
            return False

        # Extract timestamp from the token and ensure it's no older than 5 minutes
        timestamp = self._num_seconds(self._make_token_with_timestamp(user, 1))
        current_time = self._num_seconds(now())
        return (current_time - timestamp) <= self.expiration_minutes * 60


# Create an instance of the custom token generator
password_reset_token_generator = ExpiringPasswordResetTokenGenerator(expiration_minutes=5)
