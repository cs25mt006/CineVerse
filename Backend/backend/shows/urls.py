from django.urls import path
from .views import MoviesByLocationView, ShowByMovieView, ShowViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'shows', ShowViewSet)

urlpatterns = [
    path('movies-by-location/', MoviesByLocationView.as_view(), name='movies-by-location'),
    path('shows-by-movie/', ShowByMovieView.as_view(), name='shows-by-movie'),
]

urlpatterns += router.urls