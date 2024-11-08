from rest_framework import viewsets
from departments.models import Department, Position
from departments.serializers import DepartmentSerializer, PositionSerializer
from rest_framework.permissions import IsAuthenticated

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()  # Make sure you're querying the correct model
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]  # You can adjust this permission as needed

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()  # Query the Position model
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated] 