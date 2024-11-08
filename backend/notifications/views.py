#notifications/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets
from notifications.serializers import NotificationSerializer
from .models import Device
from rest_framework.views import APIView

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_device_token(request):
    token = request.data.get('device_token')
    if token:
        device, created = Device.objects.get_or_create(
            user=request.user,
            device_token=token  # Use the correct field name here
        )
        if created:
            return Response({'status': 'success', 'message': 'Device token registered.'}, status=201)
        else:
            return Response({'status': 'success', 'message': 'Device token already exists.'}, status=200)
    else:
        return Response({'error': 'No token provided'}, status=400)
    


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    """
    Mark a specific notification as read.
    """
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.read = True
        notification.save()
        return Response({'status': 'success'}, status=200)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_all_notifications(request):
    """
    Delete all notifications for the logged-in user.
    """
    notifications = Notification.objects.filter(user=request.user)
    notifications.delete()
    return Response({'status': 'success'}, status=204)





