import logging

from http import HTTPStatus

from flask_login import current_user
from flask import request, abort, session
from datetime import datetime
from flask_restx import Namespace, Resource, fields
from mongoengine import ValidationError

from controllers.helper import get_uid
from db_models import Booking, TimeSlots, AppointmentStatus, User, Mentor
from controllers.auth_decorator import require_auth

logger = logging.getLogger(__name__)

appointments_ns = Namespace('appointments', description='Appointment booking operations')

# Request/Response models
create_appointment_model = appointments_ns.model('CreateAppointment', {
    'mentor_id': fields.String(required=True, description='Mentor ID'),
    'start_time': fields.String(required=True, description='Start time (ISO format)'),
    'end_time': fields.String(required=True, description='End time (ISO format)')
})

appointment_response_model = appointments_ns.model('Appointment', {
    'appointment_id': fields.String(description='Appointment ID'),
    'mentor_id': fields.String(description='Mentor ID'),
    'user_id': fields.String(description='User ID'),
    'mentor_name': fields.String(description='Mentor full name'),
    'start_time': fields.String(description='Start time'),
    'end_time': fields.String(description='End time'),
    'status': fields.String(description='Appointment status'),
    'created_at': fields.String(description='Creation timestamp')
})


def send_notification(user_id=None, mentor_id=None, notification_type='In-App', message=''):
    # send notification
    logger.info(
        f"Notification sent - Type: {notification_type}, To: user_id={user_id}, mentor_id={mentor_id}, Message: {message}")


@appointments_ns.route('/')
class AppointmentList(Resource):
    @appointments_ns.doc(description='List current student appointments', security='session')
    @appointments_ns.response(HTTPStatus.OK, 'Appointment list retrieved', [appointment_response_model])
    @appointments_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def get(self):
        try:
            bookings = list(Booking.objects(uid_mentee=current_user.uid).order_by('-created_at'))
            if not bookings:
                return [], 200

            mentor_ids = set()
            for b in bookings:
                mentor_id = getattr(b, 'mentor_id', None)
                if mentor_id:
                    mentor_ids.add(mentor_id)

            mentor_names_dict = {}
            if mentor_ids:
                mentors = Mentor.objects(id__in=list(mentor_ids))
                for mentor in mentors:
                    if mentor.uid:
                        user_obj = mentor.uid
                        if isinstance(user_obj, User):
                            parts = [p for p in [user_obj.first_name, user_obj.last_name] if p]
                            mentor_names_dict[str(mentor.id)] = ' '.join(parts) if parts else user_obj.username

            result = []
            for b in bookings:
                ts = b.time_slot
                mentor_id = getattr(b, 'mentor_id', None)
                mentor_name = mentor_names_dict.get(mentor_id) if mentor_id else None

                result.append({
                    'appointment_id': str(b.id),
                    'mentor_id': mentor_id,
                    'user_id': current_user.uid,
                    'mentor_name': mentor_name,
                    'start_time': ts.start_time.isoformat() if ts and ts.start_time else None,
                    'end_time': ts.end_time.isoformat() if ts and ts.end_time else None,
                    'status': b.status.value if getattr(b, 'status', None) else (
                        ts.status.value if ts and getattr(ts, 'status', None) else None),
                    'created_at': b.created_at.isoformat() if getattr(b, 'created_at', None) else None,
                })
            return result, 200
        except Exception as e:
            logger.exception("Error in appointment list")
            abort(400, str(e))


@appointments_ns.route('/')
class AppointmentCreate(Resource):
    @appointments_ns.doc(description='Create a new appointment', security='session')
    @appointments_ns.response(HTTPStatus.CREATED, 'Appointment created successfully')
    @appointments_ns.response(HTTPStatus.BAD_REQUEST, 'Invalid request or missing fields')
    @appointments_ns.response(HTTPStatus.UNAUTHORIZED, 'Authentication required')
    def post(self):
        try:
            data = request.get_json(force=True) 

            slot = TimeSlots.objects(id = data['appointment_id'], status = AppointmentStatus.AVAILABLE).first()

            # get mentor

            if not slot:
                return {'success': False, 'message': 'mentor not available for the requested time range'}, 400

            # mark slot as scheduled
            slot.status = AppointmentStatus.SCHEDULED
            slot.save()

            booking = Booking(
                time_slot=slot,
                uid_mentee=current_user.uid,
                mentor_id=str(slot.uid_mentor.id),
                status=AppointmentStatus.SUBMITTED
            )
            booking.save()

            # notify mentor
            # send_notification(
            #     mentor_id=mentor_id,
            #     notification_type='In-App',
            #     message=f'New appointment request for {start_time} to {end_time}'
            # )

            # notify user
            # send_notification(
            #     user_id=uid,
             #     notification_type='In-App',
            #     message=f'Appointment created with mentor for {start_time} to {end_time}'
            # )

            return {'success': True, 'message': 'created', 'appointment_id': str(booking.id)}, 201
        except (ValidationError, Exception) as e:
            print(e)
            abort(400, str(e))


