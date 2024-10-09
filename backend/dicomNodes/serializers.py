from rest_framework import serializers
from .models import DicomNode

class DicomNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DicomNode
        fields = '__all__'
