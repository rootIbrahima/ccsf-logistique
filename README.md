# CCSF Logistique

Application de gestion logistique pour **Comptoir Commercial SALL et Frères (CCSF)**, Dakar, Sénégal.

## Prérequis

- Node.js 20+
- MySQL 8+ (service démarré)
- npm 10+

## Mise en place

### 1. Créer la base de données MySQL

```sql
mysql -u root -p
CREATE DATABASE ccsf_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Backend

```bash
cd backend
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env : renseigner DATABASE_URL avec ton mot de passe MySQL
# Exemple : DATABASE_URL="mysql://root:MonMotDePasse@localhost:3306/ccsf_db"

# Créer le schéma en base
npx prisma migrate dev --name init

# Charger les données de test
npm run seed

# Démarrer le serveur de développement
npm run dev
# → http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install

# Copier les variables d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
# → http://localhost:5173
```

## Identifiants de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@ccsf.sn | Admin2026! | admin |

## Architecture

```
ccsf-logistique/
├── backend/          Node.js 20 + Express + Prisma (MySQL)
└── frontend/         React 18 + Vite + Tailwind CSS
```

## Modules

| Module | Description |
|--------|-------------|
| **Tableau de bord** | KPIs du mois, derniers trajets, destinations fréquentes |
| **Carte** | Leaflet/OpenStreetMap, marqueurs par statut, filtres |
| **Feuilles de route** | Formulaire 2 étapes, export PDF |
| **Dotation carburant** | Calcul automatique, tableau coloré par statut |
| **Répertoire** | Chauffeurs et véhicules, recherche globale debounce |

## Stack technique

- **Backend** : Node.js 20 · Express · Prisma · MySQL 8 · JWT · pdfkit · pino · Zod
- **Frontend** : React 18 · Vite · Tailwind CSS 3 · react-hook-form · react-icons · Leaflet (CDN)
- **Auth** : Access token 15min (mémoire React) + Refresh token 7j (httpOnly cookie)
