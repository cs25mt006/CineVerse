from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .models import Show, Seat, Locked_Seat
from django.utils import timezone
from datetime import timedelta
from .models import Locked_Seat, Booking
from .serializers import BookingDetailsSerializer, BookingSerializer, Locked_SeatSerializer
from django.shortcuts import get_object_or_404
from users.models import User
from rest_framework import viewsets

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

class LockedSeatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Locked_Seat.objects.all()
    serializer_class = Locked_SeatSerializer

class SeatsStatusView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        show_id = request.GET.get('show_id')
        if not show_id:
            return Response({'error': 'show_id is required.'}, status=400)

        try:
            show = Show.objects.get(pk=show_id)
        except Show.DoesNotExist:
            return Response({'error': 'Show not found.'}, status=404)

        seats = Seat.objects.filter(screen=show.screen)
        locked_seats_map = {ls.seat_id: ls for ls in Locked_Seat.objects.filter(show=show)}

        data = []
        for seat in seats:
            ls = locked_seats_map.get(seat.id)
            status = 'available'
            locked_seat_id = None
            if ls:
                # Check if lock expired
                if ls.status == 'locked' and ls.locked_at:
                    if timezone.now() > ls.locked_at + timedelta(minutes=5):
                        # Expired: auto-unlock
                        ls.status = 'available'
                        ls.locked_at = None
                        ls.save()
                    else:
                        status = 'locked'
                        locked_seat_id = ls.id
                else:
                    status = ls.status
                    locked_seat_id = ls.id
            data.append({
                'seat_id': seat.id,
                'locked_seat_id': ls.id if ls else None,
                'status': ls.status if ls else 'available',
                'rownumber': seat.rownumber,
                'colomnnumber': seat.colomnnumber,
                'seattype': seat.seattype.seattype,  # For FK to Price model
                'price': float(seat.seattype.price), # Convert Decimal to float for JSON
            })
        return Response(data)

class LockSeatView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        show_id = request.data.get('show_id')
        locked_seat_ids = request.data.get('locked_seat_ids')  # expect a list

        if not show_id or not locked_seat_ids:
            return Response({'error': 'show_id and locked_seat_ids are required.'}, status=400)

        results = []
        for lid in locked_seat_ids:
            try:
                lseat = Locked_Seat.objects.get(id=lid, show_id=show_id)
            except Locked_Seat.DoesNotExist:
                results.append({'locked_seat_id': lid, 'result': 'not found'})
                continue

            # Expiry logic
            if lseat.status == 'locked' and lseat.locked_at:
                if timezone.now() > lseat.locked_at + timedelta(minutes=5):
                    lseat.status = 'available'
                    lseat.locked_at = None
                    lseat.save()
            if lseat.status != 'available':
                results.append({'locked_seat_id': lid, 'result': f'failed: status {lseat.status}'})
                continue

            lseat.status = 'locked'
            lseat.locked_at = timezone.now()
            lseat.save()
            results.append({'locked_seat_id': lid, 'result': 'locked'})

        return Response({'results': results})
    

class BookSeatsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        show_id = request.data.get('show_id')
        locked_seat_ids = request.data.get('locked_seat_ids')  # Expect a list

        if not show_id or not locked_seat_ids:
            return Response({'error': 'show_id and locked_seat_ids are required.'}, status=400)

        updated = []
        notfound = []
        for lid in locked_seat_ids:
            try:
                lseat = Locked_Seat.objects.get(id=lid, show_id=show_id)
                lseat.status = 'booked'
                lseat.locked_at = None  # Clear lock timestamp
                lseat.save()
                updated.append(lid)
            except Locked_Seat.DoesNotExist:
                notfound.append(lid)

        return Response({'booked': updated, 'notfound': notfound})
    

class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        locked_seat_ids = request.data.get('locked_seat_ids')  # List
        totalamount = request.data.get('totalamount')
        show_id = request.data.get('show_id')
        payment_id = request.data.get('payment_id')
        
        print("CreateBookingView called with:", request.data)

        # Validate all params
        if not all([user_id, locked_seat_ids, totalamount, show_id, payment_id]):
            return Response({'error': 'All fields are required.'}, status=400)

        user = get_object_or_404(User, id=user_id)
        show = get_object_or_404(Show, id=show_id)
        # seats = Seat.objects.filter(id__in=locked_seat_ids)
        locked_seats = Locked_Seat.objects.filter(id__in=locked_seat_ids)
        seats = Seat.objects.filter(id__in=locked_seats.values_list('seat_id', flat=True))              

        if seats.count() != len(locked_seat_ids):
            return Response({'error': 'Some seats not found.'}, status=404)

        # Create booking
        booking = Booking.objects.create(
            user=user,
            show=show,
            totalamount=totalamount,
            payment_id=payment_id
        )
        booking.seats.set(seats)
        booking.save()
         # Update the movie revenue
        movie = show.movie
        movie.revenue = (movie.revenue or 0) + float(totalamount)
        movie.save()

        return Response({'success': True, 'booking_id': booking.id})
      
"""
class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        locked_seat_ids = request.data.get('locked_seat_ids')  # List
        totalamount = request.data.get('totalamount')
        show_id = request.data.get('show_id')
        payment_id = request.data.get('payment_id')

        # Validate all params
        if not all([user_id, locked_seat_ids, totalamount, show_id, payment_id]):
            return Response({'error': 'All fields are required.'}, status=400)

        user = get_object_or_404(User, id=user_id)
        show = get_object_or_404(Show, id=show_id)
        
        # Check locked seat statuses
        locked_seats = Locked_Seat.objects.filter(id__in=locked_seat_ids, show_id=show_id)
        
        if locked_seats.count() != len(locked_seat_ids):
            return Response({'error': 'Some locked seats not found.'}, status=404)
        
        # Check if any seat is already booked
        booked_seats = locked_seats.filter(status='booked')
        if booked_seats.exists():
            return Response({'error': 'Some seats are already booked.'}, status=400)
        
        seats = Seat.objects.filter(id__in=[ls.seat_id for ls in locked_seats])

        if seats.count() != len(locked_seat_ids):
            return Response({'error': 'Some seats not found.'}, status=404)

        # Create booking
        booking = Booking.objects.create(
            user=user,
            show=show,
            totalamount=totalamount,
            payment_id=payment_id
        )
        booking.seats.set(seats)
        booking.save()
        # Update the movie revenue
        movie = show.movie
        movie.revenue = (movie.revenue or 0) + float(totalamount)
        movie.save()

        return Response({'success': True, 'booking_id': booking.id})
"""
 
class GetOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.GET.get('user_id', None)
        if not user_id:
            return Response({'error': 'user_id parameter is required'}, status=400)
        if User.objects.filter(id=user_id).count() == 0:
            return Response({'error': 'User not found'}, status=404)
        orders = Booking.objects.filter(user_id=user_id)
        serializer = BookingDetailsSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)
    
