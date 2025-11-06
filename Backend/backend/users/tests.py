from django.test import TestCase
from .models import User
from .serializers import SignupSerializer
from django.urls import reverse
from rest_framework.test import APITestCase
from .models import User

class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_email_uniqueness(self):
        User.objects.create_user(username='u1', email='e1@example.com', password='pw')
        with self.assertRaises(Exception):
            User.objects.create_user(username='u2', email='e1@example.com', password='pw')

class SignupSerializerTest(TestCase):
    def test_signup_valid(self):
        data = {
            'username': 'newuser',
            'password': 'pw',
            'email': 'nu@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'gender': 'M'
        }
        serializer = SignupSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, 'newuser')
        self.assertTrue(user.check_password('pw'))

    def test_signup_missing_field(self):
        data = {'username': 'baduser'}
        serializer = SignupSerializer(data=data)
        self.assertFalse(serializer.is_valid())

class UserViewsTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='client_user', password='pw', email='c@example.com', gender='M')
        self.login_url = reverse('login')
        self.signup_url = reverse('signup')
        self.profile_url = reverse('profile-details')
        self.edit_url = reverse('edit-profile')

    def test_signup(self):
        data = {
            'username': 'apiuser',
            'password': 'pw',
            'email': 'api@example.com',
            'first_name': 'Api',
            'last_name': 'User',
            'gender': 'F'
        }
        response = self.client.post(self.signup_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

    def test_login_success(self):
        data = {'username': 'client_user', 'password': 'pw'}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

    def test_login_fail(self):
        data = {'username': 'wrong', 'password': 'nopw'}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    def test_profile_details(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.profile_url, {'user_id': self.user.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'client_user')

    def test_edit_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.edit_url, {'id': self.user.id, 'email': 'updated@example.com'})
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'updated@example.com')
