from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    CookieTokenRefreshView,
    UserProfileView,
    complete_onboarding,
    reset_onboarding,
    logout_view,
    CreateCompanyView,
    CreateJobSeekerView,
)
from .oauth_views import google_oauth_login, google_token_exchange

urlpatterns = [
    # Authentication endpoints
    path('signup/', UserRegistrationView.as_view(), name='user-signup'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', logout_view, name='logout'),
    
    # OAuth endpoints
    path('oauth/google/', google_oauth_login, name='google-oauth-login'),
    path('google/exchange/', google_token_exchange, name='google-token-exchange'),
    
    # User profile endpoints
    path('user/', UserProfileView.as_view(), name='user-profile'),
    
    # Onboarding endpoints
    path('onboarding/complete/', complete_onboarding, name='complete-onboarding'),
    path('onboarding/reset/', reset_onboarding, name='reset-onboarding'),
    
    # Profile creation endpoints
    path('create-company/', CreateCompanyView.as_view(), name='create-company'),
    path('create-jobseeker/', CreateJobSeekerView.as_view(), name='create-jobseeker'),
]