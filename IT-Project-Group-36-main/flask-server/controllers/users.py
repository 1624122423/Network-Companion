import logging
from datetime import datetime
from http import HTTPStatus

from flask import request, abort, session
from flask_restx import Namespace, Resource, fields
from flask_login import login_user, current_user, logout_user
from mongoengine.errors import NotUniqueError
from mongoengine.queryset.visitor import Q
from werkzeug.security import check_password_hash, generate_password_hash

from controllers.auth_decorator import require_auth
from controllers.helper import create_time_slots
from db_models import User, Mentor, UserRole
from firebase_admin import auth

logger = logging.getLogger(__name__)

user_ns = Namespace('users', description='User authentication and profile operations')

# Request/Response models
login_model = user_ns.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

register_model = user_ns.model('Register', {
    'email': fields.String(required=True, description='User email'),
    'username': fields.String(required=True, description='Username'),
    'first_name': fields.String(required=True, description='First name'),
    'last_name': fields.String(required=True, description='Last name'),
    'password': fields.String(required=True, description='User password')
})

update_profile_model = user_ns.model('UpdateProfile', {
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'email': fields.String(description='Email')
})

time_slot_input_model = user_ns.model('TimeSlotInput', {
    'start_time': fields.String(description='Start time (ISO format)'),
    'end_time': fields.String(description='End time (ISO format)'),
    'status': fields.String(description='Status')
})

register_as_mentor_model = user_ns.model('RegisterAsMentor', {
    'biography': fields.String(required=True, description='Mentor biography'),
    'field_of_expertise': fields.String(required=True, description='Field of expertise'),
    'location': fields.String(required=True, description='Location (e.g., Remote, City)'),
    #'available_time': fields.List(fields.Nested(time_slot_input_model),
    #                              description='Available time slots array (optional, can be managed via TimeSlots API)')
})

user_response_model = user_ns.model('UserInfo', {
    'uid': fields.String(description='User ID'),
    'email': fields.String(description='Email'),
    'username': fields.String(description='Username'),
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'role': fields.String(description='User role'),
    'is_mentor': fields.Boolean(description='Whether the user is a mentor'),
    'created_at': fields.String(description='Creation timestamp'),
    'updated_at': fields.String(description='Update timestamp')
})


def get_uid(data: dict) -> dict:
    # get uid from session
    try:
        if 'uid' in session:
            uid = session['uid']
            logger.debug(f"signup: {uid}")
            data['uid'] = uid
            return data
        else:
            abort(400)
    except Exception as e:
        raise Exception("Must be logged in")


@user_ns.route('/register')
class UserRegister(Resource):
    @user_ns.doc(description='Register a new user')
    @user_ns.expect(register_model)
    @user_ns.response(HTTPStatus.CREATED, 'Registration successful')
    @user_ns.response(HTTPStatus.BAD_REQUEST, 'Invalid request')
    @user_ns.response(HTTPStatus.CONFLICT, 'Email or username already exists')
    def post(self):
        try:
            data = request.get_json(force=True)

            id_token = data.get('id-token')
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            
            del data['id-token']
            data['uid'] = uid      
            required = [field_name for field_name, field_obj in User._fields.items() if field_obj.required]
            missing = [k for k in required if k not in data or not str(data[k]).strip()]

            if missing:
                print("missing ", missing)

            unique = [field_name for field_name, field_obj in User._fields.items() if field_obj.unique]

            criteria = {u: data[u] for u in unique}

            query = Q()
            for field, value in criteria.items():
                query |= Q(**{field: value})

            matching_users = User.objects(query)

            if matching_users:
                raise NotUniqueError("not unique")

            new_user = User(**data)

            new_user.save()

            return {'success': True, 'message': 'registered', 'user_id': new_user.uid}, 201

        except NotUniqueError as e:
            abort(409, "Not unique")
        except Exception as e:
            print("error:", e)
            message = getattr(e, "description", str(e))
            return {"error": message}


@user_ns.route('/login')
class UserLogin(Resource):
    @user_ns.doc(description='User login')
    @user_ns.expect(login_model)
    @user_ns.response(HTTPStatus.OK, 'Login successful')
    @user_ns.response(HTTPStatus.BAD_REQUEST, 'Email and password required')
    @user_ns.response(HTTPStatus.UNAUTHORIZED, 'Invalid credentials')
    def post(self):
        data = request.get_json(force=True)

        if data:
            id_token = data.get("id-token")   
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            
        else:
            abort(400, "bad request")
            
        user = User.objects(uid=uid).first()
        login_user(user)
        print(current_user.email)
        resp = {"message": "Session created!"}
        session["uid"] = uid
        return resp, 200
 

