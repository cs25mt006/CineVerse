from rest_framework import serializers
from .models import Location, Theater, Screen, Price, Seat

class TheatersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theater
        fields = '__all__'


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'
        
class ScreenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Screen
        fields = '__all__'

class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = '__all__'

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'
        
class TheaterSerializer(serializers.ModelSerializer):
    location = LocationSerializer()
    class Meta:
        model = Theater
        fields = ['id', 'name', 'totalscreens', 'address', 'location']
