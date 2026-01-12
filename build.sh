#!/usr/bin/env bash
# exit on error
set -o errexit

# Navigate to backend directory
cd backend

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate

# Create superuser if it doesn't exist (optional - commented out for security)
# echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin@example.com', 'changeme123') if not User.objects.filter(email='admin@example.com').exists() else None" | python manage.py shell
