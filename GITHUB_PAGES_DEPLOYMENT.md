# GitHub Pages + Supabase - 100% KOSTENLOS DAUERHAFT

## 🌟 Komplett kostenlose Lösung ohne Zeitlimit

### ✅ Vorteile:
- **GitHub Pages**: Vollständig kostenlos, dauerhaft
- **Supabase**: Kostenlos für kleine bis mittlere Projekte (500MB DB, 50MB Dateien)
- **Keine Kreditkarte** erforderlich
- **Keine Zeitlimits** oder Probezeiten
- **Automatische SSL-Zertifikate**

---

## 📋 Schritt-für-Schritt Anleitung

### 1. Frontend für GitHub Pages vorbereiten

Ihr Next.js Frontend ist bereits für statischen Export konfiguriert.

### 2. GitHub Pages aktivieren

1. Gehen Sie zu Ihrem GitHub Repository: https://github.com/githubpscl/DATACRM
2. Klicken Sie auf **Settings** (oben rechts)
3. Scrollen Sie zu **Pages** (linke Sidebar)
4. Bei **Source** wählen Sie: **GitHub Actions**
5. Erstellen Sie eine neue Workflow-Datei

### 3. GitHub Actions Workflow erstellen

Erstellen Sie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: https://your-project.supabase.co

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

### 4. Supabase Backend Setup

1. **Supabase Account erstellen:**
   - Gehen Sie zu: https://supabase.com
   - Klicken Sie auf "Start your project"
   - "Sign in with GitHub"

2. **Neues Projekt erstellen:**
   - "New Project"
   - Project Name: `datacrm`
   - Database Password: (sicheres Passwort wählen)
   - Region: `Central EU (Frankfurt)` (für Deutschland optimal)

3. **Datenbank Schema erstellen:**
   ```sql
   -- Führen Sie diese SQL-Befehle in Supabase SQL Editor aus:
   
   -- Companies table
   CREATE TABLE companies (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     company_id UUID REFERENCES companies(id),
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Customers table
   CREATE TABLE customers (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) NOT NULL,
     first_name VARCHAR(255),
     last_name VARCHAR(255),
     company VARCHAR(255),
     phone VARCHAR(50),
     company_id UUID REFERENCES companies(id),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **API Keys kopieren:**
   - Gehen Sie zu Settings → API
   - Kopieren Sie:
     - `Project URL`
     - `anon public key`

### 5. Environment Variables setzen

In Ihrem GitHub Repository:
1. Gehen Sie zu **Settings** → **Secrets and variables** → **Actions**
2. Fügen Sie hinzu:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 6. Code anpassen für Supabase

Erstellen Sie `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🚀 Deployment starten

1. **Code committen:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **GitHub Actions wird automatisch ausgeführt**
3. **Nach 2-3 Minuten ist Ihre App verfügbar unter:**
   ```
   https://githubpscl.github.io/DATACRM/
   ```

---

## 💰 Kosten-Übersicht (dauerhaft kostenlos)

| Service | Limits (kostenlos) | Kosten |
|---------|-------------------|---------|
| **GitHub Pages** | 1GB Speicher, 100GB Bandbreite/Monat | **0€** |
| **Supabase** | 500MB DB, 1GB Dateien, 50K API Requests/Monat | **0€** |
| **GitHub Actions** | 2000 Minuten/Monat | **0€** |

---

## 🔄 Alternative: Vercel (auch dauerhaft kostenlos)

Falls GitHub Pages nicht funktioniert:

1. Gehen Sie zu: https://vercel.com
2. "Sign up with GitHub" 
3. Repository importieren
4. Automatisches Deployment
5. **URL:** `https://datacrm.vercel.app`

**Vercel Limits (kostenlos):**
- 100GB Bandbreite/Monat
- Serverless Functions
- Automatische SSL

---

## ✅ Empfehlung

**Beste dauerhaft kostenlose Kombination:**
1. **Frontend:** GitHub Pages oder Vercel
2. **Backend + DB:** Supabase
3. **Kein Zeitlimit, keine Kreditkarte erforderlich!**

Möchten Sie mit GitHub Pages oder Vercel starten?
