# Quick Reference Guide: Testing & Deployment Commands

**Project**: IT-Project-Group-36 - Networking Companion Platform  
**Updated**: November 2025

---

## 🚀 Quick Start (5 Minutes)

### 1. Local Setup
```bash
# Clone and navigate
git clone https://github.com/GitUser-321/IT-Project-Group-36/tree/main
cd IT-Project-Group-36

# Create environment files
cp flask-server/.env.example flask-server/.env
cp react-web-app/.env.example react-web-app/.env

# Start local development
docker-compose up -d

# Verify services
curl http://localhost:3000        # Frontend
curl http://localhost:5000/api/health  # Backend
```

### 2. Run Tests
```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests
docker-compose exec frontend npm test

# View coverage
docker-compose exec backend pytest --cov
```

### 3. Deploy to Staging
```bash
# Push to GitHub
git add .
git commit -m "Prepare for staging deployment"
git push origin main

# Monitor on Render dashboard
# Should auto-deploy or manual deploy if needed
```

---

## 🧪 Testing Commands

### Unit Testing

#### React Frontend
```bash
# Run all tests
docker-compose exec frontend npm test

# Run with coverage
docker-compose exec frontend npm test -- --coverage

# Run specific file
docker-compose exec frontend npm test LoginForm.test.jsx

# Watch mode (continuous)
docker-compose exec frontend npm test -- --watch

# Update snapshots
docker-compose exec frontend npm test -- -u
```

#### Flask Backend
```bash
# Run all tests
docker-compose exec backend pytest

# Run with coverage
docker-compose exec backend pytest --cov=. --cov-report=html

# Run specific test file
docker-compose exec backend pytest tests/test_auth.py

# Run specific test
docker-compose exec backend pytest tests/test_auth.py::TestAuth::test_login

# Show print output
docker-compose exec backend pytest -s

# Verbose mode
docker-compose exec backend pytest -v

# Stop on first failure
docker-compose exec backend pytest -x

# Last failed tests
docker-compose exec backend pytest --lf

# Create coverage report
docker-compose exec backend pytest --cov=. --cov-report=html --cov-report=xml
```

### Integration Testing
```bash
# Run integration tests only
docker-compose exec backend pytest tests/integration/

# Mock external services
docker-compose exec backend pytest tests/ -m "integration"

# Run with database
docker-compose exec backend pytest tests/ --db-live
```

### API Testing

#### Using curl
```bash
# Health check
curl -i http://localhost:5000/api/health

# Get all users
curl http://localhost:5000/api/users

# Create user (registration)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "mentee"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create booking with auth
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "mentorId": "mentor123",
    "menteeId": "mentee123",
    "startTime": "2025-11-15T10:00:00",
    "endTime": "2025-11-15T11:00:00"
  }'
```

#### Using Postman/Insomnia
```
Import collection:
1. Open Postman/Insomnia
2. Create new collection "IT-Project-Group-36"
3. Add requests:
   - GET /api/health
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/users
   - POST /api/bookings
4. Set up environment variables for tokens
5. Export collection for team sharing
```

### Load Testing

#### Apache Bench
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:5000/api/users

# 1000 requests, 50 concurrent
ab -n 1000 -c 50 http://localhost:5000/api/users

# With headers
ab -n 100 -c 10 -H "Authorization: Bearer token" http://localhost:5000/api/users

# Save output
ab -n 100 -c 10 http://localhost:5000/api/users > load_test_results.txt
```

#### Locust
```bash
# Start Locust UI
locust -f locustfile.py --host=http://localhost:5000

# Command line
locust -f locustfile.py --host=http://localhost:5000 --users=100 --spawn-rate=10 --run-time=5m -u
```

### Security Testing

```bash
# Test for SQL injection
curl "http://localhost:5000/api/users?email='; DROP TABLE users; --"

# Test CORS
curl -H "Origin: http://attacker.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:5000/api/users -v

# Test authentication bypass
curl http://localhost:5000/api/users  # Without token - should fail

# Test rate limiting
for i in {1..100}; do
  curl http://localhost:5000/api/users
done

