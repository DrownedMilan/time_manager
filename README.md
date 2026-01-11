# 🕐 Time Manager

A comprehensive time tracking and employee management application built with modern technologies. The system allows employees to clock in/out, managers to oversee their teams, and organization admins to manage the entire workforce.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### For Employees

- ⏰ Clock in/out with real-time tracking
- 📊 View personal work statistics (hours worked, late time, etc.)
- 📅 Track working days per month
- 📈 View clock history and records

### For Managers

- 👥 View and manage team members
- 📊 Team performance analytics and charts
- ⏱️ Monitor team clock-in/out status
- 📉 Track team metrics (late time, overtime, average hours)
- 📥 Export team KPI data as CSV

### For Organization Admins

- 🏢 Manage all employees across the organization
- 👥 Create and manage teams
- 📊 Organization-wide analytics dashboard
- 👤 User management (create, edit, delete users)
- 📥 Export organization-wide reports

### System Features

- 🔐 Secure authentication via Keycloak (SSO)
- 🎨 Custom Keycloak login theme
- 🌙 Dark theme UI
- 📱 Responsive design
- 🔄 Auto clock-out at midnight (scheduled job)
- 🔒 Role-based access control (RBAC)

---

## 🛠 Tech Stack

### Frontend

| Technology  | Purpose                 |
| ----------- | ----------------------- |
| React 18    | UI Framework            |
| TypeScript  | Type Safety             |
| Vite        | Build Tool              |
| TailwindCSS | Styling                 |
| Radix UI    | Accessible Components   |
| Recharts    | Data Visualization      |
| React Query | Server State Management |
| Keycloakify | Custom Keycloak Theme   |

### Backend

| Technology  | Purpose                     |
| ----------- | --------------------------- |
| FastAPI     | REST API Framework          |
| SQLModel    | ORM (SQLAlchemy + Pydantic) |
| PostgreSQL  | Database                    |
| APScheduler | Background Jobs             |
| SQLAdmin    | Admin Panel                 |

### Infrastructure

| Technology              | Purpose                                |
| ----------------------- | -------------------------------------- |
| Docker & Docker Compose | Containerization                       |
| Nginx                   | Reverse Proxy                          |
| Keycloak                | Identity & Access Management           |
| PostgreSQL              | Database (separate for app & Keycloak) |

---

## 🏗 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│    Nginx    │────▶│  Frontend   │
│             │     │   (Proxy)   │     │  (React)    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Backend   │ │  Keycloak   │ │  Keycloak   │
    │  (FastAPI)  │ │   (Auth)    │ │  Database   │
    └──────┬──────┘ └─────────────┘ └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  PostgreSQL │
    │  (App DB)   │
    └─────────────┘
```

---

## 📦 Prerequisites

- **Docker** >= 24.0
- **Docker Compose** >= 2.20
- **Node.js** >= 20 (for local development)
- **Python** >= 3.12 (for local development)
- **Yarn** >= 4.0 (for frontend)

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd time_manager
```

### 2. Create environment files

```bash
# Root .env (copy from example)
cp .envexample .env

# Frontend .env
cp frontend/.envexample frontend/.env

# Backend .env
cp backend/.envexample backend/.env
```

### 3. Start with Docker Compose

```bash
docker compose up --build
```

### 4. Access the application

| Service            | URL                              |
| ------------------ | -------------------------------- |
| Frontend           | http://localhost:4000            |
| API                | http://localhost:4000/api        |
| API Docs (Swagger) | http://localhost:4000/api/docs   |
| Keycloak Admin     | http://localhost:4000/auth/admin |
| Admin Panel        | http://localhost:4000/api/admin  |

### 5. Default Users

| Username | Role               | Password          |
| -------- | ------------------ | ----------------- |
| sarah    | Organization Admin | (set in Keycloak) |
| john     | Manager            | (set in Keycloak) |
| kevin    | Employee           | (set in Keycloak) |
| lucas    | Employee           | (set in Keycloak) |

> **Note:** Reset passwords in Keycloak Admin Console: Users → Select User → Credentials → Reset Password

---

## 💻 Development Setup

### Frontend Development

```bash
cd frontend
yarn install
yarn dev
```

Access at http://localhost:3000

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Access at http://localhost:8000

### Run Tests

```bash
# Frontend tests
cd frontend
yarn test

# Backend tests
cd backend
pytest
```

---

## 🔧 Environment Variables

### Root `.env`

| Variable                | Description           | Default                      |
| ----------------------- | --------------------- | ---------------------------- |
| `POSTGRES_DB`           | Database name         | `time_management_db`         |
| `POSTGRES_USER`         | Database user         | `admin`                      |
| `POSTGRES_PASSWORD`     | Database password     | `admin`                      |
| `KEYCLOAK_REALM`        | Keycloak realm name   | `time-manager`               |
| `KEYCLOAK_PUBLIC_URL`   | Public Keycloak URL   | `http://localhost:4000/auth` |
| `KEYCLOAK_INTERNAL_URL` | Internal Keycloak URL | `http://keycloak:8080/auth`  |

### Frontend `.env`

| Variable                  | Description         |
| ------------------------- | ------------------- |
| `VITE_API_URL`            | Backend API URL     |
| `VITE_KEYCLOAK_URL`       | Keycloak server URL |
| `VITE_KEYCLOAK_REALM`     | Keycloak realm      |
| `VITE_KEYCLOAK_CLIENT_ID` | Keycloak client ID  |

### Backend `.env`

| Variable                | Description           |
| ----------------------- | --------------------- |
| `POSTGRES_HOST`         | Database host         |
| `KEYCLOAK_PUBLIC_URL`   | Public Keycloak URL   |
| `KEYCLOAK_INTERNAL_URL` | Internal Keycloak URL |
| `ALLOWED_ORIGINS`       | CORS allowed origins  |

