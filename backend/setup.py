#!/usr/bin/env python3
"""
Setup script for Work Nest Django Backend
"""

import os
import sys
import subprocess
import secrets
import string


def generate_secret_key():
    """Generate a secure Django secret key"""
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(alphabet) for i in range(50))


def create_env_file():
    """Create .env file from template if it doesn't exist"""
    env_example_path = '.env.example'
    env_path = '.env'
    
    if os.path.exists(env_path):
        print(f"✓ {env_path} already exists")
        return
    
    if not os.path.exists(env_example_path):
        print(f"✗ {env_example_path} not found")
        return
    
    # Read template and replace secret key
    with open(env_example_path, 'r') as f:
        content = f.read()
    
    secret_key = generate_secret_key()
    content = content.replace('your-super-secret-key-change-this-in-production', secret_key)
    
    with open(env_path, 'w') as f:
        f.write(content)
    
    print(f"✓ Created {env_path} with secure secret key")


def install_requirements():
    """Install Python requirements"""
    print("📦 Installing Python requirements...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
        print("✓ Requirements installed successfully")
    except subprocess.CalledProcessError:
        print("✗ Failed to install requirements")
        sys.exit(1)


def run_migrations():
    """Run Django migrations"""
    print("🗄️  Running database migrations...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("✓ Database migrations completed")
    except subprocess.CalledProcessError:
        print("✗ Failed to run migrations")
        sys.exit(1)


def create_superuser():
    """Optionally create a Django superuser"""
    choice = input("🧑‍💼 Create a Django admin superuser? (y/n): ").lower().strip()
    
    if choice in ('y', 'yes'):
        try:
            subprocess.run([sys.executable, 'manage.py', 'createsuperuser'], check=True)
            print("✓ Superuser created successfully")
        except subprocess.CalledProcessError:
            print("ℹ️  Superuser creation cancelled or failed")


def main():
    """Main setup function"""
    print("🚀 Setting up Work Nest Django Backend")
    print("=" * 50)
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Setup steps
    create_env_file()
    install_requirements()
    run_migrations()
    create_superuser()
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update database credentials in .env file if needed")
    print("2. Start the development server: python manage.py runserver")
    print("3. Visit http://127.0.0.1:8000/admin for Django admin")
    print("4. API will be available at http://127.0.0.1:8000/api/")
    print("\n📄 API Endpoints:")
    print("- POST /api/auth/signup/ - User registration")
    print("- POST /api/auth/login/ - User login")
    print("- GET /api/auth/user/ - Get user profile")
    print("- POST /api/auth/logout/ - User logout")
    print("- GET /api/jobs/ - List job posts")
    print("- POST /api/jobs/ - Create job post")


if __name__ == '__main__':
    main()