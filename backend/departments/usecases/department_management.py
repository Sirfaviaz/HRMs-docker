# departments/usecases/department_management.py

from departments.models import Department

def create_department(data):
    department = Department.objects.create(**data)
    return department

def update_department(department_id, data):
    department = Department.objects.get(id=department_id)
    for key, value in data.items():
        setattr(department, key, value)
    department.save()
    return department

def delete_department(department_id):
    department = Department.objects.get(id=department_id)
    department.delete()
