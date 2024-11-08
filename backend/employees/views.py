from rest_framework import viewsets
from employees.serializers import DocumentRequestSerializer, EmployeeSerializer, DocumentSerializer
from accounts.permissions import IsAdminUser, IsHRUser, IsAdminOrHR, IsOwnerOrAdminOrHR, IsOwnerOrCanEdit
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import get_user_model
from rest_framework import status
from .models import Document, DocumentRequest
from employees.models import Employee, EmployeeJobDetails, EmployeePersonalDetails
from employees.serializers import EmployeeProfileSerializer, PersonalInfoSerializer, JobDetailsSerializer
from employees.usecases.send_info_link import SendInfoLinkUseCase


# class EmployeeViewSet(viewsets.ModelViewSet):
#     queryset = Employee.objects.all()
#     serializer_class = EmployeeSerializer

    

#     def get_permissions(self):
#         permission_classes = [IsAuthenticated]
        
#         if self.action == 'create':
          
#             permission_classes.append(IsHRUser)
#         elif self.action in ['update', 'partial_update', 'destroy']:
            
#             permission_classes.append(IsAdminUser)
#         elif self.action == 'list':
        
#             permission_classes.append(IsAdminOrHR)
#         elif self.action == 'retrieve':
           
#             permission_classes.append(IsAdminOrHR)
#         else:
        
#             permission_classes.append(IsAdminOrHR)
#         print(f"Applying permissions: {self.permission_classes}")
#         return [permission() for permission in permission_classes]





class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [IsAuthenticated, IsHRUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsOwnerOrCanEdit]
        elif self.action == 'list':
            self.permission_classes = [IsAuthenticated, IsAdminOrHR]
        elif self.action == 'retrieve':
            self.permission_classes = [IsAuthenticated, IsOwnerOrCanEdit]
        else:
            self.permission_classes = [IsAuthenticated, IsAdminOrHR]
        print(f"Applying permissions: {self.permission_classes}")
        return [permission() for permission in self.permission_classes]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        files = request.FILES

        # Handle profile picture
        if 'profile_picture' in files:
            data['image'] = files['profile_picture']

        # Extract documents
        aadhaar_file = files.get('aadhaar')
        passport_file = files.get('passport')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()

        # Handle documents
        if aadhaar_file:
            Document.objects.create(employee=employee, name='Aadhaar', file=aadhaar_file)
        if passport_file:
            Document.objects.create(employee=employee, name='Passport', file=passport_file)

        headers = self.get_success_headers(serializer.data)
        return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        files = request.FILES

        # Logging to check incoming data
        print("Received data for update:", data)

        # Handle profile picture
        if 'profile_picture' in files:
            data['image'] = files['profile_picture']

        # Extract documents
        aadhaar_file = files.get('aadhaar')
        passport_file = files.get('passport')

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        print("Validated data:", serializer.validated_data)
        employee = serializer.save()

        # Handle documents
        if aadhaar_file:
            Document.objects.create(employee=employee, name='Aadhaar', file=aadhaar_file)
        if passport_file:
            Document.objects.create(employee=employee, name='Passport', file=passport_file)

        return Response(EmployeeSerializer(employee).data)




class EmployeeProfileView(APIView):
    
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        print(f"Authenticated user: {request.user}")
        try:
         
            employee = Employee.objects.get(user=request.user)
            
            
            try:
                personal_details = EmployeePersonalDetails.objects.get(employee=employee)
                personal_details_data = PersonalInfoSerializer(personal_details).data
            except EmployeePersonalDetails.DoesNotExist:
                personal_details_data = None  

            try:
                job_details = EmployeeJobDetails.objects.get(employee=employee)
                job_details_data = JobDetailsSerializer(job_details).data
            except EmployeeJobDetails.DoesNotExist:
                job_details_data = None  

           
            employee_data = EmployeeProfileSerializer(employee).data

            return Response({
                'employee': employee_data,
                'personal_details': personal_details_data,
                'job_details': job_details_data
            }, status=status.HTTP_200_OK)

        except Employee.DoesNotExist:
            return Response({"error": "Employee profile not found"}, status=status.HTTP_404_NOT_FOUND)






