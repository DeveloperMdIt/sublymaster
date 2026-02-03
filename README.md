# Sublymaster - Sublimationsdruck Design-Tool

🎨 Professionelles Design-Tool für Sublimationsdruck mit Echtzeit-Vorschau und Druckerverwaltung.

## 🚀 Features

- ✅ Drag & Drop Bild-Upload
- ✅ Echtzeit Canvas-Editor (Fabric.js)
- ✅ Vordefinierte Vorlagen (Tassen, Handyhüllen, Kissen, etc.)
- ✅ Drucker-Kalibrierung mit Offset-Einstellungen
- ✅ Projekt-Speicherung & -Verwaltung
- ✅ Benutzer-Authentifizierung (JWT)
- ✅ Stripe-Integration für Zahlungen
- ✅ Admin-Dashboard

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Fabric.js (Canvas)
- TailwindCSS
- React Router

### Backend
- Node.js / Express
- SQLite (Datenbank)
- JWT (Authentifizierung)
- Multer (File Uploads)
- Stripe API

## 📦 Installation (Lokal)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# .env anpassen
node index.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment (Netcup)

### Voraussetzungen
- Node.js 20.x
- PM2
- Nginx
- Git

### Setup
1. Repository klonen:
```bash
git clone git@github.com:USERNAME/sublymaster.git /var/www/sublymaster
cd /var/www/sublymaster
```

2. Backend konfigurieren:
```bash
cd backend
cp .env.production.example .env
nano .env  # Werte anpassen
npm install --production
pm2 start ecosystem.config.js
pm2 save
```

3. Frontend bauen:
```bash
cd ../frontend
npm install
npm run build
```

4. Nginx konfigurieren:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/sublymaster.de
sudo ln -s /etc/nginx/sites-available/sublymaster.de /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. SSL aktivieren:
```bash
sudo certbot --nginx -d sublymaster.de -d www.sublymaster.de
```

### Automatisches Deployment
GitHub Actions deployt automatisch bei Push auf `main` Branch.

**Benötigte GitHub Secrets:**
- `SSH_HOST`: Server IP
- `SSH_USER`: SSH Username
- `SSH_PRIVATE_KEY`: SSH Private Key
- `SSH_PORT`: SSH Port (Standard: 22)

## 📝 Lizenz

Proprietary - Alle Rechte vorbehalten

## 👨‍💻 Entwickler

Entwickelt für professionelle Sublimationsdruckereien.
