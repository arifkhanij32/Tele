from rest_framework import viewsets
from .models import DicomWorklist
from .serializers import DicomWorklistSerializer

class DicomWorklistViewSet(viewsets.ModelViewSet):
    queryset = DicomWorklist.objects.all()
    serializer_class = DicomWorklistSerializer
