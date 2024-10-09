from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Visit, VisitNotes, UploadedFile, PatientVisit, ServiceDescription
from .serializers import VisitSerializer, VisitNotesSerializer, PatientVisitSerializer, ServiceDescriptionSerializer
from .serializers import RefundSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import UploadedFileSerializer
from .models import Payment
from .serializers import PaymentSerializer
from .models import Refund
from .serializers import RefundSerializer
from rest_framework import generics
from rest_framework.decorators import action
from .models import Bill
from .serializers import BillSerializer
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
# # views.py




class visitsViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer

@api_view(['GET', 'POST', 'PUT','PATCH', 'DELETE'])
def create_patient(request, pk=None):
    if request.method == 'GET':
        if pk is not None:
            visit = get_object_or_404(Visit, pk=pk)
            serializer = VisitSerializer(visit)
            return Response(serializer.data)
        else:
            visits = Visit.objects.all()
            serializer = VisitSerializer(visits, many=True)
            return Response(serializer.data)

    elif request.method == 'POST':
        serializer = VisitSerializer(data=request.data)
        print("serielazers data visit",request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT' and pk is not None:
        visit = get_object_or_404(Visit, pk=pk)
        print("put requist data:",request.data)
        serializer = VisitSerializer(visit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print("after put requist data:",serializer.data)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PATCH' and pk is not None:
        visit = get_object_or_404(Visit, pk=pk)
        serializer = VisitSerializer(visit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE' and pk is not None:
        visit = get_object_or_404(Visit, pk=pk)
        visit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



@api_view(['GET'])
def get_last_patient_id(request):
    last_visit = Visit.objects.order_by('patientId').last()
    logger.debug(f"Last visit: {last_visit}, Date: {last_visit.date} (type: {type(last_visit.date)})")
    if last_visit:
        return Response({'last_patient_id': last_visit.patientId})
    return Response({'last_patient_id': None})


class PatientVisitViewSet(viewsets.ModelViewSet):
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitSerializer

    @action(detail=False, methods=['get'])
    def by_patient(self, request):
        patientId = request.query_params.get('patientId')
        visits = PatientVisit.objects.filter(visit__patientId=patientId)
        serializer = self.get_serializer(visits, many=True)
        return Response(serializer.data)

    import logging

    logger = logging.getLogger(__name__)

    @action(detail=False, methods=['post'])
    def create_visit(self, request):
        custom_id = request.data.get('visit')
        
        if custom_id is None:
            logger.error("Visit ID is missing in the request.")
            return Response({'error': 'Visit ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            visit_instance = Visit.objects.get(patientId=custom_id)
            request.data['visit'] = visit_instance.id
        except Visit.DoesNotExist:
            logger.error(f"Visit with patient_id {custom_id} does not exist.")
            return Response({'error': 'Visit with this ID does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PatientVisitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        logger.error(f"Invalid data: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=False, methods=['get'])
    def latest_visit(self, request):
        latest_visit = PatientVisit.objects.latest('date')
        serializer = self.get_serializer(latest_visit)
        return Response(serializer.data)
    
class ServiceDescriptionViewSet(viewsets.ModelViewSet):
    queryset = ServiceDescription.objects.all()
    serializer_class = ServiceDescriptionSerializer

    def create(self, request, *args, **kwargs):
        print("Request Data:", request.data)  # Print request data
        
        try:
            # Look up the visit by ID (assuming visit is ID, change if it's not)
            visit = Visit.objects.get(id=request.data['visit'])
            # Look up the PatientVisit by newVisitId
            patientVisit = PatientVisit.objects.get(id=request.data['newVisitId'])

            # Convert price to decimal
            price = float(request.data['price'])

            # Parse and format the date correctly
            date_str = request.data['date']
            date = datetime.fromisoformat(date_str).strftime('%Y-%m-%d')

            # Create a new data dictionary with the correct types
            data = {
                'visit': visit.id,
                'patientVisit': patientVisit.id,
                'date': date,
                'service_name': request.data['service_name'],
                'price': price
            }

            print("Converted Data:", data)  # Print converted data
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        except Visit.DoesNotExist:
            return Response({'error': 'Invalid visit ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        except PatientVisit.DoesNotExist:
            return Response({'error': 'Invalid patient visit ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        except ValueError as e:
            return Response({'error': f'Invalid date format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            print("Error during processing:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        print("request",request.data)
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print("Error during deletion:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_destroy(self, instance):
        instance.delete()

class ServiceDescriptionList(generics.ListAPIView):
    serializer_class = ServiceDescriptionSerializer

    def get_queryset(self):
        visit_id = self.request.query_params.get('visit', None)
        patient_visit_id = self.request.query_params.get('patientVisit', None)
        if visit_id and patient_visit_id:
            return ServiceDescription.objects.filter(visit_id=visit_id, patientVisit_id=patient_visit_id)
        return ServiceDescription.objects.none()
    


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    # @api_view(['GET'])
    # def get_payments_for_visit(request, visit_id):
    #     try:
    #         payments = Payment.objects.filter(visit__id=visit_id)
    #         serializer = PaymentSerializer(payments, many=True)
    #         return Response(serializer.data, status=200)
    #     except Visit.DoesNotExist:
    #         return Response({"error": "Visit not found"}, status=404)
    @api_view(['GET'])
    def get_payments_for_visit(request, visit_id):
        try:
            payments = Payment.objects.filter(visit__id=visit_id)
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data, status=200)
        except Visit.DoesNotExist:
            return Response({"error": "Visit not found"}, status=404)


    def list(self, request, *args, **kwargs):
        print("Entering PaymentViewSet list method")
        try:
            response = super().list(request, *args, **kwargs)
            print("Response data: %s", response.data)
            return response
        except Exception as e:
            raise e

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        print('Request data: %s', request.data)
        print('Request data:', request.data)
        
        file_serializer = UploadedFileSerializer(data=request.data, context={'request': request})
        
        if file_serializer.is_valid():
            file_serializer.save()
            print('File uploaded successfully.')
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('File upload failed. Errors: %s', file_serializer.errors)
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class VisitNotesViewSet(viewsets.ModelViewSet):
    queryset = VisitNotes.objects.all()
    serializer_class = VisitNotesSerializer






@api_view(['GET', 'POST', 'DELETE'])
def createNotes(request, pk=None):
    if request.method == 'GET':
        if pk is not None:
            visitNotes = get_object_or_404(Visit, pk=pk)
            serializer = VisitNotesSerializer(visitNotes)
            return Response(serializer.data)
        else:
            visitNots = Visit.objects.all()
            serializer = VisitNotesSerializer(visitNots, many=True)
            return Response(serializer.data)
        
    elif request.method == 'POST':
        print("Request data:", request.data)
        serializer = VisitNotesSerializer(data=request.data)
        print("Serializer initial data:", serializer.initial_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET', 'POST'])
def add_payment(request):
    if request.method == 'GET':
        # Example of returning a list of payments (or customize this logic)
        payments = Payment.objects.all()
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Create a new payment with the POST request
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer

    def create(self, request, *args, **kwargs):
        print(f"Request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        visit_id = request.data.get('visit')
        print(f"Received visit_id: {visit_id}")
        if visit_id:
            try:
                visit = Visit.objects.get(id=visit_id)
                visit.refund = 'Initiated'
                visit.save()
                print(f"Updated visit {visit_id} refund status to 'Initiated'")
            except Visit.DoesNotExist:
                print(f"Visit with id {visit_id} does not exist")
                return Response({"error": "Visit not found"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
class RefundCreateView(APIView):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer
    def post(self, request, *args, **kwargs):
        serializer = RefundSerializer(data=request.data)
        if serializer.is_valid():
            refund = serializer.save()
            # Update the refund status of the related visit
            visit = refund.visit
            visit.refund_status = 'Initiated'
            visit.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def initiate_refund(request):
    visit_id = request.data.get('visit')
    try:
        visit = Visit.objects.get(id=visit_id)
        visit.refund_status = 'Initiated'
        visit.save()
        serializer = VisitSerializer(visit)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Visit.DoesNotExist:
        return Response({'error': 'Visit not found'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['POST'])
def update_refund_status(request):
    visit_id = request.data.get('visit_id')
    refund_status = request.data.get('refund_status')
    try:
        visit = Visit.objects.get(id=visit_id)
        visit.refund_status = refund_status
        visit.save()
        serializer = VisitSerializer(visit)
        return Response({'status': 'success', 'visit': serializer.data}, status=status.HTTP_200_OK)
    except Visit.DoesNotExist:
        return Response({'status': 'error', 'message': 'Visit not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def approve_refund(request):
    visit_id = request.data.get('visit_id')
    try:
        visit = Visit.objects.get(id=visit_id)
        visit.refund_status = 'Approved'
        visit.save()
        serializer = VisitSerializer(visit)
        return Response({'status': 'success', 'visit': serializer.data}, status=status.HTTP_200_OK)
    except Visit.DoesNotExist:
        return Response({'status': 'error', 'message': 'Visit not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET', 'POST'])
def update_pay_status(request, visit_id):
    if request.method == 'GET':
        try:
            # Fetch the visit's pay status for a GET request
            visit = Visit.objects.get(id=visit_id)
            return Response({'pay_status': visit.pay}, status=status.HTTP_200_OK)
        except Visit.DoesNotExist:
            return Response({'status': 'failure', 'message': 'Visit not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status': 'failure', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        pay_status = request.data.get('pay')
        
        try:
            visit = Visit.objects.get(id=visit_id)
            visit.pay = pay_status
            visit.save()
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        except Visit.DoesNotExist:
            return Response({'status': 'failure', 'message': 'Visit not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status': 'failure', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

    def create(self, request, *args, **kwargs):
        print('Request data:', request.data)  # Log request data
        response = super().create(request, *args, **kwargs)
        print('Response data:', response.data)  # Log response data
        return response

    def list(self, request, *args, **kwargs):
        print('List request received')
        response = super().list(request, *args, **kwargs)
        print('List response data:', response.data)
        return response
    
    