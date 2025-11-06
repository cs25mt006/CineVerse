from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Show
from theaters.models import Seat
from bookings.models import Locked_Seat

@receiver(post_save, sender=Show)
def create_locked_seats_for_show(sender, instance, created, **kwargs):
    if created:
        seats = Seat.objects.filter(screen=instance.screen)
        locked_seats = [
            Locked_Seat(show=instance, seat=seat, status='available')
            for seat in seats
        ]
        Locked_Seat.objects.bulk_create(locked_seats)
