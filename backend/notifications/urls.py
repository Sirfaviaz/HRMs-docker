# hrm_project/urls.py

from django.urls import path
from .views import NotificationListView, clear_all_notifications, mark_notification_as_read, register_device_token  # Import your view here

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notifications_list'),  # Add the correct path
    path('notifications/<int:notification_id>/mark-as-read/', mark_notification_as_read, name='mark_notification_as_read'),
    path('notifications/clear-all/', clear_all_notifications, name='clear_all_notifications'),
    path('register-device-token/', register_device_token, name='register_device_token'),
]