# Check security headers
curl -i http://localhost:5000/api/health | grep -i "x-"
```

---

## 🐳 Docker Commands

### Basic Operations
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Restart service
docker-compose restart backend

# Execute command in container
docker-compose exec backend bash
docker-compose exec backend python

# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Remove stopped containers
docker container prune
```

### Cleanup
```bash
# Stop and remove containers, networks
docker-compose down

# Stop, remove, and delete volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Full cleanup (system prune)
docker system prune -a --volumes

# Check disk usage
docker system df
```

### Database Access
```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh

# MongoDB shell with credentials
docker-compose exec mongodb mongosh -u admin -p password

# Database operations (in mongosh)
db.users.find()
db.users.count()
db.bookings.find().pretty()
db.users.insertOne({...})
db.users.deleteOne({email: "test@example.com"})

# View database statistics
db.stats()

# Create index
db.users.createIndex({email: 1})
```

### Build & Push
```bash
# Build with specific tag
docker build -t your-username/networking-platform:latest .

# Push to Docker Hub
docker push your-username/networking-platform:latest

# View image layers
docker history your-image:tag

# Inspect image
docker inspect your-image:tag
```

---

## 📦 Deployment Commands

### Local Deployment
```bash
# Full startup
docker-compose up -d

# Check all services
docker ps

# Verify connectivity
curl http://localhost:3000
curl http://localhost:5000/api/health

# Seed test data (if script exists)
docker-compose exec backend python scripts/seed_db.py

# Run migrations (if applicable)
docker-compose exec backend python manage.py migrate
```

### GitHub Operations
```bash
# Add all changes
git add .

# Commit with message
git commit -m "Feature: Add booking confirmation email"

# Push to branch
git push origin feature-branch

# Create pull request
git push origin feature-branch
# Then create PR on GitHub website

# Merge to main
git checkout main
git merge feature-branch
git push origin main

# Tag release
git tag v1.0.0
git push origin v1.0.0

# View commit history
git log --oneline
git log --graph --all --decorate

# Check status
git status

# See differences
git diff
```

### Render Deployment

#### Manual Deploy
```bash
# Via dashboard:
1. Go to https://render.com/dashboard
2. Select service
3. Click "Manual Deploy"
4. Wait for build to complete

# Via API (requires RENDER_API_KEY)
curl -X POST https://api.render.com/v1/services/{serviceId}/deploys \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -d '{"clearCache": true}'
```

#### Monitoring
```bash
# Check service status
curl https://api.render.com/v1/services/{serviceId} \
  -H "Authorization: Bearer $RENDER_API_KEY"

# View recent builds
curl https://api.render.com/v1/services/{serviceId}/builds \
  -H "Authorization: Bearer $RENDER_API_KEY"

# Watch logs (on dashboard)
Go to Service → Logs tab
```

#### Rollback
```bash
# Via dashboard:
1. Service → Deploy history
2. Find previous deployment
3. Click "Redeploy" button

# Via Git:
git revert <bad-commit>
git push origin main
# Render auto-deploys
```

---

## 🗄️ MongoDB Commands

### Connection
```bash
# Local connection
mongosh mongodb://localhost:27017

# With credentials
mongosh mongodb+srv://user:password@cluster.mongodb.net/database

# Atlas connection string
mongosh "mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
```

### Database Operations
```bash
# Show databases
show dbs

# Use database
use networking_platform

# Show collections
show collections

# Count documents
db.users.countDocuments()

# Find operations
db.users.find()
db.users.find({role: "mentor"})
db.users.find({_id: ObjectId("...")})
db.users.findOne()

# Pretty print
db.users.find().pretty()

# Limit results
db.users.find().limit(10)

# Sort
db.users.find().sort({createdAt: -1})

# Insert
db.users.insertOne({email: "test@example.com", name: "Test"})

# Update
db.users.updateOne({_id: ObjectId("...")}, {$set: {name: "New Name"}})

# Delete
db.users.deleteOne({_id: ObjectId("...")})
```

