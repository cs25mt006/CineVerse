from rest_framework import serializers
from .models import Booking
from shows.models import Show
from theaters.models import Seat

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__' 
        
class Locked_SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        

class SeatDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'rownumber', 'colomnnumber']

class BookingDetailsSerializer(serializers.ModelSerializer):
    movie = serializers.CharField(source='show.movie.title', read_only=True)
    showtime = serializers.TimeField(source='show.showtime', read_only=True)
    date = serializers.DateField(source='show.date', read_only=True)
    theater = serializers.CharField(source='show.screen.theater.name', read_only=True)
    location = serializers.CharField(source='show.location.name', read_only=True)
    seats = SeatDetailSerializer(many=True, read_only=True)
    # locked_seats = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'totalamount', 'bookingtime', 'payment_id',
            'movie', 'showtime', 'date', 'theater', 'location', 'seats'
        ]
    # def get_locked_seats(self, obj):
    #     # Assuming you can access related locked seats for a booking
    #     return [{
    #         'locked_seat_id': ls.id,
    #         'seat_id': ls.id,
    #         'rownumber': ls.rownumber,
    #         'colomnnumber': ls.colomnnumber
    #     } for ls in obj.seats.all()]


