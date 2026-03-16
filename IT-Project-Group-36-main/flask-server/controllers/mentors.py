import logging
from datetime import datetime
from http import HTTPStatus

from flask import abort, request, session
from flask_restx import Namespace, Resource, fields, reqparse
from flask_login import current_user
from mongoengine.queryset.visitor import Q
from mongoengine.errors import NotUniqueError
from controllers.helper import *
from firebase_admin import auth

from controllers.auth_decorator import require_auth
from controllers.helper import create_time_slots
from db_models import Mentor, User, TimeSlots

logger = logging.getLogger(__name__)

mentors_ns = Namespace('mentors', description='Mentor listing and search operations')

# Query parameters parser
list_parser = reqparse.RequestParser()
list_parser.add_argument('field_of_expertise', type=str, help='Filter by field of expertise')
list_parser.add_argument('location', type=str, help='Filter by location')
list_parser.add_argument('page', type=int, default=1, help='Page number')
list_parser.add_argument('page_size', type=int, default=20, help='Page size')

# Response models
mentor_item_model = mentors_ns.model('MentorItem', {
    'mentor_id': fields.String(description='Mentor ID'),
    'uid': fields.String(description='User ID (uid)'),
    'name': fields.String(description='Mentor name'),
    'biography': fields.String(description='Mentor biography'),
    'field_of_expertise': fields.String(description='Field of expertise'),
    'location': fields.String(description='Location'),
    'created_at': fields.String(description='Creation timestamp')
})

time_slot_model = mentors_ns.model('TimeSlot', {
    'start_time': fields.String(description='Start time'),
    'end_time': fields.String(description='End time'),
    'location': fields.String(description='Location'),
    'status': fields.String(description='Status')
})

mentor_detail_model = mentors_ns.model('MentorDetail', {
    'mentor_id': fields.String(description='Mentor ID'),
    'uid': fields.String(description='User ID (uid)'),
    'name': fields.String(description='Mentor name'),
    'biography': fields.String(description='Mentor biography'),
    'field_of_expertise': fields.String(description='Field of expertise'),
    'location': fields.String(description='Location'),
    'available_time': fields.List(fields.Nested(time_slot_model), description='Available time slots')
})

mentor_me_model = mentors_ns.model('MentorMe', {
    'mentor_id': fields.String(description='Mentor ID'),
    'uid': fields.String(description='User ID (uid)'),
    'name': fields.String(description='Mentor name'),
    'biography': fields.String(description='Mentor biography'),
    'field_of_expertise': fields.String(description='Field of expertise'),
    'location': fields.String(description='Location'),
    'available_time': fields.List(fields.Nested(time_slot_model), description='Available time slots array')
})

update_mentor_model = mentors_ns.model('UpdateMentor', {
    'biography': fields.String(description='Mentor biography'),
    'field_of_expertise': fields.String(description='Field of expertise'),
    'location': fields.String(description='Location'),
    'available_time': fields.List(fields.Nested(time_slot_model),
                                  description='Available time slots array (managed via TimeSlots API)')
})


