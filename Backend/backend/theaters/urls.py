from django.urls import path
from .views import LocationSearchView, LocationViewSet, PriceViewSet, ScreenViewSet, ScreensfromTheaterView, SeatViewSet, TheaterViewSet, TheatersfromLocationView
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'theaters', TheaterViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'screens', ScreenViewSet)
router.register(r'prices', PriceViewSet)
router.register(r'seats', SeatViewSet)

urlpatterns = [
    path('locations/search/', LocationSearchView.as_view(), name='location-search'),
    path('screens-by-theater/', ScreensfromTheaterView.as_view(), name='screens-by-theater'),
    path('theaters-by-location/', TheatersfromLocationView.as_view(), name='theaters-by-location'),
]

urlpatterns += router.urls
