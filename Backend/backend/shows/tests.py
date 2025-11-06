from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date, time
from theaters.models import Location, Theater, Screen, Price
from movies.models import Movie
from .models import Show

class ShowAPITest(APITestCase):
    def setUp(self):
        # Create related models
        self.location = Location.objects.create(name='Test Location')
        self.theater = Theater.objects.create(name='Test Theater', totalscreens=1, address='Test Address', location=self.location)

        # Add Price entries expected by signal
        Price.objects.create(seattype='normal', price=100)
        Price.objects.create(seattype='premium', price=150)
        Price.objects.create(seattype='recliner', price=200)

        self.screen = Screen.objects.create(screenname='Test Screen', theater=self.theater, colomns=10, rows=10)
        from datetime import timedelta

        self.movie = Movie.objects.create(
            title='Test Movie',
            poster='posters/poster.jpg',
            description='Sample description',
            releasedate=date.today(),
            cast='Actor 1, Actor 2',
            duration=timedelta(hours=2),
            genre='Action',
            language='English',
            revenue=1000000,
        )

        self.show = Show.objects.create(
            movie=self.movie,
            screen=self.screen,
            showtime=time(20, 0),
            date=date.today(),
            location=self.location
        )
    
    def test_show_viewset_list(self):
        url = reverse('show-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_movies_by_location_with_param(self):
        url = reverse('movies-by-location')
        response = self.client.get(url, {'q': self.location.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(movie['movie_id'] == self.movie.id for movie in response.data))
    
    def test_movies_by_location_without_param(self):
        url = reverse('movies-by-location')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(movie['movie_id'] == self.movie.id for movie in response.data))
    
    def test_shows_by_movie_valid_params(self):
        url = reverse('shows-by-movie')
        response = self.client.get(url, {'movie_id': self.movie.id, 'location_id': self.location.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_shows_by_movie_missing_params(self):
        url = reverse('shows-by-movie')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
