from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from departments.models import Department
from django.conf import settings

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email and not username:
            raise ValueError('The Email or Username must be set')
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        
        if password:  # Only set the password if provided
            user.set_password(password)
        else:
            user.set_unusable_password()  # Allows user to be created without a password
        
        user.save(using=self._db)
        return user


    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault('is_admin', True)
        extra_fields.setdefault('is_hr', True)
        extra_fields.setdefault('is_manager', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    
    email = models.EmailField(unique=True, null=True, blank=True)
    username = models.CharField(max_length=255, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    is_hr = models.BooleanField(default=False)
    is_manager = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'  # Use email as the unique identifier
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email or self.username


class UserPermissionAudit(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='audit_logs')
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='permission_changes')
    timestamp = models.DateTimeField(auto_now_add=True)
    previous_permissions = models.JSONField()
    new_permissions = models.JSONField()

    def __str__(self):
        return f"Permission change for {self.user.email or self.user.username} by {self.changed_by.email or self.changed_by.username} at {self.timestamp}"
    




