
from django.contrib import admin
from .models import Visit, VisitNotes, UploadedFile, Refund, PatientVisit, Bill, ServiceDescription,Payment

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('visit', 'payment_mode', 'amount', 'note', 'created_at')
    search_fields = ('visit__patientId', 'payment_mode', 'note')
    list_filter = ('payment_mode', 'created_at')

# Register the Payment model with the customized PaymentAdmin
admin.site.register(Payment, PaymentAdmin)    
class BillAdmin(admin.ModelAdmin):
    list_display = ('sub_total', 'tax', 'discount', 'refund', 'total', 'balance')

class VisitAdmin(admin.ModelAdmin):
    list_display = ('emg', 'name', 'service', 'date', 'pay', 'status', 'gender', 'age', 'phone', 'patientId')
    list_filter = ('pay', 'gender', 'date')
    search_fields = ('name', 'visit_type', 'patientId')
    ordering = ('date',)

class VisitNotesAdmin(admin.ModelAdmin):
    list_display = ('date', 'referrer')

class RefundAdmin(admin.ModelAdmin):
    list_display = ('refund_mode', 'amount', 'note', 'reason', 'created_at', 'visit')
    search_fields = ('refund_mode', 'note', 'reason', 'visit__id')

class PatientVisitAdmin(admin.ModelAdmin):
    list_display = ('visit', 'date', 'notes')  # Fields to display in the list view
    search_fields = ('visit__name', 'visit__patient_id', 'notes')  # Fields to search
    list_filter = ['date']  # Ensure 'date' is a valid field

class ServiceDescriptionAdmin(admin.ModelAdmin):
    list_display = ('visit', 'patientVisit', 'date', 'service_name', 'price')  # Adjust fields as necessary

# Register models with their corresponding ModelAdmin classes
admin.site.register(Visit, VisitAdmin)
admin.site.register(UploadedFile)
admin.site.register(Refund, RefundAdmin)
admin.site.register(PatientVisit, PatientVisitAdmin)
admin.site.register(Bill, BillAdmin)
admin.site.register(VisitNotes, VisitNotesAdmin)
admin.site.register(ServiceDescription, ServiceDescriptionAdmin)  # Correct registration