---

## 📚 API Documentation

### Endpoints Overview

#### Users

| Method   | Endpoint      | Description      |
| -------- | ------------- | ---------------- |
| `GET`    | `/users/`     | List all users   |
| `GET`    | `/users/me`   | Get current user |
| `GET`    | `/users/{id}` | Get user by ID   |
| `POST`   | `/users/`     | Create user      |
| `PUT`    | `/users/{id}` | Update user      |
| `DELETE` | `/users/{id}` | Delete user      |

#### Clocks

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| `GET`  | `/clocks/`               | List all clocks     |
| `GET`  | `/clocks/user/{user_id}` | Get clocks for user |
| `POST` | `/clocks/`               | Clock in/out        |

#### Teams

| Method   | Endpoint                        | Description             |
| -------- | ------------------------------- | ----------------------- |
| `GET`    | `/teams/`                       | List all teams          |
| `GET`    | `/teams/{id}`                   | Get team by ID          |
| `POST`   | `/teams/`                       | Create team             |
| `PUT`    | `/teams/{id}`                   | Update team             |
| `DELETE` | `/teams/{id}`                   | Delete team             |
| `POST`   | `/teams/{id}/members/{user_id}` | Add member to team      |
| `DELETE` | `/teams/{id}/members/{user_id}` | Remove member from team |

#### KPI

| Method | Endpoint       | Description     |
| ------ | -------------- | --------------- |
| `GET`  | `/kpi/summary` | Get KPI summary |

> **Full API Documentation:** Access Swagger UI at `/api/docs` or ReDoc at `/api/redoc`

---

## 📁 Project Structure

```
time_manager/
├── backend/
│   ├── app/
│   │   ├── routers/          # API route handlers
│   │   │   ├── users.py
│   │   │   ├── clocks.py
│   │   │   ├── teams.py
│   │   │   └── kpi.py
│   │   ├── models.py         # SQLModel/Pydantic models
│   │   ├── database.py       # Database connection
│   │   ├── auth.py           # JWT authentication
│   │   ├── keycloak_admin.py # Keycloak admin API
│   │   ├── scheduler.py      # Background jobs
│   │   ├── admin_panel.py    # SQLAdmin setup
│   │   └── main.py           # FastAPI application
│   ├── tests/                # Pytest tests
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # Base UI components (shadcn)
│   │   │   └── common/       # App-specific components
│   │   ├── features/         # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── dashboard/    # Dashboard views
│   │   │   ├── employees/    # Employee management
│   │   │   ├── teams/        # Team management
│   │   │   └── errors/       # Error pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service functions
│   │   ├── lib/              # Utilities
│   │   ├── types/            # TypeScript types
│   │   ├── layouts/          # Layout components
│   │   ├── routes/           # React Router config
│   │   └── themes/           # Theme configuration
│   ├── keycloak-theme/       # Custom Keycloak theme
│   ├── Dockerfile
│   └── package.json
│
├── nginx/
│   └── nginx.conf            # Nginx configuration
│
├── import/
│   └── keycloak/
│       └── time-manager-realm.json  # Keycloak realm config
│
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile.keycloak       # Custom Keycloak image
└── .env                      # Environment variables
```

---

## 👥 User Roles

| Role             | Permissions                                               |
| ---------------- | --------------------------------------------------------- |
| **Employee**     | Clock in/out, view personal stats                         |
| **Manager**      | All employee permissions + manage team, view team stats   |
| **Organization** | All permissions + manage all users, teams, org-wide stats |

Roles are managed in Keycloak and synced to the backend.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest -v
```

### Frontend Tests

```bash
cd frontend
yarn test
```

### Test Coverage

```bash
# Backend
pytest --cov=app --cov-report=html

# Frontend
yarn test --coverage
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Keycloak 502 Bad Gateway

**Cause:** Nginx starts before Keycloak is ready (takes ~30-60 seconds)
**Solution:** Wait for Keycloak to fully start, then refresh

```bash
docker compose logs -f keycloak
# Wait for "Keycloak X.X.X started"
```

#### 2. Users not syncing from Keycloak

**Cause:** Backend starts before Keycloak is ready
**Solution:** The backend retries automatically, or trigger manually:

```bash
docker exec -it backend python -c "
from sqlmodel import Session
from app.database import engine
from app.keycloak_admin import sync_keycloak_users_to_db
with Session(engine) as session:
    sync_keycloak_users_to_db(session)
"
```

#### 3. CORS Errors

**Cause:** Frontend URL not in backend's allowed origins
**Solution:** Update `ALLOWED_ORIGINS` in `.env`:

```dotenv
ALLOWED_ORIGINS=http://localhost,http://localhost:4000
```

#### 4. Database Connection Error

**Cause:** Database container not ready
**Solution:** Check database health:

```bash
docker compose ps
docker compose logs database
```

#### 5. Login redirects to wrong URL

**Cause:** Keycloak client has wrong redirect URIs
**Solution:** Update in Keycloak Admin Console:

1. Go to Clients → frontend
2. Update Valid Redirect URIs to match your domain
3. Save

### Useful Commands

```bash
# View all logs
docker compose logs -f

# Restart a specific service
docker compose restart backend

# Rebuild a specific service
docker compose up -d --build backend

# Access container shell
docker exec -it backend bash

# View database
docker exec -it database psql -U admin -d time_management_db

# Clear all data and restart fresh
docker compose down -v
docker compose up -d --build
```

---

## 📄 License

This project is developed for Epitech.

---

## 👨‍💻 Authors

Time Manager Development Team
