from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=255, unique=True)
    id = models.AutoField(primary_key=True)
    def __str__(self):
        return self.name
    
class Theater(models.Model):
    name = models.CharField(max_length=255)
    totalscreens = models.IntegerField()
    address = models.TextField()
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='theaters')

class Screen(models.Model):
    screenname = models.CharField(max_length=100)
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, related_name='screens')
    colomns = models.IntegerField()  # spelling matches ERD, but 'columns' recommended
    rows = models.IntegerField()
    
class Price(models.Model):
    seattype = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=7, decimal_places=2)

class Seat(models.Model):
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='seats')
    rownumber = models.IntegerField()
    colomnnumber = models.IntegerField()  # spelling matches ERD, but 'columnnumber' recommended
    seattype = models.ForeignKey(Price, on_delete=models.CASCADE, related_name='seats')
