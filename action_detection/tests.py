from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Video


class AuthApiTests(APITestCase):
    def test_user_can_signup_and_receive_token(self):
        response = self.client.post(
            '/api/auth/signup/',
            {
                'username': 'tester',
                'email': 'tester@example.com',
                'password': 'strongpass123',
                'confirm_password': 'strongpass123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'tester')

    def test_authenticated_user_only_sees_their_videos(self):
        user = User.objects.create_user(username='owner', password='strongpass123')
        other_user = User.objects.create_user(username='other', password='strongpass123')
        token = Token.objects.create(user=user)

        owned_video = Video.objects.create(owner=user, video_file='videos/owned.mp4')
        Video.objects.create(owner=other_user, video_file='videos/other.mp4')

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get('/api/videos/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], owned_video.id)
