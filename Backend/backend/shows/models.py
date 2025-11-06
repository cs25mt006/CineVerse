from django.db import models
import movies.models as movie_models
import theaters.models as theater_models
from datetime import date
Movie = movie_models.Movie
Screen = theater_models.Screen
Location = theater_models.Location

# Create your models here.
class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='shows')
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='shows')
    showtime = models.TimeField()
    date = models.DateField(default=date.today)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='shows')
    

