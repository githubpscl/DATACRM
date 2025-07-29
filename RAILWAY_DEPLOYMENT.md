# Railway.app Deployment - Komplett kostenlos ohne Kreditkarte

## 🚀 Railway.app - Beste Alternative zu Render

### Vorteile:
- ✅ Vollständig kostenlos ohne Kreditkarte
- ✅ $5 Startguthaben (reicht für Monate)
- ✅ PostgreSQL Datenbank inklusive
- ✅ Automatische SSL-Zertifikate
- ✅ Git-Integration

### Schritt-für-Schritt Anleitung:

#### 1. Railway Account erstellen:
- Gehen Sie zu: https://railway.app
- Klicken Sie auf "Login with GitHub"
- Autorisieren Sie Railway

#### 2. Backend deployen:
- Klicken Sie auf "New Project"
- Wählen Sie "Deploy from GitHub repo"
- Wählen Sie "githubpscl/DATACRM"
- Railway erkennt automatisch das Backend

#### 3. Datenbank hinzufügen:
- Klicken Sie auf "+ New"
- Wählen Sie "Database" → "PostgreSQL"
- Railway erstellt automatisch die DATABASE_URL

#### 4. Environment Variables setzen:
```
NODE_ENV=production
JWT_SECRET=your-random-secret-key
CORS_ORIGIN=*
PORT=8000
```

#### 5. Frontend deployen:
- Klicken Sie erneut auf "New Project"
- Wählen Sie das gleiche Repository
- Setzen Sie Root Directory auf "/" (für Frontend)

### URLs nach Deployment:
- Backend: https://datacrm-backend-production.up.railway.app
- Frontend: https://datacrm-frontend-production.up.railway.app

---

## Alternative: Vercel + PlanetScale (beide kostenlos)

### Vercel (Frontend):
1. Gehen Sie zu https://vercel.com
2. "Sign up with GitHub"
3. Import repository
4. Automatisches Deployment

### PlanetScale (Datenbank):
1. Gehen Sie zu https://planetscale.com
2. Kostenloses Konto erstellen
3. MySQL-Datenbank erstellen
4. Connection String kopieren
