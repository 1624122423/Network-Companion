# IT Project - Docker Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│                  (Access http://localhost)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Network: app-network                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          Frontend Container (Nginx)                         │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────┐           │ │
│  │  │  React App (Built with Vite)                │           │ │
│  │  │  - Static file serving                      │           │ │
│  │  │  - SPA routing support                      │           │ │
│  │  │  - Port: 80                                 │           │ │
│  │  └─────────────────────────────────────────────┘           │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────┐           │ │
│  │  │  Nginx Reverse Proxy                        │           │ │
│  │  │  - /api/* → backend:5000                   │           │ │
│  │  │  - CORS configuration                       │           │ │
│  │  │  - Gzip compression                         │           │ │
│  │  │  - Static asset caching                     │           │ │
│  │  └─────────────────────────────────────────────┘           │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                           │
│                       │ /api/* requests                           │
│                       ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          Backend Container (Flask)                          │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────┐           │ │
│  │  │  Flask Application                          │           │ │
│  │  │  - REST API (Flask-RESTX)                  │           │ │
│  │  │  - JWT Authentication                       │           │ │
│  │  │  - Business Logic                           │           │ │
│  │  │  - Port: 5000                               │           │ │
│  │  └─────────────────────────────────────────────┘           │ │
│  │                                                              │ │
│  │  Controllers:                                                │ │
│  │  - users.py       (User Management)                         │ │
│  │  - mentors.py     (Mentor Management)                       │ │
│  │  - appointments.py (Appointment Management)                 │ │
│  │  - timeSlots.py   (Time Slot Management)                    │ │
│  └────────┬──────────────────────┬─────────────────────────────┘ │
│           │                      │                                │
└───────────┼──────────────────────┼────────────────────────────────┘
            │                      │
            │                      │
            ▼                      ▼
    ┌───────────────┐      ┌─────────────────┐
    │   MongoDB     │      │   Firebase      │
    │               │      │   Authentication│
    │               │      │                 │
    │  Option 1:    │      │  - User Auth    │
    │  Atlas Cloud  │      │  - JWT Token    │
    │  (Default)    │      │  - Service Key  │
    │               │      │                 │
    │  Option 2:    │      └─────────────────┘
    │  Local Docker │              ▲
    │  (MongoDB 7.0)│              │
    │               │              │
    │  + Mongo      │      (it-project-auth.json)
    │    Express    │
    │    Admin UI   │
    └───────────────┘
```

## 📊 Data Flow Diagram

### User Registration Flow

```
User Form
    │
    ▼
React Frontend ──1. POST /api/users/register──▶ Flask Backend
    │                                                │
    │                                                ▼
    │                                         Firebase Auth
    │                                         (Create User)
    │                                                │
    │                                                ▼
    │◀────────────2. Return ID Token ────────────────┤
    │                                                │
    │                                                ▼
    └──────────3. Save User Info ──────────▶     MongoDB
                                               (Store User Data)
```

### User Login Flow

```
User Credentials
    │
    ▼
React Frontend ──1. POST /api/users/login──▶ Flask Backend
    │                                            │
    │                                            ▼
    │                                      Firebase Auth
    │                                      (Verify User)
    │                                            │
    │                                            ▼
    │◀────2. Return JWT Token + Session Cookie───┤
    │
    └─────────3. Store Token in localStorage
```

### API Request Flow

```
User Action (e.g., View Mentors)
    │
    ▼
React Frontend ──1. GET /api/mentors──▶ Nginx (Port 80)
                                          │
                                          │ Reverse Proxy
                                          ▼
                                    Flask Backend (Port 5000)
                                          │
                                          │ 2. Query Database
                                          ▼
                                       MongoDB
                                          │
                                          │ 3. Return Data
                                          ▼
                                    Flask Backend
                                          │
                                          │ 4. JSON Response
                                          ▼
React Frontend ◀───────────────────────Nginx
    │
    ▼
Render Page
```

## 🔄 Container Communication

### Network Configuration

- **Network Name**: `app-network` (bridge mode)
- **Containers can access each other by service name**:
  - Frontend → Backend: `http://backend:5000`
  - Backend → MongoDB: `mongodb://mongodb:27017` (if local)

### Port Mapping

```
Host Port → Container Port → Service

80       → 80       → Nginx (Frontend)
5000     → 5000     → Flask (Backend)
27017    → 27017    → MongoDB (Local mode)
8081     → 8081     → Mongo Express (Local mode)
```

## 📦 Docker Compose Service Dependencies

```
┌─────────────┐
│  MongoDB    │  (Optional, local mode)
└──────┬──────┘
       │
       │ depends_on
       ▼
┌─────────────┐
│  Backend    │
└──────┬──────┘
       │
       │ depends_on
       ▼
┌─────────────┐
│  Frontend   │
└─────────────┘
```

## 🛡️ Security Architecture

```
┌─────────────────────────────────────────────┐
│            Internet                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │   Firewall      │
         │   (Only necessary ports open)
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │   Docker Host   │
         │                 │
         │  ┌───────────┐ │
         │  │ Frontend  │ │ ← Public access (Port 80)
         │  └─────┬─────┘ │
         │        │        │
         │  ┌─────▼─────┐ │
         │  │ Backend   │ │ ← Internal network (Port 5000)
         │  └─────┬─────┘ │
         │        │        │
         │  ┌─────▼─────┐ │
         │  │ MongoDB   │ │ ← Internal network (Port 27017)
         │  └───────────┘ │
         └─────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Firebase Auth  │ ← External service (HTTPS)
         └────────────────┘
```

## 📈 Horizontal Scaling Architecture

### Load Balancer Setup

```
                    ┌────────────────┐
                    │  Load Balancer  │
                    │   (Nginx/HAProxy)│
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
        ┌────▼────┐     ┌────▼────┐    ┌────▼────┐
        │Frontend │     │Frontend │    │Frontend │
        │Instance1│     │Instance2│    │Instance3│
        └────┬────┘     └────┬────┘    └────┬────┘
             │               │               │
             └───────────────┼───────────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
        ┌────▼────┐     ┌────▼────┐    ┌────▼────┐
        │Backend  │     │Backend  │    │Backend  │
        │Instance1│     │Instance2│    │Instance3│
        └────┬────┘     └────┬────┘    └────┬────┘
             │               │               │
             └───────────────┼───────────────┘
                             │
                    ┌────────▼────────┐
                    │  MongoDB Cluster │
                    │  (Replica Set)   │
                    └──────────────────┘
```

## 🔧 Environment Variables Flow

```
.env file
    │
    ├──▶ Docker Compose
    │       │
    │       ├──▶ Backend Container
    │       │       └──▶ Flask App
    │       │              └──▶ Connect to MongoDB
    │       │
    │       └──▶ Frontend Container
    │               └──▶ Nginx
    │
    └──▶ Build-time Environment Variables
            └──▶ React Build (VITE_API_BASE_URL)
```

## 📂 Data Persistence

```
Docker Host
    │
    ├── volumes/
    │   ├── mongodb_data/        ← MongoDB data files
    │   │   └── /data/db
    │   │
    │   └── mongodb_config/      ← MongoDB configuration
    │       └── /data/configdb
    │
    └── containers/
        ├── backend/
        │   └── /app/it-project-auth.json  ← Firebase credentials (read-only mount)
        │
        └── frontend/
            └── /usr/share/nginx/html      ← Built static files
```

## 🚦 Health Check Mechanism

```
Docker Engine
    │
    ├──▶ Backend Health Check
    │       │
    │       └──▶ curl http://localhost:5000/health
    │              └──▶ Every 30 seconds
    │                     └──▶ Mark unhealthy after 3 failures
    │
    ├──▶ Frontend Health Check
    │       │
    │       └──▶ wget http://localhost/
    │              └──▶ Every 30 seconds
    │                     └──▶ Mark unhealthy after 3 failures
    │
    └──▶ MongoDB Health Check
            │
            └──▶ mongosh --eval "db.adminCommand('ping')"
                   └──▶ Every 10 seconds
                          └──▶ Mark unhealthy after 5 failures
```

## 🎯 Deployment Flow Diagram

```
Start
  │
  ▼
Check Docker and Docker Compose
  │
  ▼
Prepare Project File Structure
  │
  ├── flask-server/
  ├── react-web-app/
  └── Docker configuration files
  │
  ▼
Configure Environment Variables (.env)
  │
  ▼
Verify Firebase Credentials
  │
  ▼
Choose MongoDB Mode
  │
  ├── Atlas (Cloud)
  │   └── Use docker-compose.yml
  │
  └── Local
      └── Use docker-compose.local-mongo.yml
  │
  ▼
Build Docker Images
  │
  ├── Backend Dockerfile
  │   └── Python 3.11 + Flask + Dependencies
  │
  └── Frontend Dockerfile
      └── Node.js 20 + React Build + Nginx
  │
  ▼
Start Containers
  │
  ├── MongoDB (if local)
  ├── Backend
  └── Frontend
  │
  ▼
Health Checks
  │
  ├── Backend: /health
  ├── Frontend: /
  └── MongoDB: ping
  │
  ▼
Deployment Successful ✅
  │
  └── Access http://localhost
```

## 📊 Monitoring Architecture (Optional Extension)

```
┌─────────────────────────────────────────────┐
│              Monitoring System               │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │Prometheus│◀─│cAdvisor  │◀─│Containers │ │
│  │          │  │          │  │           │ │
│  └────┬─────┘  └──────────┘  └───────────┘ │
│       │                                      │
│       ▼                                      │
│  ┌──────────┐                               │
│  │ Grafana  │                               │
│  │Dashboard │                               │
│  └──────────┘                               │
└─────────────────────────────────────────────┘
```

## 🗄️ Database Schema Overview

```
Database: test
├── user              (Users Collection)
│   ├── email         (Email address)
│   ├── uid           (User ID)
│   ├── username      (Username)
│   ├── first_name    (First name)
│   ├── last_name     (Last name)
│   ├── role          (Role: Mentee/Mentor)
│   └── created_at    (Creation timestamp)
│
├── mentor            (Mentors Collection)
│   ├── uid           (References User)
│   ├── biography     (Biography)
│   ├── field_of_expertise  (Field of expertise)
│   └── city          (City)
│
├── time_slots        (Time Slots Collection)
│   ├── uid_mentor    (References Mentor)
│   ├── start_time    (Start time)
│   ├── end_time      (End time)
│   ├── status        (Status)
│   └── location      (Location)
│
└── booking           (Bookings Collection)
    ├── time_slot     (References TimeSlot)
    ├── uid_mentee    (Mentee ID)
    ├── mentor_id     (Mentor ID)
    ├── message       (Message)
    └── status        (Status)
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication                        │
│                                                           │
│  User Input                                              │
│      │                                                    │
│      ▼                                                    │
│  React Frontend                                          │
│      │                                                    │
│      │ 1. POST credentials                               │
│      ▼                                                    │
│  Flask Backend                                           │
│      │                                                    │
│      │ 2. Verify with Firebase                          │
│      ▼                                                    │
│  Firebase Authentication                                 │
│      │                                                    │
│      │ 3. Return ID Token                                │
│      ▼                                                    │
│  Flask Backend                                           │
│      │                                                    │
│      │ 4. Create Session                                 │
│      │ 5. Generate JWT                                   │
│      ▼                                                    │
│  React Frontend                                          │
│      │                                                    │
│      └─ Store token in localStorage                      │
│                                                           │
│  Subsequent Requests:                                    │
│      │                                                    │
│      ├─ Include JWT in Authorization header              │
│      └─ Send session cookie                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🌐 Request/Response Lifecycle

```
1. User Action
      │
      ▼
2. React Component
      │
      ▼
3. API Call (api.js)
      │
      ├─ Add JWT token
      ├─ Add session cookie
      └─ Set headers
      │
      ▼
4. Nginx Reverse Proxy
      │
      ├─ Route /api/* to backend
      ├─ Add proxy headers
      └─ Handle CORS
      │
      ▼
5. Flask Backend
      │
      ├─ Verify JWT token
      ├─ Check session
      └─ Parse request
      │
      ▼
6. Business Logic (Controllers)
      │
      ├─ Validate input
      ├─ Process data
      └─ Call database
      │
      ▼
7. MongoDB
      │
      ├─ Execute query
      └─ Return results
      │
      ▼
8. Flask Backend
      │
      ├─ Format response
      └─ Return JSON
      │
      ▼
9. Nginx
      │
      └─ Forward response
      │
      ▼
10. React Frontend
      │
      ├─ Parse JSON
      ├─ Update state
      └─ Re-render UI
      │
      ▼
11. User sees result
```

---

**This architecture diagram shows the complete Docker deployment design.**

For detailed configuration, refer to [README.md](./README.md).
