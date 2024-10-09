import phonenumbers
from rest_framework import serializers
from .models import Visit, VisitNotes,UploadedFile, PatientVisit,ServiceDescription
from datetime import datetime
from .models import Payment
from .models import Refund,Bill



class VisitSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(format='%b %d %Y, %I:%M %p', input_formats=['%b %d %Y, %I:%M %p'])
    dob = serializers.DateField(format='%d %b %Y', input_formats=['%Y-%m-%d', '%d %b %Y'], required=False, allow_null=True)

    class Meta:
        model = Visit
        fields = '__all__'

    def to_internal_value(self, data):
        errors = {}
        
        if 'date' in data:
            try:
                data['date'] = datetime.strptime(data['date'], '%b %d %Y, %I:%M %p')
            except ValueError:
                errors['date'] = 'Date has wrong format. Use "Aug 08 2024, 11:25 AM".'

        if 'dob' in data:
            if data['dob'] == '':
                data['dob'] = None
            else:
                try:
                    data['dob'] = datetime.strptime(data['dob'], '%Y-%m-%d').date()
                except ValueError:
                    try:
                        data['dob'] = datetime.strptime(data['dob'], '%d %b %Y').date()
                    except ValueError:
                        errors['dob'] = 'Date of birth has wrong format. Use "09 Aug 0078" or "78-08-09".'
        
        if errors:
            raise serializers.ValidationError(errors)

        return super().to_internal_value(data)

class PatientVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientVisit
        fields = '__all__'

class ServiceDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceDescription
        fields = '__all__'



class VisitNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitNotes
        fields = '__all__'

class UploadedFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = ['file', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url)

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'  

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = '__all__'

class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = '__all__'
        extra_kwargs = {
            'visit': {'required': True}
        }



