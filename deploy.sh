#!/bin/bash

# Sublymaster Deployment Script
# Wird automatisch von GitHub Actions ausgeführt

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Variablen
PROJECT_DIR="/var/www/sublymaster"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Zum Projekt-Verzeichnis wechseln
cd $PROJECT_DIR

# Git Pull
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Backend Deployment
echo "🔧 Deploying Backend..."
cd $BACKEND_DIR

# Dependencies installieren
echo "📦 Installing backend dependencies..."
npm install --production

# Logs-Verzeichnis erstellen
mkdir -p logs

# PM2 neu starten
echo "♻️  Restarting backend with PM2..."
pm2 restart sublymaster-backend || pm2 start ecosystem.config.js

# Frontend Deployment
echo "🎨 Deploying Frontend..."
cd $FRONTEND_DIR

# Dependencies installieren
echo "📦 Installing frontend dependencies..."
npm install

# Build erstellen
echo "🏗️  Building frontend..."
npm run build

# Nginx neu laden (optional)
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx || echo "⚠️  Nginx reload failed (might need manual intervention)"

echo "✅ Deployment completed successfully!"
echo "🌐 Visit: https://sublymaster.de"

# PM2 Status anzeigen
pm2 status
