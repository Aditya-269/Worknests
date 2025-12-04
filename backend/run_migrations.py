#!/usr/bin/env python
"""
Manual migration script for Railway deployment
This script can be run manually to set up the database
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'worknest.settings')
    django.setup()
    
    print("Starting database migrations...")
    
    try:
        # Run migrations
        execute_from_command_line(['manage.py', 'migrate', '--verbosity=2'])
        print("✅ Migrations completed successfully!")
        
        # Check if tables were created (works for both PostgreSQL and SQLite)
        from django.db import connection
        cursor = connection.cursor()
        
        # Check database type and use appropriate query
        if 'postgresql' in connection.settings_dict['ENGINE']:
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname='public';")
        else:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            
        tables = cursor.fetchall()
        print(f"📋 Created tables: {[table[0] for table in tables]}")
        
        # Specifically check for our custom user table
        from accounts.models import CustomUser
        user_count = CustomUser.objects.count()
        print(f"👤 CustomUser table exists, contains {user_count} users")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)