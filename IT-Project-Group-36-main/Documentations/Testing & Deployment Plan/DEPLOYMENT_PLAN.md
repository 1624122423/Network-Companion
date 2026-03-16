# IT-Project-Group-36: Comprehensive Deployment Plan

**Project**: Networking Companion Platform (Mentor-Mentee Booking System)  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Architecture**: React Frontend + Flask Backend + MongoDB Database  
**Deployment Strategy**: Local Docker + Render (separate services) + MongoDB Atlas

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Pre-Deployment Requirements](#pre-deployment-requirements)
3. [Architecture Overview](#architecture-overview)
4. [Local Development Deployment](#local-development-deployment)
5. [Staging Deployment](#staging-deployment)
6. [Production Deployment (Render)](#production-deployment-render)
7. [MongoDB Atlas Setup](#mongodb-atlas-setup)
8. [GitHub Actions CI/CD](#github-actions-cicd)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Backup and Recovery](#backup-and-recovery)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Rollback Procedures](#rollback-procedures)

---

## Deployment Overview

### Deployment Environments

#### 1. Local Development Environment
- **Frontend**: React development server (port 3000)
- **Backend**: Flask development server (port 5000)
- **Database**: Local MongoDB or Docker container (port 27017)
- **Purpose**: Local development and initial testing
- **Developer Access**: Full local access

#### 2. Staging Environment
- **Frontend**: Render Web Service with Docker
- **Backend**: Render Web Service with Docker
- **Database**: MongoDB Atlas (staging cluster)
- **Purpose**: Pre-production testing and validation
- **Access**: Team members with Render account

#### 3. Production Environment
- **Frontend**: Render Web Service (React + Nginx)
- **Backend**: Render Web Service (Flask + Gunicorn)
- **Database**: MongoDB Atlas (production cluster)
- **Purpose**: Live user application
- **Access**: Limited to authorized personnel

### Deployment Timeline

```
Week 1-5: Local Development Setup
Week 5-7: Staging Deployment
Week 7-9: Performance & Security Testing
Week 10-13: Production Deployment
Week 13+: Monitoring & Maintenance
```

---

## Pre-Deployment Requirements

### System Requirements

#### Developer Machine
```
Operating System: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
Processor: 2+ GHz dual-core
RAM: 8 GB minimum (16 GB recommended)
Storage: 20 GB free space
Network: Stable internet connection (minimum 5 Mbps)
```

#### Required Software
```
Node.js: v18.x or v20.x (LTS)
Python: 3.9 or later
Docker: 25.0 or later
Docker Compose: 2.20 or later
Git: 2.30 or later
MongoDB Community: 7.0 (optional, use Docker instead)
Visual Studio Code (recommended IDE)
```

### Accounts and Credentials Required

#### GitHub
- [ ] Repository created: https://github.com/GitUser-321/IT-Project-Group-36/tree/main
- [ ] SSH keys configured for git push/pull
- [ ] Collaborators added with appropriate permissions
- [ ] Branch protection rules configured

#### Render
- [ ] Account created at render.com
- [ ] Credit card added for usage
- [ ] Team created (if using team features)
- [ ] Blueprint (optional) prepared

#### MongoDB Atlas
- [ ] Account created at mongodb.com
- [ ] Organization created
- [ ] Project created for production
- [ ] Project created for staging
- [ ] IP whitelist configured (0.0.0.0/0 for development, specific IPs for production)

#### Firebase (for authentication)
- [ ] Project created in Firebase Console
- [ ] Web app created
- [ ] Authentication enabled (Email/Password)
- [ ] Firebase config JSON obtained
- [ ] API keys configured

### Environment Variables

#### Backend Environment Variables
```bash
# .env.backend (development)
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-dev
MONGODB_URI=mongodb://localhost:27017/networking_platform
MONGODB_DB_NAME=networking_platform
FIREBASE_CONFIG={"type":"service_account",...}
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=your-jwt-secret-dev
LOG_LEVEL=DEBUG
```

```bash
# .env.backend (production on Render)
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-secret-key-prod
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/networking_platform?retryWrites=true&w=majority
MONGODB_DB_NAME=networking_platform_prod
FIREBASE_CONFIG={"type":"service_account",...}
CORS_ORIGINS=https://your-frontend-render-url
JWT_SECRET=your-jwt-secret-prod
LOG_LEVEL=INFO
```

#### Frontend Environment Variables
```bash
# .env.local (development)
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...
```

```bash
# .env.production (Render)
VITE_API_URL=https://your-backend-render-url/api
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...
```

### Pre-Deployment Checklist

```
REPOSITORY & CODE
□ All code committed to GitHub
□ No merge conflicts
□ All branches up to date
□ .gitignore properly configured
□ No sensitive data in code (API keys, passwords)
□ README.md updated with setup instructions
□ API documentation complete
□ Database schema documented

TESTING
□ All unit tests passing
□ All integration tests passing
□ 80%+ code coverage
□ Security tests passing
□ No console errors or warnings
□ No broken links in frontend
□ API endpoints tested with Postman/Insomnia

CONFIGURATION
□ Firebase project created and configured
□ MongoDB Atlas cluster created
□ Render account set up
□ Environment variables templates created
□ Docker configurations tested locally
□ Docker images build successfully
□ docker-compose works locally

DOCUMENTATION
□ Deployment guide written
□ Setup instructions complete
□ API documentation comprehensive
□ Database schema documented
□ Troubleshooting guide created
□ Architecture diagram provided

SECURITY
□ No hardcoded credentials
□ HTTPS/TLS enabled
□ CORS properly configured
□ Input validation implemented
□ Rate limiting configured
□ Security headers configured
□ Dependencies checked for vulnerabilities

PERFORMANCE
□ Frontend bundle size optimized
□ Database indexes created
□ Caching strategy implemented
□ Load tested (basic)
□ Memory leaks checked
```

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTPS / TLS
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌─────────────────────┐           ┌────────────────────┐
│  Frontend Service   │           │ Backend Service    │
│  (Render)           │           │ (Render)           │
│                     │           │                    │
│ - React Build       │           │ - Flask App        │
│ - Nginx Server      │           │ - Gunicorn WSGI    │
│ - Port: 443 (HTTPS) │           │ - Port: 443 (HTTPS)│
│ - Static Assets     │           │ - REST API         │
│                     │           │ - JWT Auth         │
└─────────────────────┘           └────────┬───────────┘
                                           │
                                REST API (HTTPS)
                                           │
                                    ┌──────▼──────┐
                                    │             │
                                    ▼             ▼
                            ┌─────────────────────────┐
                            │  MongoDB Atlas          │
                            │                         │
                            │ - Production Cluster    │
                            │ - Auto Backups          │
                            │ - Replication           │
                            │ - Port: 27017           │
                            │ - TLS Connection        │
                            └─────────────────────────┘
```

### Network Flow

```
1. User Request
   User Browser (HTTPS) → Render Frontend Service (port 443)
   
2. Frontend Processing
   React App processes request locally
   Determines if API call needed
   
3. API Request
   React App (HTTPS) → Render Backend Service (port 443)
   Includes JWT token in Authorization header
   
4. Backend Processing
   Flask receives request
   Validates JWT token
   Processes business logic
   
5. Database Query
   Flask (TLS) → MongoDB Atlas cluster
   Executes database operation
   Returns result to Flask
   
6. Response
   Flask → React (JSON response)
   React → Browser (HTML/JavaScript)
   Browser displays to user
```

### Service Dependencies

```
Frontend Service
├── Depends on: Backend Service (via API)
├── Depends on: Firebase (for authentication)
└── No direct database connection

Backend Service
├── Depends on: MongoDB Atlas (for data)
├── Depends on: Firebase (for auth token validation)
└── Independent of Frontend

MongoDB Atlas
├── Depends on: Internet connectivity
└── No dependencies on other services
```

---

## Local Development Deployment

### Initial Setup

#### Step 1: Clone Repository
```bash
# Clone the repository
git clone https://github.com/GitUser-321/IT-Project-Group-36/tree/main
cd IT-Project-Group-36

# Verify structure
ls -la
# Should show: react-web-app/, flask-server/, docker-compose.yml, Dockerfile, nginx.conf
```

#### Step 2: Create Environment Files
```bash
# Backend environment file
cat > flask-server/.env << 'EOF'
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/networking_platform
MONGODB_DB_NAME=networking_platform
FIREBASE_CONFIG={}
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=dev-jwt-secret-change-in-production
LOG_LEVEL=DEBUG
EOF

# Frontend environment file
cat > react-web-app/.env.local << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789
EOF
```

#### Step 3: Start Services with Docker Compose
```bash
# Build images
docker-compose build

# Start all services in background
docker-compose up -d

# Verify all services are running
docker ps

# Expected output:
# - networking_platform-frontend-1
# - networking_platform-backend-1
# - networking_platform-mongodb-1
```

#### Step 4: Verify Services

```bash
# Check frontend
curl http://localhost:3000
# Should return HTML content

# Check backend health
curl http://localhost:5000/api/health
# Should return: {"status": "ok"}

# Check MongoDB connection
docker exec networking_platform-mongodb-1 mongosh --eval "db.adminCommand('ping')"
# Should return: { ok: 1 }
```

### Local Development Workflow

#### Daily Development

```bash
# 1. Start services (if not already running)
docker-compose up -d

# 2. Check logs (if needed)
docker-compose logs -f backend
docker-compose logs -f frontend

# 3. Make code changes
# Edit files in react-web-app/ or flask-server/

# 4. Restart affected service
docker-compose restart backend   # If backend code changed
docker-compose restart frontend  # If frontend code changed

# 5. Verify changes
curl http://localhost:5000/api/health
curl http://localhost:3000

# 6. Commit and push changes
git add .
git commit -m "Feature: [description]"
git push origin feature-branch
```

#### Running Tests Locally

```bash
# Backend tests
docker-compose exec backend pytest
docker-compose exec backend pytest --cov=. --cov-report=html

# Frontend tests
docker-compose exec frontend npm test

# Run specific test file
docker-compose exec backend pytest tests/test_auth.py
docker-compose exec frontend npm test -- LoginForm.test.jsx
```

#### Database Management

```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password

# Database operations
db.users.find()
db.bookings.find().pretty()
db.users.countDocuments()

# Backup local database
docker exec networking_platform-mongodb-1 mongodump --out /tmp/dump

# Restore from backup
docker exec networking_platform-mongodb-1 mongorestore /tmp/dump
```

### Cleanup

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (data will be deleted)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up completely
docker system prune -a --volumes
```

---

## Staging Deployment

### Staging Environment Setup

#### Step 1: Create MongoDB Atlas Staging Cluster

```bash
# Navigate to MongoDB Atlas Dashboard
1. Go to https://cloud.mongodb.com
2. Create new cluster named "staging-cluster"
3. Configuration:
   - Tier: M0 (free) or M2 (paid)
   - Region: Same as Render region (recommended)
   - Backup: Daily automatic backups
4. Security:
   - Create database user: staging_user / password
   - Whitelist IP: 0.0.0.0/0 (for staging)
   - Enable TLS
5. Obtain connection string:
   mongodb+srv://staging_user:password@staging-cluster.mongodb.net/networking_platform
```

#### Step 2: Create Render Backend Service

```
1. Visit https://render.com
2. Click "New+" → "Web Service"
3. Select your GitHub repository
4. Configuration:
   - Name: networking-platform-backend
   - Root Directory: flask-server/
   - Runtime: Docker
   - Build Command: (leave empty, uses Dockerfile)
   - Start Command: gunicorn -b 0.0.0.0:$PORT -w 4 -t 120 app_factory:app
   - Plan: Starter (free) or Standard
5. Environment Variables:
   - FLASK_ENV: staging
   - FLASK_DEBUG: False
   - SECRET_KEY: <your-secret-key>
   - MONGODB_URI: <staging-mongodb-connection-string>
   - MONGODB_DB_NAME: networking_platform_staging
   - FIREBASE_CONFIG: <your-firebase-config>
   - CORS_ORIGINS: https://networking-platform-frontend.onrender.com
   - JWT_SECRET: <your-jwt-secret>
   - LOG_LEVEL: INFO
6. Deploy
```

#### Step 3: Create Render Frontend Service

```
1. Visit https://render.com
2. Click "New+" → "Web Service"
3. Select your GitHub repository
4. Configuration:
   - Name: networking-platform-frontend
   - Root Directory: ./
   - Runtime: Docker
   - Build Command: (leave empty, uses Dockerfile)
   - Start Command: nginx -g 'daemon off;'
   - Plan: Starter (free) or Standard
5. Environment Variables:
   - VITE_API_URL: https://networking-platform-backend.onrender.com/api
   - VITE_FIREBASE_API_KEY: <your-firebase-key>
   - VITE_FIREBASE_AUTH_DOMAIN: <your-firebase-auth-domain>
   - VITE_FIREBASE_PROJECT_ID: <your-project-id>
   - VITE_FIREBASE_STORAGE_BUCKET: <your-storage-bucket>
   - VITE_FIREBASE_MESSAGING_SENDER_ID: <your-sender-id>
   - VITE_FIREBASE_APP_ID: <your-app-id>
6. Deploy
```

### Staging Verification

```bash
# 1. Backend health check
curl https://networking-platform-backend.onrender.com/api/health

# 2. Frontend access
curl https://networking-platform-frontend.onrender.com/

# 3. API testing
curl -X GET https://networking-platform-backend.onrender.com/api/users

# 4. Create test account
curl -X POST https://networking-platform-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User",
    "role": "mentee"
  }'

# 5. Login test
curl -X POST https://networking-platform-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# 6. Check MongoDB connection
# Via Render backend logs:
# Visit Render dashboard → Backend service → Logs tab
# Look for: "Successfully connected to MongoDB"
```

---

## Production Deployment (Render)

### Production Environment Setup

#### Step 1: Create MongoDB Atlas Production Cluster

```bash
# MongoDB Atlas Setup
1. Create production cluster "production-cluster"
2. Configuration:
   - Tier: M2 or higher for production
   - Regions: Multi-region replication for high availability
   - Backup: Continuous backups
3. Security (production requirements):
   - Create database user: prod_user / secure_password
   - Whitelist Render IP addresses (check Render documentation)
   - Enable TLS certificate validation
   - Enable IP access list
4. Connection string:
   mongodb+srv://prod_user:secure_password@production-cluster.mongodb.net/networking_platform
```

#### Step 2: Create Production Backend Service

```
1. Render Dashboard:
   1. Duplicate staging backend service
   2. Rename to: networking-platform-backend-prod
   3. Update Configuration:
      - Name: networking-platform-backend-prod
      - Branch: main (main branch only)
      - Auto-deploy: ON
      - Plan: Standard or higher
   4. Update Environment Variables:
      - FLASK_ENV: production
      - FLASK_DEBUG: False
      - SECRET_KEY: <strong-production-secret>
      - MONGODB_URI: <production-mongodb-connection-string>
      - MONGODB_DB_NAME: networking_platform_prod
      - CORS_ORIGINS: https://networking-platform.onrender.com
      - LOG_LEVEL: WARNING
      - Add any other production-specific config
   5. Set up health check:
      - Path: /api/health
      - Interval: 30 seconds
      - Timeout: 10 seconds
```

#### Step 3: Create Production Frontend Service

```
1. Render Dashboard:
   1. Duplicate staging frontend service
   2. Rename to: networking-platform-prod
   3. Update Configuration:
      - Name: networking-platform-prod
      - Branch: main (main branch only)
      - Auto-deploy: ON
      - Plan: Standard or higher
   4. Update Environment Variables:
      - VITE_API_URL: https://networking-platform-backend-prod.onrender.com/api
      - NODE_ENV: production
      - All Firebase config keys with production values
   5. Custom domain (optional):
      - Go to Settings → Custom Domains
      - Add your domain
      - Update DNS records
```

### Production Deployment Steps

#### Pre-Production Checklist

```
CODE
□ All code tested and reviewed
□ No debug logging enabled
□ No test accounts in production
□ Error handling complete
□ All dependencies specified

SECURITY
□ All secrets in environment variables
□ No API keys in code
□ HTTPS/TLS enabled
□ CORS properly configured
□ Rate limiting enabled
□ Input validation enabled
□ Security headers configured

PERFORMANCE
□ Database indexes created
□ Caching strategy implemented
□ Frontend assets minified
□ Backend response times < 200ms
□ Database queries optimized

MONITORING
□ Logging configured
□ Error tracking setup (Sentry/similar)
□ Performance monitoring enabled
□ Uptime monitoring configured
□ Alerts configured

BACKUP
□ MongoDB backups enabled
□ Backup recovery tested
□ Backup retention policy set

DOCUMENTATION
□ Deployment documented
□ Troubleshooting guide ready
□ Rollback plan documented
□ On-call runbook prepared
```

#### Deployment Process

```bash
# 1. Final testing in staging
curl https://networking-platform-backend.onrender.com/api/health
curl https://networking-platform-frontend.onrender.com/

# 2. Create production deployment branch
git checkout -b release/v1.0.0
git tag v1.0.0
git push origin release/v1.0.0 --tags

# 3. Merge to main (triggers auto-deploy)
git checkout main
git merge release/v1.0.0
git push origin main

# 4. Monitor Render deployment
# Visit Render dashboard
# Watch deployment progress in Logs tab

# 5. Verify production deployment
# Wait 5-10 minutes for deployment to complete
# Test endpoints:
curl https://networking-platform-backend-prod.onrender.com/api/health
curl https://networking-platform-prod.onrender.com/

# 6. Monitor application
# Check error logs
# Monitor database performance
# Monitor API response times
# Monitor frontend errors (using browser console)

# 7. Perform smoke tests
# Login as test user
# Create a booking
# View profile
# Check all main workflows
```

### Production Monitoring

```bash
# 1. Backend logs
curl -H "Authorization: Bearer <render-api-key>" \
  https://api.render.com/v1/services/networking-platform-backend-prod/logs

# 2. Frontend logs
# Check browser console for any errors

# 3. MongoDB monitoring
# Visit MongoDB Atlas dashboard
# Check:
# - Connection count
# - Query performance
# - Storage usage
# - Backup status

# 4. Application health
# Setup monitoring endpoint
GET /api/health → should return {"status": "ok"}
GET /api/status → should return service status details
```

---

## MongoDB Atlas Setup

### Atlas Account Creation

```bash
# 1. Register at https://www.mongodb.com/cloud/atlas
# 2. Create organization
# 3. Create project
# 4. Create cluster(s)
```

### Cluster Configuration

#### Development Cluster (optional)
```
Name: development-cluster
Tier: M0 (free)
Region: closest to your location
Backup: disabled
Auth: basic username/password
```

#### Staging Cluster
```
Name: staging-cluster
Tier: M2 (paid)
Region: us-east-1 (or same as Render)
Backup: daily snapshots
Auth: strong password
Replication: 3-node replica set
```

#### Production Cluster
```
Name: production-cluster
Tier: M5 or M10 (production)
Region: Multi-region replication
Backup: continuous snapshots + 30-day retention
Auth: strong password + IP whitelist
Replication: 3-node replica set
Encryption: enabled (in transit and at rest)
```

### Network Access Configuration

#### Development
```
IP Whitelist: 0.0.0.0/0 (allow all)
Reason: Needed for local development with changing IPs
```

#### Staging
```
IP Whitelist: 
  - Render IP range (check Render docs for your region)
  - Your office IP (if needed for testing)
Reason: Specific access for staging environment
```

#### Production
```
IP Whitelist:
  - Render static IP for backend service
  - Your office IP (for emergency access)
  - VPN IP (if applicable)
Reason: Restricted access to production
```

### Database Users

```
Development:
  Username: dev_user
  Password: dev_password (or auto-generated)
  Roles: readWrite on networking_platform

Staging:
  Username: staging_user
  Password: secure_random_password
  Roles: readWrite on networking_platform_staging

Production:
  Username: prod_user
  Password: very_secure_random_password
  Roles: readWrite on networking_platform_prod
  MFA: enabled if available
```

### Connection Strings

```bash
# Development
mongodb://dev_user:dev_password@localhost:27017/networking_platform

# Staging
mongodb+srv://staging_user:password@staging-cluster.mongodb.net/networking_platform_staging?retryWrites=true&w=majority

# Production
mongodb+srv://prod_user:password@production-cluster.mongodb.net/networking_platform_prod?retryWrites=true&w=majority
```

### Database Initialization

```bash
# 1. Create database indices (for performance)
# Run via MongoDB Compass or via script:

db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.bookings.createIndex({ mentorId: 1, startTime: 1 })
db.bookings.createIndex({ menteeId: 1, startTime: 1 })
db.bookings.createIndex({ status: 1 })

# 2. Create seed data (optional)
db.roles.insertMany([
  { name: "mentor", permissions: ["view_profile", "accept_bookings", ...] },
  { name: "mentee", permissions: ["view_mentors", "create_bookings", ...] }
])
```

---

## GitHub Actions CI/CD

### Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          cache: 'pip'
      
      - name: Install Frontend Dependencies
        run: |
          cd react-web-app
          npm install
      
      - name: Install Backend Dependencies
        run: |
          cd flask-server
          pip install -r requirements.txt
      
      - name: Run Frontend Tests
        run: |
          cd react-web-app
          npm test -- --coverage
      
      - name: Run Backend Tests
        run: |
          cd flask-server
          pytest --cov=. --cov-report=xml
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/networking_platform_test
      
      - name: Upload Coverage Reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
      
      - name: Build Frontend
        run: |
          cd react-web-app
          npm run build
      
      - name: Deploy to Render
        if: github.ref == 'refs/heads/main'
        run: |
          curl -X POST https://api.render.com/deploy \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -d '{
              "service_id": "${{ secrets.RENDER_BACKEND_SERVICE_ID }}",
              "clear_cache": true
            }'
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
```

### GitHub Secrets Configuration

```
Set these in GitHub repository Settings → Secrets:

RENDER_API_KEY: <your-render-api-key>
RENDER_BACKEND_SERVICE_ID: <backend-service-id>
RENDER_FRONTEND_SERVICE_ID: <frontend-service-id>
MONGODB_URI_PROD: <production-mongodb-connection-string>
MONGODB_URI_STAGING: <staging-mongodb-connection-string>
FIREBASE_CONFIG: <firebase-configuration-json>
```

---

## Monitoring and Logging

### Application Monitoring

#### Render Dashboard Monitoring
```
1. Visit https://render.com/dashboard
2. Select each service
3. Monitor:
   - CPU usage
   - Memory usage
   - Disk usage
   - Network I/O
   - Response times
   - Error rates
```

#### Backend Logging

```python
# Configure Flask logging (flask-server/config.py)
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("Backend service started")
logger.error("Database connection failed")
```

#### Frontend Logging

```javascript
// Configure React logging (react-web-app/src/utils/logger.js)
export const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data)
}

logger.info("User logged in", { userId: "123" })
logger.error("API request failed", error)
```

### MongoDB Performance Monitoring

```bash
# Via MongoDB Atlas Dashboard:
1. Go to Monitoring section
2. Check:
   - Connections: Should be < 100 for small app
   - Query performance: Look for slow queries
   - Replication lag: Should be < 1 second
   - Disk usage: Monitor growth rate
   - Backup status: Verify recent backups exist
```

### Error Tracking

```bash
# Option 1: Sentry (recommended)
# 1. Register at sentry.io
# 2. Create project for Flask
# 3. Create project for React
# 4. Install SDK in both projects
# 5. Configure error reporting

# Flask (flask-server/requirements.txt)
sentry-sdk==1.39.1

# React (react-web-app/package.json)
@sentry/react: ^7.80.0

# 5. Monitor errors in Sentry dashboard
```

---

## Backup and Recovery

### Automated Backups

#### MongoDB Atlas Automated Backups
```
1. Visit MongoDB Atlas → Backups
2. Configure:
   - Backup frequency: Continuous (production)
   - Retention: 30+ days
   - Restore points: Hourly incremental backups
3. Test restore:
   - Create test restore to verify integrity
   - Perform weekly
```

#### Backup Verification Script

```bash
#!/bin/bash
# backup-check.sh

BACKUP_COUNT=$(curl -s https://api.mongodb.com/api/atlas/v1.0/groups/{groupId}/clusters/{clusterId}/backup/snapshots \
  -H "Authorization: Bearer $MONGODB_API_KEY" | jq '.results | length')

if [ $BACKUP_COUNT -gt 0 ]; then
  echo "✓ Backups exist: $BACKUP_COUNT snapshots found"
else
  echo "✗ ERROR: No backups found!"
  exit 1
fi

# Check backup age
LATEST_BACKUP=$(curl -s https://api.mongodb.com/api/atlas/v1.0/groups/{groupId}/clusters/{clusterId}/backup/snapshots \
  -H "Authorization: Bearer $MONGODB_API_KEY" | jq -r '.results[0].created')

echo "Latest backup: $LATEST_BACKUP"
```

### Manual Backup Procedure

```bash
# 1. Export MongoDB data
docker exec networking_platform-mongodb-1 mongodump \
  --uri="mongodb+srv://user:password@cluster.mongodb.net/networking_platform" \
  --out=/tmp/backup_$(date +%Y%m%d_%H%M%S)

# 2. Compress backup
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz /tmp/backup_*

# 3. Store in secure location (S3, Google Cloud Storage, etc.)
aws s3 cp backup_*.tar.gz s3://your-backup-bucket/mongodb/
```

### Recovery Procedure

#### Database Recovery
```bash
# 1. Obtain backup file
aws s3 cp s3://your-backup-bucket/mongodb/backup_20251115_143022.tar.gz .

# 2. Extract backup
tar -xzf backup_20251115_143022.tar.gz

# 3. Restore to MongoDB
mongorestore \
  --uri="mongodb+srv://user:password@cluster.mongodb.net" \
  ./dump

# 4. Verify restoration
mongosh --eval "db.users.count()"
```

#### Application Recovery
```bash
# 1. Rollback to previous version (see Rollback Procedures)
git revert <commit-hash>
git push origin main

# 2. Render auto-deploys
# Monitor deployment in Render dashboard

# 3. Verify application
curl https://your-app.onrender.com/api/health
```

---

## Troubleshooting Guide

### Common Deployment Issues

#### Issue: Backend service fails to start

**Symptoms**: Service shows error in Render logs

**Diagnostics**:
```bash
# Check Render logs
1. Go to Render dashboard
2. Select backend service
3. Click "Logs" tab
4. Look for error messages

# Common errors:
- "gunicorn: command not found" → Check Dockerfile gunicorn installation
- "ModuleNotFoundError" → Missing dependency in requirements.txt
- "ConnectionRefusedError" → MongoDB connection string incorrect
```

**Solutions**:
```bash
# 1. Verify requirements.txt
# Ensure all packages are listed and versions are compatible
pip install -r requirements.txt

# 2. Check Dockerfile
# Ensure RUN pip install -r requirements.txt is present

# 3. Test locally
docker-compose up -d backend
docker-compose logs backend

# 4. Rebuild on Render
# Go to Render dashboard
# Click "Manual Deploy" button
```

#### Issue: Frontend not loading

**Symptoms**: Blank page or 404 error

**Diagnostics**:
```bash
# Check frontend service
curl https://your-frontend.onrender.com/ -v

# Check Render logs
1. Go to Render dashboard
2. Select frontend service
3. Check Logs tab

# Common issues:
- nginx configuration error → Check nginx.conf
- React build failed → Check build logs
- Wrong port configured → Should use $PORT environment variable
```

**Solutions**:
```bash
# 1. Verify nginx.conf
# Check that it's properly configured for React SPA

# 2. Rebuild locally
docker-compose build frontend

# 3. Check Docker build output
# Look for ERR or WARN messages

# 4. Manual deploy on Render
```

#### Issue: Cannot connect to MongoDB

**Symptoms**: "authentication failed" or "connection refused"

**Diagnostics**:
```bash
# Test connection string
mongosh "your-connection-string"

# If fails, check:
- Connection string format: mongodb+srv://user:pass@cluster...
- Username and password: Correct credentials?
- IP whitelist: Your IP is whitelisted?
- Network connectivity: Can you reach MongoDB Atlas?
```

**Solutions**:
```bash
# 1. Verify connection string
echo $MONGODB_URI
# Should be in format: mongodb+srv://user:pass@cluster.mongodb.net/database

# 2. Add IP to whitelist
# MongoDB Atlas → Security → IP Whitelist
# Add: 0.0.0.0/0 (for development) or specific IP (for production)

# 3. Test locally
docker-compose exec backend python -c "from pymongo import MongoClient; client = MongoClient('$MONGODB_URI'); print(client.admin.command('ping'))"

# 4. Restart backend service on Render
# Go to Render dashboard
# Click service → Manual Deploy
```

#### Issue: CORS errors in frontend

**Symptoms**: Browser console shows "Access to XMLHttpRequest blocked by CORS policy"

**Solutions**:
```bash
# 1. Check CORS configuration in Flask (flask-server/app_factory.py)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://your-frontend-render-url"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 2. Update environment variable
CORS_ORIGINS=https://your-frontend-render-url

# 3. Restart backend
# Render → Manual Deploy

# 4. Test CORS
curl -H "Origin: https://your-frontend-render-url" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS https://your-backend.onrender.com/api/users -v
```

#### Issue: Slow API response times

**Symptoms**: Frontend feels sluggish, API calls take > 1 second

**Diagnostics**:
```bash
# Check database performance
# MongoDB Atlas → Performance Advisor

# Check API response times
curl -w "Response time: %{time_total}s\n" https://your-api.onrender.com/api/users

# Check backend resource usage
# Render dashboard → Metrics tab
```

**Solutions**:
```bash
# 1. Add database indices
db.users.createIndex({ email: 1 })
db.bookings.createIndex({ mentorId: 1, startTime: 1 })

# 2. Optimize queries
# Avoid N+1 queries
# Use projection to fetch only needed fields

# 3. Upgrade service plan
# Render dashboard → Plan details
# Consider upgrading from Starter to Standard

# 4. Enable caching
# Implement Redis caching for frequently accessed data

# 5. Monitor and profile
# Use Flask profiler to identify bottlenecks
```

### Health Check Commands

```bash
# Quick health check script
#!/bin/bash

echo "Checking Backend..."
curl -s https://your-backend.onrender.com/api/health | jq .

echo "Checking Frontend..."
curl -s -o /dev/null -w "%{http_code}" https://your-frontend.onrender.com/

echo "Checking Database..."
# Via Render backend logs or direct connection

echo "All checks complete!"
```

---

## Rollback Procedures

### Planned Rollback

```bash
# 1. Identify version to rollback to
git log --oneline | head -10

# 2. Create rollback branch
git checkout -b rollback/v1.0.0 <commit-hash>

# 3. Push to GitHub
git push origin rollback/v1.0.0

# 4. Merge to main (triggers deploy)
git checkout main
git merge rollback/v1.0.0
git push origin main

# 5. Monitor deployment
# Render dashboard → watch deployment progress

# 6. Verify application
curl https://your-app.onrender.com/api/health
```

### Emergency Rollback

```bash
# 1. Immediate action
# Go to Render dashboard
# Select service
# Click "Roll back to previous deploy"

# 2. Verify stability
curl https://your-app.onrender.com/api/health

# 3. Investigate issue
# Review logs
# Check what went wrong

# 4. Fix and redeploy
git revert <bad-commit>
git push origin main
```

### Database Rollback

```bash
# 1. Restore from backup
# MongoDB Atlas → Backups
# Select backup from time before incident
# Click "Restore" → Choose restore method

# 2. Verify data integrity
mongosh --eval "db.users.count()"
mongosh --eval "db.bookings.find().limit(1)"

# 3. Update application if needed
# If database schema changed, ensure app is compatible
```

---

## Post-Deployment Checklist

```
IMMEDIATE (First Hour)
□ All services running and healthy
□ No error logs
□ API responding normally
□ Frontend loading correctly
□ Database connected and accessible

SHORT TERM (First Day)
□ Monitor error rates
□ Check performance metrics
□ Verify backup completion
□ Test main user workflows
□ Check external integrations (Firebase, etc.)

FOLLOW UP (First Week)
□ Review logs for issues
□ Check database growth rate
□ Verify backup restoration works
□ Monitor resource usage trends
□ Gather user feedback

ONGOING
□ Weekly backup verification
□ Monthly performance review
□ Quarterly security audit
□ Regular dependency updates
```

---

## Deployment Success Criteria

✅ **Deployment is considered successful when:**

- All services pass health checks
- API endpoints respond within < 500ms
- Database connectivity verified
- Zero critical errors in logs
- All unit and integration tests passing
- User workflows functioning correctly
- Monitoring and logging operational
- Backup system verified
- Documentation updated

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Developer | | | |
| DevOps Engineer | | | |
| Project Manager | | | |
| Technical Lead | | | |

---

**Document Control**

- Version: 1.0
- Last Updated: November 2025
- Next Review: February 2026
- Owner: IT-Project-Group-36 Team

---

**End of Deployment Plan**
