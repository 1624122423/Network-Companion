# IT-Project-Group-36: Comprehensive Test Plan

**Project**: Networking Companion Platform (Mentor-Mentee Booking System)  
**Document Version**: 1.0  
**Last Updated**: November 2025  
**Architecture**: React Frontend + Flask Backend + MongoDB Database  
**Deployment Environments**: Local Docker + Render (separate frontend/backend) + MongoDB Atlas

---

## Table of Contents

1. [Test Objectives](#test-objectives)
2. [Test Scope](#test-scope)
3. [Test Environment Setup](#test-environment-setup)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [Deployment Testing](#deployment-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [User Acceptance Testing](#user-acceptance-testing)
10. [Test Documentation](#test-documentation)
11. [Defect Management](#defect-management)
12. [Test Execution Timeline](#test-execution-timeline)

---

## Test Objectives

### Primary Objectives
- Verify that all system components function correctly in isolation
- Validate that components integrate seamlessly with each other
- Ensure application meets performance and security requirements
- Confirm successful deployment across local, staging, and production environments
- Validate user workflows and business logic

### Secondary Objectives
- Identify and document any issues before production release
- Establish performance baselines for future optimization
- Ensure data integrity and security compliance
- Verify disaster recovery and backup procedures
- Document system behavior under load

---

## Test Scope

### In Scope

#### Frontend (React)
- Component rendering and state management
- User authentication flow (Firebase integration)
- Form validation and submission
- API communication with backend
- Error handling and user feedback
- Responsive design across devices
- Browser compatibility (Chrome, Firefox, Safari, Edge)

#### Backend (Flask)
- API endpoint functionality
- Request/response handling
- Input validation
- Error handling and status codes
- Authentication and authorization
- Database operations (CRUD)
- Business logic correctness

#### Database (MongoDB)
- Connection establishment
- Data persistence and retrieval
- Query performance
- Data validation
- Backup and restore procedures
- Replication and failover

#### DevOps/Deployment
- Docker image building
- Docker Compose orchestration
- Environment variable configuration
- Health checks
- Container networking
- Render deployment process
- MongoDB Atlas connectivity

### Out of Scope
- Third-party service testing (Firebase, Render infrastructure)
- Load testing beyond baseline performance
- Penetration testing (basic security checks only)
- UI/UX usability testing (functional testing only)
- Localization and internationalization

---

## Test Environment Setup

### Local Development Environment

#### System Requirements
```
Operating System: Windows 10/11, macOS, or Linux
Processor: 2+ GHz dual-core
RAM: 8 GB minimum (16 GB recommended)
Storage: 20 GB free space
Network: Stable internet connection
```

#### Required Tools
```
Node.js: v18.x or v20.x
Python: 3.9+
Docker: 25.0+
Docker Compose: 2.20+
Git: 2.30+
MongoDB Community: 7.0 (local) or MongoDB Atlas account
Visual Studio Code (recommended IDE)
Postman or Insomnia (API testing)
```

#### Environment Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/GitUser-321/IT-Project-Group-36/tree/main
cd IT-Project-Group-36

# 2. Create environment files
# Copy .env.example to .env for both frontend and backend
cp react-web-app/.env.example react-web-app/.env
cp flask-server/.env.example flask-server/.env

# 3. Configure MongoDB locally
# Option A: Use Docker (recommended)
docker run -d \
  --name mongodb-local \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7

# Option B: Install MongoDB locally
# Follow official MongoDB installation guide

# 4. Verify installations
node --version         # Should be v18+
python --version       # Should be 3.9+
docker --version       # Should be 25.0+
docker-compose --version  # Should be 2.20+
```

### Staging Environment (Render)
- Frontend: Render Web Service (React + Nginx)
- Backend: Render Web Service (Flask + Gunicorn)
- Database: MongoDB Atlas (staging cluster)
- Environment: Production-like configuration

### Test Data Preparation

#### Database Seed Data
```bash
# Create test users
db.users.insertMany([
  {
    _id: ObjectId(),
    email: "mentor1@example.com",
    name: "Test Mentor",
    role: "mentor",
    expertise: ["Python", "Web Development"],
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    email: "mentee1@example.com",
    name: "Test Mentee",
    role: "mentee",
    expertise: ["Python"],
    createdAt: new Date()
  }
])

# Create test bookings
db.bookings.insertMany([
  {
    _id: ObjectId(),
    mentorId: ObjectId("..."),
    menteeId: ObjectId("..."),
    startTime: new Date("2025-11-15T10:00:00"),
    endTime: new Date("2025-11-15T11:00:00"),
    status: "confirmed",
    createdAt: new Date()
  }
])
```

---

## Unit Testing

### Frontend Unit Tests

#### Test File Structure
```
react-web-app/src/__tests__/
├── components/
│   ├── LoginForm.test.jsx
│   ├── MentorProfile.test.jsx
│   ├── BookingCalendar.test.jsx
│   └── UserDashboard.test.jsx
├── hooks/
│   ├── useAuth.test.js
│   ├── useFetch.test.js
│   └── useBooking.test.js
├── utils/
│   ├── validators.test.js
│   ├── formatters.test.js
│   └── api.test.js
└── integration/
    ├── authFlow.test.jsx
    └── bookingFlow.test.jsx
```

#### React Component Tests
```javascript
// Example: LoginForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../components/LoginForm';
import { AuthProvider } from '../context/AuthContext';

describe('LoginForm Component', () => {
  test('renders login form with email and password fields', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('displays error message on failed login', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid credentials', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'mentor@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'validpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });

  test('validates email format before submission', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'invalid-email' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
  });
});
```

#### Custom Hook Tests
```javascript
// Example: useAuth.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import useAuth from '../hooks/useAuth';
import { AuthProvider } from '../context/AuthContext';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth Hook', () => {
  test('initial state has user as null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  test('login updates user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
      expect(result.current.user.email).toBe('test@example.com');
    });
  });

  test('logout clears user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
```

#### Running Frontend Tests
```bash
cd react-web-app

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test LoginForm.test.jsx

# Watch mode for development
npm test -- --watch
```

### Backend Unit Tests

#### Test File Structure
```
flask-server/tests/
├── test_models.py
├── test_auth.py
├── test_bookings.py
├── test_users.py
├── test_validations.py
└── fixtures.py
```

#### Python Unit Tests
```python
# tests/test_auth.py
import pytest
from flask import Flask
from flask_restx import Api
from app_factory import create_app
from models.user import User

@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app('testing')
    with app.app_context():
        yield app

@pytest.fixture
def client(app):
    """Test client"""
    return app.test_client()

@pytest.fixture
def auth_token(client):
    """Generate test auth token"""
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'testpassword123'
    })
    return response.json.get('token')

class TestAuthentication:
    def test_login_success(self, client):
        """Test successful login"""
        response = client.post('/api/auth/login', json={
            'email': 'mentor@example.com',
            'password': 'validpassword'
        })
        
        assert response.status_code == 200
        assert 'token' in response.json
        assert 'user' in response.json

    def test_login_invalid_email(self, client):
        """Test login with invalid email"""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'password'
        })
        
        assert response.status_code == 401
        assert 'error' in response.json

    def test_login_invalid_password(self, client):
        """Test login with wrong password"""
        response = client.post('/api/auth/login', json={
            'email': 'mentor@example.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        assert 'error' in response.json

    def test_register_new_user(self, client):
        """Test user registration"""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@example.com',
            'password': 'securepassword123',
            'name': 'New User',
            'role': 'mentee'
        })
        
        assert response.status_code == 201
        assert 'user' in response.json

    def test_token_validation(self, client, auth_token):
        """Test token validation"""
        response = client.get(
            '/api/users/profile',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 200
        assert 'user' in response.json

    def test_invalid_token(self, client):
        """Test with invalid token"""
        response = client.get(
            '/api/users/profile',
            headers={'Authorization': 'Bearer invalid_token'}
        )
        
        assert response.status_code == 401

class TestUserModel:
    def test_user_creation(self):
        """Test User model creation"""
        user = User(
            email='test@example.com',
            name='Test User',
            role='mentee'
        )
        user.set_password('password123')
        
        assert user.email == 'test@example.com'
        assert user.name == 'Test User'
        assert user.role == 'mentee'

    def test_password_hashing(self):
        """Test password hashing"""
        user = User(email='test@example.com', name='Test', role='mentee')
        user.set_password('password123')
        
        assert user.password_hash != 'password123'
        assert user.check_password('password123')
        assert not user.check_password('wrongpassword')

    def test_user_email_validation(self):
        """Test email validation"""
        from utils.validators import validate_email
        
        assert validate_email('valid@example.com') == True
        assert validate_email('invalid-email') == False
        assert validate_email('') == False
```

#### Running Backend Tests
```bash
cd flask-server

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::TestAuthentication::test_login_success

# Verbose output
pytest -v

# Show print statements
pytest -s
```

---

## Integration Testing

### Frontend-Backend Integration

#### API Communication Tests
```javascript
// Example: API integration test
import axios from 'axios';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('http://localhost:5000/api/bookings', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '123',
        mentorId: 'mentor1',
        menteeId: 'mentee1',
        status: 'confirmed'
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Booking API Integration', () => {
  test('creates booking successfully', async () => {
    const response = await axios.post('http://localhost:5000/api/bookings', {
      mentorId: 'mentor1',
      menteeId: 'mentee1',
      startTime: '2025-11-15T10:00:00',
      endTime: '2025-11-15T11:00:00'
    });

    expect(response.status).toBe(201);
    expect(response.data.status).toBe('confirmed');
  });

  test('handles booking conflict', async () => {
    server.use(
      rest.post('http://localhost:5000/api/bookings', (req, res, ctx) => {
        return res(
          ctx.status(409),
          ctx.json({ error: 'Time slot already booked' })
        );
      })
    );

    try {
      await axios.post('http://localhost:5000/api/bookings', {
        mentorId: 'mentor1',
        menteeId: 'mentee1',
        startTime: '2025-11-15T10:00:00',
        endTime: '2025-11-15T11:00:00'
      });
    } catch (error) {
      expect(error.response.status).toBe(409);
    }
  });
});
```

### Backend-Database Integration

#### Database Operation Tests
```python
# tests/test_db_integration.py
import pytest
from models.booking import Booking
from models.user import User
from datetime import datetime, timedelta

class TestDatabaseIntegration:
    def test_create_and_retrieve_booking(self):
        """Test booking creation and retrieval"""
        # Create users
        mentor = User(email='mentor@example.com', name='Mentor', role='mentor')
        mentee = User(email='mentee@example.com', name='Mentee', role='mentee')
        
        # Create booking
        start_time = datetime.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=1)
        
        booking = Booking(
            mentor_id=mentor.id,
            mentee_id=mentee.id,
            start_time=start_time,
            end_time=end_time,
            status='confirmed'
        )
        booking.save()
        
        # Retrieve and verify
        retrieved = Booking.objects.get(id=booking.id)
        assert retrieved.mentor_id == mentor.id
        assert retrieved.mentee_id == mentee.id
        assert retrieved.status == 'confirmed'

    def test_booking_conflict_detection(self):
        """Test detection of overlapping bookings"""
        mentor = User(email='mentor@example.com', name='Mentor', role='mentor')
        mentee1 = User(email='mentee1@example.com', name='Mentee1', role='mentee')
        mentee2 = User(email='mentee2@example.com', name='Mentee2', role='mentee')
        
        start_time = datetime.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=1)
        
        # Create first booking
        booking1 = Booking(
            mentor_id=mentor.id,
            mentee_id=mentee1.id,
            start_time=start_time,
            end_time=end_time
        )
        booking1.save()
        
        # Try to create overlapping booking
        overlapping_start = start_time + timedelta(minutes=30)
        overlapping_end = overlapping_start + timedelta(hours=1)
        
        conflicts = Booking.objects.filter(
            mentor_id=mentor.id,
            start_time__lt=overlapping_end,
            end_time__gt=overlapping_start
        )
        
        assert len(conflicts) > 0

    def test_cascade_delete_bookings(self):
        """Test cascade deletion of related bookings"""
        mentor = User(email='mentor@example.com', name='Mentor', role='mentor')
        booking = Booking(
            mentor_id=mentor.id,
            mentee_id='some_mentee',
            start_time=datetime.now(),
            end_time=datetime.now() + timedelta(hours=1)
        )
        booking.save()
        
        booking_id = booking.id
        
        # Delete mentor (bookings should cascade)
        mentor.delete()
        
        # Verify booking is deleted
        assert Booking.objects(id=booking_id).count() == 0
