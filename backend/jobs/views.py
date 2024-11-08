from rest_framework import viewsets, permissions, status
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from employees.models import Employee
from .models import CandidateStage, EmployeeContract, JobPosting, Stage, StageSet
from .serializers import CandidateStageSerializer, EmployeeContractSerializer, JobPostingSerializer, CandidateApplication,CandidateApplicationSerializer, StageSerializer, StageSetSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response  
from rest_framework.decorators import action
from django.shortcuts import redirect, get_object_or_404
from django.core.files.storage import FileSystemStorage
from django.urls import reverse
from django.contrib import messages
from django.utils import timezone
from django.http import HttpResponseRedirect
from .models import EmployeeContract
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from accounts.models import User  # Import your custom User model

# class JobPostingViewSet(viewsets.ModelViewSet):
#     queryset = JobPosting.objects.all()
#     serializer_class = JobPostingSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save()

#     def get_permissions(self):
#         if self.action in ['create', 'update', 'partial_update', 'destroy']:
#             permission_classes = [permissions.IsAdminUser]  # Only admins can modify
#         else:
#             permission_classes = [permissions.AllowAny]  # Anyone can view
#         return [permission() for permission in permission_classes]

# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework import viewsets, permissions
# from .models import JobPosting, CandidateApplication, CandidateStage, Stage, StageSet
# from .serializers import JobPostingSerializer, CandidateApplicationSerializer, CandidateStageSerializer, StageSerializer, StageSetSerializer

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]  # Only admins can modify
        else:
            permission_classes = [permissions.AllowAny]  # Anyone can view
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'], url_path='applications')
    def applications(self, request, pk=None):
        """Custom action to get all applications for a specific job posting"""
        job_posting = self.get_object()
        applications = CandidateApplication.objects.filter(job_posting=job_posting)
        serializer = CandidateApplicationSerializer(applications, many=True)
        return Response(serializer.data)

