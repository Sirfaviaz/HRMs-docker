# utils.py

from django.db.models import Q
from .models import Meeting

def is_time_slot_available(participants, start_time, end_time):
    conflicts = Meeting.objects.filter(
        participants__in=participants,
        start_time__lt=end_time,
        end_time__gt=start_time
    ).exists()
    return not conflicts
