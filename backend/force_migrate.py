#!/usr/bin/env python
"""
Force migration script specifically for Railway deployment
This will be run as the main command temporarily to force migrations
"""
import os
import django
from django.core.management import execute_from_command_line

# Ensure we're using Railway's environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'worknest.settings')
django.setup()

print("🔥 FORCED MIGRATION ON RAILWAY")
print(f"DATABASE_URL exists: {'DATABASE_URL' in os.environ}")
print(f"Database engine: {django.conf.settings.DATABASES['default']['ENGINE']}")

# Force run migrations
try:
    print("Running migrations...")
    execute_from_command_line(['manage.py', 'migrate', '--verbosity=3'])
    
    # Verify
    from accounts.models import CustomUser
    print(f"Success! CustomUser table ready with {CustomUser.objects.count()} users")
    
except Exception as e:
    print(f"Migration error: {e}")
    import traceback
    traceback.print_exc()

print("Migration script completed - starting regular app...")
# Now start the normal gunicorn process
os.system('gunicorn worknest.wsgi --log-file -')