from django.urls import path
from admin_app.views import AdminStatsView

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
