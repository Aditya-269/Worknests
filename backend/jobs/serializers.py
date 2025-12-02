from rest_framework import serializers
from accounts.serializers import UserSerializer, CompanySerializer
from .models import JobPost, SavedJobPost


class JobPostSerializer(serializers.ModelSerializer):
    """Serializer for job posts"""
    
    company_details = CompanySerializer(source='company', read_only=True)
    
    class Meta:
        model = JobPost
        fields = (
            'id', 'job_title', 'employment_type', 'location',
            'salary_from', 'salary_to', 'job_description',
            'listing_duration', 'benefits', 'status', 'applications',
            'company', 'company_details', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'company', 'applications', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Get company from the authenticated user
        user = self.context['request'].user
        if not hasattr(user, 'company_profile'):
            raise serializers.ValidationError('User must have a company profile to create job posts')
        
        validated_data['company'] = user.company_profile
        return super().create(validated_data)


class JobPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job post lists"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.URLField(source='company.logo', read_only=True)
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPost
        fields = (
            'id', 'job_title', 'employment_type', 'location',
            'salary_from', 'salary_to', 'listing_duration',
            'benefits', 'status', 'applications',
            'company_name', 'company_logo', 'is_saved',
            'created_at'
        )
    
    def get_is_saved(self, obj):
        """Check if the current user has saved this job"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJobPost.objects.filter(user=request.user, job=obj).exists()
        return False


class SavedJobPostSerializer(serializers.ModelSerializer):
    """Serializer for saved job posts"""
    
    job_details = JobPostListSerializer(source='job', read_only=True)
    
    class Meta:
        model = SavedJobPost
        fields = ('id', 'job', 'job_details', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)