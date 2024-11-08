# jobs/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import  AcceptedCandidatesView, CandidateStageViewSet, ContractUploadView, EmployeeContractViewSet, JobPostingViewSet, CandidateApplicationViewSet, OnboardingCandidatesView, StageSetViewSet, StageViewSet, handle_contract_upload

router = DefaultRouter()
router.register(r'job-postings', JobPostingViewSet, basename='jobposting')
router.register(r'applications', CandidateApplicationViewSet, basename='candidateapplication')
router.register(r'stages', StageViewSet, basename='stage')
router.register(r'candidate-stages', CandidateStageViewSet, basename= 'candidatestages') 
router.register(r'stage-sets', StageSetViewSet)
router.register(r'contracts', EmployeeContractViewSet, basename='contract')

urlpatterns = [
    path('', include(router.urls)),
    path('candidates/for-onboarding/', OnboardingCandidatesView.as_view(), name='onboarding-candidates'),
    path('contract/<int:contract_id>/upload-signed/', ContractUploadView.as_view(), name='contract-upload'),
    path('contract/<int:contract_id>/upload/', handle_contract_upload, name='handle-contract-upload'),
    path('candidates/accepted/', AcceptedCandidatesView.as_view(), name='accepted-candidates'),
      
]
