import logging

from datetime import datetime
from enum import Enum

from flask_login import UserMixin

from mongoengine import StringField, Document, DateTimeField, ReferenceField, EmailField, EnumField, connect
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

logger = logging.getLogger(__name__)

uri = "mongodb+srv://Desmond:Desmond@networkingcompanion.gbnniue.mongodb.net/?retryWrites=true&w=majority&appName=NetworkingCompanion"

client = MongoClient(uri, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    logger.info("Connected to MongoDB")
except Exception as e:
    logger.exception("Error connecting to MongoDB")

connect(host=uri, alias='default')


class UserRole(Enum):
    MENTEE = "Mentee"
    MENTOR = "Mentor"


class AppointmentStatus(Enum):
    SUBMITTED = 'Submitted'
    SCHEDULED = 'Scheduled'
    CANCELLED = 'Cancelled'
    AVAILABLE = 'Available'


class User(Document, UserMixin):
    email = EmailField(required=True, unique=True)
    uid = StringField(required=True, unique=True)
    password_hash = StringField()
    username = StringField(required=True)
    first_name = StringField(max_length=50, required=True)
    last_name = StringField(max_length=50, required=True)
    role = EnumField(UserRole, default=UserRole.MENTEE)
    is_active = True
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        if not self.created_at:
            self.created_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def get_id(self):
        return self.uid


class Mentor(Document):
    uid = ReferenceField(User)
    biography = StringField()
    field_of_expertise = StringField(max_length=255)
    city = StringField(max_length=50)
    created_at = DateTimeField()
    updated_at = DateTimeField()


class TimeSlots(Document):
    uid_mentor = ReferenceField(Mentor)
    start_time = DateTimeField(required=True)
    end_time = DateTimeField(required=True)
    status = EnumField(AppointmentStatus, default=AppointmentStatus.AVAILABLE)
    created_at = DateTimeField()
    location = StringField()


class Booking(Document):
    time_slot = ReferenceField(TimeSlots)
    message = StringField()
    uid_mentee = StringField()
    mentor_id = StringField()
    status = EnumField(AppointmentStatus, default=AppointmentStatus.SCHEDULED)
    created_at = DateTimeField()
