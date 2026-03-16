# Database Schema Documentation - Networking Companion Platform

## 📋 Overview

This document describes the MongoDB database schema for the Networking Companion platform. It is based on the actual mongoengine models defined in `db_models.py`.

**Database**: MongoDB Atlas  
**Version**: 7.0  
**Connection**: Cloud-hosted on MongoDB Atlas  
**ORM**: MongoEngine  
**Last Updated**: November 5, 2025

---

## Table of Contents

1. [Collections Overview](#collections-overview)
2. [Detailed Collection Schemas](#detailed-collection-schemas)
3. [Enumerations](#enumerations)
4. [Relationships & References](#relationships--references)
5. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)

---

## Collections Overview

The database contains **4 main collections**:

| Collection | Purpose | Status |
|-----------|---------|--------|
| `user` | User accounts (mentees & mentors) | ✅ Active |
| `mentor` | Mentor profiles & details | ✅ Active |
| `time_slots` | Available and scheduled time slots | ✅ Active |
| `booking` | Appointment/booking records | ✅ Active |

---

## Detailed Collection Schemas

### 1. User Collection

Stores all user accounts (both mentees and mentors).

**Collection Name**: `user`

**MongoDB Document Structure**:
```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  email: String,                    // User email (unique, required)
  uid: String,                      // Firebase UID (unique, required)
  password_hash: String,            // Hashed password (optional)
  username: String,                 // Username (required)
  first_name: String,               // First name (max 50 chars, required)
  last_name: String,                // Last name (max 50 chars, required)
  role: String,                     // Enum: "Mentee" or "Mentor"
  created_at: Date,                 // Account creation timestamp
  updated_at: Date                  // Last update timestamp
}
```

**Field Details**:

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Yes | Yes | Auto-generated | MongoDB unique identifier |
| `email` | String | Yes | Yes | EmailField | User email address |
| `uid` | String | Yes | Yes | Firebase UID | Firebase authentication unique ID |
| `password_hash` | String | No | No | - | Bcrypt hashed password |
| `username` | String | Yes | No | - | Unique username |
| `first_name` | String | Yes | No | Max 50 | First name |
| `last_name` | String | Yes | No | Max 50 | Last name |
| `role` | String | No | No | Enum | Default: "Mentee", Options: "Mentee", "Mentor" |
| `created_at` | Date | Yes | No | Auto-set UTC | Account creation date (auto-set to utcnow) |
| `updated_at` | Date | Yes | No | Auto-set UTC | Last update date (auto-updated on save) |

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "john@example.com",
  "uid": "firebase_uid_12345",
  "password_hash": "$2b$12$K1sBt9QeKc.rKO2HqIl1pO...",
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "role": "Mentee",
  "created_at": ISODate("2025-11-05T08:19:40.000Z"),
  "updated_at": ISODate("2025-11-05T10:30:00.000Z")
}
```

**Indexes Required**:
```javascript
db.user.createIndex({ email: 1 }, { unique: true })
db.user.createIndex({ uid: 1 }, { unique: true })
db.user.createIndex({ role: 1 })
db.user.createIndex({ created_at: -1 })
```

---

### 2. Mentor Collection

Stores mentor profile information linked to users.

**Collection Name**: `mentor`

**MongoDB Document Structure**:
```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  uid: ObjectId,                    // Reference to User collection (required)
  biography: String,                // Mentor biography
  field_of_expertise: String,       // Area of expertise (max 255 chars)
  city: String,                     // Location/city (max 50 chars)
  created_at: Date,                 // Profile creation date
  updated_at: Date                  // Last update date
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Auto-generated MongoDB ID |
| `uid` | ObjectId (Ref) | Yes | Foreign key to User collection |
| `biography` | String | No | Professional biography |
| `field_of_expertise` | String | No | Max 255 characters |
| `city` | String | No | Max 50 characters |
| `created_at` | Date | No | Creation timestamp |
| `updated_at` | Date | No | Last update timestamp |

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "uid": ObjectId("507f1f77bcf86cd799439011"),
  "biography": "10+ years in full-stack web development",
  "field_of_expertise": "Web Development",
  "city": "San Francisco",
  "created_at": ISODate("2025-11-05T08:19:40.000Z"),
  "updated_at": ISODate("2025-11-05T10:30:00.000Z")
}
```

**Indexes Required**:
```javascript
db.mentor.createIndex({ uid: 1 })
db.mentor.createIndex({ field_of_expertise: 1 })
db.mentor.createIndex({ city: 1 })
db.mentor.createIndex({ created_at: -1 })
```

---

### 3. TimeSlots Collection

Stores available and scheduled time slots for mentors.

**Collection Name**: `time_slots`

**MongoDB Document Structure**:
```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  uid_mentor: ObjectId,             // Reference to Mentor collection (required)
  start_time: Date,                 // Start time (required)
  end_time: Date,                   // End time (required)
  status: String,                   // Enum: "Available", "Scheduled", "Cancelled"
  created_at: Date,                 // Creation timestamp
  location: String                  // Meeting location
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Auto-generated MongoDB ID |
| `uid_mentor` | ObjectId (Ref) | Yes | Foreign key to Mentor collection |
| `start_time` | Date | Yes | ISO 8601 format |
| `end_time` | Date | Yes | Must be > start_time |
| `status` | String | No | Default: "Available", Options: "Available", "Scheduled", "Cancelled" |
| `created_at` | Date | No | Auto-set on creation |
| `location` | String | No | Physical or virtual meeting location |

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "uid_mentor": ObjectId("507f1f77bcf86cd799439012"),
  "start_time": ISODate("2025-11-15T14:00:00.000Z"),
  "end_time": ISODate("2025-11-15T15:00:00.000Z"),
  "status": "Available",
  "created_at": ISODate("2025-11-05T08:19:40.000Z"),
  "location": "Google Meet"
}
```

**Indexes Required**:
```javascript
db.time_slots.createIndex({ uid_mentor: 1 })
db.time_slots.createIndex({ start_time: 1 })
db.time_slots.createIndex({ status: 1 })
db.time_slots.createIndex({ uid_mentor: 1, status: 1 })
```

---

### 4. Booking Collection

Stores appointment/booking records between mentees and mentors.

**Collection Name**: `booking`

**MongoDB Document Structure**:
```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  time_slot: ObjectId,              // Reference to TimeSlots collection
  uid_mentee: String,               // Mentee user UID (Firebase UID)
  mentor_id: String,                // Mentor ID (string representation)
  status: String,                   // Enum: "Submitted", "Scheduled", "Cancelled"
  message: String,                  // Optional booking message
  created_at: Date                  // Booking creation timestamp
}
```

**Field Details**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Auto-generated MongoDB ID |
| `time_slot` | ObjectId (Ref) | No | Reference to TimeSlots |
| `uid_mentee` | String | No | Firebase UID of mentee |
| `mentor_id` | String | No | String representation of mentor ObjectId |
| `status` | String | No | Default: "Scheduled", Options: "Submitted", "Scheduled", "Cancelled" |
| `message` | String | No | Optional message from mentee |
| `created_at` | Date | No | Booking creation timestamp |

**Example Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "time_slot": ObjectId("507f1f77bcf86cd799439014"),
  "uid_mentee": "firebase_uid_mentee_123",
  "mentor_id": "507f1f77bcf86cd799439012",
  "status": "Submitted",
  "message": "Looking forward to our session",
  "created_at": ISODate("2025-11-05T08:19:40.000Z")
}
```

