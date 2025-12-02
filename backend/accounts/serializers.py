from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import CustomUser, Company, JobSeeker


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = CustomUser
        fields = ('email', 'name', 'password', 'confirm_password')
    
    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        user = CustomUser.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    class Meta:
        model = CustomUser
        fields = (
            'id', 'email', 'name', 'user_type', 
            'onboarding_completed', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for company profile"""
    
    class Meta:
        model = Company
        fields = (
            'id', 'name', 'location', 'logo', 'website', 
            'x_account', 'about', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        user = self.context['request'].user
        company = Company.objects.create(user=user, **validated_data)
        
        # Update user type and onboarding status
        user.user_type = CustomUser.UserType.COMPANY
        user.onboarding_completed = True
        user.last_onboarding_completed_at = timezone.now()
        user.save()
        
        return company


class JobSeekerSerializer(serializers.ModelSerializer):
    """Serializer for job seeker profile"""
    
    class Meta:
        model = JobSeeker
        fields = (
            'id', 'name', 'about', 'resume', 
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        user = self.context['request'].user
        job_seeker = JobSeeker.objects.create(user=user, **validated_data)
        
        # Update user type and onboarding status
        user.user_type = CustomUser.UserType.JOB_SEEKER
        user.onboarding_completed = True
        user.last_onboarding_completed_at = timezone.now()
        user.save()
        
        return job_seeker