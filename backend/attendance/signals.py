from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import AttendanceRecord, Employee

@receiver(post_save, sender=AttendanceRecord)
def update_employee_status(sender, instance, **kwargs):
    """
    Updates the employee's `is_present` field based on clock_in and clock_out times.
    """
    # If the clock-out time is set, mark the employee as not present
    if instance.clock_out_time:
        instance.employee.status = False
    # If clock-in time is set and no clock-out, mark the employee as present
    elif instance.clock_in_time and not instance.clock_out_time:
        instance.employee.status = True
    
    # Save the employee's updated status
    instance.employee.save()
