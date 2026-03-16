import json
from http import HTTPStatus

import pytz
from bson import ObjectId
from flask import request, abort
from flask_restx import Namespace, Resource, fields
from mongoengine import connect, disconnect

from flask_login import current_user

from controllers.auth_decorator import require_auth
from db_models import User, Mentor, Booking
from .helper import *

logger = logging.getLogger(__name__)

time_slots_ns = Namespace('timeslots', description='Time slot management operations')

# Request/Response models
create_timeslot_model = time_slots_ns.model('CreateTimeSlot', {
    'start_time': fields.String(required=True, description='Start time (ISO format)'),
    'end_time': fields.String(required=True, description='End time (ISO format)'),
    'location': fields.String(required=True, description='Location')
})

timeslot_response_model = time_slots_ns.model('TimeSlot', {
    'appointment_id': fields.String(description='Time slot ID'),
    'mentor_id': fields.String(description='Mentor ID'),
    'mentor_name': fields.String(description='Mentor name'),
    'start_time': fields.String(description='Start time'),
    'end_time': fields.String(description='End time'),
    'location': fields.String(description='Location'),
    'status': fields.String(description='Time slot status')
})


@time_slots_ns.route('/')
class TimeSlotList(Resource):
    @time_slots_ns.doc(description='List available time slots', security='session')
    @require_auth()
    @time_slots_ns.response(HTTPStatus.OK, 'Time slots retrieved', [timeslot_response_model])
    @time_slots_ns.response(HTTPStatus.UNAUTHORIZED, 'Must be logged in')
    def get(self):
        try:
            # Checking if user is registered as mentor
            mentor = Mentor.objects(uid=current_user).first()

            # check if any of the existing timeslots clashes with the new time
            existing_time_slots = TimeSlots.objects(uid_mentor=mentor, status=AppointmentStatus.AVAILABLE)
            result = []

            for ts in existing_time_slots:
                mentee = ""
                if getattr(ts, 'status', None) == AppointmentStatus.SCHEDULED:
                    mentee = Booking.objects().get(time_slot=ts)['uid_mentee']
                    mentee = User.objects().get(uid=mentee)

                if ts.status == AppointmentStatus.AVAILABLE or ts.status == AppointmentStatus.SCHEDULED:
                    logger.debug(f"Time slot status: {ts.status}")
                    result.append({
                        'appointment_id': str(ts.id),
                        'mentor_id': current_user.uid,
                        'mentor_name': mentee.first_name if mentee != "" else "",
                        'start_time': ts.start_time.isoformat() if ts and ts.start_time else None,
                        'end_time': ts.end_time.isoformat() if ts and ts.end_time else None,
                        'status': ts.status.value if ts and getattr(ts, 'status', None) else None,
                    })

            print(result)
            
            return result, 200

        except NotLoggedInError:
            return {'success': False, 'message': 'Must be logged in'}, 401


@time_slots_ns.route('/')
class TimeSlotCreate(Resource):
    @time_slots_ns.doc(description='Create a new time slot', security='session')
    #@require_auth()
    @time_slots_ns.expect(create_timeslot_model)
    @time_slots_ns.response(HTTPStatus.CREATED, 'Time slot created successfully')
    @time_slots_ns.response(HTTPStatus.BAD_REQUEST, 'Invalid request or user not registered as mentor')
    @time_slots_ns.response(HTTPStatus.CONFLICT, 'Time slots cannot overlap')
    @time_slots_ns.response(HTTPStatus.UNAUTHORIZED, 'Must be logged in')
    def post(self):
        try:
            data = json.loads(request.get_json(force=True))

            start_time = data.get('start_time')
            end_time = data.get('end_time')
            location = data.get('location')

            # Checking if user is registered as mentor
            mentor = Mentor.objects(uid=current_user).first()
            if not mentor:
                logger.warning(f"User {current_user.id} is not registered as a mentor")
                return {'success': False, 'message': 'user must be registered as a mentor'}, 400

            try:
                start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            except ValueError:
                return {'success': False, 'message': 'invalid time format'}, 400

            # check if any of the existing timeslots clashes with the new time
            existing_time_slots = TimeSlots.objects(uid_mentor=mentor, status__in=[AppointmentStatus.AVAILABLE,
                                                                                   AppointmentStatus.SCHEDULED])
            new_time_slot = TimeSlots(uid_mentor=mentor, start_time=start_dt, end_time=end_dt, location = location)

            if not clash(new_time_slot, existing_time_slots):
                new_time_slot.save()
                return {'success': True, 'message': 'new time slot created'}, 201
            else:
                return {'success': False, 'message': 'time slots cannot overlap each other'}, 409
        except NotLoggedInError:
            return {'success': False, 'message': 'Must be logged in'}, 401


@time_slots_ns.route('/<string:appointment_id>')
class TimeSlotDelete(Resource):
    @time_slots_ns.doc(description='Delete or cancel a time slot', security='session')
    @require_auth()
    @time_slots_ns.response(HTTPStatus.OK, 'Time slot cancelled successfully')
    @time_slots_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def delete(self, appointment_id: str):
        try:
            booking = Booking.objects(id=ObjectId(appointment_id)).first()
            if not booking:
                slot = TimeSlots.objects(id=ObjectId(appointment_id)).first()
                if slot and getattr(slot, 'status', None) == AppointmentStatus.AVAILABLE:
                    logger.debug(f"Cancelling time slot {appointment_id}")
                    slot.status = AppointmentStatus.CANCELLED
                elif slot and getattr(slot, 'status', None) == AppointmentStatus.SCHEDULED:
                    slot.status = AppointmentStatus.AVAILABLE
                slot.save()
                return {'success': True, 'message': 'cancelled'}, 200

            try:
                slot = booking.time_slot
                if slot and getattr(slot, 'status', None) == AppointmentStatus.SCHEDULED:
                    slot.status = AppointmentStatus.AVAILABLE
                    slot.save()
            except Exception:
                pass

            # Delete booking record
            booking.delete()

            return {'success': True, 'message': 'cancelled'}, 200
        except Exception as e:
            abort(400, str(e))


def clash(new_time_slot, time_slots) -> bool:
    # check if new time slot overlaps with existing ones
    if not time_slots or len(time_slots) < 2:
        return False

    # sort by start time
    sorted_time_slots = sorted(time_slots, key=lambda appt: appt.start_time)

    # check for overlaps
    for i in range(len(sorted_time_slots)):
        current = sorted_time_slots[i]

        # check if overlaps
        if pytz.utc.localize(current.end_time) > new_time_slot.start_time:
            logger.debug(f"Time slot clash detected at index {i}")
            return True

    return False


if __name__ == "__main__":
    try:
        disconnect()
        uri = "mongodb+srv://Desmond:Desmond@networkingcompanion.gbnniue.mongodb.net/?retryWrites=true&w=majority&appName=NetworkingCompanion"
        connect(db='test', host=uri)
        time = TimeSlots(
            **{"uid_mentor": "68f0a7aba84c081a4206b28c", "location": "Remote", "start_time": datetime.now(),
               "end_time": datetime.now(), "status": "Available"})
        time.save()
        disconnect()
    except TypeError as e:
        logger.exception(f"Error in timeSlots test: {e}")
