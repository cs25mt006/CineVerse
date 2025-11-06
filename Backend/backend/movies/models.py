from django.db import models

class Movie(models.Model):
    title = models.CharField(max_length=255)
    poster = models.ImageField(upload_to='posters/')
    description = models.TextField()
    releasedate = models.DateField()
    cast = models.TextField()
    duration = models.DurationField()
    genre = models.CharField(max_length=100)
    language = models.CharField(max_length=50)
    revenue = models.BigIntegerField()
    
