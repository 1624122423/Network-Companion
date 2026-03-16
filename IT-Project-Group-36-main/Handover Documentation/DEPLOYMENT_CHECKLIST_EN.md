# ✅ Docker Deployment Checklist

## 📋 Pre-Deployment Checks

### System Requirements
- [ ] Docker installed (version 20.x or higher)
  ```bash
  docker --version
  ```
- [ ] Docker Compose installed (version 2.x or higher)
  ```bash
  docker-compose --version
  ```
- [ ] At least 8GB available RAM
- [ ] At least 5GB available disk space
- [ ] Internet connection available (for MongoDB Atlas and Firebase access)

### File Preparation
- [ ] All Docker configuration files copied to project root
- [ ] `flask-server/` directory exists with backend code
- [ ] `react-web-app/` directory exists with frontend code
- [ ] `flask-server/it-project-auth.json` file exists (⚠️ Required)
- [ ] Created `.env` file from `.env.example`
  ```bash
  cp .env.example .env
  ```

### Port Checks
- [ ] Port 80 is not in use
  ```bash
  lsof -i :80  # or netstat -tulpn | grep :80
  ```
- [ ] Port 5000 is not in use
  ```bash
  lsof -i :5000
  ```
- [ ] Port 27017 is not in use (if using local MongoDB)
  ```bash
  lsof -i :27017
  ```

### Configuration Verification
- [ ] `FLASK_SECRET_KEY` set in `.env` file (must change for production)
- [ ] MongoDB connection configured correctly
  - [ ] Using Atlas: Default configuration is fine
  - [ ] Using Local: Set `MONGODB_URI` in `.env`
- [ ] Firebase configuration file is valid and accessible

---

## 🚀 Deployment Steps

### Method 1: Using Automated Script (Recommended)
- [ ] Grant execute permission to script
  ```bash
  chmod +x deploy.sh
  ```
- [ ] Run deployment script
  ```bash
  ./deploy.sh
  ```
- [ ] Choose MongoDB mode
  - [ ] Option 1: MongoDB Atlas (Cloud)
  - [ ] Option 2: Local MongoDB
- [ ] Wait for build and startup to complete
- [ ] Verify all services are healthy

### Method 2: Manual Deployment
- [ ] Build images
  ```bash
  # Using Atlas
  docker-compose build
  
  # Or using local MongoDB
  docker-compose -f docker-compose.local-mongo.yml build
  ```
- [ ] Start services
  ```bash
  # Using Atlas
  docker-compose up -d
  
  # Or using local MongoDB
  docker-compose -f docker-compose.local-mongo.yml up -d
  ```
- [ ] View startup logs
  ```bash
  docker-compose logs -f
  ```

---

## ✅ Deployment Verification

### Service Status Check
- [ ] View all container status
  ```bash
  docker-compose ps
  ```
  Expected output: All containers show "Up" or "healthy" status

- [ ] Check container logs for errors
  ```bash
  docker-compose logs | grep -i error
  ```
  Expected output: No critical error messages

### Health Checks
- [ ] Backend health check passes
  ```bash
  curl http://localhost:5000/health
  ```
  Expected output: `{"status": "ok", "database": "test"}`

- [ ] Frontend is accessible
  ```bash
  curl -I http://localhost
  ```
  Expected output: HTTP status code 200

- [ ] API documentation is accessible
  - Browser visit: http://localhost:5000/api/docs/
  - [ ] Page loads successfully
  - [ ] Can see all API endpoints

### Functional Testing
- [ ] Frontend page displays correctly
  - Visit: http://localhost
  - [ ] Page loads without errors
  - [ ] Styles load correctly

- [ ] User registration functionality
  - [ ] Can open registration page
  - [ ] Can fill registration form
  - [ ] Registration succeeds or shows appropriate error

- [ ] User login functionality
  - [ ] Can open login page
  - [ ] Can fill login form
  - [ ] Login succeeds or shows appropriate error

