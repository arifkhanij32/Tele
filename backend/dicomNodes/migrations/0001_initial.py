# Generated by Django 5.0.6 on 2024-10-03 16:48

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DicomNode',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('location', models.CharField(max_length=20)),
                ('name', models.CharField(max_length=100)),
                ('manufacturer', models.CharField(blank=True, max_length=100, null=True)),
                ('model', models.CharField(blank=True, max_length=100, null=True)),
                ('deviceSerialNumber', models.CharField(blank=True, max_length=100, null=True)),
                ('softwareVersions', models.CharField(blank=True, max_length=100, null=True)),
                ('stationName', models.CharField(blank=True, max_length=100, null=True)),
                ('ipAddress', models.GenericIPAddressField(blank=True, null=True)),
                ('aeTitle', models.CharField(blank=True, max_length=100, null=True)),
            ],
        ),
    ]