@appointments_ns.route('/<string:appointment_id>')
class AppointmentCancel(Resource):
    @appointments_ns.doc(description='Cancel an appointment', security='session')
    @appointments_ns.response(HTTPStatus.OK, 'Appointment cancelled successfully')
    @appointments_ns.response(HTTPStatus.NOT_FOUND, 'Appointment not found')
    @appointments_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def delete(self, appointment_id: str):
        try:
            uid = get_uid()
            booking = Booking.objects(id=appointment_id).first()
            if not booking:
                return {'success': False, 'message': 'appointment not found'}, 404

            # check if appointment belongs to user
            if booking.uid_mentee != uid:
                return {'success': False, 'message': 'Not authorized to cancel this appointment'}, 403

            # only submitted/scheduled can be cancelled
            if booking.status not in [AppointmentStatus.SUBMITTED, AppointmentStatus.SCHEDULED]:
                return {'success': False, 'message': 'Appointment cannot be cancelled in current status'}, 400

            try:
                slot = booking.time_slot
                if slot and getattr(slot, 'status', None) == AppointmentStatus.SCHEDULED:
                    slot.status = AppointmentStatus.AVAILABLE
                    slot.save()
            except Exception:
                pass

            # get user and mentor info
            user_id = booking.uid_mentee
            slot = booking.time_slot
            mentor_id = None
            if slot and slot.uid_mentor:
                mentor_id = str(slot.uid_mentor.id)

            # delete booking
            booking.delete()

            # notify mentor
            if mentor_id:
                send_notification(
                    mentor_id=mentor_id,
                    notification_type='In-App',
                    message=f'Appointment cancelled by user'
                )

            # notify user
            send_notification(
                user_id=user_id,
                notification_type='In-App',
                message=f'Appointment cancelled successfully'
            )

            return {'success': True, 'message': 'cancelled'}, 200
        except Exception as e:
            abort(400, str(e))


@appointments_ns.route('/<string:user_id>')
class UserAppointments(Resource):
    @appointments_ns.doc(description='Get appointments for a specific user', security='session')
    @require_auth()
    @appointments_ns.response(HTTPStatus.OK, 'User appointments retrieved', [appointment_response_model])
    @appointments_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def get(self, user_id: str):
        try:
            user = User.objects(uid=user_id).first()
            if not user:
                return {'success': False, 'message': 'User not found'}, 404

            bookings = list(Booking.objects(uid_mentee=user_id).order_by('-created_at'))
            if not bookings:
                return [], 200

            mentor_ids = set()
            for b in bookings:
                mentor_id = getattr(b, 'mentor_id', None)
                if mentor_id:
                    mentor_ids.add(mentor_id)

            mentor_names_dict = {}
            if mentor_ids:
                mentors = Mentor.objects(id__in=list(mentor_ids))
                for mentor in mentors:
                    if mentor.uid:
                        user_obj = mentor.uid
                        if isinstance(user_obj, User):
                            parts = [p for p in [user_obj.first_name, user_obj.last_name] if p]
                            mentor_names_dict[str(mentor.id)] = ' '.join(parts) if parts else user_obj.username

            result = []
            for b in bookings:
                ts = b.time_slot
                if not ts:
                    continue

                mentor_id = getattr(b, 'mentor_id', None)
                mentor_name = mentor_names_dict.get(mentor_id) if mentor_id else None

                result.append({
                    'appointment_id': str(b.id),
                    'mentor_id': mentor_id,
                    'user_id': user_id,
                    'mentor_name': mentor_name,
                    'start_time': ts.start_time.isoformat() if ts.start_time else None,
                    'end_time': ts.end_time.isoformat() if ts.end_time else None,
                    'status': b.status.value if getattr(b, 'status', None) else (
                        ts.status.value if getattr(ts, 'status', None) else None),
                    'created_at': b.created_at.isoformat() if getattr(b, 'created_at', None) else None,
                })

            return result, 200
        except Exception as e:
            logger.exception("Error in appointment list")
            abort(400, str(e))


@appointments_ns.route('/mentor')
class MentorAppointments(Resource):
    @appointments_ns.doc(description='Get appointments for the current mentor', security='session')
    @require_auth()
    @appointments_ns.response(HTTPStatus.OK, 'Mentor appointments retrieved', [appointment_response_model])
    @appointments_ns.response(HTTPStatus.NOT_FOUND, 'Mentor not found')
    @appointments_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def get(self):
        try:
            uid = get_uid()
            user = User.objects(uid=uid).first()
            if not user:
                return {'success': False, 'message': 'User not found'}, 404

            mentor = Mentor.objects(uid=user).first()
            if not mentor:
                return {'success': False, 'message': 'User is not a mentor'}, 404

            mentor_id = str(mentor.id)
            mentor_name = None
            if mentor.uid:
                user_obj = mentor.uid
                if isinstance(user_obj, User):
                    parts = [p for p in [user_obj.first_name, user_obj.last_name] if p]
                    mentor_name = ' '.join(parts) if parts else user_obj.username

            bookings = list(Booking.objects(mentor_id=mentor_id).order_by('-created_at'))
            if not bookings:
                return [], 200

            user_ids = set()
            for booking in bookings:
                user_id = booking.uid_mentee
                if user_id:
                    user_ids.add(user_id)

            users_dict = {}
            if user_ids:
                users = User.objects(uid__in=list(user_ids))
                for user in users:
                    users_dict[user.uid] = user

            result = []
            for booking in bookings:
                ts = booking.time_slot
                if not ts:
                    continue

                user_id = booking.uid_mentee
                result.append({
                    'appointment_id': str(booking.id),
                    'mentor_id': mentor_id,
                    'user_id': user_id,
                    'mentor_name': mentor_name,
                    'start_time': ts.start_time.isoformat() if ts.start_time else None,
                    'end_time': ts.end_time.isoformat() if ts.end_time else None,
                    'status': booking.status.value if getattr(booking, 'status', None) else (
                        ts.status.value if getattr(ts, 'status', None) else None),
                    'created_at': booking.created_at.isoformat() if getattr(booking, 'created_at', None) else None,
                })

            return result, 200
        except Exception as e:
            logger.exception("Error in appointment list")
            abort(400, str(e))


