# Server Troubleshooting Guide (Netcup / Production)

Falls du auf dem Server (Netcup) Fehler wie `Unexpected token '<'` oder Verbindungsprobleme hast, gehe bitte diese Checkliste durch.

## 1. Backend Status prüfen
Der Fehler `Unexpected token '<'` bedeutet oft, dass das Backend nicht läuft oder eine HTML-Fehlerseite (404/502) zurückgibt.

**Befehle auf dem Server:**
```bash
# Zeige alle laufenden Prozesse
pm2 list

# Falls der Status nicht "online" ist, oder bei Fehlern:
pm2 logs backend --lines 100

# Wichtig: Nach jedem Update Abhängigkeiten prüfen!
npm install
```

## 2. Datenbank-Verbindung (CRM Migration)
Ich habe die Migration so programmiert, dass sie den Server-Start nicht mehr blockiert. Dennoch sollte sie erfolgreich durchlaufen.
Prüfe in den PM2 Logs, ob diese Zeile erscheint:
`✅ Connected to PostgreSQL database.`

## 3. Nginx / Routing
Falls PM2 sagt, dass das Backend online ist (Port 3000), aber das Frontend trotzdem HTML für `/api` Anfragen erhält:
- Eventuell fängt Nginx die `/api` Anfragen ab, bevor sie beim Node-Server ankommen.
- Prüfe die Nginx Konfiguration (meist in `/etc/nginx/sites-available/...`):
  ```nginx
  location /api {
      proxy_pass http://localhost:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
  }
  ```

## 4. Frontend Cache
Nach einem `npm run build` auf dem Server solltest du im Browser einmal den Cache löschen (Strg + F5), um sicherzustellen, dass die neue `index.js` mit den Proxy-Fixes geladen wird.

---
**Aktueller Status**: Ich habe das Backend so umgestellt, dass es für `/api/*` Fehler jetzt immer JSON zurückgibt. Falls du also jetzt einen Fehler bekommst, steht dort eine klare JSON-Nachricht drin statt HTML Code.
