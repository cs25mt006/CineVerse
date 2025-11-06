from django.contrib import admin
from .models import Location, Theater, Screen, Seat, Price

admin.site.register(Location)
admin.site.register(Theater)
admin.site.register(Screen)
admin.site.register(Seat)
admin.site.register(Price)
