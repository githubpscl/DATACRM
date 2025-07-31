# Multi-Tenant Organization System - Implementierung

## 🏗️ **Architektur-Übersicht**

Das CRM verwendet eine **Session-basierte Multi-Tenancy** mit Row Level Security (RLS):

### **Gewählter Ansatz: Session + RLS**
- ✅ **URL bleibt sauber:** `datacrm.com/dashboard` 
- ✅ **Automatische Datentrennung:** Jeder Benutzer sieht nur Daten seiner Organisation
- ✅ **Zentrale Logik:** Ein Codebase für alle Organisationen
- ✅ **Sicherheit:** Database-Level Isolation durch RLS

---

## 🔐 **Sicherheits-Mechanismen**

### **1. Row Level Security (RLS)**
Alle Tabellen sind automatisch nach Organisation gefiltert:
```sql
-- Beispiel: Customers
CREATE POLICY "Users can only see customers in their organization" ON customers
    FOR ALL USING (organization_id = get_current_user_organization_id());
```

### **2. Automatische Organization ID**
```sql
-- Trigger setzt automatisch die richtige Organisation beim INSERT
CREATE TRIGGER set_org_id_customers
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION set_organization_id_customers();
```

### **3. Frontend Guards**
- `OrganizationGuard`: Prüft ob Benutzer einer Organisation angehört
- `SuperAdminGuard`: Prüft Super-Admin-Berechtigung

---

## 🚀 **Benutzer-Flows**

### **Neuer Benutzer ohne Organisation:**
1. **Registrierung** → Benutzer wird in `users` Tabelle erstellt
2. **Login** → `OrganizationGuard` erkennt fehlende Organisation
3. **Weiterleitung** → `/organization-required` Seite
4. **Optionen:**
   - Beitrittsanfrage an bestehende Organisation
   - Kontakt zu Admin für neue Organisation

### **Beitrittsanfrage-Prozess:**
1. **Benutzer** wählt Organisation und gibt Admin-E-Mail ein
2. **System** erstellt Eintrag in `organization_join_requests`
3. **Admin** erhält Benachrichtigung (TODO: E-Mail)
4. **Admin** genehmigt/lehnt ab über Super-Admin-Interface
5. **Bei Genehmigung:** Benutzer wird automatisch der Organisation zugewiesen

---

## 🛠️ **Implementierte Komponenten**

### **Frontend:**
- `OrganizationGuard` - Zentrale Organisationsprüfung
- `OrganizationRequiredPage` - Beitrittsanfragen-Interface
- `JoinRequestsManager` - Admin-Interface für Anfragen
- `SuperAdminGuard` - Super-Admin-Berechtigung

### **Backend (Supabase):**
- `get_current_user_organization_id()` - Aktuelle Organisation ermitteln
- `get_available_organizations_for_join()` - Verfügbare Organisationen
- RLS Policies für alle Tabellen
- Automatische Trigger für Organization ID

### **Datenbank:**
- `organization_join_requests` - Beitrittsanfragen-Tabelle
- RLS auf allen Multi-Tenant-Tabellen
- Automatische Trigger für Daten-Isolation

---

## 📋 **Setup-Anweisungen**

### **1. SQL Script ausführen:**
```bash
# In Supabase SQL Editor:
multi-tenant-setup.sql
```

### **2. Frontend aktualisieren:**
- Alle Dashboard-Routen sind automatisch geschützt
- Neue Benutzer werden zur Organization-Required-Seite geleitet
- Super-Admins können Join-Requests verwalten

### **3. Testen:**
1. **Neuen Benutzer registrieren** → Sollte zur Organization-Required-Seite
2. **Beitrittsanfrage stellen** → Als Admin genehmigen
3. **Daten erstellen** → Nur für eigene Organisation sichtbar

---

## 🔄 **Datenfluss-Beispiel**

### **Customer erstellen:**
```typescript
// Frontend sendet nur die Customer-Daten
const customer = await createCustomer({
  name: "Musterfirma",
  email: "info@musterfirma.de"
})

// Backend-Trigger setzt automatisch:
// organization_id = get_current_user_organization_id()

// RLS Policy sorgt dafür, dass nur Benutzer
// der gleichen Organisation den Customer sehen
```

---

## 🎯 **Vorteile dieser Lösung**

1. **Sicherheit:** Database-Level-Isolation
2. **Einfachheit:** Ein Codebase, automatische Trennung
3. **Performance:** Effiziente RLS-Queries
4. **Skalierbar:** Keine Limits für Organisationen
5. **Wartbar:** Zentrale Logik, klare Trennung

---

## 🔜 **Nächste Schritte**

1. **E-Mail-Benachrichtigungen** für Join-Requests
2. **Organization-Einstellungen** für Admins
3. **Benutzer-Verwaltung** innerhalb der Organisation
4. **Organization-spezifische Anpassungen** (Logo, Farben)
5. **Usage Analytics** pro Organisation

---

## 🚨 **Wichtige Hinweise**

- **Super-Admins** haben Zugriff auf alle Organisationen
- **RLS ist aktiviert** - alle Queries sind automatisch gefiltert
- **Organization ID wird automatisch gesetzt** - kein manueller Code nötig
- **Guards sind zentral** - einmal implementiert, überall aktiv

Diese Implementierung bietet eine solide, sichere und skalierbare Multi-Tenant-Architektur für Ihr CRM-System.
