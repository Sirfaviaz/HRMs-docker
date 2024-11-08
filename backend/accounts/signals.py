from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import User, UserPermissionAudit

@receiver(pre_save, sender=User)
def track_permission_changes(sender, instance, **kwargs):
    if instance.pk:  # Ensure it's an update, not a new creation
        previous_user = User.objects.get(pk=instance.pk)

        # Check if the permissions have changed
        changed_fields = {}
        for field in ['is_admin', 'is_hr', 'is_manager', 'is_staff']:
            if getattr(previous_user, field) != getattr(instance, field):
                changed_fields[field] = {
                    'before': getattr(previous_user, field),
                    'after': getattr(instance, field)
                }

        if changed_fields:  # If any permissions have changed
            instance._previous_permissions = {field: getattr(previous_user, field) for field in ['is_admin', 'is_hr', 'is_manager', 'is_staff']}
            instance._changed_fields = changed_fields


@receiver(post_save, sender=User)
def log_permission_changes(sender, instance, created, **kwargs):
    if not created and hasattr(instance, '_previous_permissions'):  # If the user was updated
        changed_by = instance._changed_by  # Ensure this is set in your view (see below)
        UserPermissionAudit.objects.create(
            user=instance,
            changed_by=changed_by,
            previous_permissions=instance._previous_permissions,
            new_permissions={field: getattr(instance, field) for field in ['is_admin', 'is_hr', 'is_manager', 'is_staff']}
        )
