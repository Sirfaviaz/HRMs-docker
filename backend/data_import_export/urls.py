from django.urls import path
from .views import EmployeeImportExportView, TestView

urlpatterns = [
    path('emp-data/', EmployeeImportExportView.as_view(), name='employee-import-export'),
    path('test/', TestView.as_view(), name='test-view')
]
