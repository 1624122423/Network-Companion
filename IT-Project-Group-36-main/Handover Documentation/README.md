# IT Project - Docker Deployment Configuration

## 📋 Project Overview

This is a Docker containerization deployment solution for a **Mentor-Mentee Booking System**, including:

- 🎨 **Frontend**: React + Vite + Nginx
- ⚙️ **Backend**: Flask + Flask-RESTX API
- 🗄️ **Database**: MongoDB (Atlas cloud or Local Docker)
- 🔐 **Authentication**: Firebase Authentication

---

## 🚀 Quick Start (3 Steps)

### Step 1: Prepare Files

Copy all Docker configuration files to your project root directory:

```
your-project/
├── docker-compose.yml          ← Place here
├── backend.Dockerfile          ← Place here
├── frontend.Dockerfile         ← Place here
├── nginx.conf                  ← Place here
├── .env                        ← Create from .env.example
├── .dockerignore               ← Place here
├── deploy.sh                   ← Place here
├── flask-server/
│   ├── it-project-auth.json   ← ⚠️ Ensure this exists!
│   └── ...
└── react-web-app/
    └── ...
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Optional: Edit configuration
nano .env
```

### Step 3: Deploy

```bash
# Method 1: Using automated script (Recommended)
bash deploy.sh

# Method 2: Manual deployment
docker-compose up --build -d
```

---

## 🎯 Two Deployment Modes

### Mode 1: MongoDB Atlas (Cloud) - Default ✅
```bash
docker-compose up -d
```
- Uses existing cloud database
- No additional configuration needed
- Suitable for production

### Mode 2: Local MongoDB
```bash
docker-compose -f docker-compose.local-mongo.yml up -d
```
- Runs completely offline
- Includes Mongo Express management interface
- Suitable for development/testing

---

## 🌐 Access URLs

After successful deployment:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | React Web App |
| Backend API | http://localhost:5000/api | REST API Service |
| API Docs | http://localhost:5000/api/docs/ | Swagger UI |
| Health Check | http://localhost:5000/health | Service Status |
| Mongo Express* | http://localhost:8081 | MongoDB Admin UI |

\* Only available when using `docker-compose.local-mongo.yml`

---

## 📊 Service Management

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```bash
# Stop all
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes - careful!)
docker-compose down -v
```

---

## 🐛 Troubleshooting

### 1. Container Won't Start

```bash
# View detailed error logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

### 2. Cannot Connect to MongoDB

**Problem**: Unable to connect to MongoDB Atlas

**Solution**:
- Check network connection
- Verify MongoDB Atlas whitelist settings (allow 0.0.0.0/0 or your IP)
- Confirm connection string is correct
- Check username and password

```bash
# Test connection from backend container
docker exec -it it-project-backend bash
python -c "from mongoengine import connect; connect(host='your-mongodb-uri')"
```

### 3. Firebase Authentication Fails

**Problem**: Firebase auth not working

**Solution**:
- Confirm `it-project-auth.json` file exists
- Verify Firebase project configuration
- Check backend logs

```bash
docker-compose logs backend | grep -i firebase
```

### 4. Frontend Cannot Access Backend API

**Problem**: API requests return 404 or 502

**Solution**:
- Check nginx configuration
- Verify backend service is running
- View nginx logs

```bash
# View nginx error logs
docker exec -it it-project-frontend cat /var/log/nginx/error.log

# Test backend health
curl http://localhost:5000/health
```

### 5. Port Conflicts

**Problem**: Port 80 or 5000 already in use

**Solution**: Modify port mappings in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change to 8080
  backend:
    ports:
      - "5001:5000"  # Change to 5001
```

---

## 🔐 Security Recommendations

### Production Deployment Checklist

- [ ] Change `FLASK_SECRET_KEY` to a strong password
- [ ] Change default MongoDB password (if using local MongoDB)
- [ ] Configure HTTPS (add SSL certificates to nginx)
- [ ] Restrict CORS allowed domains
- [ ] Enable Docker log rotation
- [ ] Regularly update Docker images
- [ ] Use Docker secrets for sensitive information
- [ ] Set up firewall rules

---

## 📦 Database Deployment

### Option 1: MongoDB Atlas (Cloud)

**Current Setup**: Already configured in `flask-server/app_factory.py`

**Advantages**:
- ✅ Ready to use out of the box
- ✅ Automatic backups
- ✅ High availability
- ✅ Suitable for production

**Important**:
- Configure IP whitelist in MongoDB Atlas
- Consider using environment variables for connection string

### Option 2: Local MongoDB (Docker)

**Configuration**: Use `docker-compose.local-mongo.yml`

**Advantages**:
- ✅ Runs completely offline
- ✅ Includes Mongo Express (Web UI)
- ✅ Fast local access
- ✅ Suitable for development

**Access Mongo Express**: http://localhost:8081
- Username: admin
- Password: admin

---

## 📚 File Descriptions

### Core Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| `docker-compose.yml` | Main orchestration (MongoDB Atlas) | ✅ Required |
| `docker-compose.local-mongo.yml` | Local MongoDB configuration | ⭕ Optional |
| `backend.Dockerfile` | Flask backend image | ✅ Required |
| `frontend.Dockerfile` | React frontend image | ✅ Required |
| `nginx.conf` | Nginx reverse proxy | ✅ Required |
| `.env.example` | Environment variables template | ✅ Required |
| `.dockerignore` | Build optimization | ✅ Recommended |

### Scripts

| File | Purpose | Required |
|------|---------|----------|
| `deploy.sh` | Automated deployment script | ⭐ Strongly Recommended |
| `app_factory.py.new` | Improved backend config | ⭕ Optional |

---

## 🔧 Environment Variables

Edit `.env` file to customize:

```env
# Flask Configuration
FLASK_SECRET_KEY=your-secret-key-here
FLASK_ENV=production

# MongoDB Configuration (when using local MongoDB)
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/test?authSource=admin

# Frontend Configuration
VITE_API_BASE_URL=/api
```

---

## 📈 Common Commands Reference

| Action | Command |
|--------|---------|
| Start all services | `docker-compose up -d` |
| Stop all services | `docker-compose stop` |
| View logs | `docker-compose logs -f` |
| Restart services | `docker-compose restart` |
| View status | `docker-compose ps` |
| Enter container | `docker exec -it <container-name> bash` |
| Clean up all | `docker-compose down -v` |
| Rebuild | `docker-compose build --no-cache` |

---

## ✅ Successful Deployment Checklist

Deployment is successful when:

- ✅ All containers show "Up" or "healthy" status
- ✅ Frontend accessible via browser
- ✅ Backend API health check passes
- ✅ API documentation page opens
- ✅ User can successfully register
- ✅ User can successfully login
- ✅ MongoDB connection successful
- ✅ Firebase authentication working
- ✅ No critical error logs
- ✅ All core features working

---

## 📝 Version Information

- **Docker**: 20.x+
- **Docker Compose**: 2.x+
- **Python**: 3.11
- **Node.js**: 20
- **MongoDB**: 7.0 (if using local)
- **Nginx**: Alpine latest

---

## 🆘 Need Help?

### View Health Status
```bash
# Backend health check
curl http://localhost:5000/health

# Frontend accessibility
curl http://localhost/

# Container health status
docker-compose ps
```

### View Detailed Information
```bash
docker inspect it-project-backend
docker inspect it-project-frontend
```

### Check Network
```bash
docker network ls
docker network inspect it-project_app-network
```

---

**Deployment successful! Enjoy your application!** 🚀
