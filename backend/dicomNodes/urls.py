from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DicomNodeViewSet

router = DefaultRouter()
router.register(r'dicomnodes', DicomNodeViewSet)


urlpatterns = [
    path('', include(router.urls)),
]