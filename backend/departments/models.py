from django.db import models
from simple_history.models import HistoricalRecords  # Import the historical tracking

class Department(models.Model):
    name = models.CharField(max_length=255, unique=True)
    history = HistoricalRecords()  # Add historical tracking

    def __str__(self):
        return self.name


class Position(models.Model):
    title = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')
    description = models.TextField(blank=True, null=True)
    is_executive = models.BooleanField(default=False)
    reports_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    level = models.PositiveIntegerField(default=1)
    history = HistoricalRecords()  # Add historical tracking

    def __str__(self):
        return f'{self.title} ({self.department.name})'
