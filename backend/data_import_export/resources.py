from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from employees.models import Employee, EmployeePersonalDetails, EmployeeJobDetails
from accounts.models import User
from departments.models import Department, Position
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmployeeResource(resources.ModelResource):
    # User fields
    user_email = fields.Field(
        column_name='user_email*',
        attribute='user',
        widget=ForeignKeyWidget(User, 'email')
    )
    user_first_name = fields.Field(
        column_name='first_name*',
        attribute='user__first_name'
    )
    user_last_name = fields.Field(
        column_name='last_name*',
        attribute='user__last_name'
    )

    # Employee fields
    department = fields.Field(
        column_name='department',
        attribute='department',
        widget=ForeignKeyWidget(Department, 'name')
    )
    position = fields.Field(
        column_name='position',
        attribute='position',
        widget=ForeignKeyWidget(Position, 'title')
    )
    date_joined = fields.Field(
        column_name='date_joined*',
        attribute='date_joined'
    )
    status = fields.Field(
        column_name='status*',
        attribute='status'
    )

    # Personal details fields
    personal_details_dob = fields.Field(
        column_name='date_of_birth',
        attribute='personal_details__date_of_birth'
    )
    personal_details_gender = fields.Field(
        column_name='gender',
        attribute='personal_details__gender'
    )
    personal_details_address = fields.Field(
        column_name='address',
        attribute='personal_details__address'
    )
    personal_details_country = fields.Field(
        column_name='country',
        attribute='personal_details__country'
    )
    personal_details_city = fields.Field(
        column_name='city',
        attribute='personal_details__city'
    )
    personal_details_experience = fields.Field(
        column_name='experience',
        attribute='personal_details__experience'
    )

    # Job details fields
    job_details_department = fields.Field(
        column_name='job_details_department',
        attribute='job_details__department__name',
        widget=ForeignKeyWidget(Department, 'name')
    )
    job_details_position = fields.Field(
        column_name='job_details_position',
        attribute='job_details__job_position__title',
        widget=ForeignKeyWidget(Position, 'title')
    )
    job_details_shift = fields.Field(
        column_name='shift',
        attribute='job_details__shift'
    )
    job_details_work_type = fields.Field(
        column_name='work_type',
        attribute='job_details__work_type'
    )
    job_details_employee_type = fields.Field(
        column_name='employee_type',
        attribute='job_details__employee_type'
    )
    job_details_salary = fields.Field(
        column_name='salary',
        attribute='job_details__salary'
    )

    class Meta:
        model = Employee
        fields = (
            'user_email', 'user_first_name', 'user_last_name',
            'department', 'position', 'date_joined', 'status',
            'personal_details_dob', 'personal_details_gender', 'personal_details_address',
            'personal_details_country', 'personal_details_city', 'personal_details_experience',
            'job_details_department', 'job_details_position', 'job_details_shift',
            'job_details_work_type', 'job_details_employee_type', 'job_details_salary'
        )
        import_id_fields = ['user_email']
        exclude = ('id',)

    def before_import_row(self, row, **kwargs):
        """
        Ensure the User, Employee, and related data are created during import if they don't exist.
        """
        try:
            # Ensure the user exists, or create if it doesn't
            user_email = row.get('user_email*')
            if user_email:
                user, created = User.objects.get_or_create(
                    email=user_email,
                    defaults={
                        'first_name': row.get('first_name*'),
                        'last_name': row.get('last_name*'),
                        'username': user_email.split('@')[0]
                    }
                )
                row['user'] = user.id  # Update the row with the user's ID

            # Get or create the department
            department_name = row.get('department')
            department = Department.objects.filter(name=department_name).first()
            if department_name and not department:
                logger.warning(f"Department '{department_name}' not found. Skipping this field.")

            # Get or create the position
            position_title = row.get('position')
            position = Position.objects.filter(title=position_title).first()
            if position_title and not position:
                logger.warning(f"Position '{position_title}' not found. Skipping this field.")

            # Handle Employee creation or update
            employee, created = Employee.objects.get_or_create(
                user=user,
                defaults={
                    'date_joined': row.get('date_joined*'),
                    'status': row.get('status*') == 'True',
                    'department': department,
                    'position': position,
                }
            )

            # Handle EmployeePersonalDetails creation or update
            if not hasattr(employee, 'personal_details'):
                dob = row.get('date_of_birth')
                if dob == '':  # Handle empty date_of_birth
                    dob = None

                EmployeePersonalDetails.objects.create(
                    employee=employee,
                    date_of_birth=dob,
                    gender=row.get('gender'),
                    address=row.get('address'),
                    country=row.get('country'),
                    city=row.get('city'),
                    experience=row.get('experience') or None
                )

            # Handle EmployeeJobDetails creation or update
            if not hasattr(employee, 'job_details'):
                EmployeeJobDetails.objects.create(
                    employee=employee,
                    department=department,
                    job_position=position,
                    shift=row.get('shift'),
                    work_type=row.get('work_type'),
                    employee_type=row.get('employee_type'),
                    salary=row.get('salary') or None
                )

        except Exception as e:
            logger.error(f"Error processing row: {row}. Error: {str(e)}")
            raise