@appointments_ns.route('/<string:appointment_id>/accept')
class AcceptAppointment(Resource):
    @appointments_ns.doc(description='Accept an appointment (mentor only)', security='session')
    @require_auth()
    @appointments_ns.response(HTTPStatus.OK, 'Appointment accepted successfully')
    @appointments_ns.response(HTTPStatus.NOT_FOUND, 'Appointment not found')
    @appointments_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    @appointments_ns.response(HTTPStatus.FORBIDDEN, 'Not authorized to accept this appointment')
    def patch(self, appointment_id: str):
        try:
            uid = get_uid()
            user = User.objects(uid=uid).first()
            if not user:
                return {'success': False, 'message': 'User not found'}, 404

            # get mentor
            mentor = Mentor.objects(uid=user).first()
            if not mentor:
                return {'success': False, 'message': 'User is not a mentor'}, 403

            # get booking
            booking = Booking.objects(id=appointment_id).first()
            if not booking:
                return {'success': False, 'message': 'Appointment not found'}, 404

            # check if appointment belongs to mentor
            slot = booking.time_slot
            if not slot:
                return {'success': False, 'message': 'Time slot not found'}, 404

            slot_mentor = slot.uid_mentor
            if not slot_mentor or str(slot_mentor.id) != str(mentor.id):
                return {'success': False, 'message': 'Not authorized to accept this appointment'}, 403

            # accept appointment
            if booking.status != AppointmentStatus.SUBMITTED:
                booking.status = AppointmentStatus.SCHEDULED
                booking.save()
            # notify user
            user_id = booking.uid_mentee
            send_notification(
                user_id=user_id,
                notification_type='In-App',
                message=f'Your appointment request has been accepted by the mentor'
            )

            return {'success': True, 'message': 'Appointment accepted successfully'}, 200
        except Exception as e:
            logger.exception("Error accepting appointment")
            return {'success': False, 'message': str(e)}, 400


@appointments_ns.route('/<string:appointment_id>/reject')
class RejectAppointment(Resource):
    @appointments_ns.doc(description='Reject an appointment (mentor only)', security='session')
    @require_auth()
    @appointments_ns.response(HTTPStatus.OK, 'Appointment rejected successfully')
    @appointments_ns.response(HTTPStatus.NOT_FOUND, 'Appointment not found')
    @appointments_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    @appointments_ns.response(HTTPStatus.FORBIDDEN, 'Not authorized to reject this appointment')
    def patch(self, appointment_id: str):
        try:
            uid = get_uid()
            user = User.objects(uid=uid).first()
            if not user:
                return {'success': False, 'message': 'User not found'}, 404

            # get mentor
            mentor = Mentor.objects(uid=user).first()
            if not mentor:
                return {'success': False, 'message': 'User is not a mentor'}, 403

            # get booking
            booking = Booking.objects(id=appointment_id).first()
            if not booking:
                return {'success': False, 'message': 'Appointment not found'}, 404

            # check if appointment belongs to mentor
            slot = booking.time_slot
            if not slot:
                return {'success': False, 'message': 'Time slot not found'}, 404

            slot_mentor = slot.uid_mentor
            if not slot_mentor or str(slot_mentor.id) != str(mentor.id):
                return {'success': False, 'message': 'Not authorized to reject this appointment'}, 403

            if booking.status == AppointmentStatus.CANCELLED:
                return {'success': False, 'message': 'Appointment was rejected'}, 403
            booking.status = AppointmentStatus.CANCELLED
            booking.save()

            # free up the slot
            if slot.status == AppointmentStatus.SCHEDULED:
                slot.status = AppointmentStatus.AVAILABLE
                slot.save()

            # notify user
            user_id = booking.uid_mentee
            send_notification(
                user_id=user_id,
                notification_type='In-App',
                message=f'Your appointment request has been rejected by the mentor'
            )

            return {'success': True, 'message': 'Appointment rejected successfully'}, 200
        except Exception as e:
            logger.exception("Error rejecting appointment")
            return {'success': False, 'message': str(e)}, 400
