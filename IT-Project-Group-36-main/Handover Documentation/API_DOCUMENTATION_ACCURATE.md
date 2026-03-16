# API Documentation - Networking Companion Platform

## 📖 Overview

This document describes all RESTful API endpoints for the Networking Companion platform based on the actual Flask implementation. The API handles user authentication, mentor profiles, time slot management, and appointment bookings.

**Base URL**: `https://it-project-group-36-backend.onrender.com/api`

**API Version**: 1.0  
**Last Updated**: November 5, 2025  
**Status**: Production Ready

---

## Table of Contents

1. [Users API](#users-api)
2. [Mentors API](#mentors-api)
3. [Appointments API](#appointments-api)
4. [Time Slots API](#time-slots-api)
5. [Authentication](#authentication)
6. [Error Codes](#error-codes)

---

## Users API

### 1. User Registration

**Endpoint**: `POST /api/users/register`

**Description**: Register a new user account

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "registered",
  "user_id": "507f1f77bcf86cd799439011"
}
```

**Error Responses**:
- `400`: Missing required fields
- `409`: Email or username already exists

---

### 2. User Login

**Endpoint**: `POST /api/users/login`

**Description**: Authenticate user with Firebase token

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "id-token": "firebase_id_token_here"
}
```

**Response** (200 OK):
```json
{
  "uid": "user_uid_from_firebase"
}
```

**Error Responses**:
- `400`: Invalid token format
- `401`: Invalid credentials

---

### 3. User Logout

**Endpoint**: `GET /api/users/logout`

**Description**: Logout current user and clear session

**Request Headers**:
```
(No special headers required)
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "logged out"
}
```

---

### 4. Get Current User Profile

**Endpoint**: `GET /api/users/me`

**Description**: Retrieve current authenticated user's profile

**Request Headers**:
```
Cookie: session=<session_id>
```

**Response** (200 OK):
```json
{
  "uid": "user_uid_123",
  "email": "user@example.com",
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "role": "mentee",
  "is_mentor": false,
  "created_at": "2025-11-05T08:19:40.000Z",
  "updated_at": "2025-11-05T10:30:00.000Z"
}
```

**Error Responses**:
- `400`: Not logged in or user not found
- `401`: Invalid session

---

### 5. Update User Profile

**Endpoint**: `PUT /api/users/me`

**Description**: Update current user's profile information

**Request Headers**:
```
Cookie: session=<session_id>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "newemail@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "updated"
}
```

**Error Responses**:
- `400`: No valid fields to update or user not found
- `401`: Not logged in
- `409`: Email already in use

---

### 6. Register as Mentor

**Endpoint**: `POST /api/users/register_as_mentor`

**Description**: Register current user as a mentor

**Request Headers**:
```
Cookie: session=<session_id>
Content-Type: application/json
```

**Request Body**:
```json
{
  "biography": "10+ years in software development",
  "field_of_expertise": "Web Development",
  "location": "San Francisco, CA",
  "available_time": []
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Registered as mentor successfully"
}
```

**Error Responses**:
- `400`: Missing required fields or user not logged in
- `401`: Not logged in
- `409`: User already registered as mentor

---

## Mentors API

### 1. Get All Mentors

**Endpoint**: `GET /api/mentors/`

**Description**: List all mentors with optional filtering

**Query Parameters**:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `field_of_expertise` | string | Filter by expertise | "Web Development" |
| `location` | string | Filter by location | "San Francisco" |
| `page` | integer | Page number (default: 1) | 1 |
| `page_size` | integer | Results per page (default: 20, max: 100) | 20 |

**Example Request**:
```
GET /api/mentors/?field_of_expertise=Web%20Development&location=San%20Francisco&page=1&page_size=20
```

**Response** (200 OK):
```json
[
  {
    "mentor_id": "507f1f77bcf86cd799439012",
    "uid": "user_uid_123",
    "name": "John Doe",
    "biography": "10+ years in software development",
    "field_of_expertise": "Web Development",
    "location": "San Francisco, CA",
    "created_at": "2025-11-05T08:19:40.000Z"
  }
]
```

**Error Responses**:
- `400`: Invalid parameters

---

### 2. Get Mentor Details

**Endpoint**: `GET /api/mentors/<mentor_id>`

**Description**: Get detailed information about a specific mentor including available time slots

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `mentor_id` | string | MongoDB ID of mentor |

**Response** (200 OK):
```json
{
  "mentor_id": "507f1f77bcf86cd799439012",
  "uid": "user_uid_123",
  "name": "John Doe",
  "biography": "10+ years in software development",
  "field_of_expertise": "Web Development",
  "location": "San Francisco, CA",
  "available_time": [
    {
      "start_time": "2025-11-10T14:00:00.000Z",
      "end_time": "2025-11-10T15:00:00.000Z",
      "status": "AVAILABLE"
    }
  ]
}
```

**Error Responses**:
- `400`: Invalid request
- `404`: Mentor not found

---

### 3. Get Current Mentor Profile

**Endpoint**: `GET /api/mentors/me`

**Description**: Get current authenticated user's mentor profile (mentor only)

**Request Headers**:
```
Cookie: session=<session_id>
```

**Response** (200 OK):
```json
{
  "mentor_id": "507f1f77bcf86cd799439012",
  "uid": "user_uid_123",
  "name": "John Doe",
  "biography": "10+ years in software development",
  "field_of_expertise": "Web Development",
  "location": "San Francisco, CA",
  "available_time": [
    {
      "start_time": "2025-11-10T14:00:00.000Z",
      "end_time": "2025-11-10T15:00:00.000Z",
      "status": "AVAILABLE"
    }
  ]
}
```

**Error Responses**:
- `400`: Bad request
- `401`: Not logged in
- `404`: Mentor profile not found

---

### 4. Update Mentor Profile

**Endpoint**: `PUT /api/mentors/me`

**Description**: Update current mentor's profile

**Request Headers**:
```
Cookie: session=<session_id>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "biography": "Updated biography",
  "field_of_expertise": "Python Development",
  "location": "New York, NY",
  "available_time": [
    {
      "start_time": "2025-11-15T14:00:00Z",
      "end_time": "2025-11-15T15:00:00Z",
      "status": "AVAILABLE"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Mentor profile updated successfully"
}
```

**Error Responses**:
- `400`: Bad request
- `401`: Not logged in
- `404`: Mentor profile not found

---

### 5. Register as Mentor (Alternative Endpoint)

**Endpoint**: `POST /api/mentors/register`

**Description**: Register current user as a mentor (alternative endpoint)

**Request Headers**:
```
Cookie: session=<session_id>
Content-Type: application/json
```

**Request Body**:
```json
{
  "id-token": "firebase_id_token_here",
  "biography": "10+ years in software development",
  "field_of_expertise": "Web Development",
  "city": "San Francisco, CA"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "registered"
}
```

**Error Responses**:
- `400`: Missing required fields
- `409`: User already registered as mentor

---

## Appointments API

### 1. Create Appointment

**Endpoint**: `POST /api/appointments/`

**Description**: Book an appointment with a mentor

**Request Headers**:
```
Cookie: session=<session_id>
Content-Type: application/json
```

**Request Body**:
```json
{
  "mentor_id": "507f1f77bcf86cd799439012",
  "start_time": "2025-11-10T14:00:00Z",
  "end_time": "2025-11-10T15:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "created",
  "appointment_id": "507f1f77bcf86cd799439013"
}
```

**Error Responses**:
- `400`: Missing fields or invalid time format
- `401`: Not logged in
- `404`: Mentor not found
- `409`: Time slot conflict or not available

---

### 2. Get Current User's Appointments

**Endpoint**: `GET /api/appointments/`

**Description**: List all appointments for current user

**Request Headers**:
```
Cookie: session=<session_id>
```

**Response** (200 OK):
```json
[
  {
    "appointment_id": "507f1f77bcf86cd799439013",
    "mentor_id": "507f1f77bcf86cd799439012",
    "user_id": "user_uid_123",
    "mentor_name": "John Doe",
    "start_time": "2025-11-10T14:00:00.000Z",
    "end_time": "2025-11-10T15:00:00.000Z",
    "status": "SUBMITTED",
    "created_at": "2025-11-05T08:19:40.000Z"
  }
]
```

**Error Responses**:
- `400`: Bad request
- `401`: Not logged in

---

### 3. Get User's Appointments (by UID)

**Endpoint**: `GET /api/appointments/<user_id>`

**Description**: Get appointments for a specific user

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User UID |

**Request Headers**:
```
Cookie: session=<session_id>
```

**Response** (200 OK):
```json
[
  {
    "appointment_id": "507f1f77bcf86cd799439013",
    "mentor_id": "507f1f77bcf86cd799439012",
    "user_id": "user_uid_123",
    "mentor_name": "John Doe",
    "start_time": "2025-11-10T14:00:00.000Z",
    "end_time": "2025-11-10T15:00:00.000Z",
    "status": "SUBMITTED",
    "created_at": "2025-11-05T08:19:40.000Z"
  }
]
```

**Error Responses**:
- `400`: Bad request
- `401`: Not logged in
- `404`: User not found

---

### 4. Cancel Appointment

**Endpoint**: `DELETE /api/appointments/<appointment_id>`

**Description**: Cancel an existing appointment

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `appointment_id` | string | Appointment/Booking ID |

**Request Headers**:
```
Cookie: session=<session_id>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "cancelled"
}
```

**Error Responses**:
- `400`: Cannot cancel in current status
- `401`: Not logged in
- `403`: Not authorized to cancel this appointment
- `404`: Appointment not found

---

### 5. Get Mentor's Appointments

**Endpoint**: `GET /api/mentor/`

**Description**: Get all appointments for current mentor

**Request Headers**:
```
Cookie: session=<session_id>
```

**Response** (200 OK):
```json
[
  {
    "appointment_id": "507f1f77bcf86cd799439013",
    "mentor_id": "507f1f77bcf86cd799439012",
    "user_id": "user_uid_123",
    "mentor_name": "John Doe",
    "start_time": "2025-11-10T14:00:00.000Z",
    "end_time": "2025-11-10T15:00:00.000Z",
    "status": "SUBMITTED",
    "created_at": "2025-11-05T08:19:40.000Z"
  }
]
```

**Error Responses**:
- `400`: Bad request
- `401`: Not logged in
- `404`: Mentor not found

---

## Time Slots API

### 1. Create Time Slot

**Endpoint**: `POST /api/timeslots/`

**Description**: Create an available time slot for current mentor

**Request Headers**:
```
Cookie: session=<session_id>
Content-Type: application/json
```

**Request Body**:
```json
{
  "start_time": "2025-11-15T14:00:00Z",
  "end_time": "2025-11-15T15:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "new time slot created"
}
```

**Error Responses**:
- `400`: User not registered as mentor or invalid time format
- `401`: Not logged in
- `409`: Time slots cannot overlap

---

### 2. Get Time Slots

**Endpoint**: `GET /api/timeslots/`

**Description**: List available time slots for current mentor

**Request Headers**:
```
Cookie: session=<session_id>
```

**Response** (200 OK):
```json
[
  {
    "appointment_id": "507f1f77bcf86cd799439014",
    "mentor_id": "user_uid_123",
    "mentor_name": "John Doe",
    "start_time": "2025-11-15T14:00:00.000Z",
    "end_time": "2025-11-15T15:00:00.000Z",
    "status": "AVAILABLE"
  }
]
```

**Error Responses**:
- `401`: Not logged in

---

### 3. Delete Time Slot

**Endpoint**: `DELETE /api/timeslots/<appointment_id>`

**Description**: Delete or cancel a time slot

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `appointment_id` | string | Time slot or booking ID |

**Request Headers**:
```
Cookie: session=<session_id>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "cancelled"
}
```

**Error Responses**:
- `400`: Bad request
- `401`: Not logged in

---

## Authentication

### Session-Based Authentication

The API uses Flask session cookies for authentication. When a user logs in successfully, a session cookie is created and must be sent with subsequent requests.

**How it works**:
1. User logs in with `POST /api/users/login`
2. Server verifies Firebase ID token
3. Session is created and cookie is set
4. Include session cookie in subsequent requests

**Session Cookie**:
```
Cookie: session=<session_id>
```

### Protected Endpoints

The following endpoints require authentication (session cookie):
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/users/register_as_mentor`
- `GET /api/mentors/me`
- `PUT /api/mentors/me`
- `POST /api/appointments/`
- `GET /api/appointments/`
- `DELETE /api/appointments/<appointment_id>`
- `GET /api/timeslots/`
- `POST /api/timeslots/`
- `DELETE /api/timeslots/<appointment_id>`

---

## Error Codes

### Standard HTTP Status Codes

| Status Code | Description |
|------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input or missing required fields |
| 401 | Unauthorized - Invalid/missing authentication |
| 403 | Forbidden - No permission for this resource |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Data conflict (e.g., duplicate email, overlapping time slots) |

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Or with additional details:

```json
{
  "error": "Error code",
  "message": "Human readable message"
}
```

---

## Key Points

1. **Authentication**: All requests requiring authentication must include a valid session cookie
2. **Time Format**: All timestamps use ISO 8601 format with UTC timezone (e.g., "2025-11-10T14:00:00Z")
3. **Pagination**: List endpoints support `page` and `page_size` parameters
4. **CORS**: API supports CORS for all origins
5. **Database**: Uses MongoDB with mongoengine ORM

---

## API Status Endpoints

### Health Check

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "ok"
}
```

### API Documentation

**Endpoint**: `GET /api/docs/`

**Description**: Interactive Swagger UI documentation

---

**Last Updated**: November 5, 2025  
**Version**: 1.0  
**Status**: Production Ready
