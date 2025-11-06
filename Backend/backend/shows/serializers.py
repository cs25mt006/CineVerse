from rest_framework import serializers
from .models import Show
from theaters.serializers import TheaterSerializer

class ShowsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Show
        fields = '__all__'

class ShowMovieSerializer(serializers.ModelSerializer):
    movie_id = serializers.IntegerField(source='movie.id')
    title = serializers.CharField(source='movie.title')
    poster = serializers.SerializerMethodField()
    
    class Meta:
        model = Show
        fields = ['movie_id', 'title', 'poster']
    
    def get_poster(self, obj):
        request = self.context.get('request')
        if obj.movie.poster:
            return request.build_absolute_uri(obj.movie.poster.url)
        return None
    
class ShowSerializer(serializers.ModelSerializer):
    theater = serializers.SerializerMethodField()
    class Meta:
        model = Show
        fields = '__all__'
        
    def get_theater(self, obj):
        return TheaterSerializer(obj.screen.theater).data
