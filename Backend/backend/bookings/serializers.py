from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__' 
        
class Locked_SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'