#!/bin/bash

echo "🚀 DATACRM - Automatisches Deployment Setup"
echo "=========================================="

# Git Status prüfen
echo "📋 Prüfe Git Status..."
git status

# Änderungen committen
echo "💾 Committe alle Änderungen..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
echo "📤 Push zu GitHub..."
git push origin main

echo ""
echo "✅ Repository ist bereit für Deployment!"
echo ""
echo "🌐 Nächste Schritte:"
echo "1. Gehen Sie zu https://render.com"
echo "2. Melden Sie sich mit GitHub an"
echo "3. Klicken Sie auf 'New +' → 'Blueprint'"
echo "4. Wählen Sie Ihr Repository: githubpscl/DATACRM"
echo "5. Klicken Sie auf 'Deploy'"
echo ""
echo "⏱️  Deployment dauert ca. 5-10 Minuten"
echo "🎉 Danach ist Ihre App online verfügbar!"
