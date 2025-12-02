from django.urls import path
from .views import (
    JobPostListCreateView,
    JobPostDetailView,
    MyJobPostsView,
    SavedJobPostListView,
    save_job_post,
    unsave_job_post,
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
    
    # Statistics
    path('stats/', job_post_stats, name='job-stats'),
]