#!/usr/bin/env python
"""
Force run migrations on Railway
"""
import os
import django
from django.core.management import execute_from_command_line

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'worknest.settings')
django.setup()

print("🚀 Starting forced migration process...")
print("DATABASE_URL:", os.environ.get('DATABASE_URL', 'Not set'))

try:
    # Show current migration status
    print("\n📋 Current migration status:")
    execute_from_command_line(['manage.py', 'showmigrations'])
    
    # Run migrations with maximum verbosity
    print("\n🔧 Running migrations...")
    execute_from_command_line(['manage.py', 'migrate', '--verbosity=3'])
    
    # Verify tables exist
    print("\n✅ Verifying database setup...")
    from django.db import connection
    with connection.cursor() as cursor:
        if 'postgresql' in connection.settings_dict['ENGINE']:
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%custom%';")
        else:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%custom%';")
        tables = cursor.fetchall()
        print(f"Found CustomUser-related tables: {tables}")
    
    # Try to create a test query
    from accounts.models import CustomUser
    user_count = CustomUser.objects.count()
    print(f"👤 CustomUser table operational. Current user count: {user_count}")
    
    print("🎉 Migration completed successfully!")
    
except Exception as e:
    print(f"❌ Migration failed with error: {e}")
    import traceback
    traceback.print_exc()