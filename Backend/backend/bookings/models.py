from django.db import models
import users.models as user_models
import shows.models as show_models
import theaters.models as theater_models
User = user_models.User
Show = show_models.Show
Seat = theater_models.Seat


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='bookings')
    totalamount = models.DecimalField(max_digits=10, decimal_places=2)
    bookingtime = models.DateTimeField(auto_now_add=True)
    seats = models.ManyToManyField(Seat, related_name='bookings')  # many-to-many
    payment_id = models.CharField(max_length=100)

# class BookingSeat(models.Model):
#     booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='bookingseats')
    
class Locked_Seat(models.Model):   # Remove extra parentheses!
    STATUS_CHOICES = [
        ("available", "Available"),
        ("booked", "Booked"),
        ("locked", "Locked"),
    ]
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='locked_seats')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="available")
    locked_at = models.DateTimeField(null=True, blank=True) 

