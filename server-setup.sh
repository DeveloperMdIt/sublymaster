#!/bin/bash

# Sublymaster Server Setup Script für Apache + PostgreSQL
# Für User: sunlinermicha auf 188.68.32.75

set -e

echo "🚀 Sublymaster Server Setup wird gestartet..."

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variablen
PROJECT_DIR="/var/www/sublymaster"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
APACHE_CONF="/etc/apache2/sites-available/sublymaster.conf"

echo -e "${GREEN}📦 Schritt 1: System-Pakete prüfen${NC}"

# Node.js Version prüfen
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nicht installiert!"
    echo "Installiere Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js bereits installiert: $(node --version)"
fi

# PM2 prüfen
if ! command -v pm2 &> /dev/null; then
    echo "Installiere PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 bereits installiert"
fi

# Git prüfen
if ! command -v git &> /dev/null; then
    echo "Installiere Git..."
    sudo apt install -y git
else
    echo "✅ Git bereits installiert"
fi

echo -e "${GREEN}📂 Schritt 2: Projekt-Verzeichnis erstellen${NC}"

# Verzeichnis erstellen
sudo mkdir -p $PROJECT_DIR
sudo chown -R sunlinermicha:sunlinermicha $PROJECT_DIR

echo -e "${GREEN}🔑 Schritt 3: SSH-Key für GitHub generieren${NC}"

if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -C "sunlinermicha@sublymaster.de" -f ~/.ssh/id_ed25519 -N ""
    echo ""
    echo -e "${YELLOW}📋 WICHTIG: Fügen Sie diesen Public Key zu GitHub hinzu:${NC}"
    echo -e "${YELLOW}https://github.com/DeveloperMdIt/sublymaster/settings/keys${NC}"
    echo ""
    cat ~/.ssh/id_ed25519.pub
    echo ""
    read -p "Drücken Sie Enter, wenn Sie den Key zu GitHub hinzugefügt haben..."
else
    echo "✅ SSH-Key existiert bereits"
fi

echo -e "${GREEN}📥 Schritt 4: Repository klonen${NC}"

cd $PROJECT_DIR
if [ ! -d ".git" ]; then
    git clone git@github.com:DeveloperMdIt/sublymaster.git .
else
    echo "✅ Repository bereits geklont, pulling latest..."
    git pull origin main
fi

echo -e "${GREEN}🗄️  Schritt 5: PostgreSQL Datenbank erstellen${NC}"

# PostgreSQL Datenbank erstellen
sudo -u postgres psql -c "CREATE DATABASE sublymaster;" 2>/dev/null || echo "Datenbank existiert bereits"
sudo -u postgres psql -c "CREATE USER sublymaster_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';" 2>/dev/null || echo "User existiert bereits"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sublymaster TO sublymaster_user;"

echo -e "${GREEN}⚙️  Schritt 6: Backend konfigurieren${NC}"

cd $BACKEND_DIR

# Dependencies installieren
npm install --production

# .env erstellen
if [ ! -f .env ]; then
    cp .env.production.example .env
    echo ""
    echo -e "${YELLOW}⚠️  WICHTIG: Bearbeiten Sie jetzt die .env Datei:${NC}"
    echo "nano .env"
    echo ""
    echo "Ändern Sie mindestens:"
    echo "  - JWT_SECRET (zufälliger String, min. 32 Zeichen)"
    echo "  - DATABASE_URL (PostgreSQL Connection String)"
    echo ""
    read -p "Drücken Sie Enter, um .env zu bearbeiten..."
    nano .env
fi

# Logs-Verzeichnis
mkdir -p logs

# PM2 starten
pm2 delete sublymaster-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | bash

echo -e "${GREEN}🎨 Schritt 7: Frontend bauen${NC}"

cd $FRONTEND_DIR
npm install
npm run build

echo -e "${GREEN}🌐 Schritt 8: Apache konfigurieren${NC}"

# Apache Module aktivieren
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

# Virtual Host kopieren
sudo cp $PROJECT_DIR/apache-sublymaster.conf $APACHE_CONF

# Site aktivieren
sudo a2ensite sublymaster.conf

# Apache Config testen
sudo apache2ctl configtest

# Apache neu laden
sudo systemctl reload apache2

echo -e "${GREEN}🔒 Schritt 9: SSL-Zertifikat (Let's Encrypt)${NC}"

# Certbot installieren (falls nicht vorhanden)
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-apache
fi

# SSL aktivieren
sudo certbot --apache -d sublymaster.de -d www.sublymaster.de --non-interactive --agree-tos --email sunlinermicha@gmail.com || echo "SSL bereits konfiguriert oder DNS nicht bereit"

echo ""
echo -e "${GREEN}✅ Setup abgeschlossen!${NC}"
echo ""
echo "🌐 Ihre Seite sollte erreichbar sein unter:"
echo "   https://sublymaster.de"
echo ""
echo "📊 Backend Status prüfen:"
echo "   pm2 status"
echo "   pm2 logs sublymaster-backend"
echo ""
echo "🔧 Apache Status:"
echo "   sudo systemctl status apache2"
echo ""
