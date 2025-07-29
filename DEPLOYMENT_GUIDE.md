# DATACRM - Kostenlose Deployment Anleitung (Render.com)

## 🚀 Render.com - Beste kostenlose Option

### Vorteile:
- ✅ Vollständig kostenlos (750h/Monat)
- ✅ PostgreSQL Datenbank inklusive
- ✅ Automatische SSL-Zertifikate
- ✅ Git-Integration
- ✅ Umgebungsvariablen-Management

### Schritt-für-Schritt Anleitung:

#### 1. GitHub Repository vorbereiten:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Render.com Account erstellen:
- Gehen Sie zu: https://render.com
- Melden Sie sich mit GitHub an
- Verbinden Sie Ihr Repository

#### 3. Deployment starten:
- Klicken Sie auf "New +"
- Wählen Sie "Blueprint"
- Wählen Sie Ihr GitHub Repository
- Die render.yaml wird automatisch erkannt
- Klicken Sie auf "Deploy"

#### 4. Fertig! 🎉
- Frontend URL: https://datacrm-frontend.onrender.com
- Backend API: https://datacrm-backend.onrender.com
- Automatische SSL-Verschlüsselung

### Wichtige Hinweise:
- Erste Bereitstellung dauert 5-10 Minuten
- Kostenlose Services "schlafen" nach 15 Min Inaktivität
- Erstes Request nach "Schlaf" dauert ~30 Sekunden
- PostgreSQL DB: 1GB Speicher kostenlos

---

## 🌟 Alternative Optionen:

### Option 2: Vercel + Railway
- Frontend: Vercel (kostenlos)
- Backend + DB: Railway ($5/Monat nach Trial)

### Option 3: Netlify + Supabase
- Frontend: Netlify (kostenlos)
- Backend: Netlify Functions (begrenzt)
- DB: Supabase (kostenlos)

---

## 🔧 Lokale Entwicklung beibehalten:

```bash
# Frontend (Terminal 1)
npm run dev

# Backend (Terminal 2)
cd backend
npm run dev
```

## 📧 Support:
Bei Problemen öffnen Sie ein Issue im GitHub Repository.
