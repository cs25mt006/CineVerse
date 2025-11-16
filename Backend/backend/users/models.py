from django.db import models
from django.contrib.auth.models import AbstractUser
# import backend.theaters.models as theater_models

# Location = theater_models.Location
class User(AbstractUser):
    # profileimage = models.ImageField(upload_to='profiles/', null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    email = models.EmailField(unique=True)
    # location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',  # change this
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',  # change this
        blank=True,
    )
    def __str__(self):
        return self.username
    