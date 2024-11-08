from employees.models import Employee
from django.core.exceptions import ObjectDoesNotExist

class EmployeeProfileUseCase:
    @staticmethod
    def get_employee_profile(user_id):
        try:
            employee = Employee.objects.get(user__id=user_id)
            return employee, None
        except ObjectDoesNotExist:
            return None, "Employee profile not found."
