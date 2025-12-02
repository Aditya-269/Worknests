from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.conf import settings
from allauth.socialaccount.models import SocialAccount, SocialApp
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
import requests

from .models import CustomUser
from .serializers import UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def google_oauth_login(request):
    """Handle Google OAuth login"""
    try:
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'Access token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify token with Google
        google_response = requests.get(
            f'https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}'
        )
        
        if google_response.status_code != 200:
            return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)
        
        google_data = google_response.json()
        email = google_data.get('email')
        name = google_data.get('name')
        google_id = google_data.get('id')
        
        if not email:
            return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'name': name or '',
                'onboarding_completed': False,
            }
        )
        
        # Create or update social account
        social_account, _ = SocialAccount.objects.get_or_create(
            user=user,
            provider='google',
            defaults={
                'uid': google_id,
                'extra_data': google_data,
            }
        )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Prepare response
        response_data = {
            'access_token': str(access_token),
            'user': UserSerializer(user).data
        }
        
        # Create response and set refresh token as httpOnly cookie
        response = Response(response_data, status=status.HTTP_200_OK)
        response.set_cookie(
            settings.SIMPLE_JWT_COOKIE_NAME,
            str(refresh),
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            httponly=settings.SIMPLE_JWT_COOKIE_HTTP_ONLY,
            secure=settings.SIMPLE_JWT_COOKIE_SECURE,
            samesite=settings.SIMPLE_JWT_COOKIE_SAMESITE,
            domain=settings.SIMPLE_JWT_COOKIE_DOMAIN,
        )
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def github_oauth_login(request):
    """Handle GitHub OAuth login"""
    try:
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'Access token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user data from GitHub
        headers = {'Authorization': f'token {access_token}'}
        github_response = requests.get('https://api.github.com/user', headers=headers)
        
        if github_response.status_code != 200:
            return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)
        
        github_data = github_response.json()
        
        # Get user emails from GitHub
        emails_response = requests.get('https://api.github.com/user/emails', headers=headers)
        emails_data = emails_response.json() if emails_response.status_code == 200 else []
        
        # Find primary email
        primary_email = None
        for email_data in emails_data:
            if email_data.get('primary', False):
                primary_email = email_data.get('email')
                break
        
        if not primary_email:
            # Fallback to email from user data
            primary_email = github_data.get('email')
        
        if not primary_email:
            return Response({'error': 'Email not provided by GitHub'}, status=status.HTTP_400_BAD_REQUEST)
        
        name = github_data.get('name') or github_data.get('login', '')
        github_id = str(github_data.get('id'))
        
        # Get or create user
        user, created = CustomUser.objects.get_or_create(
            email=primary_email,
            defaults={
                'username': primary_email,
                'name': name,
                'onboarding_completed': False,
            }
        )
        
        # Create or update social account
        social_account, _ = SocialAccount.objects.get_or_create(
            user=user,
            provider='github',
            defaults={
                'uid': github_id,
                'extra_data': github_data,
            }
        )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Prepare response
        response_data = {
            'access_token': str(access_token),
            'user': UserSerializer(user).data
        }
        
        # Create response and set refresh token as httpOnly cookie
        response = Response(response_data, status=status.HTTP_200_OK)
        response.set_cookie(
            settings.SIMPLE_JWT_COOKIE_NAME,
            str(refresh),
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            httponly=settings.SIMPLE_JWT_COOKIE_HTTP_ONLY,
            secure=settings.SIMPLE_JWT_COOKIE_SECURE,
            samesite=settings.SIMPLE_JWT_COOKIE_SAMESITE,
            domain=settings.SIMPLE_JWT_COOKIE_DOMAIN,
        )
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)