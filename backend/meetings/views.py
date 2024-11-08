from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from dateutil.parser import parse
from meetings.models import Meeting
from meetings.serializers import MeetingSerializer
from meetings.utils import is_time_slot_available

# Get the correct User model
User = get_user_model()

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        participant_ids = request.data.get('participant_ids', [])
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')

        # Convert start_time and end_time to datetime objects if they are strings
        try:
            if isinstance(start_time, str):
                start_time = parse(start_time)
            if isinstance(end_time, str):
                end_time = parse(end_time)
        except ValueError:
            return Response(
                {'error': 'Invalid date format for start_time or end_time.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure that participants are available for the time slot
        if not is_time_slot_available(participant_ids, start_time, end_time):
            return Response(
                {'error': 'One or more participants are unavailable during this time slot.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch the actual participants from the provided participant IDs
        participants = User.objects.filter(id__in=participant_ids)

        if not participants.exists():
            return Response(
                {'error': 'One or more participants are invalid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the meeting and assign participants
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Call perform_create to save the organizer and participants
        self.perform_create(serializer, participants)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer, participants):
        serializer.save(organizer=self.request.user, participants=participants)

    def list(self, request, *args, **kwargs):
        user = request.user
        # Check if the user is an admin or manager
        if user.is_admin or user.is_manager:
            queryset = Meeting.objects.all()  # Retrieve all meetings for admins or managers
        else:
            queryset = Meeting.objects.filter(participants=user)  # Only meetings where the user is a participant

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
