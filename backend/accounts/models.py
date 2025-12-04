from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class CustomUser(AbstractUser):
    """Custom user model that matches the frontend expectations"""
    
    class UserType(models.TextChoices):
        COMPANY = 'COMPANY', 'Company'
        JOB_SEEKER = 'JOB_SEEKER', 'Job Seeker'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    user_type = models.CharField(
        max_length=20, 
        choices=UserType.choices, 
        blank=True, 
        null=True
    )
    onboarding_completed = models.BooleanField(default=False)
    last_onboarding_completed_at = models.DateTimeField(blank=True, null=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No additional required fields since email is the USERNAME_FIELD
    
    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        # If name is provided but no username, use email as username
        if not self.username:
            self.username = self.email
        # Copy name to first_name and last_name if provided
        if self.name and not self.first_name:
            name_parts = self.name.split(' ', 1)
            self.first_name = name_parts[0]
            if len(name_parts) > 1:
                self.last_name = name_parts[1]
        super().save(*args, **kwargs)


class Company(models.Model):
    """Company profile model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='company_profile')
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    logo = models.URLField(blank=True, null=True)
    website = models.URLField()
    x_account = models.CharField(max_length=255, blank=True, null=True)  # Twitter handle
    about = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Companies"


class JobSeeker(models.Model):
    """Job seeker profile model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='jobseeker_profile')
    name = models.CharField(max_length=255)
    about = models.TextField()
    resume = models.URLField()  # URL to uploaded resume file
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name