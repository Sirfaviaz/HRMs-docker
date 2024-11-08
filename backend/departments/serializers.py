from rest_framework import serializers
from departments.models import Department, Position

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']  # Only the necessary fields from Department

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation


class PositionSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    reports_to = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Position
        fields = ['id', 'title', 'department', 'description', 'is_executive', 'reports_to', 'level']

    def to_representation(self, instance):
        """Customize the representation of the Position instance."""
        representation = super().to_representation(instance)
        
        # Include detailed department information
        representation['department'] = {
            'id': instance.department.id,
            'name': instance.department.name
        } if instance.department else None
        
        # Include detailed reports_to information
        if instance.reports_to:
            representation['reports_to'] = {
                'id': instance.reports_to.id,
                'title': instance.reports_to.title,
                'department': instance.reports_to.department.name if instance.reports_to.department else None
            }
        else:
            representation['reports_to'] = None

        return representation

    def create(self, validated_data):
        """Create a new Position instance."""
        return Position.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Update an existing Position instance."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance