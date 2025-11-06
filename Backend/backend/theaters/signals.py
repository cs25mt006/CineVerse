from django.db.models.signals import post_save
from django.dispatch import receiver
from theaters.models import Screen, Seat, Price

@receiver(post_save, sender=Screen)
def create_seats_for_screen(sender, instance, created, **kwargs):
    if created:
        normal = Price.objects.get(seattype="normal")
        premium = Price.objects.get(seattype="premium")
        recliner = Price.objects.get(seattype="recliner")

        row_count = getattr(instance, "rows", 10)
        col_count = getattr(instance, "colomns", 10)
        total_seats = row_count * col_count

        # Calculate seat count per type
        normal_rows = int(0.6 * row_count)
        premium_rows = int(0.2 * row_count)
        recliner_rows = row_count - normal_rows - premium_rows

        dummy_seats = []
        for row in range(1, row_count + 1):
            if row <= normal_rows:
                seattype = normal
            elif row <= normal_rows + premium_rows:
                seattype = premium
            else:
                seattype = recliner
            for col in range(1, col_count + 1):
                dummy_seats.append(
                    Seat(screen=instance, rownumber=row, colomnnumber=col, seattype=seattype)
                )
        Seat.objects.bulk_create(dummy_seats)
        print(f"Created {len(dummy_seats)} seats for screen {instance.id}")
