from django.db import models

class DicomNode(models.Model):
    id = models.AutoField(primary_key=True)
    location = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    deviceSerialNumber = models.CharField(max_length=100, blank=True, null=True)
    softwareVersions = models.CharField(max_length=100, blank=True, null=True)
    stationName = models.CharField(max_length=100, blank=True, null=True)
    ipAddress = models.GenericIPAddressField(blank=True, null=True)
    aeTitle = models.CharField(max_length=100, blank=True, null=True)
    # useLatinOnly = models.BooleanField(default=False)

    def __str__(self):
        return self.name
