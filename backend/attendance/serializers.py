from rest_framework import serializers
from .models import AttendanceRecord, LeaveRequest

class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        read_only_fields = ['date', 'employee']
        fields = ['date', 'clock_in_time', 'clock_out_time']


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.user.get_full_name')

    class Meta:
        model = LeaveRequest
        fields = ['id', 'employee', 'employee_name', 'start_date', 'end_date', 'reason', 'status']
        read_only_fields = ['status', 'employee']