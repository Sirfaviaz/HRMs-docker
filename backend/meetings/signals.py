# signals.py

from django.db.models.signals import post_save,m2m_changed
from django.dispatch import receiver

from notifications.tasks import send_meeting_invitation_email
from .models import Meeting

@receiver(m2m_changed, sender=Meeting.participants.through)
def notify_participants(sender, instance, action, **kwargs):
    if action == "post_add":  # Only trigger after participants are added
        # Get the emails of the participants
        participant_emails = instance.participants.values_list('email', flat=True)
        
        print("mails", list(participant_emails),
              "other details", instance.title, instance.start_time, instance.end_time)
        
        # Send email notifications asynchronously using Celery
        send_meeting_invitation_email.delay(
            list(participant_emails),
            instance.title,
            instance.start_time,
            instance.end_time
        )
