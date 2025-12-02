from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import login
from django.utils import timezone
from django.conf import settings

from .models import CustomUser, Company, JobSeeker
from rest_framework import serializers
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer, 
    UserSerializer,
    CompanySerializer,
    JobSeekerSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """Handle user registration"""
    
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Prepare response
        response_data = {
            'access_token': str(access_token),
            'user': UserSerializer(user).data
        }
        
        # Create response and set refresh token as httpOnly cookie
        response = Response(response_data, status=status.HTTP_201_CREATED)
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


class UserLoginView(generics.GenericAPIView):
    """Handle user login"""
    
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        login(request, user)
        
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


class CookieTokenRefreshView(TokenRefreshView):
    """Handle token refresh using httpOnly cookie"""
    
    def post(self, request, *args, **kwargs):
        # Get refresh token from cookie
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT_COOKIE_NAME)
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token not found in cookies'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Add refresh token to request data
        request.data._mutable = True
        request.data['refresh'] = refresh_token
        request.data._mutable = False
        
        try:
            response = super().post(request, *args, **kwargs)
            
            # If successful, set new refresh token in cookie (rotation enabled)
            if response.status_code == 200:
                # Get new refresh token if rotation is enabled
                refresh = RefreshToken(refresh_token)
                new_refresh = refresh.rotate() if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS') else refresh
                
                response.set_cookie(
                    settings.SIMPLE_JWT_COOKIE_NAME,
                    str(new_refresh),
                    max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                    httponly=settings.SIMPLE_JWT_COOKIE_HTTP_ONLY,
                    secure=settings.SIMPLE_JWT_COOKIE_SECURE,
                    samesite=settings.SIMPLE_JWT_COOKIE_SAMESITE,
                    domain=settings.SIMPLE_JWT_COOKIE_DOMAIN,
                )
            
            return response
            
        except (InvalidToken, TokenError) as e:
            return Response(
                {'error': 'Invalid refresh token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_onboarding(request):
    """Mark user's onboarding as completed"""
    
    user = request.user
    user.onboarding_completed = True
    user.last_onboarding_completed_at = timezone.now()
    user.save()
    
    return Response({
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reset_onboarding(request):
    """Reset user's onboarding status (optional endpoint)"""
    
    user = request.user
    user.onboarding_completed = False
    user.save()
    
    return Response({
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Handle user logout"""
    
    # Get refresh token from cookie and blacklist it
    refresh_token = request.COOKIES.get(settings.SIMPLE_JWT_COOKIE_NAME)
    
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except (InvalidToken, TokenError):
            pass  # Token was already invalid
    
    # Clear the refresh token cookie
    response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    response.delete_cookie(
        settings.SIMPLE_JWT_COOKIE_NAME,
        domain=settings.SIMPLE_JWT_COOKIE_DOMAIN,
        samesite=settings.SIMPLE_JWT_COOKIE_SAMESITE,
    )
    
    return response


class CreateCompanyView(generics.CreateAPIView):
    """Create company profile during onboarding"""
    
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Check if user already has a company profile
        if hasattr(self.request.user, 'company_profile'):
            raise serializers.ValidationError('User already has a company profile')
        
        serializer.save()


class CreateJobSeekerView(generics.CreateAPIView):
    """Create job seeker profile during onboarding"""
    
    serializer_class = JobSeekerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Check if user already has a job seeker profile
        if hasattr(self.request.user, 'jobseeker_profile'):
            raise serializers.ValidationError('User already has a job seeker profile')
        
        serializer.save()