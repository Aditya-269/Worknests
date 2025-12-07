from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError


class Command(BaseCommand):
    help = 'Create a superuser with predefined credentials'

    def handle(self, *args, **options):
        User = get_user_model()
        
        email = 'admin@gmail.com'
        password = 'admin'
        
        try:
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'Superuser with email {email} already exists')
                )
            else:
                User.objects.create_superuser(
                    email=email,
                    password=password
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created superuser with email: {email}')
                )
        except IntegrityError:
            self.stdout.write(
                self.style.ERROR(f'Failed to create superuser with email: {email}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )