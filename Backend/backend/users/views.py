from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User
from .serializers import UserSerializer, UsersSerializer
from rest_framework import viewsets

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsersSerializer

class ProfileDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=400)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        serializer = UserSerializer(user)
        return Response(serializer.data)

class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Assuming user is identified by 'id' in the posted data
        user_id = request.data.get('id')
        if not user_id:
            return Response({'error': 'user id required'}, status=400)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True})
        else:
            return Response({'success': False, 'errors': serializer.errors}, status=400)
        

from .serializers import SignupSerializer

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'success': True, 'user_id': user.id})
        else:
            return Response({'success': False, 'errors': serializer.errors}, status=400)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            # Return user details or token if you use JWT/DRF auth
            return Response({
                "success": True,
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "gender": user.gender,
                # "profileimage": request.build_absolute_uri(user.profileimage.url) if user.profileimage else None,
            })
        else:
            return Response({"success": False, "error": "Invalid credentials"}, status=400)