# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Copy backend requirements and install dependencies
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ /app/

# Run Django setup commands
RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run gunicorn with better logging
CMD ["gunicorn", "worknest.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--log-level", "debug", "--access-logfile", "-", "--error-logfile", "-"]