from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Movie
from .serializers import MovieSearchSerializer, MovieDetailsSerializer, MovieSerializer
from rest_framework import viewsets

class MovieViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer

class MovieSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        if query:
            movies = Movie.objects.filter(title__istartswith=query)
        else:
            movies = Movie.objects.none()
        serializer = MovieSearchSerializer(movies, many=True)
        return Response(serializer.data)

# Create your views here.
class MovieDetailsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        movie_id = request.GET.get('movie_id', None)
        # print(movie_id)
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found'}, status=404)

        serializer = MovieDetailsSerializer(movie)
        return Response(serializer.data)