- [ ] API endpoint testing
  ```bash
  # Test mentor list
  curl http://localhost:5000/api/mentors
  
  # Test health check
  curl http://localhost:5000/health
  ```

### Database Connection
- [ ] Backend successfully connects to MongoDB
  - View logs: `docker-compose logs backend | grep -i mongo`
  - Expected: See "Connected to MongoDB" or similar message

- [ ] Firebase authentication initializes successfully
  - View logs: `docker-compose logs backend | grep -i firebase`
  - Expected: See "Firebase initialized successfully"

### Local MongoDB Specific Checks (if using)
- [ ] MongoDB container running correctly
  ```bash
  docker exec -it it-project-mongodb mongosh -u admin -p admin123
  ```
- [ ] Mongo Express accessible
  - Visit: http://localhost:8081
  - Username: admin
  - Password: admin

---

## 🔍 Performance Checks

- [ ] Container resource usage is normal
  ```bash
  docker stats
  ```
  - CPU usage < 80%
  - Memory usage within reasonable range

- [ ] Response time is acceptable
  ```bash
  time curl http://localhost:5000/health
  ```
  - Response time < 2 seconds

---

## 🐛 Common Issues Troubleshooting

### If Containers Won't Start
- [ ] View detailed logs
  ```bash
  docker-compose logs backend
  docker-compose logs frontend
  ```
- [ ] Check for port conflicts
- [ ] Verify Firebase credentials file
- [ ] Confirm MongoDB connection configuration

### If Frontend Not Accessible
- [ ] Check nginx logs
  ```bash
  docker exec -it it-project-frontend cat /var/log/nginx/error.log
  ```
- [ ] Verify nginx configuration
  ```bash
  docker exec -it it-project-frontend nginx -t
  ```

### If Backend API Not Responding
- [ ] Check backend logs
  ```bash
  docker-compose logs backend
  ```
- [ ] Verify Flask application startup
- [ ] Test container internal connection
  ```bash
  docker exec -it it-project-backend curl http://localhost:5000/health
  ```

### If MongoDB Connection Fails
- [ ] **Using Atlas**: Check network connection and whitelist settings
- [ ] **Using Local**: Check MongoDB container status
  ```bash
  docker-compose logs mongodb
  ```

---

## 📝 Post-Deployment Tasks

### Security Configuration (Production Environment)
- [ ] Change `FLASK_SECRET_KEY` in `.env`
- [ ] Change default MongoDB password (if using local)
- [ ] Configure HTTPS (add SSL certificates)
- [ ] Restrict CORS allowed domains
- [ ] Set up firewall rules

### Monitoring Setup
- [ ] Set up log rotation
- [ ] Configure health check alerts
- [ ] Set up resource usage monitoring
- [ ] Configure backup strategy

### Documentation
- [ ] Record deployment configuration
- [ ] Document custom modifications
- [ ] Update team documentation

---

## 📊 Successful Deployment Criteria

All of the following conditions must be met:

✅ All containers show "Up" or "healthy" status
✅ Frontend accessible via browser
✅ Backend API health check passes
✅ API documentation page opens
✅ User can successfully register
✅ User can successfully login
✅ MongoDB connection successful
✅ Firebase authentication working normally
✅ No critical error logs
✅ All core features working

---

## 🎉 Success!

If all checks pass, congratulations on successful deployment!

### Next Steps
- Start using the application
- Monitor application performance
- Optimize as needed
- Regular updates and maintenance

### Useful Commands
```bash
# View status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose stop

# Update services
docker-compose up -d --build
```

---

## 📞 Getting Help

Encountered issues? Check:
- `QUICKSTART.md` - Quick start guide
- `README.md` - Complete documentation
- `ADDING_FILES_GUIDE.md` - File guide
- Log output: `docker-compose logs`

---

**Deployment Checklist v1.0**
*Use this checklist to ensure successful deployment* ✅