**Indexes Required**:
```javascript
db.booking.createIndex({ uid_mentee: 1 })
db.booking.createIndex({ mentor_id: 1 })
db.booking.createIndex({ status: 1 })
db.booking.createIndex({ time_slot: 1 })
db.booking.createIndex({ created_at: -1 })
```

---

## Enumerations

### UserRole Enum

| Value | Description |
|-------|-------------|
| "Mentee" | User is a mentee (student/learner) |
| "Mentor" | User is a mentor (instructor/expert) |

**Usage**: In `User.role` field

---

### AppointmentStatus Enum

| Value | Description |
|-------|-------------|
| "Submitted" | Booking request submitted (awaiting mentor response) |
| "Scheduled" | Time slot is scheduled/booked |
| "Cancelled" | Appointment/slot has been cancelled |
| "Available" | Time slot is available for booking |

**Usage**: 
- In `TimeSlots.status` field
- In `Booking.status` field

---

## Relationships & References

### Collection Relationships

```
┌─────────────────┐
│     USER        │
│                 │
│ _id: ObjectId   │
│ uid*: String    │
└────────┬────────┘
         │ (1:0..1)
         │
         v
┌─────────────────┐
│    MENTOR       │
│                 │
│ _id: ObjectId   │
│ uid: ObjectId→ USER
└────────┬────────┘
         │ (1:N)
         │
         v
┌─────────────────┐
│  TIME_SLOTS     │
│                 │
│ _id: ObjectId   │
│ uid_mentor→MENTOR
└────────┬────────┘
         │ (1:N)
         │
         v
┌─────────────────┐
│    BOOKING      │
│                 │
│ _id: ObjectId   │
│ time_slot→TS    │
│ uid_mentee: String
│ mentor_id: String
└─────────────────┘
```

### Detailed Relationships

1. **User → Mentor** (1:0..1)
   - One user can have 0 or 1 mentor profile
   - Relationship: `Mentor.uid` → `User._id`
   - Example: A mentee has no mentor profile, but a mentor user has one

