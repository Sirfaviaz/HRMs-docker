from django.db import models

# Create your models here.


from django.db import models
from hrm_backend.settings import AUTH_USER_MODEL as User

class Meeting(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    organizer = models.ForeignKey(User, related_name='organized_meetings', on_delete=models.CASCADE)
    participants = models.ManyToManyField(User, related_name='meetings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.title