class CandidateApplicationViewSet(viewsets.ModelViewSet):
    queryset = CandidateApplication.objects.all()
    serializer_class = CandidateApplicationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='convert-to-employee')
    def convert_to_employee(self, request, pk=None):
        try:
            candidate = self.get_object()  # Get the candidate

            # Check if the candidate is already an employee
            if hasattr(candidate, 'employee'):
                return Response({'message': 'Candidate is already an employee'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the candidate has a contract
            if not hasattr(candidate, 'contract'):
                return Response({'message': 'Candidate does not have an associated contract'}, status=status.HTTP_400_BAD_REQUEST)

            contract = candidate.contract  # Access the related contract

            # Convert the candidate into an employee
            user = User.objects.create(
                first_name=candidate.first_name,
                last_name=candidate.last_name,
                email=candidate.email,
                # Add any other necessary fields for the User model
            )

            employee = Employee.objects.create(
                user=user,  # Assuming Employee has a foreign key to User
                department=candidate.job_posting.department,  # Assign a department
                position=candidate.job_posting.position,  # Assign a position
                date_joined=contract.contract_start_date,  # Set the join date from the contract
            )

            return Response({'message': 'Candidate successfully converted to employee'}, status=status.HTTP_200_OK)

        except CandidateApplication.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        serializer.save()

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.AllowAny]  # Anyone can apply
        else:
            permission_classes = [permissions.IsAdminUser]  # Only admins can view/update applications
        return [permission() for permission in permission_classes]

class StageViewSet(viewsets.ModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get job_posting ID from request parameters if available
        job_posting_id = self.request.query_params.get('job_posting', None)
        if job_posting_id:
            try:
                # Get the JobPosting and its related StageSet
                job_posting = JobPosting.objects.get(id=job_posting_id)
                stage_set = job_posting.stage_set
                # Filter stages that belong to the JobPosting's StageSet
                return Stage.objects.filter(stage_set=stage_set)
            except JobPosting.DoesNotExist:
                return Stage.objects.none()  # Return an empty queryset if no job posting is found
        return Stage.objects.all()


class CandidateStageViewSet(viewsets.ModelViewSet):
    queryset = CandidateStage.objects.all()
    serializer_class = CandidateStageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically update CandidateApplication status to Active when creating a new stage
        candidate_application = serializer.validated_data['candidate_application']
        candidate_application.status = 'Active'
        candidate_application.save()
        serializer.save()
    @action(detail=False, methods=['get'], url_path='assigned-stages')
    def assigned_stages(self, request):
        """Fetch all stages assigned to the logged-in employee"""
        employee = request.user.employee  # Assuming each user has an employee profile
        assigned_stages = CandidateStage.objects.filter(assigned_employee=employee)
        serializer = self.get_serializer(assigned_stages, many=True)
        return Response(serializer.data)

class StageSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for performing CRUD operations on StageSets
    """
    queryset = StageSet.objects.all()
    serializer_class = StageSetSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='stages')
    def stages(self, request, pk=None):
        """Custom action to get all stages for a specific stage set"""
        stage_set = self.get_object()
        stages = Stage.objects.filter(stage_set=stage_set)
        serializer = StageSerializer(stages, many=True)
        return Response(serializer.data)
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from jobs.models import CandidateApplication

class OnboardingCandidatesView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access this

    def get(self, request):
        # Get all candidate applications where they have passed all stages
        passed_candidates = CandidateApplication.objects.filter(status='Active')  # Or add other filters if needed
        
        # Filter candidates who passed all stages
        passed_candidates = [candidate for candidate in passed_candidates if candidate.has_passed_all_stages()]
        
        # Serialize the data (you can create a custom serializer if needed)
        data = [{
            'id': candidate.id,
            'first_name': candidate.first_name,
            'last_name': candidate.last_name,
            'email': candidate.email,
            'job_posting_title': candidate.job_posting.title,
        } for candidate in passed_candidates]

        return Response(data)



# class EmployeeContractViewSet(viewsets.ModelViewSet):
#     queryset = EmployeeContract.objects.all()
#     serializer_class = EmployeeContractSerializer



#     def retrieve(self, request, *args, **kwargs):
#         """Retrieve contract by candidate ID (assuming candidate application ID is passed)"""
#         candidate_application_id = kwargs.get('pk')
#         try:
#             contract = EmployeeContract.objects.get(candidate_application_id=candidate_application_id)
#             serializer = self.get_serializer(contract)
#             return Response(serializer.data)
#         except EmployeeContract.DoesNotExist:
#             return Response({'detail': 'Contract not found.'}, status=status.HTTP_404_NOT_FOUND)

#     def update(self, request, *args, **kwargs):
#         """Handle partial and full updates for EmployeeContract"""
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
        
#         if serializer.is_valid():
#             # Save the contract data
#             serializer.save()

#             # Handle contract acceptance
#             if 'accepted' in request.data and request.data['accepted'] is True:
#                 if not instance.accepted:  # If it wasn't already accepted
#                     instance.date_accepted = timezone.now().date()
#                     instance.save()

#                     # Additional logic can be added here, such as converting the candidate to an employee
#                     self._convert_candidate_to_employee(instance.candidate_application)

#             return Response(serializer.data)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def _convert_candidate_to_employee(self, candidate_application):
#         """Convert a candidate to an employee after the contract is accepted"""
#         # Check if the candidate is already an employee (to avoid duplicates)
#         if not hasattr(candidate_application, 'employee'):
#             # Create an Employee from the CandidateApplication
#             employee = Employee.objects.create(
#                 first_name=candidate_application.first_name,
#                 last_name=candidate_application.last_name,
#                 email=candidate_application.email,
#                 # Add any other fields necessary for the employee creation
#             )
#             return employee
#         return None
    

# from django.core.mail import EmailMessage
# from django.template.loader import render_to_string
# from django.http import JsonResponse
# from django.views import View
# from io import BytesIO
# from django.http import FileResponse
# from xhtml2pdf import pisa  # For generating PDF from HTML
# from .models import EmployeeContract

# class SendOfferLetterView(View):

#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, *args, **kwargs):
#         contract_id = request.data.get('contract_id')

#         try:
#             # Fetch the contract details
#             contract = EmployeeContract.objects.get(id=contract_id)

#             # Generate the HTML content for the email
#             html_content = render_to_string('emails/offer_letter.html', {
#                 'contract': contract,
#             })

#             # Optionally: Generate PDF attachment from HTML
#             pdf = self.generate_pdf(html_content)

#             # Prepare email
#             subject = f"Offer Letter for {contract.candidate_application.first_name} {contract.candidate_application.last_name}"
#             email = EmailMessage(
#                 subject,
#                 html_content,
#                 'from@example.com',  # Replace with your email
#                 [contract.candidate_application.email],
#             )

#             # Attach PDF if needed
#             email.attach(f"Offer_Letter_{contract.candidate_application.first_name}.pdf", pdf, 'application/pdf')

#             # Send email
#             email.content_subtype = 'html'  # To send an HTML email
#             email.send()

#             return JsonResponse({'message': 'Offer letter sent successfully'}, status=200)

#         except EmployeeContract.DoesNotExist:
#             return JsonResponse({'error': 'Contract not found'}, status=404)

#     def generate_pdf(self, html_content):
#         """Generate a PDF from HTML content."""
#         result = BytesIO()
#         pdf = pisa.pisaDocument(BytesIO(html_content.encode('UTF-8')), result)
#         if not pdf.err:
#             return result.getvalue()
#         return None


from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from io import BytesIO
from xhtml2pdf import pisa  # For generating PDF from HTML
from rest_framework.permissions import IsAuthenticated

class EmployeeContractViewSet(viewsets.ModelViewSet):
    queryset = EmployeeContract.objects.all()
    serializer_class = EmployeeContractSerializer

    def retrieve(self, request, *args, **kwargs):
        """Retrieve contract by candidate application ID"""
        candidate_application_id = kwargs.get('pk')  # Use the candidate application ID instead of contract ID
        try:
            # Get the contract using the candidate_application ID
            contract = EmployeeContract.objects.get(candidate_application_id=candidate_application_id)
            serializer = self.get_serializer(contract)
            return Response(serializer.data)
        except EmployeeContract.DoesNotExist:
            return Response({'detail': 'Contract not found.'}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, *args, **kwargs):
        """Handle partial and full updates for EmployeeContract"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Save the contract data
            serializer.save()

            # Handle contract acceptance
            if 'accepted' in request.data and request.data['accepted'] is True:
                if not instance.accepted:  # If it wasn't already accepted
                    instance.date_accepted = timezone.now().date()
                    instance.save()

                    # Additional logic can be added here, such as converting the candidate to an employee
                    self._convert_candidate_to_employee(instance.candidate_application)

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _convert_candidate_to_employee(self, candidate_application):
        """Convert a candidate to an employee after the contract is accepted"""
        # Check if the candidate is already an employee (to avoid duplicates)
        if not hasattr(candidate_application, 'employee'):
            # Create an Employee from the CandidateApplication
            employee = Employee.objects.create(
                first_name=candidate_application.first_name,
                last_name=candidate_application.last_name,
                email=candidate_application.email,
                # Add any other fields necessary for the employee creation
            )
            return employee
        return None

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='generate-offer-letter')
    def send_offer_letter(self, request, pk=None):
        try:
            contract = self.get_object()

            # Generate the URL for accepting the offer
            contract_upload = request.build_absolute_uri(reverse('handle-contract-upload', args=[contract.id]))


            # Generate the link to upload signed contract
            upload_url = request.build_absolute_uri(reverse('contract-upload', args=[contract.id]))
            print("print",upload_url,contract_upload)

            # Generate the HTML content for the email
            html_content = render_to_string('emails/offer_letter.html', {
                'contract': contract,
                'upload_url': upload_url,
                'contract_upload':contract_upload
            })
            
            html_contract_content = render_to_string('emails/contract_letter.html', {
            'contract': contract,
            'company_name': 'HRM',
            'company_representative': 'John Doe',
            'company_domain': 'hrms.com',
            'contract_upload': contract_upload,
        })



            # Generate PDF attachment from HTML
            pdf = self.generate_pdf(html_contract_content)

            # Prepare email
            subject = f"Offer Letter for {contract.candidate_application.first_name} {contract.candidate_application.last_name}"
            email = EmailMessage(
                subject,
                html_content,
                'from@example.com',
                [contract.candidate_application.email],
            )

            # Attach PDF if needed
            email.attach(f"contract_{contract.candidate_application.first_name}.pdf", pdf, 'application/pdf')

            email.content_subtype = 'html'
            email.send()

            return Response({'message': 'Offer letter sent successfully'}, status=200)
        except EmployeeContract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=404)

    def generate_pdf(self, html_content):
        """Generate a PDF from HTML content."""
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html_content.encode('UTF-8')), result)
        if not pdf.err:
            return result.getvalue()
        return None


