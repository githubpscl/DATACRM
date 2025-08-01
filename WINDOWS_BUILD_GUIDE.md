# DataCRM Build-Probleme lösen (Windows)

## 🚨 **Häufige Windows Build-Fehler**

### **Problem 1: EPERM - Operation not permitted**
```
Error: EPERM: operation not permitted, rmdir 'C:\...\out\help'
```

**Lösung:**
```powershell
# Option 1: Verbessertes Start-Skript verwenden
.\start-dev.ps1 -Build

# Option 2: Forceful cleanup (falls Option 1 fehlschlägt)
.\force-clean.ps1
.\start-dev.ps1 -Build
```

### **Problem 2: EINVAL - Invalid argument, readlink**
```
Error: EINVAL: invalid argument, readlink '.next\package.json'
```

**Lösung:**
```powershell
# Normale Development Build (ohne Export)
npm run build

# GitHub Pages Build (mit Export)
npm run build:github
```

## 🔧 **Build-Befehle**

| Zweck | Befehl | Beschreibung |
|-------|--------|---------------|
| **Development** | `npm run dev` | Dev-Server starten |
| **Development Build** | `npm run build` | SSR Build (lokal) |
| **GitHub Pages** | `npm run build:github` | Static Export |
| **Script: Dev** | `.\start-dev.ps1` | Dev-Server mit Cleanup |
| **Script: Build** | `.\start-dev.ps1 -Build` | GitHub Pages Build |
| **Script: Deploy** | `.\start-dev.ps1 -Deploy` | Build + Deploy Ready |

## 🛠️ **Problemlösung Schritt-für-Schritt**

### **Schritt 1: Bereinigung**
```powershell
# Sanfte Bereinigung
.\start-dev.ps1 -Build

# Falls das fehlschlägt - Forceful cleanup
.\force-clean.ps1
```

### **Schritt 2: Dependencies prüfen**
```powershell
npm install
npm audit fix
```

### **Schritt 3: Build testen**
```powershell
# Test 1: Development Build
npm run build

# Test 2: GitHub Pages Build
npm run build:github
```

### **Schritt 4: Bei anhaltenden Problemen**
```powershell
# Alle Node-Prozesse beenden
Get-Process -Name "node" | Stop-Process -Force

# Alle Caches löschen
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue

# Neu installieren
npm ci
npm run build:github
```

## ✅ **Erfolgreiche Deployment-URLs**

- **Development:** http://localhost:3000
- **GitHub Pages:** https://githubpscl.github.io/DATACRM/

## 📝 **Deployment-Workflow**

1. **Entwickeln:** `.\start-dev.ps1`
2. **Testen:** `.\start-dev.ps1 -Build`
3. **Deployen:** 
   ```powershell
   .\start-dev.ps1 -Deploy
   git add .
   git commit -m "Deploy updates"
   git push origin main
   ```

Das System ist jetzt Windows-kompatibel und produktionsbereit! 🚀
