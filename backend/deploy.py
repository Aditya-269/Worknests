#!/usr/bin/env python
"""
Railway deployment script
Run this after your first Railway deployment to set up the database
"""

import os
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'worknest.settings')
    django.setup()
    
    # Run migrations
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create superuser if it doesn't exist
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(email='admin@worknest.com').exists():
            User.objects.create_superuser(
                email='admin@worknest.com',
                password='admin123',
                name='Admin User',
                user_type='COMPANY'
            )
            print("Superuser created: admin@worknest.com / admin123")
    except Exception as e:
        print(f"Error creating superuser: {e}")