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


# GitHub OAuth login removed# GitHub OAuth token exchange removed



@api_view(['POST'])
@permission_classes([AllowAny])
def google_token_exchange(request):
    """Exchange Google authorization code for access token"""
    try:
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        
        if not code:
            return Response({'error': 'Authorization code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get Google client credentials from settings
        google_client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
        google_client_secret = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret']
        
        # Debug logging for production
        print(f"DEBUG: Google Client ID: {google_client_id[:20]}...")
        print(f"DEBUG: Google Client Secret: {google_client_secret[:15]}...")
        print(f"DEBUG: Redirect URI: {redirect_uri}")
        print(f"DEBUG: Auth Code: {code[:20]}...")
        
        if not google_client_id or not google_client_secret:
            return Response({'error': 'Google OAuth not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Exchange code for access token with Google
        token_response = requests.post("https://oauth2.googleapis.com/token", {
            "client_id": google_client_id,
            "client_secret": google_client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        })
        
        if token_response.status_code != 200:
            print(f"DEBUG: Google API Error Status: {token_response.status_code}")
            print(f"DEBUG: Google API Error Response: {token_response.text}")
            return Response({'error': 'Failed to exchange code for token'}, status=status.HTTP_400_BAD_REQUEST)
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            return Response({"error": "No access token received from Google"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"access_token": access_token}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
