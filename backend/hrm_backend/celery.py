# hrm_project/celery.py

import os
from celery import Celery
from django.conf import settings 

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrm_backend.settings')

app = Celery('hrm_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
