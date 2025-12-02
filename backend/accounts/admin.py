from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Company, JobSeeker


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'name', 'user_type', 'onboarding_completed', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('user_type', 'onboarding_completed', 'is_staff', 'is_superuser', 'is_active', 'date_joined')
    list_editable = ('is_active', 'is_staff')
    list_per_page = 25
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'name', 'first_name', 'last_name')}),
        ('Profile', {'fields': ('user_type', 'onboarding_completed', 'last_onboarding_completed_at', 'stripe_customer_id')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'user_type', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'name', 'first_name', 'last_name', 'username')
    ordering = ('-date_joined',)
    readonly_fields = ('created_at', 'updated_at', 'date_joined', 'last_login')
    
    actions = ['make_staff', 'remove_staff', 'activate_users', 'deactivate_users']
    
    def make_staff(self, request, queryset):
        queryset.update(is_staff=True)
        self.message_user(request, f"{queryset.count()} users marked as staff")
    make_staff.short_description = "Mark selected users as staff"
    
    def remove_staff(self, request, queryset):
        queryset.update(is_staff=False)
        self.message_user(request, f"{queryset.count()} users removed from staff")
    remove_staff.short_description = "Remove staff status from selected users"
    
    def activate_users(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} users activated")
    activate_users.short_description = "Activate selected users"
    
    def deactivate_users(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} users deactivated")
    deactivate_users.short_description = "Deactivate selected users"


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'location', 'website', 'created_at')
    list_filter = ('location', 'created_at')
    search_fields = ('name', 'user__email', 'location')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(JobSeeker)
class JobSeekerAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'user__email')
    readonly_fields = ('created_at', 'updated_at')