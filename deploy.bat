@echo off
echo 🚀 DATACRM - Kostenlose Deployment Optionen
echo ==========================================

REM Git Status prüfen
echo 📋 Prüfe Git Status...
git status

REM Änderungen committen
echo 💾 Committe alle Änderungen...
git add .
git commit -m "Deploy: %date% %time%"

REM Push to GitHub
echo 📤 Push zu GitHub...
git push origin main

echo.
echo ✅ Repository ist bereit für Deployment!
echo.
echo � KOSTENLOSE DEPLOYMENT OPTIONEN (ohne Kreditkarte):
echo.
echo 🥇 Option 1: Railway.app (Empfohlen)
echo    1. Gehen Sie zu: https://railway.app
echo    2. "Login with GitHub"
echo    3. "New Project" → "Deploy from GitHub repo"
echo    4. Repository wählen: githubpscl/DATACRM
echo    💰 $5 Startguthaben - reicht für Monate!
echo.
echo 🥈 Option 2: Vercel (nur Frontend)
echo    1. Gehen Sie zu: https://vercel.com
echo    2. "Sign up with GitHub"
echo    3. Repository importieren
echo    4. Automatisches Deployment
echo    🌐 URL: https://datacrm.vercel.app
echo.
echo 🥉 Option 3: Netlify + Supabase
echo    1. Frontend: https://netlify.com
echo    2. Backend: https://supabase.com
echo    3. Beide mit GitHub verbinden
echo.
echo ⏱️  Deployment dauert ca. 3-5 Minuten
echo 🎉 Komplett kostenlos - keine Kreditkarte nötig!

pause
