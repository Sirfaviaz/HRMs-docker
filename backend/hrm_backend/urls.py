"""
URL configuration for hrm_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [

    path('admin/', admin.site.urls),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('accounts/', include('accounts.urls')),
    path('employees/', include('employees.urls')),
    path('departments/', include('departments.urls')),
    path('jobs/', include('jobs.urls')),
    path('admin_app/',include('admin_app.urls')),
    path('attendance/',include('attendance.urls')),
    path('chat/',include('chat.urls')),
    path('notifications/', include('notifications.urls')),
    path('meetings/',include('meetings.urls')),
    path('import-export/', include('data_import_export.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)






