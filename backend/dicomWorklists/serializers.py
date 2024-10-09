from rest_framework import serializers
from .models import DicomWorklist

class DicomWorklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = DicomWorklist
        fields = '__all__'
