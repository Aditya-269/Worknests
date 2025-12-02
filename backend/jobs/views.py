from rest_framework import generics, permissions, status, filters, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from .models import JobPost, SavedJobPost
from .serializers import JobPostSerializer, JobPostListSerializer, SavedJobPostSerializer
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


@api_view(['GET'])
def job_post_stats(request):
    """Get general job posting statistics"""
    
    total_jobs = JobPost.objects.filter(status=JobPost.JobPostStatus.ACTIVE).count()
    total_companies = Company.objects.count()
    
    return Response({
        'total_active_jobs': total_jobs,
        'total_companies': total_companies,
    })