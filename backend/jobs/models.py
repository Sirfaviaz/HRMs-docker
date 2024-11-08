# jobs/models.py


from django.db import models
from departments.models import Department, Position
from employees.models import Employee  # Import Employee model

from django.conf import settings

class StageSet(models.Model):
    name = models.CharField(max_length=255)  # e.g., "Accountant Hiring Process", "Software Engineer Process"
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    

class JobPosting(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True)  # Nullable Position
    location = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=50, choices=[
        ('full_time', 'Full-Time'),
        ('part_time', 'Part-Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    ], blank=True, null=True)
    posted_date = models.DateField(auto_now_add=True)
    closing_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    incharge_employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)  # Nullable employee
    vacancies = models.PositiveIntegerField(default=1)  # Number of open positions
    filled = models.PositiveIntegerField(default=0)  # Number of positions filled
    stage_set = models.ForeignKey(StageSet, on_delete=models.SET_NULL, null=True, blank=True)  # New field for stage set
    
    def __str__(self):
        return self.title





class CandidateApplication(models.Model):
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    resume = models.FileField(upload_to='resumes/')
    cover_letter = models.TextField(null=True, blank=True)
    application_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[
        ('Active', 'Active'),
        ('Rejected', 'Rejected'),
    ], default='Active')

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_posting.title}"

    def has_passed_all_stages(self):
        """
        Check if the candidate has passed all stages in the stage_set related to the job posting.
        """

        # Get the stages related to the job posting's stage_set
        stages_in_stage_set = Stage.objects.filter(stage_set=self.job_posting.stage_set)
        
        # Get the candidate's completed stages and their results
        candidate_stages = CandidateStage.objects.filter(candidate_application=self, stage__in=stages_in_stage_set)
        
        # Check if the candidate has been assigned all the stages
        if candidate_stages.count() != stages_in_stage_set.count():
            return False  # Not all stages are assigned

        # Check if the candidate has a "Pass" result for all assigned stages
        for stage in stages_in_stage_set:
            candidate_stage = candidate_stages.filter(stage=stage).first()
            if not candidate_stage or candidate_stage.result != 'Pass':
                return False
        
        return True





class Stage(models.Model):
    name = models.CharField(max_length=255)  # e.g., 1st Round Interview, Machine Test, etc.
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)  # Order in which the stages occur
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    stage_set = models.ForeignKey(StageSet, on_delete=models.SET_NULL, null=True, blank=True, related_name='stages')
   

    def __str__(self):
        return self.name

class CandidateStage(models.Model):
    candidate_application = models.ForeignKey(CandidateApplication, on_delete=models.CASCADE, related_name='stages')
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE)
    assigned_employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)  # This can be used to track when the stage is completed
    result = models.CharField(max_length=50, choices=[
        ('Pass', 'Pass'),
        ('Fail', 'Fail'),
        ('Pending', 'Pending'),
    ], default='Pending')

    def __str__(self):
        return f"{self.candidate_application.first_name} {self.candidate_application.last_name} - {self.stage.name}"




class EmployeeContract(models.Model):
    candidate_application = models.OneToOneField(
        CandidateApplication, on_delete=models.CASCADE, related_name='contract'
    )  # Link to the candidate application
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    workshift = models.CharField(max_length=50, choices=[
        ('Day', 'Day Shift'),
        ('Night', 'Night Shift'),
        ('Rotating', 'Rotating Shift'),
    ])
    worktype = models.CharField(max_length=50, choices=[
        ('Full-Time', 'Full-Time'),
        ('Part-Time', 'Part-Time'),
        ('Contract', 'Contract'),
    ])
    employee_type = models.CharField(max_length=50, choices=[
        ('Permanent', 'Permanent'),
        ('Temporary', 'Temporary'),
        ('Intern', 'Intern'),
    ])
    contract_start_date = models.DateField(null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    accepted = models.BooleanField(default=False)
    date_accepted = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    signed_contract = models.FileField(upload_to='signed_contracts/', null=True, blank=True)  


    def __str__(self):
        return f"Contract for {self.candidate_application.first_name} {self.candidate_application.last_name}"
