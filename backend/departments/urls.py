from django.urls import path, include
from rest_framework.routers import DefaultRouter
from departments.views import DepartmentViewSet,PositionViewSet
from . import views

router = DefaultRouter()
router.register(r'positions', PositionViewSet, basename='position') 
router.register(r'departments', DepartmentViewSet, basename='department')  # Use 'departments' here


urlpatterns = [
    path('', include(router.urls)),  # Ensure this is correct
]