```

---

## Deployment Testing

### Local Docker Testing

#### Docker Compose Validation

```bash
# 1. Verify Docker Compose syntax
docker-compose config

# 2. Build all services
docker-compose build

# 3. Start services
docker-compose up -d

# 4. Verify services are running
docker ps

# Expected output:
# - frontend (React on port 3000)
# - backend (Flask on port 5000)
# - mongodb (MongoDB on port 27017)

# 5. Check service logs
docker-compose logs frontend -f
docker-compose logs backend -f
docker-compose logs mongodb -f

# 6. Verify connectivity
curl http://localhost:3000          # Frontend
curl http://localhost:5000/api/health  # Backend health check
```

#### Health Check Tests

```bash
# 1. Frontend health check
curl -i http://localhost:3000
# Expected: HTTP 200 OK

# 2. Backend health check
curl -i http://localhost:5000/api/health
# Expected: HTTP 200 {"status": "ok"}

# 3. Database connectivity check
docker exec mongodb-local mongosh --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }

# 4. API endpoint tests
curl -X GET http://localhost:5000/api/users
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

### Render Deployment Testing

#### Pre-Deployment Checklist

```
□ All code committed to GitHub
□ Environment variables configured in Render dashboard
□ MongoDB Atlas connection string verified
□ Firebase credentials configured
□ Docker images built successfully locally
□ All tests passing
□ No hardcoded secrets in code or config files
□ .env files in .gitignore
□ README and documentation updated
```

