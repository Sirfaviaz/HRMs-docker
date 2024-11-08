from django.utils import timezone
from django.db import models
from accounts.models import User
from departments.models import Department, Position  # Importing the models from a different app
from simple_history.models import HistoricalRecords  # Import historical tracking
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

def validate_image(image):
    file_size = image.file.size
    limit_kb = 500  # 500 KB limit
    if file_size > limit_kb * 1024:
        raise ValidationError("Maximum file size is %s KB" % limit_kb)

    # Check image format (optional)
    valid_mime_types = ['image/jpeg', 'image/png']
    if image.file.content_type not in valid_mime_types:
        raise ValidationError("Unsupported file type.")

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True)
    date_joined = models.DateField()
    image = models.ImageField(upload_to='employee_images/', null=True, blank=True, validators=[validate_image])
    history = HistoricalRecords()  # Add historical tracking
    status = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

class EmployeePersonalDetails(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='personal_details')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')], null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    experience = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)  # In years
    history = HistoricalRecords()  # Add historical tracking

    def __str__(self):
        return f"Personal Details for {self.employee.user.first_name} {self.employee.user.last_name}"

class EmployeeJobDetails(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='job_details')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    job_position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True)
    shift = models.CharField(max_length=100, null=True, blank=True)
    work_type = models.CharField(max_length=100, null=True, blank=True)
    employee_type = models.CharField(max_length=100, null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    history = HistoricalRecords()  # Add historical tracking

    def __str__(self):
        return f"Job Details for {self.employee.user.first_name} {self.employee.user.last_name}"


class Document(models.Model):
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)  # Name of the document
    file = models.FileField(upload_to='employee_documents/')
    uploaded_at = models.DateTimeField(default=timezone.now)
    approved = models.BooleanField(default=False)  # New field added

    def __str__(self):
        return f"{self.name} uploaded by {self.employee.user.first_name} {self.employee.user.last_name}"


class DocumentRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]

    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='document_requests')
    requested_by = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, related_name='requests_made')
    document_name = models.CharField(max_length=255)
    message = models.TextField(blank=True, null=True)
    requested_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Request for {self.document_name} by {self.requested_by.get_full_name()} to {self.employee.user.get_full_name()}"
    


