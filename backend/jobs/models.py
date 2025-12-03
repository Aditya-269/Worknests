from django.db import models
from accounts.models import CustomUser, Company
import uuid


class JobPost(models.Model):
    """Job posting model"""
    
    class JobPostStatus(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        EXPIRED = 'EXPIRED', 'Expired'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='job_posts')
    
    # Job details
    job_title = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=100)  # Full-time, Part-time, Contract, etc.
    location = models.CharField(max_length=255)
    salary_from = models.PositiveIntegerField()
    salary_to = models.PositiveIntegerField()
    job_description = models.TextField()
    listing_duration = models.PositiveIntegerField()  # Duration in days
    benefits = models.JSONField(default=list, blank=True)  # List of benefits
    
    # Status and metrics
    status = models.CharField(
        max_length=20,
        choices=JobPostStatus.choices,
        default=JobPostStatus.DRAFT
    )
    applications = models.PositiveIntegerField(default=0)
    payment_session_id = models.CharField(max_length=255, blank=True, null=True)  # Stripe session ID
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.job_title} at {self.company.name}"
    
    class Meta:
        ordering = ['-created_at']


class SavedJobPost(models.Model):
    """Model for users to save job posts"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='saved_by_users')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} saved {self.job.job_title}"
    
    class Meta:
        unique_together = ('user', 'job')
        ordering = ['-created_at']


class JobApplication(models.Model):
    """Model for job applications submitted by job seekers"""
    
    class ApplicationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        REVIEWED = 'reviewed', 'Reviewed'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='job_applications')
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='job_applications')
    status = models.CharField(max_length=20, choices=ApplicationStatus.choices, default=ApplicationStatus.PENDING)
    cover_letter = models.TextField(blank=True, help_text="Optional cover letter")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'job')
        ordering = ['-applied_at']
        
    def __str__(self):
        return f"{self.user.email} applied to {self.job.job_title}"