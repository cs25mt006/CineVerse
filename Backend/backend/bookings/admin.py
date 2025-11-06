from django.contrib import admin
from .models import Booking, Locked_Seat
# Register your models here.
admin.site.register(Booking)
admin.site.register(Locked_Seat)