@user_ns.route('/logout')
class UserLogout(Resource):
    @user_ns.doc(description='Logout current user')
    @user_ns.response(HTTPStatus.OK, 'Logged out successfully')
    def get(self):
        print(current_user.email)
        logout_user()
        session.pop('uid', None)
        return {'success': True, 'message': 'logged out'}, 200


@user_ns.route('/me')
class UserProfile(Resource):
    @user_ns.doc(description='Get current user profile', security='session')
    @require_auth()
    @user_ns.response(HTTPStatus.OK, 'User profile retrieved', user_response_model)
    @user_ns.response(HTTPStatus.BAD_REQUEST, 'Not logged in or user not found')
    def get(self):
        try:
            data = get_uid({})
            if not data['uid']:
                abort(400, "Not logged in")

            user = User.objects(uid=data['uid']).first()
            if not user:
                abort(400, "User not found")

            # check if user is mentor
            is_mentor = Mentor.objects(uid=user).first() is not None

            info = {
                'uid': user.uid,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role.value if getattr(user, 'role', None) else None,
                'is_mentor': is_mentor,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat()
            }
            return info, 200
        except Exception as e:
            abort(400, str(e))

    @user_ns.doc(description='Update current user profile', security='session')
    @require_auth()
    @user_ns.expect(update_profile_model)
    @user_ns.response(HTTPStatus.OK, 'Profile updated successfully')
    @user_ns.response(HTTPStatus.BAD_REQUEST, 'Invalid request or user not found')
    @user_ns.response(HTTPStatus.CONFLICT, 'Email already in use')
    def put(self):
        try:
            data = get_uid({})
            if not data['uid']:
                abort(400, "Not logged in")

            body = request.get_json(force=True) or {}
            allowed_fields = ['first_name', 'last_name', 'email']
            updates = {k: v for k, v in body.items() if k in allowed_fields}

            if not updates:
                return {'success': False, 'message': 'no valid fields to update'}, 400

            user = User.objects(uid=data['uid']).first()
            if not user:
                return {'success': False, 'message': 'user not found'}, 400

            if 'email' in updates and updates['email']:
                new_email = str(updates['email']).strip()
                if new_email and new_email != user.email:
                    exists = User.objects(email=new_email, id__ne=user.id).first()
                    if exists:
                        return {'success': False, 'message': 'email already in use'}, 409
                    user.email = new_email

            if 'first_name' in updates:
                user.first_name = str(updates['first_name']).strip() if updates['first_name'] is not None else None

            if 'last_name' in updates:
                user.last_name = str(updates['last_name']).strip() if updates['last_name'] is not None else None

            user.save()

            return {'success': True, 'message': 'updated'}, 200
        except Exception as e:
            abort(400, str(e))


@user_ns.route('/register_as_mentor')
class RegisterAsMentor(Resource):
    @user_ns.doc(description='Register current user as a mentor', security='session')
    #@require_auth()
    #@user_ns.expect(register_as_mentor_model)
    @user_ns.response(HTTPStatus.OK, 'Registration as mentor successful')
    @user_ns.response(HTTPStatus.BAD_REQUEST, 'Invalid request or user not logged in')
    @user_ns.response(HTTPStatus.CONFLICT, 'User is already registered as mentor')
    def post(self):
        try:
            data = request.get_json(force=True)
            
            if 'uid' in session:
                uid = session['uid']
            else:
                id_token = data.get("id-token")
                del data['id-token']
                decoded_token = auth.verify_id_token(id_token)
                uid = decoded_token['uid']

            print(uid)
            user = User.objects(uid=uid).first()
            if not user:
                return {'success': False, 'message': 'User not found'}, 400

            # check if already mentor
            existing_mentor = Mentor.objects(uid=user).first()
            if existing_mentor:
                return {'success': False, 'message': 'User is already registered as mentor'}, 409
            
            biography = data.get('biography', '').strip()
            field_of_expertise = data.get('field_of_expertise', '').strip()
            location = data.get('location', '').strip()
            
            print(biography)
            print(field_of_expertise)
            print(location)

            if not biography or not field_of_expertise or not location:
                return {'success': False, 'message': 'biography, field_of_expertise, and location are required'}, 400

            # create mentor
            mentor = Mentor(
                uid=user,
                biography=biography,
                field_of_expertise=field_of_expertise,
                city=location,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            mentor.save()

            user.role = UserRole.MENTOR
            user.save()

            return {'success': True, 'message': 'Registered as mentor successfully'}, 200
        except Exception as e:
            logger.exception(f"Error registering as mentor: {e}")
            return {'success': False, 'message': str(e)}, 400


if __name__ == '__main__':
    pass