#### Render Deployment Steps

```bash
# 1. Push code to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main

# 2. Create backend service on Render
# - Service Type: Web Service
# - Runtime: Docker
# - Repository: Your GitHub repo
# - Build Command: (leave empty, uses Dockerfile)
# - Start Command: gunicorn -b 0.0.0.0:$PORT -w 4 -t 120 app_factory:app
# - Environment Variables:
#   - FLASK_ENV=production
#   - MONGODB_URI=<your_mongodb_atlas_connection_string>
#   - FIREBASE_CONFIG=<your_firebase_config>

# 3. Create frontend service on Render
# - Service Type: Web Service
# - Runtime: Docker
# - Repository: Your GitHub repo
# - Build Command: (leave empty, uses Dockerfile)
# - Start Command: nginx -g 'daemon off;'
# - Environment Variables:
#   - REACT_APP_API_URL=<backend_render_url>
#   - NODE_ENV=production
```

#### Post-Deployment Verification

```bash
# 1. Verify backend service
curl https://your-backend-service.onrender.com/api/health
# Expected: {"status": "ok"}

# 2. Verify frontend service
curl https://your-frontend-service.onrender.com/
# Expected: HTML content with React app

# 3. Test API endpoints
curl https://your-backend-service.onrender.com/api/users

# 4. Monitor service logs
# Visit Render dashboard > Service > Logs tab

# 5. Check build logs
# Visit Render dashboard > Service > Build logs tab

# 6. Monitor resource usage
# Visit Render dashboard > Metrics tab
```

