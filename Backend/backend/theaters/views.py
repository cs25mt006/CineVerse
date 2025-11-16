from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Location, Theater, Screen, Price, Seat
from .serializers import LocationSerializer, PriceSerializer, ScreenSerializer, SeatSerializer, TheatersSerializer
from rest_framework import viewsets

class TheaterViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Theater.objects.all()
    serializer_class = TheatersSerializer

class LocationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class ScreenViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Screen.objects.all()
    serializer_class = ScreenSerializer
    
class PriceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Price.objects.all()
    serializer_class = PriceSerializer
    
class SeatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer

class LocationSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        if query:
            locations = Location.objects.filter(name__istartswith=query)
        else:
            locations = Location.objects.all()
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)

class ScreensfromTheaterView(APIView):
    permission_classes = [IsAdminUser]
    # permission_classes = [AllowAny]

    def get(self, request):
        theater_id = request.GET.get('theater_id', None)
        if not theater_id:
            return Response({'error': 'theater_id parameter is required'}, status=400)
        if Theater.objects.filter(id=theater_id).count() == 0:
            return Response({'error': 'Theater not found'}, status=404)
        screens = Screen.objects.filter(theater_id=theater_id)
        serializer = ScreenSerializer(screens, many=True, context={'request': request})
        return Response(serializer.data)
    
class TheatersfromLocationView(APIView):
    permission_classes = [IsAdminUser]
    # permission_classes = [AllowAny]

    def get(self, request):
        location_id = request.GET.get('location_id', None)
        if not location_id:
            return Response({'error': 'location_id parameter is required'}, status=400)
        if Location.objects.filter(id=location_id).count() == 0:
            return Response({'error': 'Location not found'}, status=404)
        theaters = Theater.objects.filter(location_id=location_id)
        serializer = TheatersSerializer(theaters, many=True, context={'request': request})
        return Response(serializer.data)
    
# Create your views here.
