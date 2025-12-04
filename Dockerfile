FROM python:3.11

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput

EXPOSE $PORT

CMD sh -c "python manage.py migrate --verbosity=2 && gunicorn worknest.wsgi --log-file - --bind 0.0.0.0:$PORT"