@mentors_ns.route('/')
class MentorList(Resource):
    @mentors_ns.doc(description='List mentors with optional filtering and pagination')
    @mentors_ns.expect(list_parser)
    @mentors_ns.response(HTTPStatus.OK, 'Mentor list retrieved', [mentor_item_model])
    @mentors_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def get(self):
        try:
            args = list_parser.parse_args()
            field = args.get('field_of_expertise', '')
            location = args.get('location', '')
            page = args.get('page', 1)
            page_size = args.get('page_size', 20)

            if page < 1:
                page = 1
            if page_size < 1:
                page_size = 20
            if page_size > 100:
                page_size = 100

            query = Q()
            if field:
                query &= Q(field_of_expertise__icontains=field)
            if location:
                query &= Q(city__icontains=location)

            qs = Mentor.objects(query).order_by('-created_at')
            items = qs.skip((page - 1) * page_size).limit(page_size)

            result = []
            for m in items:
                # get name from user
                name = None
                try:
                    u = User.objects(id=m.uid.id).first() if hasattr(m.uid, 'id') else None
                    if not u:
                        logger.warning(f"User {m.uid} not exists for mentor {m.id}")
                        continue
                    parts = [p for p in [u.first_name, u.last_name] if p]
                    name = ' '.join(parts) if parts else u.username
                except Exception as e:
                    logger.exception(f"Error resolving user name for mentor {m.id}")
                    name = None

                if current_user != u:
                    rsp_info = {
                        'mentor_id': str(m.id),
                        'uid': u.uid if u else None,
                        'name': name,
                        'biography': m.biography,
                        'field_of_expertise': getattr(m, 'field_of_expertise', None),
                        'location': m.city,
                    }
                    if m.created_at:
                        rsp_info['created_at'] = m.created_at.isoformat()
                    result.append(rsp_info)
            return result, 200
        except Exception as e:
            logger.exception("Error in mentor list")
            abort(400, str(e))


@mentors_ns.route('/<string:mentor_id>')
class MentorDetail(Resource):
    @mentors_ns.doc(description='Get detailed mentor information including available time slots')
    @mentors_ns.response(HTTPStatus.OK, 'Mentor detail retrieved', mentor_detail_model)
    @mentors_ns.response(HTTPStatus.NOT_FOUND, 'Mentor not found')
    @mentors_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def get(self, mentor_id: str):
        try:
            mentor = Mentor.objects(id=mentor_id).first()
            if not mentor:
                return {'error': 'mentor not found'}, 404

            # get name
            name = None
            try:
                if isinstance(mentor.uid, User):
                    u = mentor.uid
                elif mentor.uid:
                    u = User.objects(id=mentor.uid.id).first() if hasattr(mentor.uid, 'id') else None
                else:
                    u = None
                if u:
                    parts = [p for p in [u.first_name, u.last_name] if p]
                    name = ' '.join(parts) if parts else u.username
            except Exception as e:
                logger.exception(f"Error resolving user name for mentor {mentor.id}")
                name = None

            # get time slots
            slots = TimeSlots.objects(uid_mentor=str(mentor.id)).order_by('start_time')

            uid_value = u.uid if u else None

            data = {
                'mentor_id': str(mentor.id),
                'uid': uid_value,
                'name': name,
                'biography': mentor.biography,
                'field_of_expertise': getattr(mentor, 'field_of_expertise', None),
                'location': mentor.city,
                'available_time': [
                    {
                        'start_time': s.start_time.isoformat() if s.start_time else None,
                        'end_time': s.end_time.isoformat() if s.end_time else None,
                        'status': s.status.value,
                        'appointment_id': str(s.id)
                    }
                    for s in slots
                ],
            }
            return data, 200
        except Exception as e:
            logger.exception("Error in mentor detail")
            abort(400, str(e))


