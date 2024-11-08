# serializers.py

from rest_framework import serializers
from .models import Meeting
from django.contrib.auth import get_user_model

User = get_user_model()

class MeetingSerializer(serializers.ModelSerializer):
    organizer = serializers.ReadOnlyField(source='organizer.username')
    participant_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, write_only=True, source='participants'
    )
    participants = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'description', 'organizer', 'participants', 'participant_ids',
            'start_time', 'end_time', 'location'
        ]
