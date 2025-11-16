from django.urls import path
from .views import CreateBookingView, GetOrdersView, LockSeatView, LockedSeatViewSet, SeatsStatusView, BookSeatsView, BookingViewSet
from rest_framework import routers

app_name = 'bookings'

router = routers.DefaultRouter()
router.register(r'bookings', BookingViewSet)
router.register(r'locked-seats', LockedSeatViewSet)

urlpatterns = [
    path('seats/status/', SeatsStatusView.as_view(), name='seats-status'),
    path('seats/lock/', LockSeatView.as_view(), name='lock-seat'),
    path('seats/book/', BookSeatsView.as_view(), name='book-seats'),
    path('seats/create-booking/', CreateBookingView.as_view(), name='create-booking'),
    path('seats/your-orders/', GetOrdersView.as_view(), name='your-orders')
]

urlpatterns += router.urls