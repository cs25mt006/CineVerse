from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Show
from .serializers import ShowMovieSerializer, ShowSerializer, ShowsSerializer
from rest_framework import viewsets

class ShowViewSet(viewsets.ModelViewSet):
    queryset = Show.objects.all()
    serializer_class = ShowsSerializer


class MoviesByLocationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        location_id = request.GET.get('location_id', None)
        print
        if location_id:
            shows = Show.objects.filter(location_id=location_id).select_related('movie')
        else:
            shows = Show.objects.all().select_related('movie')
        
        movies_data = []
        seen_movie_ids = set()
        
        for show in shows:
            if show.movie.id not in seen_movie_ids:
                seen_movie_ids.add(show.movie.id)
                movies_data.append({
                    'movie_id': show.movie.id,
                    'title': show.movie.title,
                    'poster': request.build_absolute_uri(show.movie.poster.url) if show.movie.poster else None
                })
        print(movies_data)
        return Response(movies_data)

class ShowByMovieView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        movie_id = request.GET.get('movie_id', None)
        location_id = request.GET.get('location_id', None)
        if not movie_id and not location_id:
            return Response({'error': 'movie_id or location_id parameter is required'}, status=400)

        shows = Show.objects.filter(movie_id=movie_id, location_id=location_id)
        serializer = ShowSerializer(shows, many=True, context={'request': request})
        return Response(serializer.data)