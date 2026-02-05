---
description: How to manually deploy the application to Netcup
---

// turbo-all
# Netcup Deployment Manual Steps

Follow these steps to update and restart the application on the Netcup server.

## 1. Access the Server
SSH into your Netcup server:
```bash
ssh root@sublymaster.de # or your user
```

## 2. Update Code
Navigate to the project root and pull the latest changes:
```bash
cd /var/www/sublymaster
git pull origin main
```

## 3. Update & Restart Backend
```bash
cd /var/www/sublymaster/backend
npm install --production
pm2 restart sublymaster-backend || pm2 start index.js --name sublymaster-backend
```

## 4. Build & Update Frontend
```bash
cd /var/www/sublymaster/frontend
npm install
npm run build
```

## 5. Reload Web Server (Apache)
```bash
sudo systemctl reload apache2
```

## 6. Verify Logs
Check if the backend is running correctly:
```bash
pm2 logs sublymaster-backend
```
