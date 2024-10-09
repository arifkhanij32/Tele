
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from datetime import datetime
from django.db import transaction
from django.utils import timezone

class Visit(models.Model):
    id = models.AutoField(primary_key=True)
    PAY_CHOICES = [
        ('paid', 'Paid'),
        ('unpaid', 'Unpaid'),
    ]
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Others'),
    ]
    REFUND_CHOICES = [
        ('No Refund', 'No Refund'),
        ('Initiated', 'Initiated'),
        ('Approval Pending', 'Approval Pending'),
        ('Approval Done', 'Approval Done'),
        ('Refunded', 'Refunded')
    ]
    emg = models.BooleanField(default=False)
    pay = models.CharField(max_length=6, choices=PAY_CHOICES, default='unpaid')
    status = models.CharField(max_length=50, blank=True, default='Created')
    date = models.DateTimeField(auto_now_add=True)
    service = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=100, null=False)
    dob = models.DateField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone = PhoneNumberField(blank=True, null=True)
    patientId = models.CharField(max_length=100, unique=True, blank=True, editable=False)
    refund_status = models.CharField(max_length=50, choices=REFUND_CHOICES, default='No Refund')

    def save(self, *args, **kwargs):
        if not self.patientId:
            self.patientId = self.generatePatientId()
        super().save(*args, **kwargs)
        
    def initiate_refund(self):
        self.refund_status = 'Initiated'
        self.save()

    @transaction.atomic
    def generatePatientId(self):
        current_date_str = datetime.now().strftime("%Y%m%d")
        prefix = f"PID-{current_date_str}"
        
        with transaction.atomic():
            last_visit = Visit.objects.filter(patientId__startswith=prefix).select_for_update().order_by('patientId').last()
            if last_visit:
                last_id = int(last_visit.patientId.split('-')[-1])
                new_id = last_id + 1
            else:
                new_id = 1
            return f"{prefix}-{new_id:03d}"

    def __str__(self):
        return f"{self.name}"

    
class PatientVisit(models.Model):
    id = models.AutoField(primary_key=True)
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='patient_visits')
    date = models.DateTimeField(blank=True, null=True)  # Ensure this line exists
    notes = models.TextField(blank=True)
    price = models.IntegerField()
    currency = models.CharField(max_length=3, default='USD')
    newVisitId = models.CharField(max_length=255, unique=True, editable=False)


    def save(self, *args, **kwargs):
        if not self.newVisitId:
            self.newVisitId = self.generateVisitId()
        super().save(*args, **kwargs)

    @transaction.atomic
    def generateVisitId(self):
        current_date_str = datetime.now().strftime("%Y%m%d")
        prefix = f"VID-{current_date_str}"

        with transaction.atomic():
            last_patient_visit = PatientVisit.objects.filter(newVisitId__startswith=prefix).select_for_update().order_by('newVisitId').last()
            if last_patient_visit:
                last_id = int(last_patient_visit.newVisitId.split('-')[-1])
                new_id = last_id + 1
            else:
                new_id = 1
            return f"{prefix}-{new_id:03d}"

    def __str__(self):
        return f"{self.visit.name} - {self.newVisitId}"
    
    
class VisitNotes(models.Model):
    date = models.DateTimeField(blank=True, null=True)
    referrer = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
# For patient add new document file 
class UploadedFile(models.Model):
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


class ServiceDescription(models.Model):
    visit = models.ForeignKey('Visit', on_delete=models.CASCADE, related_name='patient_patients_visits')
    patientVisit = models.ForeignKey('PatientVisit', on_delete=models.CASCADE, related_name='patient_visits')
    date = models.DateTimeField(blank=True, null=True)
    service_name = models.CharField(max_length=100)
    currency = models.CharField(max_length=3, default='USD')
    price = models.IntegerField()

    def __str__(self):
        return self.service_name

class Payment(models.Model):
    payment_mode = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField(null=True, blank=True)
    visit = models.ForeignKey('Visit', on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=datetime.now)

    class Meta:
        db_table = 'payments'
        

class Bill(models.Model):
    visit = models.ForeignKey('Visit', on_delete=models.CASCADE, default=1)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    refund = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, default='Unpaid')
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        # Update status based on balance
        if self.balance == 0:
            self.status = 'Paid'
        else:
            self.status = 'Unpaid'
        super().save(*args, **kwargs)





    
class Refund(models.Model):
    CASH = 'Cash'
    CHEQUE = 'Cheque'
    CREDIT_CARD = 'Credit Card'
    DEBIT_CARD = 'Debit Card'
    GOOGLE_PAY = 'Google Pay'
    PHONEPE = 'PhonePe'
    AMAZON_PAY = 'Amazon Pay'
    NET_BANKING = 'Net Banking'
    UPI = 'UPI'
    OTHER = 'Other'

    REFUND_MODE_CHOICES = [
        (CASH, 'Cash'),
        (CHEQUE, 'Cheque'),
        (CREDIT_CARD, 'Credit Card'),
        (DEBIT_CARD, 'Debit Card'),
        (GOOGLE_PAY, 'Google Pay'),
        (PHONEPE, 'PhonePe'),
        (AMAZON_PAY, 'Amazon Pay'),
        (NET_BANKING, 'Net Banking'),
        (UPI, 'UPI'),
        (OTHER, 'Other'),
    ]

    refund_mode = models.CharField(max_length=50, choices=REFUND_MODE_CHOICES, default=CASH)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    visit = models.ForeignKey('Visit', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.refund_mode} - {self.amount}"

# # models.py

# from django.db import models

# class Patient(models.Model):
#     name = models.CharField(max_length=100)
#     dob = models.DateField(null=True, blank=True)
#     gender = models.CharField(max_length=10)
#     phone = models.CharField(max_length=15)

# class Visit(models.Model):
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
#     visit_date = models.DateTimeField(auto_now_add=True)
#     status = models.CharField(max_length=20, default='Unpaid')

# class Service(models.Model):
#     visit = models.ForeignKey(Visit, related_name='services', on_delete=models.CASCADE)
#     description = models.CharField(max_length=255)
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     quantity = models.IntegerField(default=1)

# class Payment(models.Model):
#     visit = models.ForeignKey(Visit, related_name='payments', on_delete=models.CASCADE)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     payment_mode = models.CharField(max_length=50)
#     note = models.TextField(null=True, blank=True)
#     date = models.DateTimeField(auto_now_add=True)

# class Discount(models.Model):
#     visit = models.ForeignKey(Visit, related_name='discounts', on_delete=models.CASCADE)
#     percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
#     amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     note = models.TextField(null=True, blank=True)

# class Refund(models.Model):
#     visit = models.ForeignKey(Visit, related_name='refunds', on_delete=models.CASCADE)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     reason = models.TextField(null=True, blank=True)
#     refund_mode = models.CharField(max_length=50)
#     status = models.CharField(max_length=20, default='Pending')
#     date = models.DateTimeField(auto_now_add=True)
