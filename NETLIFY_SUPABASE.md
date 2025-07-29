# Netlify + Supabase - 100% kostenlos ohne Kreditkarte

## 🌟 Netlify (Frontend) + Supabase (Backend + DB)

### Schritt 1: Supabase Backend Setup
1. Gehen Sie zu https://supabase.com
2. "Start your project" → "Sign in with GitHub"
3. "New Project" erstellen
4. Warten Sie auf Database Setup (2-3 Minuten)

### Schritt 2: Netlify Frontend Setup
1. Gehen Sie zu https://netlify.com
2. "Sign up with GitHub"
3. "Add new site" → "Import an existing project"
4. GitHub Repository auswählen
5. Build Einstellungen:
   - Build command: `npm run build`
   - Publish directory: `out` oder `dist`

### Schritt 3: Environment Variables
In Netlify unter Site Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### URLs:
- Frontend: https://your-app.netlify.app
- Backend: https://your-project.supabase.co

---

## 🔥 Schnellste Lösung: Vercel (nur Frontend)

1. https://vercel.com → "Sign up with GitHub"
2. Repository importieren
3. Deploy (automatisch)
4. Fertig! 

URL: https://datacrm.vercel.app

*Hinweis: Nur Frontend, Backend müsste separat gehostet werden*
