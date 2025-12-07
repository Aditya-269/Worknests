import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.core.exceptions import ValidationError


class Command(BaseCommand):
    help = 'Create a production superuser with environment-configured credentials'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from environment variables with fallbacks
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@gmail.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')
        name = os.environ.get('DJANGO_SUPERUSER_NAME', 'Admin User')
        
        # Validate email format
        if '@' not in email or '.' not in email:
            self.stdout.write(
                self.style.ERROR(f'Invalid email format: {email}')
            )
            return
        
        # Validate password strength for production
        if len(password) < 8:
            self.stdout.write(
                self.style.WARNING('Password is less than 8 characters. Consider using a stronger password.')
            )
        
        try:
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'Superuser with email {email} already exists')
                )
                return
            
            # Create superuser with all required fields for CustomUser model
            superuser = User.objects.create_superuser(
                email=email,
                password=password,
                name=name,
                username=email,  # Set username to email
                first_name=name.split(' ')[0] if name else 'Admin',
                last_name=' '.join(name.split(' ')[1:]) if len(name.split(' ')) > 1 else 'User',
                user_type='COMPANY',  # Set a default user type
                onboarding_completed=True  # Skip onboarding for admin
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created superuser with email: {email}')
            )
            
            # Log environment variable usage (without exposing sensitive data)
            if os.environ.get('DJANGO_SUPERUSER_EMAIL'):
                self.stdout.write(
                    self.style.SUCCESS('✓ Using DJANGO_SUPERUSER_EMAIL from environment')
                )
            if os.environ.get('DJANGO_SUPERUSER_PASSWORD'):
                self.stdout.write(
                    self.style.SUCCESS('✓ Using DJANGO_SUPERUSER_PASSWORD from environment')
                )
            if os.environ.get('DJANGO_SUPERUSER_NAME'):
                self.stdout.write(
                    self.style.SUCCESS('✓ Using DJANGO_SUPERUSER_NAME from environment')
                )
                
        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'IntegrityError creating superuser: {str(e)}')
            )
            # Check for common issues
            if 'unique constraint' in str(e).lower():
                self.stdout.write(
                    self.style.ERROR(f'A user with email {email} may already exist')
                )
        except ValidationError as e:
            self.stdout.write(
                self.style.ERROR(f'Validation error: {str(e)}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error creating superuser: {str(e)}')
            )