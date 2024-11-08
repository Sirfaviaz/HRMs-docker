from rest_framework import serializers

from employees.models import Employee
from .models import CandidateStage, EmployeeContract, JobPosting, CandidateApplication, Stage, StageSet


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class StageSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), allow_null=True)

    class Meta:
        model = Stage
        fields = '__all__'  

    def create(self, validated_data):
        # Extract employee from validated data if it exists
        employee = validated_data.pop('employee', None)

        # Create the Stage instance
        stage = Stage.objects.create(**validated_data)

        # If there's an employee, associate it with the stage
        if employee:
            stage.employee = employee
            stage.save()

        return stage

class StageSetSerializer(serializers.ModelSerializer):
    stages = StageSerializer(many=True, read_only=True)  # Optionally, you can nest stages within the stage set
    

    class Meta:
        model = StageSet
        fields = '__all__'


from rest_framework import serializers
from .models import JobPosting, StageSet  # Make sure you import StageSet

class JobPostingSerializer(serializers.ModelSerializer):
    stage_set = serializers.PrimaryKeyRelatedField(queryset=StageSet.objects.all(), required=False)  # Allow setting stage_set by ID
    department_name = serializers.CharField(source='department.name', read_only=True)  # Read-only department name

    class Meta:
        model = JobPosting
        fields = '__all__'
    
    def update(self, instance, validated_data):
        # Handle stage_set separately if provided
        stage_set_data = validated_data.pop('stage_set', None)  # Extract stage_set if provided

        # Update the JobPosting fields
        instance = super().update(instance, validated_data)

        # If a stage_set is provided, assign it directly
        if stage_set_data:
            instance.stage_set = stage_set_data
            instance.save()

        return instance



class CandidateStageSerializer(serializers.ModelSerializer):
    stage = StageSerializer(read_only=True)  # Use a nested serializer for reading stage details
    stage_id = serializers.PrimaryKeyRelatedField(queryset=Stage.objects.all(), write_only=True, source='stage')
    
    assigned_employee = EmployeeSerializer(read_only=True)  # Use a nested serializer for reading employee details
    assigned_employee_id = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), write_only=True, source='assigned_employee')

    class Meta:
        model = CandidateStage
        fields = '__all__'
        extra_kwargs = {
            'candidate_application': {'required': False}
        }


class EmployeeContractSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate_application.get_full_name', read_only=True)
    job_title = serializers.CharField(source='candidate_application.job_posting.title', read_only=True)

    class Meta:
        model = EmployeeContract
        fields = [
            'id', 'candidate_application', 'candidate_name', 'job_title', 'salary', 'workshift', 'worktype',
            'employee_type', 'contract_start_date', 'contract_end_date', 'accepted', 'date_accepted', 'created_at','signed_contract'
        ]
        read_only_fields = ['candidate_name', 'job_title', 'created_at', 'date_accepted']

    def validate(self, data):
        # Allow null for contract_start_date
        if 'contract_start_date' not in data or data.get('contract_start_date') is None:
            data['contract_start_date'] = None  # Default to None if not provided
        return data

class CandidateApplicationSerializer(serializers.ModelSerializer):
    contract = EmployeeContractSerializer(read_only=True) 
    stages = CandidateStageSerializer(many=True, read_only=True)
    post_title = serializers.CharField(source='job_posting.title', read_only=True)
    class Meta:
        model = CandidateApplication
        fields = '__all__'
        # read_only_fields = ['application_date', 'status', 'email','first_name','job_posting','last_name','resume']




