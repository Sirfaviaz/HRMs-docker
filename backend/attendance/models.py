from django.db import models
from employees.models import Employee

# Create your models here.
# attendance/models.py

class AttendanceRecord(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(auto_now_add=True)
    clock_in_time = models.DateTimeField(null=True, blank=True)
    clock_out_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.employee.user.get_username()} - {self.date}"


class LeaveRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=50, choices=[
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ], default='Pending')

    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.start_date} to {self.end_date}"

class Holiday(models.Model):
    name = models.CharField(max_length=255)
    date = models.DateField()

    def __str__(self):
        return self.name