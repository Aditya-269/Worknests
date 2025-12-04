#!/usr/bin/env python3
"""
Emergency migration script - run this to force migrate the Railway PostgreSQL
"""
import os
import django
from django.core.management import execute_from_command_line

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'worknest.settings')
django.setup()

try:
    print("🚀 STARTING EMERGENCY MIGRATION")
    print("✅ Django setup complete")
    
    # Run migrations with maximum verbosity
    print("🔧 Running migrations...")
    execute_from_command_line(['manage.py', 'migrate', '--verbosity=3'])
    
    print("🎉 MIGRATION COMPLETED!")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()