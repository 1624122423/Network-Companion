# 📁 Guide: How to Add New Files to Your Docker Deployment

This guide explains how to add new files to your Docker deployment configuration.

---

## 📚 Table of Contents

1. [Adding Backend Files](#adding-backend-files)
2. [Adding Frontend Files](#adding-frontend-files)
3. [Adding Configuration Files](#adding-configuration-files)
4. [Adding Database Scripts](#adding-database-scripts)
5. [Adding Environment Variables](#adding-environment-variables)
6. [Modifying Docker Build Process](#modifying-docker-build-process)

---

## 🔧 Adding Backend Files

### Scenario 1: Adding a New Python Module

If you need to add a new Python file or module to your backend:

**Example**: Adding a new utility module `utils/helpers.py`

#### Step 1: Create the file in your project
```bash
# In your project directory
mkdir -p flask-server/utils
touch flask-server/utils/helpers.py
touch flask-server/utils/__init__.py
```

#### Step 2: Add your code
```python
# flask-server/utils/helpers.py
def format_date(date):
    """Helper function to format dates"""
    return date.strftime("%Y-%m-%d")

def validate_email(email):
    """Helper function to validate email"""
    import re
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None
```

#### Step 3: Update backend.Dockerfile (if needed)
The current Dockerfile already copies all files with `COPY flask-server/ .`

**If you need specific handling**:
```dockerfile
# Add before the main COPY command
COPY flask-server/utils/ ./utils/

# Or install additional dependencies
RUN pip install --no-cache-dir <new-package>
```

#### Step 4: Use in your application
```python
# In your controller or model
from utils.helpers import format_date, validate_email

# Use the functions
formatted = format_date(datetime.now())
is_valid = validate_email("user@example.com")
```

#### Step 5: Rebuild and restart
```bash
docker-compose build backend
docker-compose up -d backend
```

---

### Scenario 2: Adding New Python Dependencies

**Example**: Adding `pandas` library for data processing

#### Step 1: Update requirements.txt
```bash
# Add to flask-server/requirements.txt
echo "pandas==2.0.0" >> flask-server/requirements.txt
```

Or edit the file:
```txt
# flask-server/requirements.txt
Flask==3.1.2
pandas==2.0.0
# ... other dependencies
```

#### Step 2: Option A - Rebuild container
```bash
docker-compose build --no-cache backend
docker-compose up -d
```

#### Step 2: Option B - Install in running container (temporary)
```bash
# Only for testing - will be lost when container restarts
docker exec -it it-project-backend pip install pandas
```

---

### Scenario 3: Adding Configuration Files

**Example**: Adding a `config.py` for application settings

#### Step 1: Create the configuration file
```python
# flask-server/config.py
import os

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret')
    DEBUG = False
    TESTING = False
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    MONGODB_URI = 'mongodb://localhost:27017/test'

class ProductionConfig(Config):
    """Production configuration"""
    MONGODB_URI = os.getenv('MONGODB_URI')

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

#### Step 2: Use in app_factory.py
```python
# flask-server/app_factory.py
from config import config
import os

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    env = os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[env])
    
    # ... rest of your code
```

#### Step 3: Update .env file
```env
FLASK_ENV=production
```

#### Step 4: Rebuild and restart
```bash
docker-compose build backend
docker-compose up -d
```

---

## 🎨 Adding Frontend Files

### Scenario 1: Adding New React Components

**Example**: Adding a new component `components/UserProfile.jsx`

#### Step 1: Create the component
```bash
# In your project
touch react-web-app/src/components/UserProfile.jsx
```

```jsx
// react-web-app/src/components/UserProfile.jsx
import React from 'react';

function UserProfile({ user }) {
    return (
        <div className="user-profile">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
}

export default UserProfile;
```

#### Step 2: No Dockerfile changes needed
The current setup already copies all source files:
```dockerfile
COPY react-web-app/ .
```

#### Step 3: Use the component
```jsx
// In your App.jsx or other component
import UserProfile from './components/UserProfile';

function App() {
    return (
        <div>
            <UserProfile user={currentUser} />
        </div>
    );
}
```

#### Step 4: Rebuild frontend
```bash
docker-compose build frontend
docker-compose up -d frontend
```

---

### Scenario 2: Adding Frontend Dependencies

**Example**: Adding `axios` for API calls

#### Step 1: Add to package.json
```bash
# Navigate to react-web-app directory locally
cd react-web-app
npm install axios

# Or manually edit package.json
```

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "axios": "^1.12.2"
  }
}
```

#### Step 2: Rebuild frontend container
```bash
# From project root
docker-compose build frontend
docker-compose up -d frontend
```

---

### Scenario 3: Adding Static Assets

**Example**: Adding images, fonts, or other static files

#### Step 1: Create assets directory
```bash
mkdir -p react-web-app/public/images
mkdir -p react-web-app/public/fonts
```

#### Step 2: Add your files
```bash
# Copy your assets
cp ~/my-logo.png react-web-app/public/images/
cp ~/my-font.woff react-web-app/public/fonts/
```

#### Step 3: Use in your components
```jsx
// In your React component
function Logo() {
    return <img src="/images/my-logo.png" alt="Logo" />;
}
```

Or in CSS:
```css
@font-face {
    font-family: 'MyFont';
    src: url('/fonts/my-font.woff') format('woff');
}
```

#### Step 4: Rebuild
```bash
docker-compose build frontend
docker-compose up -d frontend
```

---

## ⚙️ Adding Configuration Files

### Scenario 1: Adding Nginx Configuration for New Routes

**Example**: Adding a new API proxy rule

#### Step 1: Edit nginx.conf
```nginx
# Add new location block in nginx.conf
server {
    listen 80;
    
    # Existing configurations...
    
    # NEW: Add proxy for new service
    location /api/v2/ {
        proxy_pass http://backend:5000/api/v2/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # NEW: Add proxy for WebSocket
    location /ws/ {
        proxy_pass http://backend:5000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### Step 2: Test configuration locally (optional)
```bash
# Test nginx configuration
docker exec -it it-project-frontend nginx -t
```

#### Step 3: Rebuild and restart
```bash
docker-compose build frontend
docker-compose up -d frontend
```

---

### Scenario 2: Adding Custom Docker Compose Override

**Example**: Creating development-specific configuration

#### Step 1: Create docker-compose.override.yml
```yaml
# docker-compose.override.yml
# This file is automatically loaded by docker-compose
version: '3.8'

services:
  backend:
    # Mount source code for live reloading
    volumes:
      - ./flask-server:/app
    environment:
      FLASK_ENV: development
    command: python -m flask run --host=0.0.0.0 --port=5000 --debug
  
  frontend:
    # Development build
    build:
      context: .
      dockerfile: frontend.Dockerfile
      target: builder  # If using multi-stage
```

#### Step 2: Use with docker-compose
```bash
# Automatically uses docker-compose.override.yml if present
docker-compose up -d
```

---

## 🗄️ Adding Database Scripts

### Scenario 1: Adding MongoDB Initialization Script

**Example**: Creating initial database with seed data

#### Step 1: Create init script
```javascript
// mongo-init.js
db = db.getSiblingDB('test');

// Create collections
db.createCollection('user');
db.createCollection('mentor');
db.createCollection('time_slots');
db.createCollection('booking');

// Insert seed data
db.user.insertMany([
    {
        email: 'admin@example.com',
        uid: 'admin-001',
        username: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        role: 'Mentor',
        created_at: new Date()
    },
    {
        email: 'user@example.com',
        uid: 'user-001',
        username: 'user',
        first_name: 'Regular',
        last_name: 'User',
        role: 'Mentee',
        created_at: new Date()
    }
]);

print('Database initialized with seed data');
```

#### Step 2: Mount in docker-compose
```yaml
# docker-compose.local-mongo.yml
services:
  mongodb:
    image: mongo:7.0
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro  # Add this line
```

#### Step 3: Restart MongoDB
```bash
# Remove old data (if needed)
docker-compose -f docker-compose.local-mongo.yml down -v

# Start fresh
docker-compose -f docker-compose.local-mongo.yml up -d
```

---

### Scenario 2: Adding Database Backup Script

**Example**: Creating automated backup script

#### Step 1: Create backup script
```bash
# scripts/backup-db.sh
#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mongodb_backup_$TIMESTAMP"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec it-project-mongodb mongodump --out /backup/$BACKUP_FILE

# Copy from container
docker cp it-project-mongodb:/backup/$BACKUP_FILE $BACKUP_DIR/

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE"
```

#### Step 2: Make executable
```bash
chmod +x scripts/backup-db.sh
```

#### Step 3: Run backup
```bash
./scripts/backup-db.sh
```

#### Step 4: Optional - Add to cron
```bash
# Add to crontab for daily backup at 2 AM
crontab -e

# Add this line:
0 2 * * * /path/to/your/project/scripts/backup-db.sh
```

---

## 🔐 Adding Environment Variables

### Scenario 1: Adding New Environment Variables

**Example**: Adding email service configuration

#### Step 1: Update .env.example
```env
# .env.example

# Existing variables...
FLASK_SECRET_KEY=your-secret-key
FLASK_ENV=production

# NEW: Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_USE_TLS=true
```

#### Step 2: Update .env
```bash
cp .env.example .env
# Edit .env with your actual values
```

#### Step 3: Update docker-compose.yml
```yaml
services:
  backend:
    environment:
      # Existing env vars...
      FLASK_SECRET_KEY: ${FLASK_SECRET_KEY}
      
      # NEW: Add email configuration
      EMAIL_HOST: ${EMAIL_HOST}
      EMAIL_PORT: ${EMAIL_PORT}
      EMAIL_USERNAME: ${EMAIL_USERNAME}
      EMAIL_PASSWORD: ${EMAIL_PASSWORD}
      EMAIL_USE_TLS: ${EMAIL_USE_TLS}
```

#### Step 4: Use in your application
```python
# flask-server/utils/email.py
import os
import smtplib
from email.mime.text import MIMEText

def send_email(to, subject, body):
    host = os.getenv('EMAIL_HOST')
    port = int(os.getenv('EMAIL_PORT', 587))
    username = os.getenv('EMAIL_USERNAME')
    password = os.getenv('EMAIL_PASSWORD')
    
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = username
    msg['To'] = to
    
    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(username, password)
        server.send_message(msg)
```

#### Step 5: Restart services
```bash
docker-compose up -d
```

---

## 🔨 Modifying Docker Build Process

### Scenario 1: Adding Build Arguments

**Example**: Passing build-time variables

#### Step 1: Update Dockerfile
```dockerfile
# backend.Dockerfile
FROM python:3.11-slim

# Add build argument
ARG APP_VERSION=1.0.0
ARG BUILD_DATE

# Set as environment variable
ENV APP_VERSION=${APP_VERSION}
ENV BUILD_DATE=${BUILD_DATE}

# ... rest of Dockerfile

# Display version in health check
HEALTHCHECK CMD python -c "print(f'Version: ${APP_VERSION}')"
```

#### Step 2: Update docker-compose.yml
```yaml
services:
  backend:
    build:
      context: .
      dockerfile: backend.Dockerfile
      args:
        APP_VERSION: "1.0.0"
        BUILD_DATE: "2024-01-01"
```

#### Step 3: Build with arguments
```bash
# Build with custom arguments
docker-compose build --build-arg APP_VERSION=1.2.0 backend
```

---

### Scenario 2: Adding Multi-stage Build Optimization

**Example**: Optimizing Python dependencies

#### Step 1: Update backend.Dockerfile
```dockerfile
# Stage 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config

# Install Python dependencies
COPY flask-server/requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY flask-server/ .

# Update PATH
ENV PATH=/root/.local/bin:$PATH

EXPOSE 5000

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]
```

#### Step 2: Rebuild
```bash
docker-compose build --no-cache backend
docker-compose up -d
```

---

## 📦 Adding New Services

### Scenario: Adding Redis Cache

#### Step 1: Update docker-compose.yml
```yaml
version: '3.8'

services:
  # Existing services...
  
  # NEW: Redis service
  redis:
    image: redis:7-alpine
    container_name: it-project-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    # Add Redis connection
    environment:
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - redis

volumes:
  redis_data:
    driver: local
```

#### Step 2: Update requirements.txt
```txt
# Add to flask-server/requirements.txt
redis==5.0.0
```

#### Step 3: Use Redis in your application
```python
# flask-server/utils/cache.py
import redis
import os

redis_client = redis.from_url(
    os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

def cache_get(key):
    """Get value from cache"""
    return redis_client.get(key)

def cache_set(key, value, ttl=300):
    """Set value in cache with TTL"""
    return redis_client.setex(key, ttl, value)
```

#### Step 4: Deploy
```bash
docker-compose up -d
```

---

## ✅ Best Practices

### 1. Always Test Locally First
```bash
# Test build
docker-compose build

# Test run
docker-compose up

# Check logs
docker-compose logs
```

### 2. Use .dockerignore
Add files that shouldn't be copied:
```
# .dockerignore
__pycache__/
*.pyc
node_modules/
.git/
.env
*.log
```

### 3. Version Your Configuration
```bash
# Commit your changes
git add docker-compose.yml backend.Dockerfile
git commit -m "Add Redis cache service"
git push
```

### 4. Document Your Changes
Update your README.md or create CHANGELOG.md:
```markdown
## [1.1.0] - 2024-01-15
### Added
- Redis caching service
- Email notification system
- Database backup script
```

### 5. Keep Secrets Secure
```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use environment variables
docker-compose up -d
```

---

## 🎓 Examples Summary

Here's a quick reference for common additions:

| What to Add | Files to Modify | Rebuild Required |
|-------------|----------------|------------------|
| Python module | Just add file | ✅ Yes (backend) |
| Python dependency | requirements.txt | ✅ Yes (backend) |
| React component | Just add file | ✅ Yes (frontend) |
| NPM package | package.json | ✅ Yes (frontend) |
| Environment variable | .env, docker-compose.yml | ⭕ Restart only |
| Nginx route | nginx.conf | ✅ Yes (frontend) |
| Database script | Add file, update compose | ✅ Yes (mongodb) |
| New service | docker-compose.yml | ✅ Yes (new service) |

---

## 🆘 Need Help?

If you encounter issues:

1. **Check logs**: `docker-compose logs [service-name]`
2. **Rebuild clean**: `docker-compose build --no-cache`
3. **Remove volumes**: `docker-compose down -v`
4. **Test locally**: Build and test outside Docker first

---

**Happy Coding!** 🚀