@mentors_ns.route('/me')
class MentorMe(Resource):
    @mentors_ns.doc(description='Get current mentor profile (mentor only)', security='session')
    @require_auth()
    @mentors_ns.response(HTTPStatus.OK, 'Mentor profile retrieved', mentor_me_model)
    @mentors_ns.response(HTTPStatus.NOT_FOUND, 'Mentor profile not found')
    @mentors_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def get(self):
        try:
            if 'uid' not in session or not session['uid']:
                return {'success': False, 'message': 'Not logged in'}, 401

            uid = session['uid']
            user = User.objects(uid=uid).first()
            if not user:
                return {'success': False, 'message': 'User not found'}, 404

            mentor = Mentor.objects(uid=user).first()
            if not mentor:
                return {'success': False, 'message': 'Mentor profile not found'}, 404

            # get time slots
            slots = TimeSlots.objects(uid_mentor=str(mentor.id)).order_by('start_time')

            # build list
            available_time_slots = []
            for s in slots:
                available_time_slots.append({
                    'start_time': s.start_time.isoformat() if s.start_time else None,
                    'end_time': s.end_time.isoformat() if s.end_time else None,
                    'status': s.status.value if s.status else None
                })

            # get name
            parts = [p for p in [user.first_name, user.last_name] if p]
            name = ' '.join(parts) if parts else user.username

            data = {
                'mentor_id': str(mentor.id),
                'uid': user.uid,
                'name': name,
                'biography': mentor.biography,
                'field_of_expertise': getattr(mentor, 'field_of_expertise', None),
                'location': mentor.city,
                'available_time': available_time_slots
            }
            return data, 200
        except Exception as e:
            logger.exception("Error in mentor detail")
            abort(400, str(e))

    @mentors_ns.doc(description='Update current mentor profile (mentor only)', security='session')
    @require_auth()
    @mentors_ns.expect(update_mentor_model)
    @mentors_ns.response(HTTPStatus.OK, 'Mentor profile updated successfully')
    @mentors_ns.response(HTTPStatus.NOT_FOUND, 'Mentor profile not found')
    @mentors_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def put(self):
        try:
            if 'uid' not in session or not session['uid']:
                return {'success': False, 'message': 'Not logged in'}, 401

            uid = session['uid']
            user = User.objects(uid=uid).first()
            if not user:
                return {'success': False, 'message': 'User not found'}, 404

            mentor = Mentor.objects(uid=user).first()
            if not mentor:
                return {'success': False, 'message': 'Mentor profile not found'}, 404

            body = request.get_json(force=True) or {}

            # update mentor fields
            if 'biography' in body:
                mentor.biography = str(body['biography']).strip() if body['biography'] is not None else None

            if 'field_of_expertise' in body:
                mentor.field_of_expertise = str(body['field_of_expertise']).strip() if body[
                                                                                           'field_of_expertise'] is not None else None

            if 'location' in body:
                mentor.city = str(body['location']).strip() if body['location'] is not None else None

            mentor.updated_at = datetime.utcnow()
            mentor.save()

            # update time slots
            if 'available_time' in body:
                available_time = body.get('available_time', [])
                create_time_slots(mentor, available_time, default_location=mentor.city, clear_existing=True)

            return {'success': True, 'message': 'Mentor profile updated successfully'}, 200
        except Exception as e:
            logger.exception("Error updating mentor profile")
            return {'success': False, 'message': str(e)}, 400


@mentors_ns.route('/register')
class MentorRegister(Resource):
    @mentors_ns.doc(description='Register current user as a mentor', security='session')
    #@mentor_ns.expect(create_mentor_model)
    @mentors_ns.response(HTTPStatus.CREATED, 'Mentor registered successfully')
    @mentors_ns.response(HTTPStatus.BAD_REQUEST, 'Missing required fields')
    @mentors_ns.response(HTTPStatus.CONFLICT, 'Mentor already exists')
    @mentors_ns.response(HTTPStatus.UNAUTHORIZED, 'Authentication required')
    def post(self):
        try:
            data = request.get_json(force=True)
            
            if 'uid' in session:
                data['uid'] = session['uid']
            else:
                id_token = data.get("id-token")
                print(id_token)
                del data['id-token']
                decoded_token = auth.verify_id_token(id_token)
                uid = decoded_token['uid']
                print(uid)
                data['uid'] = User.objects(uid = uid).first()
            
            print(data['uid'])


            missing = requiredCheck(Mentor, data)
            # check for missing fields
            if missing:
                print("missing ", missing)
                return {'success': False, 'message': f"missing fields: {', '.join(missing)}"}, 400

            match = Mentor.objects(uid = data['uid']).first()
            
            #print(match.id)
            
            if match: 
                raise NotUniqueError
            
            new_mentor = Mentor(**data)

            new_mentor.save()

            return {'success': True, 'message': 'registered'}, 201

        except NotUniqueError as e:
            abort(409, "Not unique")
        except Exception as e:
            print("error")
            print(e)
            return {"error": "Error"}