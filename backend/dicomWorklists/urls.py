from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DicomWorklistViewSet

router = DefaultRouter()
router.register(r'dicomWorklists', DicomWorklistViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
