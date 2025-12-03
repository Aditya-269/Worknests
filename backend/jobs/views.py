from rest_framework import generics, permissions, status, filters, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from .models import JobPost, SavedJobPost, JobApplication
from .serializers import JobPostSerializer, JobPostListSerializer, SavedJobPostSerializer, JobApplicationSerializer
from accounts.models import Company


class JobPostListCreateView(generics.ListCreateAPIView):
    """List all job posts or create a new one"""
    
    queryset = JobPost.objects.filter(status=JobPost.JobPostStatus.ACTIVE)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employment_type', 'location', 'company']
    search_fields = ['job_title', 'job_description', 'company__name']
    ordering_fields = ['created_at', 'salary_from', 'salary_to']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobPostListSerializer
        return JobPostSerializer
    
    def perform_create(self, serializer):
        # Ensure user has a company profile
        if not hasattr(self.request.user, 'company_profile'):
            raise serializers.ValidationError('You must complete company onboarding first')
        
        serializer.save()


class JobPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific job post"""
    
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        """Only allow owners to edit/delete their job posts"""
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_object(self):
        obj = super().get_object()
        
        # Check ownership for edit/delete operations
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if not hasattr(self.request.user, 'company_profile') or obj.company != self.request.user.company_profile:
                raise PermissionError('You can only modify your own job posts')
        
        return obj


class MyJobPostsView(generics.ListAPIView):
    """List job posts created by the current user's company"""
    
    serializer_class = JobPostListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Ensure user has a company profile
        if not hasattr(self.request.user, 'company_profile'):
            return JobPost.objects.none()
        
        return JobPost.objects.filter(company=self.request.user.company_profile)


class SavedJobPostListView(generics.ListAPIView):
    """List job posts saved by the current user"""
    
    serializer_class = SavedJobPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SavedJobPost.objects.filter(user=self.request.user).select_related('job', 'job__company')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_job_post(request, job_id):
    """Save a job post for the current user"""
    
    job = get_object_or_404(JobPost, id=job_id, status=JobPost.JobPostStatus.ACTIVE)
    
    # Check if already saved
    saved_job, created = SavedJobPost.objects.get_or_create(
        user=request.user,
        job=job
    )
    
    if created:
        return Response({
            'message': 'Job post saved successfully',
            'saved_job': SavedJobPostSerializer(saved_job).data
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({
            'message': 'Job post already saved'
        }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def unsave_job_post(request, saved_job_id):
    """Remove a saved job post"""
    
    saved_job = get_object_or_404(SavedJobPost, id=saved_job_id, user=request.user)
    saved_job.delete()
    
    return Response({
        'message': 'Job post removed from saved jobs'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def apply_to_job(request, job_id):
    """Apply to a job posting"""
    
    job = get_object_or_404(JobPost, id=job_id, status=JobPost.JobPostStatus.ACTIVE)
    
    # Check if user is a job seeker
    if not hasattr(request.user, 'jobseeker_profile'):
        return Response({
            'error': 'Only job seekers can apply for jobs'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if user is trying to apply to their own company's job
    if hasattr(request.user, 'company_profile') and job.company == request.user.company_profile:
        return Response({
            'error': 'Companies cannot apply to their own jobs'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if already applied
    existing_application = JobApplication.objects.filter(user=request.user, job=job).first()
    if existing_application:
        return Response({
            'error': 'You have already applied to this job',
            'application': JobApplicationSerializer(existing_application).data
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create application
    serializer = JobApplicationSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        application = serializer.save(job=job)
        
        # Increment application count on the job
        job.applications += 1
        job.save()
        
        return Response({
            'message': 'Application submitted successfully',
            'application': JobApplicationSerializer(application).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_applications(request):
    """Get current user's job applications"""
    
    applications = JobApplication.objects.filter(user=request.user).select_related('job', 'job__company')
    serializer = JobApplicationSerializer(applications, many=True)
    
    return Response({
        'results': serializer.data,
        'count': applications.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def company_job_applications(request, job_id):
    """Get all applications for a specific job (company only)"""
    
    job = get_object_or_404(JobPost, id=job_id)
    
    # Check if user owns this job
    if not hasattr(request.user, 'company_profile') or job.company != request.user.company_profile:
        return Response({
            'error': 'You can only view applications for your own jobs'
        }, status=status.HTTP_403_FORBIDDEN)
    
    applications = JobApplication.objects.filter(job=job).select_related('user', 'user__jobseeker_profile').order_by('-applied_at')
    serializer = JobApplicationSerializer(applications, many=True)
    
    return Response({
        'results': serializer.data,
        'count': applications.count(),
        'job_title': job.job_title
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def all_company_applications(request):
    """Get all applications across all company's jobs"""
    
    if not hasattr(request.user, 'company_profile'):
        return Response({
            'error': 'Only companies can view applications'
        }, status=status.HTTP_403_FORBIDDEN)
    
    company_jobs = JobPost.objects.filter(company=request.user.company_profile)
    applications = JobApplication.objects.filter(job__in=company_jobs).select_related('user', 'user__jobseeker_profile', 'job').order_by('-applied_at')
    
    serializer = JobApplicationSerializer(applications, many=True)
    
    return Response({
        'results': serializer.data,
        'count': applications.count()
    })


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_application_status(request, application_id):
    """Update application status (company only)"""
    
    application = get_object_or_404(JobApplication, id=application_id)
    
    # Check if user owns the job this application is for
    if not hasattr(request.user, 'company_profile') or application.job.company != request.user.company_profile:
        return Response({
            'error': 'You can only update applications for your own jobs'
        }, status=status.HTTP_403_FORBIDDEN)
    
    new_status = request.data.get('status')
    if new_status not in [choice[0] for choice in JobApplication.ApplicationStatus.choices]:
        return Response({
            'error': f'Invalid status. Must be one of: {[choice[0] for choice in JobApplication.ApplicationStatus.choices]}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    old_status = application.status
    application.status = new_status
    application.save()
    
    # Here you could add email notification logic
    # send_application_status_notification(application, old_status, new_status)
    
    serializer = JobApplicationSerializer(application)
    
    return Response({
        'message': f'Application status updated from {old_status} to {new_status}',
        'application': serializer.data
    })


@api_view(['GET'])
def job_post_stats(request):
    """Get general job posting statistics"""
    
    total_jobs = JobPost.objects.filter(status=JobPost.JobPostStatus.ACTIVE).count()
    total_companies = Company.objects.count()
    
    return Response({
        'total_active_jobs': total_jobs,
        'total_companies': total_companies,
    })