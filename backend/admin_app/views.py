from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from employees.models import Employee
from jobs.models import CandidateApplication, JobPosting

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Count employees based on their status
        total_employees = Employee.objects.count()  # Total number of employees
        present_employees = Employee.objects.filter(status=True).count()
        absent_employees = total_employees - present_employees  # Calculate absent employees
        
        active_job_postings = JobPosting.objects.filter(is_active=True).count()
        pending_onboarding = CandidateApplication.objects.filter(status='Offered').count()

        return Response({
            'totalEmployees': total_employees,
            'presentEmployees': present_employees,
            'absentEmployees': absent_employees,
            'activeJobPostings': active_job_postings,
            'pendingOnboarding': pending_onboarding,
        })
