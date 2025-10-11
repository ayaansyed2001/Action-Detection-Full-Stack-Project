#!/usr/bin/env bash
set -o errexit  # exit on error

# Install Python deps
pip install -r requirements.txt

# Build React frontend
cd frontend
npm install
npm run build
cd ..

# Collect Django static files
python manage.py collectstatic --noinput
python manage.py migrate
chmod +x build.sh