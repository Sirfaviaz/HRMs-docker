from django.urls import include, path
from .views import AttendanceRecordListView, AttendanceStatusView, ClockInView, ClockOutView, EmployeeAttendanceRecordsView, LeaveRequestViewSet, EmployeeClockInStatusView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')

urlpatterns = [
    path('clock-in/', ClockInView.as_view(), name='clock-in'),
    path('clock-out/', ClockOutView.as_view(), name='clock-out'),
    path('records/', AttendanceRecordListView.as_view(), name='attendance-records'),
    path('status/', AttendanceStatusView.as_view(), name='attendance-status'),
    path('attendance/records/', EmployeeAttendanceRecordsView.as_view(), name='attendance-records'),
    path('clock-in-status/', EmployeeClockInStatusView.as_view(), name='clock-in-status'),
    path('', include(router.urls)),
]