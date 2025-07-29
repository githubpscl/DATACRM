# 🚀 DATACRM Render Deployment Guide

## Schritt-für-Schritt Anleitung für Render Deployment

### 1. Render Account Setup
- Gehen Sie zu [render.com](https://render.com)
- Melden Sie sich mit GitHub an
- Verbinden Sie Ihr Repository

### 2. Backend Service erstellen

**Service Konfiguration:**
```
Service Name: datacrm-backend
Region: Frankfurt (EU) oder Oregon (US)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build && npm run migrate && npm run seed
Start Command: npm start
```

**Environment Variables:**
```
NODE_ENV=production
PORT=8000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=ihr-super-sicherer-jwt-schlüssel-min-32-zeichen
CORS_ORIGIN=https://ihr-frontend-name.onrender.com
```

### 3. Frontend Service erstellen

**Service Konfiguration:**
```
Service Name: datacrm-frontend  
Region: Frankfurt (EU) oder Oregon (US)
Branch: main
Root Directory: . (Projekt-Root)
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

**Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://ihr-backend-name.onrender.com
NEXTAUTH_URL=https://ihr-frontend-name.onrender.com
NEXTAUTH_SECRET=ihr-super-sicherer-nextauth-schlüssel-min-32-zeichen
```

### 4. URLs aktualisieren

Nach dem Deployment:
1. Notieren Sie sich die generierten URLs
2. Aktualisieren Sie `CORS_ORIGIN` im Backend mit der Frontend-URL
3. Aktualisieren Sie `NEXT_PUBLIC_API_URL` im Frontend mit der Backend-URL

### 5. Deployment testen

- Frontend: `https://ihr-frontend-name.onrender.com`
- Backend API: `https://ihr-backend-name.onrender.com/api/health`
- Login: Test mit den Seed-Daten

### 6. Login-Daten

Nach erfolgreichem Deployment können Sie sich mit folgenden Test-Daten anmelden:
- **Email:** admin@datacrm.com
- **Password:** admin123

### 7. Troubleshooting

**Häufige Probleme:**
- **Build Fehler:** Überprüfen Sie die Build-Logs in Render Dashboard
- **CORS Fehler:** Stellen Sie sicher, dass CORS_ORIGIN korrekt gesetzt ist
- **Datenbank Fehler:** SQLite wird automatisch erstellt, Migration läuft im Build-Prozess

**Nützliche Befehle:**
```bash
# Logs anzeigen (in Render Dashboard)
# Restart Service (im Render Dashboard)
# Environment Variables überprüfen
```

### 8. Wichtige Hinweise

- ⚠️ **Kostenloses Tier:** Render Free Tier hat Limitierungen (512MB RAM, Services "schlafen" nach 15min Inaktivität)
- 🔒 **Sicherheit:** Verwenden Sie starke, zufällige Secrets für Production
- 📊 **Monitoring:** Überwachen Sie die Service-Logs für Fehler
- 🔄 **Updates:** Pushes zu GitHub triggern automatisches Re-Deployment

### 9. Upgrade auf Paid Plan

Für Production empfiehlt sich der Paid Plan:
- Bessere Performance
- Keine Sleep-Modus Unterbrechungen  
- Mehr RAM und CPU
- Custom Domains
- SSL-Zertifikate

---

## Support & Hilfe

Bei Problemen:
1. Überprüfen Sie die Build- und Runtime-Logs in Render
2. Verifizieren Sie alle Environment Variables
3. Testen Sie die Backend-API direkt über die URL
4. Überprüfen Sie CORS-Einstellungen

Viel Erfolg mit Ihrem DATACRM Deployment! 🎉
