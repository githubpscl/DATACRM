# DataCRM - Enterprise CRM & Marketing Automation Platform

Eine moderne, KI-gestützte CRM- und Marketing-Automation-Plattform mit fortschrittlichen Datenmanagement-Funktionen.

## 🌐 **Live Demo** 
**[🚀 Zur Live-Anwendung](https://datacrm-frontend.onrender.com)** (Deploy mit einem Klick!)

## 📱 **Schnell-Deployment**
```bash
# 1. Repository klonen
git clone https://github.com/githubpscl/DATACRM.git
cd DATACRM

# 2. Automatisches Deployment
./deploy.bat  # Windows
# oder
./deploy.sh   # Mac/Linux
```

**Anschließend:** Gehen Sie zu [render.com](https://render.com) → GitHub verbinden → Repository wählen → Deploy!

## 🚀 Features

### ✅ Implementiert
- **Benutzer-Authentifizierung**: Sichere Anmeldung/Registrierung mit JWT
- **Dashboard**: Übersichtliches Dashboard mit Echtzeit-Statistiken
- **Modulare Architektur**: Microservices-basierte Backend-Architektur
- **AI-Integration**: OpenAI-Integration für intelligente Inhalte und Segmentierung
- **Responsive Design**: Vollständig responsive Benutzeroberfläche
- **Datenschutz**: DSGVO-konforme Implementierung mit Audit-Logs

### 🔧 Geplante Features
- **Datenimport**: Automatischer Import und Matching von Kundendaten
- **KI-Segmentierung**: Automatische Kundensegmentierung durch AI
- **Content Builder**: Email, SMS, WhatsApp Content-Editor
- **Customer Journeys**: Drag-and-Drop Journey Builder
- **Kampagnen-Management**: Vollständige Kampagnen-Erstellung und -Verwaltung
- **Echtzeit-Analytics**: Detaillierte Performance-Metriken

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Typisierte Entwicklung
- **Tailwind CSS** - Utility-first CSS Framework
- **Radix UI** - Accessible UI Components
- **Zustand** - State Management
- **React Query** - Server State Management

### Backend
- **Node.js** - JavaScript Runtime
- **Express.js** - Web Framework
- **TypeScript** - Typisierte Backend-Entwicklung
- **Prisma** - Database ORM
- **PostgreSQL** - Relationale Datenbank
- **Redis** - Caching und Session Storage
- **Socket.io** - Echtzeit-Kommunikation

### AI & Externe Services
- **OpenAI GPT-4** - AI-Content-Generierung und Insights
- **Stripe** - Zahlungsabwicklung
- **Nodemailer** - Email-Versand
- **JWT** - Sichere Authentifizierung

### DevOps & Deployment
- **Docker** - Containerisierung
- **Docker Compose** - Multi-Container-Orchestrierung
- **Nginx** - Reverse Proxy
- **Prisma Migrate** - Database Migrations

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18+ installiert
- Docker und Docker Compose installiert
- Git installiert

### 1. Repository klonen
\`\`\`bash
git clone <repository-url>
cd DATACRM
\`\`\`

### 2. Abhängigkeiten installieren

#### Frontend Dependencies
\`\`\`bash
npm install
\`\`\`

#### Backend Dependencies
\`\`\`bash
cd backend
npm install
cd ..
\`\`\`

### 3. Umgebungsvariablen konfigurieren

#### Frontend (.env.local)
\`\`\`bash
cp .env.example .env.local
\`\`\`

Bearbeiten Sie `.env.local`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=DataCRM
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
\`\`\`

#### Backend (.env)
\`\`\`bash
cd backend
cp .env.example .env
\`\`\`

Bearbeiten Sie `backend/.env`:
\`\`\`env
DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/datacrm_dev"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="your-openai-api-key"
\`\`\`

### 4. Datenbank starten (Development)
\`\`\`bash
docker-compose -f docker-compose.dev.yml up -d
\`\`\`

### 5. Datenbank einrichten
\`\`\`bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run seed
\`\`\`

### 6. Anwendung starten

#### Backend starten
\`\`\`bash
cd backend
npm run dev
\`\`\`

#### Frontend starten (neues Terminal)
\`\`\`bash
npm run dev
\`\`\`

## 🐳 Docker Deployment

### Development
\`\`\`bash
# Nur Datenbank-Services
docker-compose -f docker-compose.dev.yml up -d

# Dann manuell Frontend/Backend starten
npm run dev
cd backend && npm run dev
\`\`\`

### Production
\`\`\`bash
# Gesamte Anwendung
docker-compose up -d
\`\`\`

## 📊 Demo-Zugang

Nach dem Setup können Sie sich mit folgenden Demo-Daten anmelden:

- **Email**: admin@demo.com
- **Passwort**: password123

## 🔧 API Endpoints

### Authentifizierung
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Benutzer anmelden
- `GET /api/auth/me` - Aktueller Benutzer
- `POST /api/auth/logout` - Abmelden

### Kunden
- `GET /api/customers` - Alle Kunden abrufen
- `POST /api/customers` - Neuen Kunden erstellen
- `GET /api/customers/:id` - Kunden-Details
- `PUT /api/customers/:id` - Kunden aktualisieren
- `DELETE /api/customers/:id` - Kunden löschen

### AI Features
- `POST /api/ai/segment-customers` - AI-Segmentierung
- `POST /api/ai/generate-content` - Content-Generierung
- `POST /api/ai/optimize-campaign` - Kampagnen-Optimierung
- `GET /api/ai/insights` - AI-Insights

## 🔒 Sicherheitsfeatures

### Authentifizierung & Autorisierung
- ✅ JWT-basierte Authentifizierung
- ✅ Rollenbasierte Zugriffskontrolle
- ✅ Rate Limiting
- ✅ CORS-Schutz
- ✅ Helmet.js Security Headers

### Datenschutz
- ✅ Passwort-Hashing mit bcrypt
- ✅ Input-Validierung mit Zod
- ✅ SQL-Injection-Schutz durch Prisma
- ✅ Audit-Logs für alle Aktionen
- ✅ DSGVO-konforme Datenverarbeitung

### Infrastruktur
- ✅ Docker-Containerisierung
- ✅ Environment-Variable-Management
- ✅ Health Checks
- ✅ Graceful Shutdown

## 🧪 Testing

\`\`\`bash
# Frontend Tests
npm test

# Backend Tests
cd backend
npm test

# E2E Tests
npm run test:e2e
\`\`\`

## 📈 Monitoring & Analytics

### Health Checks
- Frontend: http://localhost:3000/api/health
- Backend: http://localhost:8000/health

### Logs
\`\`\`bash
# Docker Logs anzeigen
docker-compose logs -f

# Nur Backend Logs
docker-compose logs -f backend

# Nur Frontend Logs
docker-compose logs -f frontend
\`\`\`

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Committe deine Änderungen (\`git commit -m 'Add some AmazingFeature'\`)
4. Push zum Branch (\`git push origin feature/AmazingFeature\`)
5. Öffne einen Pull Request

## 📄 License

Dieses Projekt ist unter der MIT License lizenziert. Siehe \`LICENSE\` für Details.

## 🆘 Hilfe & Support

### Häufige Probleme

#### Backend startet nicht
1. Überprüfen Sie die Datenbank-Verbindung
2. Stellen Sie sicher, dass PostgreSQL läuft
3. Überprüfen Sie die Environment-Variablen

#### Frontend kann nicht mit Backend kommunizieren
1. Überprüfen Sie NEXT_PUBLIC_API_URL in .env.local
2. Stellen Sie sicher, dass das Backend auf Port 8000 läuft
3. Überprüfen Sie CORS-Einstellungen

#### Docker-Probleme
\`\`\`bash
# Container neu starten
docker-compose down
docker-compose up -d

# Images neu bauen
docker-compose build --no-cache
\`\`\`

### Logs debuggen
\`\`\`bash
# Backend Logs
cd backend
npm run dev

# Frontend Logs
npm run dev

# Database Logs
docker-compose logs postgres
\`\`\`

## 📞 Kontakt

- **Entwickler**: [Ihr Name]
- **Email**: [Ihre Email]
- **Website**: [Ihre Website]

---

**DataCRM** - Die Zukunft des Customer Relationship Managements mit KI-Power! 🚀
