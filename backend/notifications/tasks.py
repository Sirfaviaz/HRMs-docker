# notifications/tasks.py

import json
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task(bind=True, max_retries=3)
def send_assignment_email(self, subject, message, recipient_list):
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            fail_silently=False,
        )
    except Exception as exc:
        # Optionally log the exception
        # logger.error(f"Error sending email: {exc}")
        print(f"Error sending email: {exc}")
        raise self.retry(exc=exc, countdown=60)



# from celery import shared_task
# from firebase_admin import messaging
# import firebase_admin.exceptions
# import logging

# logger = logging.getLogger(__name__)

# @shared_task(bind=True, max_retries=3)
# def send_push_notification_task(self, title, body, data_message, registration_token):
#     try:
#         message = messaging.Message(
#             notification=messaging.Notification(
#                 title=title,
#                 body=body,
#             ),
#             token=registration_token,
#             data=data_message,
#         )
#         response = messaging.send(message)
#         logger.info(f"Successfully sent message: {response}")
#     except firebase_admin.exceptions.FirebaseError as exc:
#         logger.error(f"Error sending message: {exc}")
#         raise self.retry(exc=exc, countdown=60)


# notifications/tasks.py

from celery import shared_task
from firebase_admin import messaging
from django.contrib.auth import get_user_model
from .models import Device
import logging

logger = logging.getLogger(__name__)

User = get_user_model()
@shared_task(bind=True, max_retries=3)
def send_push_notification_task(self, user_id, title, body, data_message=None):
    try:
        # Verify that data_message is a dictionary
        if not isinstance(data_message, dict):
            logger.error(f"data_message is not a dictionary: {data_message}")
            data_message = {}

        # Proceed with sending the message
        user = User.objects.get(pk=user_id)
        device_tokens = Device.objects.filter(user=user).values_list('device_token', flat=True)
        tokens = list(device_tokens)
        if tokens:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                tokens=tokens,
                data=data_message,
            )
            response = messaging.send_multicast(message)
            logger.info(f"Successfully sent message to {response.success_count} devices.")
            # Handle failures...
        else:
            logger.warning(f"No device tokens found for user {user.username}.")
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} does not exist.")
    except Exception as exc:
        logger.exception("An unexpected error occurred.")
        raise self.retry(exc=exc, countdown=60)
    



@shared_task
def send_meeting_invitation_email(participant_emails, meeting_title, meeting_start_time, meeting_end_time):

    subject = f'Invitation to Meeting: {meeting_title}'
    message = (
        f'You have been invited to a meeting.\n\n'
        f'Meeting Title: {meeting_title}\n'
        f'Start Time: {meeting_start_time}\n'
        f'End Time: {meeting_end_time}\n\n'
        f'Please mark your calendar accordingly.'
    )
    
    # Send email to all participants
    logger.info(f"in sendind{participant_emails}" )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        participant_emails,
        fail_silently=False,
    )