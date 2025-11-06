from django.urls import path
from .views import EditProfileView, LoginView, ProfileDetailsView, SignupView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('profile_details/', ProfileDetailsView.as_view(), name='profile-details'),
    path('edit_profile/', EditProfileView.as_view(), name='edit-profile'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
