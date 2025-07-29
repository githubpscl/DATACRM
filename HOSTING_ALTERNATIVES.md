# 🌟 DATACRM - Kombinierte kostenlose Hosting-Strategie

## Empfohlene Aufteilung:

### Frontend: Vercel
- **Kostenlos:** Unlimited persönliche Projekte
- **Performance:** Optimiert für Next.js
- **URL:** https://datacrm-frontend.vercel.app

### Backend: Railway
- **Kostenlos:** 512MB RAM, 1GB Disk
- **Datenbank:** PostgreSQL inklusive
- **URL:** https://datacrm-backend.up.railway.app

### Datenbank: Supabase (kostenlos)
- **Kostenlos:** 500MB Datenbank
- **PostgreSQL:** Vollständig verwaltet
- **API:** Automatische REST API

## Setup-Schritte:

### 1. Frontend auf Vercel
```bash
# 1. Zu vercel.com gehen
# 2. GitHub Repository verbinden
# 3. Automatisches Deployment

# Environment Variables in Vercel:
NEXT_PUBLIC_API_URL=https://datacrm-backend.up.railway.app
NEXTAUTH_URL=https://datacrm-frontend.vercel.app
NEXTAUTH_SECRET=your-secret
```

### 2. Backend auf Railway
```bash
# 1. Zu railway.app gehen
# 2. Repository deployen
# 3. PostgreSQL Add-on hinzufügen

# Environment Variables in Railway:
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Automatisch gesetzt
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://datacrm-frontend.vercel.app
PORT=${{PORT}}  # Automatisch gesetzt
```

### 3. Alternative: Supabase Backend
```bash
# Supabase als Backend-Alternative:
# 1. supabase.com Account erstellen
# 2. Neues Projekt erstellen
# 3. Database Schema importieren
# 4. API Keys verwenden

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Kosten-Vergleich (Free Tiers):

| Service | Frontend | Backend | Datenbank | Limits |
|---------|----------|---------|-----------|---------|
| **Vercel + Railway** | ✅ Unlimited | ✅ 512MB RAM | ✅ 1GB PostgreSQL | Sehr gut |
| **Netlify + Supabase** | ✅ 100GB Bandwidth | ✅ Serverless Functions | ✅ 500MB PostgreSQL | Gut |
| **Render** | ✅ 512MB RAM | ✅ 512MB RAM | ❌ Externe DB nötig | Okay |
| **Heroku** | ❌ Nicht für Frontend | ✅ 512MB RAM | ✅ PostgreSQL | Schläft nach 30min |

## Empfehlung:

**Für Ihr DATACRM-Projekt:** Vercel (Frontend) + Railway (Backend)
- ✅ Beste Performance für Next.js
- ✅ Einfache Einrichtung
- ✅ Gute kostenloses Limits
- ✅ Professionelle URLs
- ✅ Automatische HTTPS
- ✅ CI/CD inklusive
