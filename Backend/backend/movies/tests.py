from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Movie
from datetime import timedelta, date

class MovieAPITest(APITestCase):
    def setUp(self):
        # Create movies for testing
        self.movie1 = Movie.objects.create(
            title='Test Movie One',
            poster='posters/test1.jpg',
            description='Description 1',
            releasedate=date(2020, 1, 1),
            cast='Actor 1, Actor 2',
            duration=timedelta(hours=2),
            genre='Action',
            language='English',
            revenue=1000000,
        )
        self.movie2 = Movie.objects.create(
            title='Another Movie',
            poster='posters/test2.jpg',
            description='Description 2',
            releasedate=date(2021, 1, 1),
            cast='Actor 3, Actor 4',
            duration=timedelta(hours=1, minutes=30),
            genre='Comedy',
            language='French',
            revenue=500000,
        )

    def test_movie_list_viewset(self):
        url = reverse('movie-list')  # from router's basename
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_movie_search_with_query(self):
        url = reverse('movie-search')
        response = self.client.get(url, {'q': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.movie1.id)
        self.assertEqual(response.data[0]['title'], 'Test Movie One')

    def test_movie_search_without_query(self):
        url = reverse('movie-search')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_movie_details_valid_id(self):
        url = reverse('movie-details')
        response = self.client.get(url, {'movie_id': self.movie2.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.movie2.id)
        self.assertEqual(response.data['title'], 'Another Movie')

    def test_movie_details_invalid_id(self):
        url = reverse('movie-details')
        response = self.client.get(url, {'movie_id': 99999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_movie_details_missing_id(self):
        url = reverse('movie-details')
        response = self.client.get(url)
        # Your code currently prints None but doesn't return an error; consider adding 400 if missing.
        # For now, expect 404 due to no id
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST])
