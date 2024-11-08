from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin

class IsHRUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_hr

class IsManagerUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_manager

class IsAdminOrHR(BasePermission):
    """
    Allows access if the user is admin or HR.
    """
    def has_permission(self, request, view):
        return (
            IsAdminUser().has_permission(request, view) or
            IsHRUser().has_permission(request, view)
        )


class IsOwnerOrCanEdit(BasePermission):
    """
    Allows access if the user is editing their own data or is an admin/HR user.
    """
    def has_permission(self, request, view):
        # Allow any authenticated user to proceed to the object-level permissions
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        print(f"User ID: {request.user.id}, Object User ID: {obj.user.id}, Method: {request.method}")
        # Allow safe methods (GET, HEAD, OPTIONS)
        if request.method in SAFE_METHODS:
            return True

        # If user is admin or HR, allow access
        if request.user.is_admin or request.user.is_hr:
            return True

        # Check if the user is modifying their own data
        return obj.user.id == request.user.id
    

class IsOwnerOrAdminOrHR(BasePermission):
    """
    Allows access to the object's owner or admin/HR users.
    """
    def has_object_permission(self, request, view, obj):
        # Admin or HR users can access any object
        if request.user.is_admin or request.user.is_hr:
            return True

        # Read permissions are allowed to any authenticated user
        if request.method in SAFE_METHODS:
            return obj.employee.user == request.user

        # Write permissions are only allowed to the owner
        return obj.employee.user == request.user
