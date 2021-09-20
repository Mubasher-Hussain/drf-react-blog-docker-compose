#!/bin/bash
python3 manage.py makemigrations blogs
python3 manage.py migrate blogs
python3 manage.py makemigrations & python3 manage.py migrate
python manage.py runserver http://localhost:7500