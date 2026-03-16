import logging

from flask import session
from mongoengine import Document
from mongoengine.queryset.visitor import Q
from datetime import datetime
from db_models import TimeSlots, AppointmentStatus

logger = logging.getLogger(__name__)


class NotLoggedInError(Exception):
    def __init__(self, message="User is not logged in"):
        self.message = message
        super().__init__(self.message)


def get_uid() -> str:
    # get uid from session
    try:
        if 'uid' in session:
            uid = session['uid']
            return uid
        else:
            raise NotLoggedInError
    except Exception as e:
        raise Exception("Must be logged in")


def requiredCheck(cls_arg: Document, data: dict) -> list:
    # check if all required fields are in data
    # returns list of missing required fields
    required = [field_name for field_name, field_obj in cls_arg._fields.items() if field_obj.required]
    missing = [k for k in required if k not in data or not str(data[k]).strip()]
    return missing


def uniquenessCheck(cls_arg: Document, data: dict) -> list:
    # check if any unique fields already exist in db
    unique = [field_name for field_name, field_obj in cls_arg._fields.items() if field_obj.unique]

    criteria = {u: data[u] for u in unique}

    query = Q()
    for field, value in criteria.items():
        query |= Q(**{field: value})

    matching_users = cls_arg.objects(query)

    return matching_users


def create_time_slots(mentor, available_time, default_location=None, clear_existing=False):
    # create time slots from available_time list
    if not available_time or not isinstance(available_time, list):
        return 0

    # delete existing available slots if needed
    if clear_existing:
        existing_slots = TimeSlots.objects(
            uid_mentor=mentor,
            status=AppointmentStatus.AVAILABLE
        )
        existing_slots.delete()

    created_count = 0
    for slot_data in available_time:
        try:
            start_time_str = slot_data.get('start_time')
            end_time_str = slot_data.get('end_time')

            if not start_time_str or not end_time_str:
                continue

            # parse datetime
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))

            # create slot
            time_slot_data = {
                'uid_mentor': mentor,
                'start_time': start_time,
                'end_time': end_time,
                'status': AppointmentStatus.AVAILABLE,
                'created_at': datetime.utcnow()
            }
            time_slot = TimeSlots(**time_slot_data)
            time_slot.save()
            created_count += 1
        except (ValueError, KeyError) as e:
            logger.exception(f"Error creating time slot: {e}")
            continue

    return created_count
