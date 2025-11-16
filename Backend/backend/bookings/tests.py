from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import timedelta, datetime
from django.utils import timezone
from users.models import User
from shows.models import Movie, Show
from theaters.models import Screen, Seat, Price, Location, Theater
from .models import Booking, Locked_Seat

class BookingTests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(username='testuser', password='password123', email='user@test.com')
        self.movie = Movie.objects.create(
            title='Test Movie',
            poster='path/to/poster.jpg',
            description='Movie description',
            releasedate='2022-01-01',
            cast='Actor1, Actor2',
            duration=timedelta(hours=2),
            genre='Action',
            language='English',
            revenue=0
        )   

        # Create the location, theater, screen etc.
        self.location = Location.objects.create(name='City1')
        self.theater = Theater.objects.create(name='Theater1', totalscreens=1, address='Address1', location=self.location)

        Price.objects.create(seattype='normal', price=100.0)
        Price.objects.create(seattype='premium', price=150.0)
        Price.objects.create(seattype='recliner', price=200.0)

        self.screen = Screen.objects.create(screenname='TestScreen', theater=self.theater, colomns=5, rows=5)
        # Seats with price 'normal'
        for row in range(1, 6):
            for col in range(1,6):
                seat_type = Price.objects.get(seattype='normal') if col <= 3 else Price.objects.get(seattype='premium')
                Seat.objects.create(screen=self.screen, rownumber=row, colomnnumber=col, seattype=seat_type)
        
        # Create the show with the movie
        self.show = Show.objects.create(
            movie=self.movie,
            screen=self.screen,  # ensure self.screen is created before
            showtime=datetime.now().time(),
            date=datetime.now().date(),
            location=self.location
        )

        # Locked seats placeholder (linked to seats below)
        self.seat1 = Seat.objects.filter(screen=self.screen).first()
        self.locked_seat = Locked_Seat.objects.create(show=self.show, seat=self.seat1, status='available')
        
        # Booking
        self.booking = Booking.objects.create(user=self.user, show=self.show, totalamount=500.0, payment_id='paymentID123')
        self.booking.seats.add(self.seat1)

        # Auth client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_seats_status_view(self):
        url = reverse('bookings:seats-status')
        response = self.client.get(url, {'show_id': self.show.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))
    
    def test_lock_seat_view_success(self):
        url = reverse('bookings:lock-seat')
        data = {'show_id': self.show.id, 'locked_seat_ids': [self.locked_seat.id]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['result'], 'locked')
    
    def test_lock_seat_view_missing_params(self):
        url = reverse('bookings:lock-seat')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_book_seats_view(self):
        url = reverse('bookings:book-seats')
        data = {'show_id': self.show.id, 'locked_seat_ids': [self.locked_seat.id]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.locked_seat.id, response.data['booked'])

    def test_create_booking_view(self):
        url = reverse('bookings:create-booking')
        data = {
            'user_id': self.user.id,
            'locked_seat_ids': [self.locked_seat.seat.id],
            'totalamount': '500.00',
            'show_id': self.show.id,
            'payment_id': 'pay_12345'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_create_booking_missing_params(self):
        url = reverse('bookings:create-booking')
        data = {'user_id': self.user.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_orders_view(self):
        url = reverse('bookings:your-orders')
        response = self.client.get(url, {'user_id': self.user.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_get_orders_missing_user_id(self):
        url = reverse('bookings:your-orders')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_orders_user_not_found(self):
        url = reverse('bookings:your-orders')
        response = self.client.get(url, {'user_id': 9999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
