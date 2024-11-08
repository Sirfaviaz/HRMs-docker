from employees.models import Employee

def create_employee(user, data):
    employee = Employee.objects.create(user=user, **data)
    return employee

def update_employee(employee_id, data):
    employee = Employee.objects.get(id=employee_id)
    for key, value in data.items():
        setattr(employee, key, value)
    employee.save()
    return employee

def delete_employee(employee_id):
    employee = Employee.objects.get(id=employee_id)
    employee.delete()


