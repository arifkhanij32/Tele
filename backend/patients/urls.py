from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    visitsViewSet,
    create_patient,
    get_last_patient_id,
    VisitNotesViewSet,
    createNotes,
    FileUploadView,
    add_payment, 
    RefundCreateView, 
    PatientVisitViewSet, 
    update_refund_status,
    ServiceDescriptionViewSet,
    ServiceDescriptionList,
    PaymentViewSet,
    RefundViewSet,
    BillViewSet,
    approve_refund,
    update_pay_status,
   # Ensure this is defined in views.py
)
# urls.py

# from .views import create_billing_data, update_refund_status




router = DefaultRouter()
router.register(r'visits', visitsViewSet)
router.register(r'service-descriptions', ServiceDescriptionViewSet, basename='service-description-patient')
router.register(r'patient-visits', PatientVisitViewSet)
router.register(r'visitsNotes', VisitNotesViewSet)
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'refunds', RefundViewSet, basename='refund')
router.register(r'bills', BillViewSet)

urlpatterns = [
    path('', include(router.urls)),
    #  path('api/billing/<int:patient_id>/<int:visit_id>/', create_billing_data, name='create_billing_data'),
    # path('api/update_refund_status/<int:visit_id>/', update_refund_status, name='update_refund_status'),
    path('api/visits/', create_patient, name='create_patient'),
    path('api/visits/<int:pk>/', create_patient, name='visit_detail'),
    path('api/visits/last_patient_id/', get_last_patient_id, name='get_last_patient_id'),
    path('api/visitsNotes/', createNotes, name='createNotes'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('api/payments/', add_payment, name='add_payment'),
    path('refunds/', RefundCreateView.as_view(), name='refund-create'),
    path('api/patient-visits/by-patient/', PatientVisitViewSet.as_view({'get': 'by_patient'}), name='patient_visits_by_patient'),
    path('api/patient-visits/create_visit/', PatientVisitViewSet.as_view({'get': 'create_visit', 'post': 'create_visit'}), name='create_visit'),   
    path('api/update_refund_status/', update_refund_status, name='update_refund_status'),
    path('api/approve_refund/', approve_refund, name='approve_refund'), 
    path('api/update_pay_status/<int:visit_id>/', update_pay_status, name='update_pay_status'),
    path('service-descriptions-list/', ServiceDescriptionList.as_view(), name='service-descriptions'),
]