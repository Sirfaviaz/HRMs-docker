from rest_framework import serializers
from employees.models import Employee, EmployeePersonalDetails, EmployeeJobDetails, Document, DocumentRequest
from accounts.models import User
from departments.models import Department, Position

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class EmployeePersonalDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeePersonalDetails
        fields = '__all__'

class EmployeeJobDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeJobDetails
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class DocumentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRequest
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'
