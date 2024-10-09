from django.db import models

class DicomWorklist(models.Model):
    location = models.CharField(max_length=255)
    modality = models.CharField(max_length=255, null=True, blank=True)
    dicomNode = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.location