@csrf_exempt
def handle_contract_upload(request, contract_id):
    contract = get_object_or_404(EmployeeContract, id=contract_id)
    
    if request.method == 'POST':
        if 'signed_contract' not in request.FILES:
            messages.error(request, "Please upload a signed contract.")
            return redirect(reverse('contract-upload', args=[contract_id]))
        
        signed_contract = request.FILES['signed_contract']

        # Save the signed contract file
        contract.signed_contract = signed_contract
        contract.accepted = True
        contract.date_accepted = timezone.now()
        contract.save()

        messages.success(request, "Signed contract uploaded successfully!")
        return HttpResponseRedirect(reverse('contract-upload', args=[contract_id]))

    return HttpResponseRedirect(reverse('contract-upload', args=[contract_id]))



class ContractUploadView(View):
    def get(self, request, contract_id):
        contract = get_object_or_404(EmployeeContract, id=contract_id)
        return render(request, 'contracts/upload_signed_contract.html', {'contract': contract})
    



from rest_framework.response import Response
from rest_framework.views import APIView
from jobs.models import JobPosting, CandidateApplication
from jobs.serializers import CandidateApplicationSerializer

class AcceptedCandidatesView(APIView):
    def get(self, request):
        job_postings = JobPosting.objects.prefetch_related('applications__contract').all()  # Prefetch related contracts
        result = []

        for job in job_postings:
            accepted_candidates = job.applications.filter(contract__accepted=True)
            if accepted_candidates.exists():
                result.append({
                    'job_posting_title': job.title,
                    'job_posting_id': job.id,
                    'candidates': CandidateApplicationSerializer(accepted_candidates, many=True, context={'request': request}).data,
                })

        return Response(result)







    