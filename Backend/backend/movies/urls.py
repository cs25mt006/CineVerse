from django.urls import path
from .views import MovieSearchView, MovieDetailsView, MovieViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'movies', MovieViewSet)

urlpatterns = [
    path('search/', MovieSearchView.as_view(), name='movie-search'),
    path('details/', MovieDetailsView.as_view(), name='movie-details'),
]

urlpatterns += router.urls