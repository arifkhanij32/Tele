from rest_framework import viewsets
from .models import DicomNode
from .serializers import DicomNodeSerializer

class DicomNodeViewSet(viewsets.ModelViewSet):
    queryset = DicomNode.objects.all()
    serializer_class = DicomNodeSerializer

    def create(self, request, *args, **kwargs):
        print(f"Request data: {request.data}")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        print(f"Request data: {request.data}")
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        print(f"Request data: {kwargs['pk']}")
        return super().destroy(request, *args, **kwargs)