### Aggregation
```bash
# Count by role
db.users.aggregate([
  {$group: {_id: "$role", count: {$sum: 1}}}
])

# Recent bookings
db.bookings.aggregate([
  {$sort: {createdAt: -1}},
  {$limit: 10}
])

# Bookings by mentor
db.bookings.aggregate([
  {$match: {mentorId: ObjectId("...")}},
  {$count: "total"}
])
```

### Backup & Restore
```bash
# Export (mongodump)
mongodump --uri="mongodb+srv://user:password@cluster.mongodb.net" --out=./backup

# Import (mongorestore)
mongorestore --uri="mongodb+srv://user:password@cluster.mongodb.net" ./backup

# Export to JSON
mongoexport --uri="mongodb+srv://user:password@cluster.mongodb.net" \
  -c users -o users.json

# Import from JSON
mongoimport --uri="mongodb+srv://user:password@cluster.mongodb.net" \
  -c users users.json
```

---

## 🔍 Troubleshooting Commands

### Container Issues
```bash
# Check container status
docker ps -a

# View container logs
docker logs <container-id>

# Inspect container
docker inspect <container-id>

# Execute command in running container
docker exec -it <container-id> bash

# Check container resource usage
docker stats

# Restart container
docker restart <container-id>

# Remove container
docker rm <container-id>
```

### Network Issues
```bash
# Test connectivity between containers
docker-compose exec backend ping mongodb

# Check network
docker network inspect <network-name>

# View network interfaces
docker exec <container-id> ifconfig

# Test DNS resolution
docker-compose exec backend nslookup mongodb
```

### Database Issues
```bash
# Test MongoDB connection from backend
docker-compose exec backend python -c "from pymongo import MongoClient; client = MongoClient('mongodb://mongodb:27017'); print(client.admin.command('ping'))"

# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Performance Issues
```bash
# Check CPU/Memory
docker stats

# View process list
docker-compose exec backend ps aux

# Monitor in real-time
docker stats --no-stream=false

# Check disk space
docker exec <container-id> df -h

# View network traffic
docker stats --no-stream=false <container-id>
```

### API Issues
```bash
# Test API endpoint
curl -v http://localhost:5000/api/health

# Include headers in output
curl -i http://localhost:5000/api/health

# Set timeout
curl --max-time 5 http://localhost:5000/api/health

# Test with different methods
curl -X POST http://localhost:5000/api/bookings

# Test CORS headers
curl -H "Origin: http://example.com" -v http://localhost:5000/api/users

# Test with custom headers
curl -H "Authorization: Bearer token" http://localhost:5000/api/users

# Test with data
curl -X POST -d '{"email":"test@example.com"}' http://localhost:5000/api/users

# Verbose output
curl -v http://localhost:5000/api/health

# Follow redirects
curl -L http://localhost:5000/api/health
```

---

## 📊 Monitoring Commands

### Application Health
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health (HTTP status)
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000

# Database health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# All services
curl http://localhost:3000 && echo "✓ Frontend"
curl http://localhost:5000/api/health && echo "✓ Backend"
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" && echo "✓ Database"
```

### Performance Monitoring
```bash
# Response time
curl -w "Response time: %{time_total}s\n" http://localhost:5000/api/users

# Per-stage timing
curl -w "
  Time_namelookup: %{time_namelookup}
  Time_connect: %{time_connect}
  Time_total: %{time_total}\n" http://localhost:5000/api/health

# Request size
curl -w "Request size: %{size_request} bytes\n" http://localhost:5000/api/health

# Response size
curl -w "Response size: %{size_download} bytes\n" http://localhost:5000/api/health

# Load average
docker stats --no-stream=false
```

### Log Monitoring
```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend

# Timestamps
docker-compose logs -t

# Since specific time
docker-compose logs --since 10m

# Search in logs
docker-compose logs | grep "error"
docker-compose logs | grep -i "warning"
```

---

## 🔐 Security Commands

### Credential Management
```bash
# Generate strong secret key
openssl rand -hex 32

# Generate strong password
openssl rand -base64 32

# Check environment variables
env | grep -i mongodb
env | grep -i firebase

# Hide sensitive output
echo $MONGODB_URI | sed 's/:.*@/:****@/'
```