---

## Performance Testing

### Load Testing

#### Backend Load Testing with Apache Bench
```bash
# Install Apache Bench (if not available)
# Windows: download from Apache.org
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test endpoint with 100 concurrent requests
ab -n 1000 -c 100 http://localhost:5000/api/users

# Expected metrics:
# - Requests per second > 100
# - Mean time per request < 100ms
# - Failed requests = 0
```

#### Load Testing with Locust
```python
# locustfile.py
from locust import HttpUser, task, constant

class BookingUser(HttpUser):
    wait_time = constant(1)
    
    @task
    def create_booking(self):
        self.client.post(
            "/api/bookings",
            json={
                "mentorId": "mentor1",
                "menteeId": "mentee1",
                "startTime": "2025-11-15T10:00:00",
                "endTime": "2025-11-15T11:00:00"
            },
            headers={"Authorization": "Bearer test_token"}
        )
    
    @task
    def get_bookings(self):
        self.client.get("/api/bookings")
    
    @task
    def get_user(self):
        self.client.get("/api/users/profile")
```

```bash
# Run load test
locust -f locustfile.py --host=http://localhost:5000 --users=50 --spawn-rate=5 --run-time=5m
```

### Database Performance Testing

```python
# tests/test_performance.py
import time
import pytest
from models.booking import Booking
from models.user import User

def test_booking_query_performance():
    """Test booking query performance"""
    # Create test data
    for i in range(1000):
        booking = Booking(
            mentor_id=f'mentor_{i % 10}',
            mentee_id=f'mentee_{i}',
            start_time=datetime.now(),
            end_time=datetime.now() + timedelta(hours=1)
        )
        booking.save()
    
    # Measure query time
    start = time.time()
    bookings = Booking.objects(mentor_id='mentor_0').limit(100)
    list(bookings)  # Force evaluation
    duration = time.time() - start
    
    # Should complete in < 100ms
    assert duration < 0.1

def test_user_search_performance():
    """Test user search performance"""
    start = time.time()
    users = User.objects(role='mentor').limit(100)
    list(users)
    duration = time.time() - start
    
    assert duration < 0.1
```

