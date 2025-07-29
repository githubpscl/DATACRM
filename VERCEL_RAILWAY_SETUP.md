# 🚀 DATACRM Setup: Vercel + Railway

## Schritt 1: Backend auf Railway deployen

### 1.1 Railway Account erstellen
1. Gehen Sie zu [railway.app](https://railway.app)
2. Mit GitHub anmelden
3. "New Project" klicken
4. "Deploy from GitHub repo" wählen
5. Ihr DATACRM Repository auswählen

### 1.2 Railway Konfiguration
```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### 1.3 Environment Variables in Railway
```
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=IhrSuperSichererJWTSchlüsselMitMindestens32Zeichen
CORS_ORIGIN=https://datacrm-frontend.vercel.app
```

### 1.4 PostgreSQL hinzufügen
1. Im Railway Dashboard: "New" → "Database" → "PostgreSQL"
2. Automatische Verknüpfung mit Ihrem Service
3. DATABASE_URL wird automatisch gesetzt

### 1.5 Backend-URL notieren
Nach dem Deployment erhalten Sie eine URL wie:
`https://datacrm-backend.up.railway.app`

## Schritt 2: Frontend auf Vercel deployen

### 2.1 Vercel Account erstellen
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Mit GitHub anmelden
3. "New Project" klicken
4. Ihr DATACRM Repository importieren

### 2.2 Vercel Konfiguration
```
Framework Preset: Next.js
Root Directory: . (Project Root)
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 2.3 Environment Variables in Vercel
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://datacrm-backend.up.railway.app
NEXTAUTH_URL=https://datacrm-frontend.vercel.app
NEXTAUTH_SECRET=IhrSuperSichererNextAuthSchlüsselMitMindestens32Zeichen
```

## Schritt 3: URLs aktualisieren

### 3.1 Nach dem Frontend-Deployment
Ihre Frontend-URL wird etwa so aussehen:
`https://datacrm-frontend.vercel.app`

### 3.2 CORS in Railway aktualisieren
Gehen Sie zurück zu Railway und aktualisieren Sie:
```
CORS_ORIGIN=https://datacrm-frontend.vercel.app
```

## Schritt 4: Datenbank Setup

### 4.1 Migration ausführen
Railway führt automatisch folgende Befehle aus:
```bash
npm run build
npm run migrate
npm run seed
```

Falls nicht, können Sie in Railway's Terminal ausführen:
```bash
npm run migrate
npm run seed
```

## Schritt 5: Testen

### 5.1 Backend testen
Öffnen Sie: `https://datacrm-backend.up.railway.app/api/health`
Erwartete Antwort: `{"status": "OK", "timestamp": "..."}`

### 5.2 Frontend testen
Öffnen Sie: `https://datacrm-frontend.vercel.app`
Login mit:
- Email: admin@datacrm.com
- Password: admin123

## Vorteile dieser Lösung:

✅ **Komplett kostenlos**
✅ **Automatisches HTTPS**
✅ **Global CDN (Vercel)**
✅ **Automatische Deployments**
✅ **PostgreSQL-Datenbank**
✅ **Professionelle URLs**
✅ **99.9% Uptime**
✅ **Einfache Skalierung**

## Limits (Free Tier):

**Vercel:**
- Unlimited persönliche Projekte
- 100GB Bandwidth/Monat
- 100 deployments/Tag

**Railway:**
- $5 kostenlose Credits/Monat
- 512MB RAM
- 1GB Disk Storage
- Shared CPU

## Alternative: Supabase Backend

Falls Sie Railway nicht verwenden möchten:

### Supabase Setup
1. [supabase.com](https://supabase.com) Account erstellen
2. Neues Projekt erstellen
3. SQL Editor verwenden für Schema
4. Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://ihr-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr-anon-key
```

Diese Lösung bietet Ihnen eine professionelle, skalierbare und kostenlose Hosting-Umgebung für Ihr DATACRM-Projekt!