### Vulnerability Scanning
```bash
# Check Node.js dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check Python dependencies
pip audit

# List outdated dependencies
npm outdated
pip list --outdated

# Update dependencies
npm update
pip install --upgrade -r requirements.txt
```

### Access Control
```bash
# View file permissions
ls -la

# Change permissions
chmod 600 .env
chmod 644 nginx.conf

# View user permissions
whoami
id

# MongoDB user roles
mongosh --eval "db.getUser('username')"
```

---

## 📝 Logging & Debugging

### Enable Verbose Logging
```bash
# Backend
export FLASK_ENV=development
export FLASK_DEBUG=True
docker-compose restart backend

# Frontend
export DEBUG=*
npm start

# Docker
docker-compose --verbose up
```

### Debugging with Breakpoints

#### Python Backend
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Run with debugger
python -m pdb app.py
```

#### JavaScript Frontend
```javascript
// Add debugger statement
debugger;

// Chrome DevTools
// Open DevTools (F12)
// Set breakpoints
// Step through code
```

---

## 🎯 Common Workflows

### Daily Development
```bash
# 1. Start services
docker-compose up -d

# 2. View logs
docker-compose logs -f

# 3. Make changes to code

# 4. Run tests
docker-compose exec backend pytest
docker-compose exec frontend npm test

# 5. Check API
curl http://localhost:5000/api/health

# 6. Commit and push
git add .
git commit -m "message"
git push
```

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# 3. Test locally
docker-compose up -d
npm test
pytest

# 4. Commit
git add .
git commit -m "Feature: Description"

# 5. Push to feature branch
git push origin feature/new-feature

# 6. Create pull request
# 7. After approval, merge to main
git checkout main
git merge feature/new-feature
git push origin main
```

### Bug Fixing
```bash
# 1. Create bug fix branch
git checkout -b fix/bug-description

# 2. Reproduce bug locally
# 3. Find root cause
# 4. Write test that fails (TDD)
# 5. Fix the bug
# 6. Verify test passes
# 7. Commit
git add .
git commit -m "Fix: bug description"
git push origin fix/bug-description

# 8. Create pull request
# 9. Merge to main after approval
```

### Deployment Prep
```bash
# 1. Update version
# 2. Update changelog
# 3. Run full test suite
npm test
pytest --cov

# 4. Check code coverage
# Coverage should be > 80%

# 5. Commit
git add .
git commit -m "Release: v1.0.0"
git tag v1.0.0

# 6. Push
git push origin main --tags

# 7. Monitor deployment
# Check Render dashboard
```

---

## 🆘 Quick Fixes

### Service Won't Start
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose up -d
```

### Database Connection Error
```bash
# Check connection string
echo $MONGODB_URI

# Test locally
docker-compose exec backend python -c "from pymongo import MongoClient; MongoClient('$MONGODB_URI')"

# Restart MongoDB
docker-compose restart mongodb
```

### API Returning 500 Error
```bash
# Check backend logs
docker-compose logs backend -f

# Check database
docker-compose exec mongodb mongosh

# Restart backend
docker-compose restart backend
```

### Frontend Blank Page
```bash
# Check frontend logs
docker-compose logs frontend -f

# Check browser console (F12)
# Look for errors

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose restart frontend
```

### Tests Failing
```bash
# Run tests with verbose output
pytest -v
npm test -- --verbose

# Run single failing test
pytest tests/test_specific.py::test_name

# Check test database
# Ensure test MongoDB is running
docker-compose exec mongodb mongosh

# Check test environment variables
echo $MONGODB_URI
```

---

## 📞 Getting Help

| Issue | Command |
|-------|---------|
| Service logs | `docker-compose logs SERVICE` |
| API test | `curl http://localhost:5000/api/health` |
| Database test | `docker-compose exec mongodb mongosh` |
| Container status | `docker ps` |
| Full logs | `docker-compose logs` |
| Run tests | `pytest` or `npm test` |
| Clean up | `docker-compose down -v` |

---

**Last Updated**: November 2025  
**Version**: 1.0  
**For**: IT-Project-Group-36 Team