---

## Security Testing

### Authentication & Authorization

#### Security Test Cases
```python
# tests/test_security.py
import pytest

class TestAuthenticationSecurity:
    def test_password_not_stored_plaintext(self):
        """Verify passwords are hashed"""
        user = User(email='test@example.com', role='mentee')
        user.set_password('mypassword123')
        
        # Password should never be stored plaintext
        assert user.password_hash != 'mypassword123'
        assert user.check_password('mypassword123')
        assert not user.check_password('wrongpassword')
    
    def test_sql_injection_prevention(self):
        """Test SQL injection prevention"""
        malicious_input = "'; DROP TABLE users; --"
        
        # Should safely handle malicious input
        users = User.objects(email=malicious_input)
        assert len(users) == 0
    
    def test_unauthorized_access_denied(self, client):
        """Test unauthorized access is denied"""
        response = client.get('/api/users/profile')
        assert response.status_code == 401
    
    def test_token_expiration(self, client, auth_token):
        """Test expired token is rejected"""
        # Simulate token expiration
        import time
        from unittest.mock import patch
        
        with patch('app.models.token_expired', return_value=True):
            response = client.get(
                '/api/users/profile',
                headers={'Authorization': f'Bearer {auth_token}'}
            )
            assert response.status_code == 401

class TestDataSecurity:
    def test_sensitive_data_not_exposed(self, client):
        """Verify sensitive data not in API responses"""
        response = client.get(
            '/api/users',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        # Should not contain password hashes
        for user in response.json:
            assert 'password_hash' not in user
            assert 'password' not in user
    
    def test_mongodb_connection_uses_tls(self):
        """Verify MongoDB connection uses TLS"""
        from app_factory import app
        
        config = app.config
        assert 'mongodb+srv://' in config['MONGODB_URI'] or 'replicaSet' in config['MONGODB_URI']

class TestInputValidation:
    def test_email_validation(self, client):
        """Test email format validation"""
        response = client.post('/api/auth/register', json={
            'email': 'invalid-email',
            'password': 'password123',
            'name': 'Test User',
            'role': 'mentee'
        })
        
        assert response.status_code == 400
    
    def test_password_strength_validation(self, client):
        """Test password strength requirements"""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',
            'password': '123',  # Too weak
            'name': 'Test User',
            'role': 'mentee'
        })
        
        assert response.status_code == 400
    
    def test_xss_prevention(self, client, auth_token):
        """Test XSS prevention in user input"""
        response = client.post(
            '/api/users/profile',
            json={
                'name': '<script>alert("xss")</script>',
            },
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        # Should sanitize or reject the input
        assert response.status_code in [400, 200]
        if response.status_code == 200:
            assert '<script>' not in response.json.get('name', '')
```

### API Security

```bash
# 1. Test HTTPS/TLS
curl -I https://your-api.onrender.com
# Should show SSL certificate info

# 2. Test CORS configuration
curl -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:5000/api/bookings

# 3. Test rate limiting
for i in {1..100}; do
  curl http://localhost:5000/api/users
done
# Should eventually get 429 Too Many Requests

# 4. Test security headers
curl -i http://localhost:5000/api/health
# Should include security headers like:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Strict-Transport-Security: max-age=31536000
```

