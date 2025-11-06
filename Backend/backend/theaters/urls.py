from django.urls import path
from .views import LocationSearchView, LocationViewSet, PriceViewSet, ScreenViewSet, SeatViewSet, TheaterViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'theaters', TheaterViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'screens', ScreenViewSet)
router.register(r'prices', PriceViewSet)
router.register(r'seats', SeatViewSet)

urlpatterns = [
    path('locations/search/', LocationSearchView.as_view(), name='location-search'),
]

urlpatterns += router.urls