class SendInfoLinkView(APIView):
    def post(self, request):
        email = request.data.get('email')
        response, status_code = SendInfoLinkUseCase.send_link(email)
        return Response(response, status=status_code)






User = get_user_model()

class ValidateTokenView(APIView):
    def get(self, request, uid, token):
        try:
            # Ensure uid and token are provided
            if not uid or not token:
                return Response({"detail": "Missing UID or token."}, status=status.HTTP_400_BAD_REQUEST)

            # Decode the user ID (urlsafe_base64_decode can handle padded encoding)
            decoded_uid = urlsafe_base64_decode(uid).decode()

           
            decoded_uid = decoded_uid.lstrip('0')

          
            user = User.objects.get(pk=decoded_uid)

            token_generator = PasswordResetTokenGenerator()
            if not token_generator.check_token(user, token):
                return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

            
            return Response({
                "detail": "Valid token.",
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,  # Optionally, you can include email as well
                "username": user.username  # Optionally, include username as well
            }, status=status.HTTP_200_OK)

        except (User.DoesNotExist, ValueError, OverflowError, TypeError):
            # Catch potential errors like decoding failure, invalid user lookup, etc.
            return Response({"detail": "Invalid link or user does not exist."}, status=status.HTTP_400_BAD_REQUEST)


class SubmitPersonalInfoView(APIView):
    def post(self, request, uid, token):
        try:
            # Decode the user ID
            uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid)

            # Validate the token
            token_generator = PasswordResetTokenGenerator()
            if not token_generator.check_token(user, token):
                return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

            # Extract individual personal details from the request
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            dob = request.data.get('dob')
            gender = request.data.get('gender')
            address = request.data.get('address')
            country = request.data.get('country')
            city = request.data.get('city')
            experience = request.data.get('experience')

            personal_details_data = {
                'first_name': first_name,
                'last_name': last_name,
                'date_of_birth': dob,
                'gender': gender,
                'address': address,
                'country': country,
                'city': city,
                'experience': experience,
            }
            print(f"Received personal details: {personal_details_data}")

          
            adhaar_name = request.data.get('adhaar_name')
            adhaar_file = request.FILES.get('adhaar')
            pan_file = request.FILES.get('pan')

            
            personal_details, created = EmployeePersonalDetails.objects.update_or_create(
                employee=user.employee,
                defaults=personal_details_data
            )

            # Save Aadhaar document
            if adhaar_file:
                Document.objects.create(employee=user.employee, name=f'Aadhaar ({adhaar_name})', file=adhaar_file)

            # Save PAN document
            if pan_file:
                Document.objects.create(employee=user.employee, name='PAN', file=pan_file)

            return Response({"detail": "Personal details and documents submitted successfully."}, status=status.HTTP_200_OK)

        except (User.DoesNotExist, ValueError, OverflowError):
            return Response({"detail": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)


class EmployeeDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        try:
            employee = Employee.objects.get(user_id=employee_id)

            # Make sure the requesting user has permission to view these documents
            if employee.user != request.user and not request.user.is_staff:
                return Response({"detail": "You do not have permission to access this employee's documents."}, status=status.HTTP_403_FORBIDDEN)

            documents = Document.objects.filter(employee=employee)
            serializer = DocumentSerializer(documents, many=True, context={'request': request})  # Pass request here
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Employee.DoesNotExist:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)
        




class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated, IsOwnerOrAdminOrHR]
        elif self.action in ['create']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminOrHR]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Set the employee to the current user
        serializer.save(employee=self.request.user.employee)




class DocumentRequestViewSet(viewsets.ModelViewSet):
    queryset = DocumentRequest.objects.all()
    serializer_class = DocumentRequestSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [IsAuthenticated, IsAdminOrHR]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminOrHR]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_hr:
            return DocumentRequest.objects.all()
        else:
            return DocumentRequest.objects.filter(employee__user=user)