---

## User Acceptance Testing

### User Workflows

#### Mentor Booking Workflow
1. Login with mentor credentials
2. View available time slots
3. Accept mentee booking requests
4. Confirm meeting details
5. Receive booking confirmation notification

#### Mentee Booking Workflow
1. Login with mentee credentials
2. Search for mentors by expertise
3. View mentor profiles
4. Request booking with preferred time slot
5. Receive booking confirmation
6. Access meeting link/details

### Test Cases
```
Test Case: UAT-001
Title: Mentor Login and Profile Setup
Steps:
1. Navigate to login page
2. Enter mentor credentials
3. Click login
4. Verify profile page loads
5. Update profile information
Expected Result: Profile updated successfully

Test Case: UAT-002
Title: Search for Mentors
Steps:
1. Login as mentee
2. Click "Find Mentor"
3. Enter search criteria (expertise: Python)
4. View search results
Expected Result: Mentor list displayed with filters applied

Test Case: UAT-003
Title: Create Booking
Steps:
1. Select mentor from list
2. Click "Book Session"
3. Select available time slot
4. Confirm booking
Expected Result: Booking confirmed, email sent
```

---

## Test Documentation

### Test Report Template

```markdown
# Test Execution Report
Date: [Date]
Tester: [Name]
Version: [Version]
Environment: [Environment]

## Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]
- Pass Rate: [%]

## Detailed Results
| Test ID | Test Case | Result | Notes |
|---------|-----------|--------|-------|
| T-001 | Login | PASS | |
| T-002 | Register | PASS | |
| T-003 | Booking | PASS | |

## Issues Found
1. Issue #1: [Description] - Severity: [High/Medium/Low]
2. Issue #2: [Description] - Severity: [High/Medium/Low]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Sign Off
Tester: _______ Date: _______
Manager: ______ Date: _______
```

---

## Defect Management

### Bug Tracking

```
Bug Report Template:
- ID: AUTO-GENERATED
- Title: Brief description
- Severity: Critical/High/Medium/Low
- Status: New/Open/In Progress/Fixed/Closed
- Description: Detailed description
- Steps to Reproduce: Step-by-step
- Expected Result: What should happen
- Actual Result: What actually happened
- Environment: Where it occurs
- Attachments: Screenshots, logs
- Assigned To: Developer
- Created Date: Auto
- Target Fix Date: Deadline
```

### Issue Resolution Process

1. **Report**: Tester discovers and reports issue
2. **Triage**: Manager categorizes severity and priority
3. **Assignment**: Issue assigned to developer
4. **Development**: Developer fixes the issue
5. **Testing**: Tester verifies fix
6. **Closure**: Issue closed once verified

---

## Test Execution Timeline

### Phase 1: Development Testing (Weeks 1-2)
- Unit testing of components
- Code review
- Local environment testing
- 90%+ code coverage target

### Phase 2: Integration Testing (Weeks 3-4)
- Frontend-Backend integration
- Database integration
- Third-party service integration
- API contract testing

### Phase 3: Staging Testing (Weeks 5-6)
- Render deployment testing
- Performance testing
- Security testing
- Failover and recovery testing

### Phase 4: User Acceptance Testing (Week 7)
- User workflow testing
- Business requirement validation
- Performance under realistic load
- Sign-off from stakeholders

### Phase 5: Production Deployment (Week 8)
- Final smoke testing
- Rollback procedures verified
- Production monitoring enabled
- Post-deployment testing

---

## Testing Best Practices

### Code Coverage
- Aim for minimum 80% code coverage
- Critical paths should have 100% coverage
- Use coverage tools: Jest (Frontend), pytest (Backend)

### Test Isolation
- Each test should be independent
- Use fixtures and mocks for dependencies
- Clean up test data after each run

### Continuous Integration
- Automated tests run on every commit
- Failed tests block merge to main branch
- Test results reported in pull requests

### Documentation
- Document test cases and expected results
- Maintain test data setup instructions
- Keep known issues documented

### Communication
- Regular test status updates
- Clear bug reports with reproducible steps
- Collaborative defect resolution

---

## Approval & Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Development Lead | | | |
| Project Manager | | | |
| Stakeholder | | | |

---

**Document End**