2. **Mentor → TimeSlots** (1:N)
   - One mentor can have many time slots
   - Relationship: `TimeSlots.uid_mentor` → `Mentor._id`

3. **TimeSlots → Booking** (1:N)
   - One time slot can be referenced by many bookings
   - Relationship: `Booking.time_slot` → `TimeSlots._id`

4. **User → Booking** (1:N) - Indirect
   - One user (mentee) can have many bookings
   - Through `Booking.uid_mentee` → `User.uid`

---

## Data Types Summary

| Type | Description | Example |
|------|-------------|---------|
| ObjectId | MongoDB unique identifier | `ObjectId("507f1f77bcf86cd799439011")` |
| String | Text field | `"john@example.com"` |
| Date | ISO 8601 datetime | `ISODate("2025-11-05T08:19:40Z")` |
| Enum | Restricted string values | `"Mentee"` or `"Mentor"` |
| EmailField | Validated email | `"user@example.com"` |
| ReferenceField | Reference to another document | `ObjectId("...")` |

---

## Data Flow Example

### Booking a Mentor Session

```
1. User (mentee) logs in → Session created
   User: { uid: "firebase_123", role: "Mentee" }

2. Search for mentors
   Query: db.mentor.find({ field_of_expertise: "Web Development" })

3. View mentor details and available time slots
   Query: db.time_slots.find({ uid_mentor: mentor_id, status: "Available" })

4. Book appointment
   Create Booking:
   {
     time_slot: timeslot_id,
     uid_mentee: "firebase_123",
     mentor_id: "mentor_object_id_string",
     status: "Submitted"
   }

5. Update time slot status
   Update TimeSlots: { status: "Scheduled" }

6. Retrieve appointment
   Query: db.booking.find({ uid_mentee: "firebase_123" })
```

---

## Entity Relationship Diagram (ERD)

```
                    ┌──────────────────┐
                    │      USER        │
                    │                  │
                    │  _id (PK)        │
                    │  email (Unique)  │
                    │  uid (Unique)    │
                    │  username        │
                    │  first_name      │
                    │  last_name       │
                    │  role (Enum)     │
                    │  created_at      │
                    │  updated_at      │
                    └────────┬─────────┘
                             │ 1:0..1
                             │
                    ┌────────v──────────┐
                    │     MENTOR       │
                    │                  │
                    │  _id (PK)        │
                    │  uid (FK)→USER   │
                    │  biography       │
                    │  expertise       │
                    │  city            │
                    │  created_at      │
                    │  updated_at      │
                    └────────┬─────────┘
                             │ 1:N
                             │
                    ┌────────v──────────┐
                    │   TIME_SLOTS     │
                    │                  │
                    │  _id (PK)        │
                    │  uid_mentor(FK)  │
                    │  start_time      │
                    │  end_time        │
                    │  status (Enum)   │
                    │  location        │
                    │  created_at      │
                    └────────┬─────────┘
                             │ 1:N
                             │
                    ┌────────v──────────┐
                    │    BOOKING       │
                    │                  │
                    │  _id (PK)        │
                    │  time_slot(FK)   │
                    │  uid_mentee      │
                    │  mentor_id       │
                    │  status (Enum)   │
                    │  message         │
                    │  created_at      │
                    └──────────────────┘

Legend:
- PK: Primary Key
- FK: Foreign Key
- 1:N: One-to-Many relationship
- 1:0..1: One-to-Zero-or-One relationship
```

---

## Constraints & Validations

### User Collection Constraints
- `email`: Must be unique and valid email format
- `uid`: Must be unique (Firebase UID)
- `username`: Must be unique
- `first_name`, `last_name`: Maximum 50 characters, required
- `role`: Must be from UserRole enum

### Mentor Collection Constraints
- `uid`: Required reference to User
- `field_of_expertise`: Maximum 255 characters
- `city`: Maximum 50 characters

### TimeSlots Collection Constraints
- `start_time`: Required
- `end_time`: Required, must be > start_time
- `status`: Must be from AppointmentStatus enum

### Booking Collection Constraints
- `status`: Must be from AppointmentStatus enum

---

## Best Practices

1. **Always verify user exists** before creating mentor profile
2. **Check for overlapping time slots** before creating new slots
3. **Update status consistently** when booking or cancelling
4. **Use proper indexing** for frequently queried fields
5. **Handle timezone** conversions (all dates stored in UTC)
6. **Validate enums** before saving to database

---

## Migration Notes

### Current Version (1.0)
- 4 collections: User, Mentor, TimeSlots, Booking
- No embedded documents
- All relationships through references

### Future Considerations
- Add reviews/ratings collection
- Add notifications collection
- Add message/chat collection
- Consider denormalization for performance

---

**Last Updated**: November 5, 2025  
**Version**: 1.0  
**Status**: Production
