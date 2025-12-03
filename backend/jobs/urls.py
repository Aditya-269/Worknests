from django.urls import path
from .views import (
    JobPostListCreateView,
    JobPostDetailView,
    MyJobPostsView,
    SavedJobPostListView,
    save_job_post,
    unsave_job_post,
    apply_to_job,
    my_applications,
    company_job_applications,
    all_company_applications,
    update_application_status,
    job_post_stats,
)

urlpatterns = [
    # Job post endpoints
    path('jobs/', JobPostListCreateView.as_view(), name='job-list-create'),
    path('jobs/<uuid:pk>/', JobPostDetailView.as_view(), name='job-detail'),
    path('my-jobs/', MyJobPostsView.as_view(), name='my-jobs'),
    
    # Saved jobs endpoints
    path('saved-jobs/', SavedJobPostListView.as_view(), name='saved-jobs'),
    path('jobs/<uuid:job_id>/save/', save_job_post, name='save-job'),
    path('saved-jobs/<uuid:saved_job_id>/remove/', unsave_job_post, name='unsave-job'),
    
    # Job application endpoints
    path('jobs/<uuid:job_id>/apply/', apply_to_job, name='apply-to-job'),
    path('my-applications/', my_applications, name='my-applications'),
    
    # Company application management endpoints
    path('jobs/<uuid:job_id>/applications/', company_job_applications, name='job-applications'),
    path('company-applications/', all_company_applications, name='company-applications'),
    path('applications/<uuid:application_id>/status/', update_application_status, name='update-application-status'),
    
    # Statistics
    path('stats/', job_post_stats, name='job-stats'),
]