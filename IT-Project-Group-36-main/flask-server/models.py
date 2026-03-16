from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# User table
class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # User ID, Primary key, Auto increment
    username = db.Column(db.String(255), unique=True, nullable=False)  # Username, Unique
    email = db.Column(db.String(255), unique=True, nullable=False)  # User's email, Unique
    password_hash = db.Column(db.String(255), nullable=False)  # Password hash
    first_name = db.Column(db.String(100), nullable=False)  # User's first name
    last_name = db.Column(db.String(100), nullable=False)  # User's last name
    role = db.Column(db.Enum('User', 'Mentor', name='user_roles'), nullable=False)  # User's role (User or Mentor)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Account creation timestamp
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)  # Last update timestamp

    def __repr__(self):
        return f'<User {self.username}>'


# Mentor table
class Mentor(db.Model):
    __tablename__ = 'mentors'

    mentor_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Mentor ID, Primary key, Auto increment
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # Foreign key from User table
    biography = db.Column(db.Text, nullable=True)  # Mentor's biography (work experience, education, etc.)
    field_of_expertise = db.Column(db.String(255), nullable=True)  # Mentor's field of expertise
    location = db.Column(db.String(255), nullable=True)  # Mentor's location (e.g., remote, city)
    available_time = db.Column(db.Text, nullable=True)  # Available time slots for mentoring
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Mentor's registration timestamp

    user = db.relationship('User', back_populates='mentor', uselist=False)  # Relationship to User table

    def __repr__(self):
        return f'<Mentor {self.user.username}>'


# One-to-one relationship between User and Mentor
User.mentor = db.relationship('Mentor', back_populates='user', uselist=False)


# Appointment table
class Appointment(db.Model):
    __tablename__ = 'appointments'

    appointment_id = db.Column(db.Integer, primary_key=True,
                               autoincrement=True)  # Appointment ID, Primary key, Auto increment
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # Foreign key from User table
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.mentor_id'),
                          nullable=False)  # Foreign key from Mentor table
    start_time = db.Column(db.DateTime, nullable=False)  # Appointment start time
    end_time = db.Column(db.DateTime, nullable=False)  # Appointment end time
    status = db.Column(db.Enum('Scheduled', 'Cancelled', 'Completed', name='appointment_status'),
                       default='Scheduled')  # Appointment status (Scheduled, Cancelled, Completed)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Appointment creation timestamp

    user = db.relationship('User', backref='appointments')  # Relationship to User table
    mentor = db.relationship('Mentor', backref='appointments')  # Relationship to Mentor table

    def __repr__(self):
        return f'<Appointment {self.appointment_id}>'


# Notification table
class Notification(db.Model):
    __tablename__ = 'notifications'

    notification_id = db.Column(db.Integer, primary_key=True,
                                autoincrement=True)  # Notification ID, Primary key, Auto increment
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # Foreign key from User table
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.mentor_id'),
                          nullable=False)  # Foreign key from Mentor table
    message = db.Column(db.Text, nullable=False)  # Notification message content
    status = db.Column(db.Enum('Unread', 'Read', name='notification_status'),
                       default='Unread')  # Notification status (Unread, Read)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Notification creation timestamp

    user = db.relationship('User', backref='notifications')  # Relationship to User table
    mentor = db.relationship('Mentor', backref='notifications')  # Relationship to Mentor table

    def __repr__(self):
        return f'<Notification {self.notification_id}>'


# Mentor schedule table
class MentorSchedule(db.Model):
    __tablename__ = 'mentor_schedule'

    schedule_id = db.Column(db.Integer, primary_key=True,
                            autoincrement=True)  # Schedule ID, Primary key, Auto increment
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.mentor_id'),
                          nullable=False)  # Foreign key from Mentor table
    start_time = db.Column(db.DateTime, nullable=False)  # Mentor's available start time
    end_time = db.Column(db.DateTime, nullable=False)  # Mentor's available end time
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Schedule creation timestamp

    mentor = db.relationship('Mentor', backref='schedule')  # Relationship to Mentor table

    def __repr__(self):
        return f'<MentorSchedule {self.schedule_id}>'

from mongoengine import Document, StringField

class UserModel(Document):
    meta = {"collection": "users"}  # MongoDB 集合名
    name  = StringField(required=True, unique=True, max_length=80)
    email = StringField(required=True, unique=True, max_length=80)

    def __repr__(self):
        return f"User(name={self.name}, email={self.email})"
