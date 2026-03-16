# 🗄️ MongoDB Setup Manual - Networking Companion Platform
## Complete English Version - Combined Guide

---

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Local Development Setup](#local-development-setup)
5. [Connection Configuration](#connection-configuration)
6. [Database Initialization](#database-initialization)
7. [Backup and Recovery](#backup-and-recovery)
8. [Performance Optimization](#performance-optimization)
9. [Quick Reference Guide](#quick-reference-guide)
10. [Common Issues FAQ](#common-issues-faq)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Quick Start Checklist](#quick-start-checklist)

---

## Overview

### MongoDB Purpose

This project uses MongoDB as the primary data storage system for:
- User accounts (User)
- Mentor profiles (Mentor)
- Time slots (TimeSlots)
- Booking records (Booking)

### Version Information

| Component | Version | Notes |
|-----------|---------|-------|
| MongoDB | 7.0+ | Database server |
| MongoDB Atlas | Latest | Cloud hosting solution |
| PyMongo | 4.15.1 | Python driver |
| MongoEngine | 0.29.1 | Python ORM |

### Deployment Architecture

```
┌──────────────────────┐
│   Flask Backend      │
│   (Python 3.11+)     │
└──────────┬───────────┘
           │ PyMongo 4.15.1
           │ MongoEngine 0.29.1
           │
    ┌──────v──────────┐
    │  MongoDB 7.0    │
    │                 │
    │  ┌─────────┐    │
    │  │   User  │    │
    │  ├─────────┤    │
    │  │ Mentor  │    │
    │  ├─────────┤    │
    │  │TimeSlots│    │
    │  ├─────────┤    │
    │  │ Booking │    │
    │  └─────────┘    │
    └─────────────────┘
```

---

## System Requirements

### System Specifications

| Item | Minimum | Recommended |
|------|---------|-------------|
| CPU | Dual-core | Quad-core+ |
| Memory | 2 GB | 4 GB+ |
| Disk Space | 2 GB | 10 GB+ |
| Network | Persistent connection | High-speed connection |
| OS | Windows 10+, macOS 11+, Ubuntu 20.04+ | Latest version |

### Software Requirements

```
Python: 3.11+
pip: 23.0+
Git: 2.40+
Docker: 20.10+ (optional, for containerized setup)
```

### Network Requirements

- MongoDB connection port: 27017
- Cloud service region network access
- IP whitelist configuration

---

## MongoDB Atlas Setup

MongoDB Atlas is the recommended cloud-hosted solution and is used in production environments.

### Step 1: Create MongoDB Atlas Account

1. **Visit the official website**
   ```
   https://www.mongodb.com/cloud/atlas
   ```

2. **Register an account**
   - Click "Sign Up"
   - Enter email and password
   - Accept terms and conditions
   - Click "Sign Up"

3. **Verify email**
   - Check your email
   - Click verification link
   - Complete registration

4. **Initial setup**
   - Fill in company information (optional)
   - Select preferred language
   - Complete onboarding

---

### Step 2: Create Organization and Project

1. **Create Organization**
   ```
   Organization Name: "Networking Companion"
   ```

2. **Create Project**
   ```
   Project Name: "IT-Project-Group-36"
   ```

3. **Add team members** (optional)
   - Invite team members
   - Set permission levels

---

### Step 3: Create Cluster

#### Select Cluster Type

**Recommended: M0 (free) or M2/M5 (paid)**

| Cluster Type | Storage | Concurrency | Price | Use Case |
|-------------|---------|------------|-------|----------|
| M0 (free) | 512 MB | 100 | Free | Development/Demo |
| M2 | 2 GB | 350 | $9/month | Small apps |
| M5 | 5 GB | 1200 | $57/month | Medium apps |
| M10+ | Larger | Higher | Higher | Production |

**Project Recommendation: M2 or M5**

#### Creation Steps

1. **Click "Create a Cluster"**

2. **Select deployment option**
   - ☑ Build a Cluster (recommended)
   - Choose your cluster tier

3. **Configure cluster**
   ```
   Cluster Name: networking-companion-prod
   Cloud Provider: AWS (or Google Cloud / Azure)
   Region: Asia Pacific (select nearest region)
   ```

4. **Advanced configuration options**
   - M0 (free) has no configuration options
   - M2+ can configure:
     - ☑ Backup (backup)
     - ☑ Encryption (encryption)

5. **Create cluster**
   - Click "Create Cluster"
   - Wait 5-10 minutes for completion

---

### Step 4: Configure Database User

#### Create Database User

1. **Open Security -> Database Access**

2. **Add user**
   ```
   Username: app_user
   Password: [generate strong password] or [custom]
   ```

3. **Select permissions**
   ```
   Roles: Read and write to any database
   ```

4. **Save user**
   - Record username and password
   - ⚠️ Keep password safe!

#### Create read-only user (optional)

```
Username: app_readonly
Password: [generate strong password]
Roles: Read any database
```

---

### Step 5: Configure IP Whitelist

#### Add IP Address

1. **Open Security -> Network Access**

2. **Add IP address**

   **Option A: Specific IP address (production recommended)**
   ```
   Render server IP: Your Render backend server IP
   ```

   **Option B: Allow all IPs (development only)**
   ```
   0.0.0.0/0 (allow any address)
   ⚠️ Note: Use only for development, not recommended for production
   ```

   **Option C: Local development**
   ```
   Your local IP address
   ```

3. **Add description**
   ```
   Render Production Server
   Local Development Machine
   ```

4. **Save**

---

### Step 6: Get Connection String

#### Copy Connection String

1. **Open Clusters page**

2. **Click "Connect"**

3. **Select "Drivers"**

4. **Select driver**
   ```
   Driver: Python
   Version: 4.15.1 (or newer)
   ```

5. **Copy connection string**
   ```
   mongodb+srv://app_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Replace placeholders**
   ```
   app_user → your username
   PASSWORD → your password
   ```

---

### Step 7: Test Connection

#### Verify Connection

```python
from pymongo import MongoClient

# Connection string
uri = "mongodb+srv://app_user:your-password@networking-companion.xxxxx.mongodb.net/?retryWrites=true&w=majority"

# Connect
client = MongoClient(uri)

# Test connection
try:
    # Check connection
    client.admin.command('ping')
    print("✅ Connected to MongoDB Atlas!")
    
    # List databases
    databases = client.list_database_names()
    print(f"Databases: {databases}")
    
except Exception as e:
    print(f"❌ Connection failed: {e}")

finally:
    client.close()
```

---

## Local Development Setup

For local development environments, use a local MongoDB instance.

### Option 1: Using Docker Compose (Recommended)

#### Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb_local
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
      MONGO_INITDB_DATABASE: test
    volumes:
      - mongo_data:/data/db
      - mongo_config:/data/configdb
    restart: unless-stopped

volumes:
  mongo_data:
  mongo_config:
```

#### Run Docker

```bash
# Start MongoDB
docker-compose up -d

# View logs
docker-compose logs -f mongodb

# Stop MongoDB
docker-compose down

# Remove data volumes
docker-compose down -v
```

### Option 2: Using MongoDB Community Edition

#### Windows Installation

1. **Download installer**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Select options**
   - Version: 7.0 (or latest)
   - Platform: Windows
   - Package: .exe

3. **Run installer**
   - Accept license agreement
   - Select "Complete" installation
   - Select "Install MongoDB as a Service"
   - Complete installation

4. **Verify installation**
   ```bash
   mongod --version
   ```

#### macOS Installation

**Using Homebrew (Recommended)**

```bash
# Add MongoDB tap
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community

# Start service
brew services start mongodb-community

# Verify
mongosh
```

#### Ubuntu/Linux Installation

```bash
# Add MongoDB repository
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add software source
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod

# Verify
mongosh
```

### Option 3: Using MongoDB Atlas Local

```bash
# Download: https://www.mongodb.com/products/tools/atlas-local
# Follow installation instructions
# Run Atlas Local
```

---

## Connection Configuration

### Backend Connection Configuration

#### Environment Variables

Create `flask-server/.env` file:

**Development environment (local MongoDB)**

```env
# Development environment
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=mongodb://localhost:27017/test
```

**Production environment (MongoDB Atlas)**

```env
# Production environment
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=mongodb+srv://app_user:your-password@networking-companion.xxxxx.mongodb.net/test?retryWrites=true&w=majority
```

#### Python Connection Code

**In `app_factory.py`**

```python
import os
from mongoengine import connect, disconnect

# Get database URL
database_url = os.getenv('DATABASE_URL', 'mongodb://localhost:27017/test')

# Database connection
def create_app():
    disconnect()  # Disconnect old connections
    
    try:
        # Connect to MongoDB
        connect(
            host=database_url,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=10000,
            retryWrites=True
        )
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise
    
    # Create Flask app...
```

### Connection Parameters

| Parameter | Description | Default | Purpose |
|-----------|-------------|---------|---------|
| `host` | Connection string or server address | localhost | Database address |
| `port` | Connection port | 27017 | Database port |
| `username` | Username | - | Authentication user |
| `password` | Password | - | Authentication password |
| `authSource` | Authentication database | admin | Database storing credentials |
| `retryWrites` | Auto retry | True | Retry on connection failure |
| `w=majority` | Write confirmation level | 0 | Ensure data replication |

---

## Database Initialization

### Automatic Initialization (Using MongoEngine Models)

Collections are automatically created on first connection. All collections are defined through Python models:

```python
# Models defined in db_models.py will automatically create collections

class User(Document):
    email = EmailField(required=True, unique=True)
    # ...

class Mentor(Document):
    uid = ReferenceField(User)
    # ...

class TimeSlots(Document):
    uid_mentor = ReferenceField(Mentor)
    # ...

class Booking(Document):
    time_slot = ReferenceField(TimeSlots)
    # ...
```

### Manual Initialization

To manually create collections and indexes:

```python
from db_models import User, Mentor, TimeSlots, Booking

# Create indexes
User.ensure_indexes()
Mentor.ensure_indexes()
TimeSlots.ensure_indexes()
Booking.ensure_indexes()

print("✅ Collections and indexes created")
```

### Create Indexes

```python
# Define indexes in db_models.py
class User(Document):
    meta = {
        'indexes': [
            'email',
            'uid',
            'role',
            '-created_at'  # Descending
        ]
    }

class Mentor(Document):
    meta = {
        'indexes': [
            'uid',
            'field_of_expertise',
            'city',
            '-created_at'
        ]
    }

class TimeSlots(Document):
    meta = {
        'indexes': [
            'uid_mentor',
            ('uid_mentor', 'status'),
            'start_time',
            '-created_at'
        ]
    }

class Booking(Document):
    meta = {
        'indexes': [
            'uid_mentee',
            'mentor_id',
            'status',
            '-created_at'
        ]
    }
```

### Seed Data (Optional)

Create `seed_data.py`:

```python
from db_models import User, Mentor, TimeSlots, Booking, UserRole, AppointmentStatus
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

def seed_database():
    """Insert test data"""
    
    # Clear existing data (development only)
    User.drop_collection()
    Mentor.drop_collection()
    TimeSlots.drop_collection()
    Booking.drop_collection()
    
    # Create test users
    user1 = User(
        email="john@example.com",
        uid="firebase_uid_john",
        username="john_doe",
        first_name="John",
        last_name="Doe",
        role=UserRole.MENTEE,
        password_hash=generate_password_hash("password123")
    )
    user1.save()
    
    user2 = User(
        email="jane@example.com",
        uid="firebase_uid_jane",
        username="jane_smith",
        first_name="Jane",
        last_name="Smith",
        role=UserRole.MENTOR,
        password_hash=generate_password_hash("password123")
    )
    user2.save()
    
    # Create mentor profile
    mentor = Mentor(
        uid=user2,
        biography="10+ years in Python development",
        field_of_expertise="Python",
        city="San Francisco",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    mentor.save()
    
    # Create time slots
    now = datetime.utcnow()
    for i in range(5):
        slot = TimeSlots(
            uid_mentor=mentor,
            start_time=now + timedelta(days=i+1, hours=14),
            end_time=now + timedelta(days=i+1, hours=15),
            status=AppointmentStatus.AVAILABLE,
            created_at=now,
            location="Google Meet"
        )
        slot.save()
    
    print("✅ Seed data created successfully")

if __name__ == "__main__":
    seed_database()
```

Run seed data:

```bash
python flask-server/seed_data.py
```

---

## Backup and Recovery

### MongoDB Atlas Automatic Backup

MongoDB Atlas provides free automatic backups:

1. **Open Backup page**
   ```
   MongoDB Atlas Dashboard → Cluster → Backup
   ```

2. **View backups**
   - Automatic backup: Every 6 hours
   - Retention period: 7 days

3. **Manual backup**
   - Click "Take a Snapshot"

### Restore Data

1. **Select backup**
   ```
   Backup → Restore
   ```

2. **Select restore method**
   - Restore to a cluster (restore to cluster)
   - Download backup (download backup)

3. **Confirm restore**
   - May take 5-30 minutes

### Local Backup (Export)

```bash
# Export entire database
mongodump --uri "mongodb+srv://app_user:password@cluster.mongodb.net/test" --out ./backups

# Export specific collection
mongodump --uri "mongodb://localhost:27017/test" --collection=user --out ./backups
```

### Restore Local Backup

```bash
# Restore entire database
mongorestore --uri "mongodb://localhost:27017/test" ./backups

# Restore specific collection
mongorestore --uri "mongodb://localhost:27017/test" --collection=user ./backups/test/user.bson
```

---

## Performance Optimization

### Index Optimization

#### Existing Indexes

```
User:
  - email (unique)
  - uid (unique)
  - role
  - created_at (descending)

Mentor:
  - uid
  - field_of_expertise
  - city
  - created_at (descending)

TimeSlots:
  - (uid_mentor, status) composite
  - start_time
  - created_at (descending)

Booking:
  - uid_mentee
  - mentor_id
  - status
  - created_at (descending)
```

#### Query Optimization Tips

**Query 1: Search mentors by city and expertise**

```python
# Unoptimized
mentors = Mentor.objects(
    field_of_expertise__icontains="Python",
    city__icontains="San Francisco"
)

# Optimized (requires adding index)
# meta = {'indexes': [('field_of_expertise', 'city')]}
```

**Query 2: Get user bookings**

```python
# Optimized (uid_mentee has index)
bookings = Booking.objects(uid_mentee=uid)
```

### Connection Pool Configuration

```python
from pymongo import MongoClient

# Configure connection pool
client = MongoClient(
    uri,
    maxPoolSize=50,      # Maximum 50 connections
    minPoolSize=10,      # Minimum 10 connections
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000
)
```

### Query Timeout Settings

```python
# MongoEngine configuration
from mongoengine import connect

connect(
    host=uri,
    serverSelectionTimeoutMS=5000,
    socketTimeoutMS=10000,
    retryWrites=True
)
```

---

## Quick Reference Guide

### Fast Decision Tree

```
What do you want to do?

1. Quick start (5 minutes)
   → Use Docker + local MongoDB
   → See "Local Development Setup"

2. Production deployment (30 minutes)
   → Visit MongoDB Atlas
   → Follow Step 1-7 in "MongoDB Atlas Setup"

3. Configure backend connection
   → See "Connection Configuration"
   → Update .env with connection string

4. Troubleshoot connection
   → See "Troubleshooting Guide"
   → Check IP whitelist and credentials

5. Backup data
   → See "Backup and Recovery"
   → Enable automatic backups in Atlas

6. Optimize performance
   → See "Performance Optimization"
   → Check indexes and query patterns
```

### 5 Minute Quick Start

**Local Development (Simplest)**

```bash
# 1. Start MongoDB (Docker)
docker-compose up -d

# 2. Configure .env
DATABASE_URL=mongodb://localhost:27017/test

# 3. Test connection
python -c "from pymongo import MongoClient; MongoClient('DATABASE_URL').admin.command('ping')"

# 4. Start application
python app.py
```

**Cloud Deployment (Production)**

```bash
# 1. Visit MongoDB Atlas
# https://www.mongodb.com/cloud/atlas

# 2. Create cluster (M0 free or M2 paid)

# 3. Create user + IP whitelist

# 4. Get connection string
# mongodb+srv://app_user:PASSWORD@cluster.mongodb.net/test

# 5. Update .env
DATABASE_URL=mongodb+srv://...
```

### Common Commands Quick Table

```bash
# Connect to local MongoDB
mongosh mongodb://localhost:27017

# Connect to MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/test"

# View all databases
show databases

# Use database
use test

# View collections
show collections

# Query all documents
db.user.find()

# Query with condition
db.user.find({ email: "john@example.com" })

# Count documents
db.user.countDocuments()

# Insert document
db.user.insertOne({ email: "test@example.com" })

# Update document
db.user.updateOne({ email: "john@example.com" }, { $set: { first_name: "John Updated" } })

# Delete document
db.user.deleteOne({ email: "test@example.com" })

# View indexes
db.user.getIndexes()

# Create index
db.user.createIndex({ email: 1 })
```

### Python Connection Templates

**Minimal Connection**

```python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client.test
users = db.user

# Insert
users.insert_one({"email": "test@example.com"})

# Query
user = users.find_one({"email": "test@example.com"})

# Close
client.close()
```

**Using MongoEngine (Recommended)**

```python
from mongoengine import connect, Document, StringField

# Connect
connect(host="mongodb://localhost:27017/test")

# Define model
class User(Document):
    email = StringField(required=True, unique=True)
    username = StringField(required=True)

# Create
user = User(email="test@example.com", username="testuser")
user.save()

# Query
users = User.objects(email="test@example.com")

# Update
user.update(set__username="newname")

# Delete
user.delete()
```

### Common Error Quick Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `ServerSelectionTimeoutError` | Cannot connect to server | Check connection string, IP whitelist |
| `AuthenticationFailed` | Wrong username/password | Verify credentials, check URL encoding |
| `OperationFailure: not authorized` | Insufficient permissions | MongoDB Atlas → increase user permissions |
| `MongoNetworkError` | Network connection issue | Check firewall, VPN, IP whitelist |
| `Database [test] does not exist` | Database not created | Insert data to auto-create |
| `Collection [user] does not exist` | Collection not created | Insert data to auto-create |

---

## Common Issues FAQ

### Q1: How do I change MongoDB password?

1. **Open Database Access**
2. **Select user, click "Edit"**
3. **Enter new password**
4. **Update connection string in .env file**

### Q2: Are there limits on MongoDB Atlas free cluster?

Yes, M0 (free) cluster limits:
- Storage: 512 MB
- Concurrency: 100
- No private endpoint support
- No VPC support

### Q3: How do I sync local and cloud databases?

```bash
# Export local data
mongodump --uri "mongodb://localhost:27017/test" --out ./backup

# Import to Atlas
mongorestore --uri "mongodb+srv://app_user:password@cluster.mongodb.net/test" ./backup/test
```

### Q4: How do I monitor database performance?

1. **Open Performance Advisor**
   ```
   MongoDB Atlas → Cluster → Performance Advisor
   ```

2. **View slow queries**
   ```
   Logs → Slow Query Log
   ```

3. **Monitor metrics**
   - CPU usage
   - Memory usage
   - Disk I/O

### Q5: Can I use both local and cloud MongoDB?

Yes:
- Development: Use local MongoDB
- Production: Use MongoDB Atlas
- Switch by changing DATABASE_URL in .env

### Q6: How often does MongoDB Atlas backup?

- Automatic: Every 6 hours
- Manual: On demand (click "Take a Snapshot")
- Retention: 7 days default

### Q7: What if I forget my MongoDB password?

1. **MongoDB Atlas → Security → Database Access**
2. **Click user, select "Edit"**
3. **Reset password**
4. **Update .env file**

### Q8: How do I check MongoDB connection status?

```python
from pymongo import MongoClient

client = MongoClient("DATABASE_URL")
try:
    client.admin.command('ping')
    print("✅ Connected")
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

---

## Troubleshooting Guide

### Connection Issues

#### Error: `ServerSelectionTimeoutError`

**Cause**: Unable to connect to MongoDB server

**Solution**:
```python
# Check connection string
print(database_url)

# Check network connection
import socket
try:
    socket.create_connection(("cluster.mongodb.net", 27017), timeout=5)
    print("✅ Network connection OK")
except Exception as e:
    print(f"❌ Network error: {e}")

# Check IP whitelist
# MongoDB Atlas → Security → Network Access
```

#### Error: `AuthenticationFailed`

**Cause**: Incorrect username or password

**Solution**:
```python
# Verify connection string
# Special characters need URL encoding
# Example: password@123 → password%40123

# Check if user exists
# MongoDB Atlas → Security → Database Access
```

#### Error: `OperationFailure: not authorized`

**Cause**: Insufficient user permissions

**Solution**:
```
1. MongoDB Atlas → Security → Database Access
2. Edit user permissions
3. Select "Read and write to any database"
4. Save changes
```

#### Error: `MongoNetworkError`

**Cause**: Network connectivity issue

**Solution**:
```
1. Check firewall settings
2. Check VPN connection
3. Verify IP in whitelist
4. Check internet connection
```

### Performance Issues

#### Slow Queries

```python
# Enable logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Check slow queries
# MongoDB Atlas → Logs → Slow Query Log

# Optimize query
mentors = Mentor.objects(field_of_expertise="Python").only('biography', 'city')
```

#### Connection Pool Exhausted

```python
# Increase pool size
client = MongoClient(uri, maxPoolSize=100)

# Check for connection leaks
import gc
gc.collect()
```

#### High Memory Usage

```python
# Reduce batch size
users = User.objects.batch_size(100)

# Use projection to limit fields
users = User.objects.only('email', 'username')
```

---

## Quick Start Checklist

### Development Environment

- [ ] Docker installed or MongoDB installed locally
- [ ] mongosh or MongoDB Shell available
- [ ] Connection string configured in .env
- [ ] Connection test successful
- [ ] Database and collections automatically created
- [ ] Application starts successfully
- [ ] Can insert and query test data

### Production Environment

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M2 or higher)
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string obtained
- [ ] Connection test successful
- [ ] .env file configured with production URI
- [ ] Backup enabled
- [ ] Encryption enabled
- [ ] Application deployed successfully
- [ ] Seed data inserted (if needed)
- [ ] Performance monitoring enabled

### Security Checklist

- [ ] Strong password (>12 characters)
- [ ] Password stored securely (not in Git)
- [ ] IP whitelist restricted (production)
- [ ] Read-only user created (backup)
- [ ] Automatic backup enabled
- [ ] Encryption enabled
- [ ] Regular backup verification
- [ ] Audit logging enabled

### Environment Variables Template

```bash
# Development environment
FLASK_ENV=development
DATABASE_URL=mongodb://localhost:27017/test
FLASK_DEBUG=True

# Production environment
FLASK_ENV=production
DATABASE_URL=mongodb+srv://app_user:PASSWORD@cluster.mongodb.net/test?retryWrites=true&w=majority
FLASK_DEBUG=False
```

---

## Key Resources

### Official Documentation

- **MongoDB Official**: https://www.mongodb.com
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **PyMongo Documentation**: https://docs.mongodb.com/drivers/python/
- **MongoEngine**: http://docs.mongoengine.org/

### Related Project Documentation

- API Documentation: `API_DOCUMENTATION_ACCURATE.md`
- Database Schema: `DATABASE_SCHEMA_ACCURATE.md`
- Deployment Guide: `RENDER_DEPLOYMENT_MANUAL_ENGLISH.md`
- System Requirements: `SYSTEM_REQUIREMENTS.md`
- Quick Reference: `MONGODB_QUICK_REFERENCE.md`

---

## Summary

### Recommended Configuration

**Development Environment**:
- Local MongoDB instance (Docker)
- Connection: mongodb://localhost:27017/test
- Auto-create collections and indexes
- Hot-reload support

**Production Environment**:
- MongoDB Atlas M2 or higher
- Enable backup
- Configure encryption
- Restrict IP access
- Monitor performance
- Regular backup verification

### Key Takeaways

✅ **Setup**: Create MongoDB Atlas cluster in 10 minutes  
✅ **Connection**: Test connection before deploying  
✅ **Security**: Use strong passwords and IP whitelist  
✅ **Performance**: Create proper indexes  
✅ **Backup**: Enable automatic backups  
✅ **Monitoring**: Check performance metrics  

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-05 | Initial release - Complete MongoDB Setup Manual (English) |

---

**MongoDB Setup Complete!** 🎉

For any questions, refer to the relevant sections above or contact the development team.

**Last Updated**: November 5, 2025  
**Status**: Complete  
**Language**: English
