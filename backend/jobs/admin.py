from django.contrib import admin
from .models import JobPost, SavedJobPost


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ('job_title', 'get_company_name', 'location', 'employment_type', 'status', 'salary_range', 'applications', 'created_at')
    list_filter = ('status', 'employment_type', 'location', 'created_at', 'listing_duration')
    search_fields = ('job_title', 'company__name', 'location', 'job_description')
    readonly_fields = ('created_at', 'updated_at', 'id')
    list_per_page = 25
    list_editable = ('status',)
    date_hierarchy = 'created_at'
    
    def get_company_name(self, obj):
        return obj.company.name if obj.company else 'No Company'
    get_company_name.short_description = 'Company'
    get_company_name.admin_order_field = 'company__name'
    
    def salary_range(self, obj):
        if obj.salary_from and obj.salary_to:
            return f"${obj.salary_from:,} - ${obj.salary_to:,}"
        elif obj.salary_from:
            return f"${obj.salary_from:,}+"
        else:
            return "Not specified"
    salary_range.short_description = 'Salary Range'
    
    actions = ['activate_jobs', 'draft_jobs', 'expire_jobs']
    
    def activate_jobs(self, request, queryset):
        queryset.update(status='ACTIVE')
        self.message_user(request, f"{queryset.count()} jobs activated")
    activate_jobs.short_description = "Activate selected jobs"
    
    def draft_jobs(self, request, queryset):
        queryset.update(status='DRAFT')
        self.message_user(request, f"{queryset.count()} jobs moved to draft")
    draft_jobs.short_description = "Move selected jobs to draft"
    
    def expire_jobs(self, request, queryset):
        queryset.update(status='EXPIRED')
        self.message_user(request, f"{queryset.count()} jobs expired")
    expire_jobs.short_description = "Expire selected jobs"
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'job_title', 'employment_type', 'location')
        }),
        ('Job Details', {
            'fields': ('job_description', 'salary_from', 'salary_to', 'benefits')
        }),
        ('Publishing', {
            'fields': ('status', 'listing_duration', 'applications')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SavedJobPost)
class SavedJobPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'job__job_title', 'job__company__name')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'job', 'job__company')