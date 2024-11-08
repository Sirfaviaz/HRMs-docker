from django.urls import path, include
from rest_framework.routers import DefaultRouter
from employees.views import DocumentRequestViewSet, DocumentViewSet, EmployeeViewSet, EmployeeProfileView, SendInfoLinkView, ValidateTokenView, SubmitPersonalInfoView,EmployeeDocumentsView

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'document-requests', DocumentRequestViewSet, basename='document-requests')
router.register(r'documents', DocumentViewSet, basename='documents')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', EmployeeProfileView.as_view(), name='employee-profile'),  # Profile URL under /employees/
    path('send-info-link/', SendInfoLinkView.as_view(), name='send-info-link'),
    path('validate-token/<uid>/<token>/', ValidateTokenView.as_view(), name='validate-token'),
    path('submit-info/<uid>/<token>/', SubmitPersonalInfoView.as_view(), name='submit-personal-info'),
    path('document-list/<int:employee_id>/documents/', EmployeeDocumentsView.as_view(), name='employee-documents'),
]
