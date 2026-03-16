import sys
import os

# Get the absolute path of the current script's directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Get the parent directory's path
parent_dir = os.path.join(current_dir, os.pardir)

# Add the parent directory to sys.path
sys.path.append(parent_dir)

from http import HTTPStatus

from flask import request, abort, session
from flask_restx import Namespace, Resource, fields
from db_models import Mentor
from mongoengine.errors import NotUniqueError
from controllers.helper import get_uid, requiredCheck, uniquenessCheck
from controllers.auth_decorator import require_auth
from db_models import User
from firebase_admin import auth

mentor_ns = Namespace('mentor', description='Mentor registration operations')

# Request/Response models
create_mentor_model = mentor_ns.model('CreateMentor', {
    'biography': fields.String(description='Mentor biography'),
    'field_of_expertise': fields.String(description='Field of expertise'),
    'city': fields.String(description='City')
})

mentor_response_model = mentor_ns.model('MentorProfile', {
    'uid': fields.String(description='User ID'),
    'biography': fields.String(description='Mentor biography'),
    'field_of_expertise': fields.String(description='Field of expertise'),
    'city': fields.String(description='City'),
    'created_at': fields.String(description='Creation timestamp'),
    'updated_at': fields.String(description='Update timestamp')
})


@mentor_ns.route('/register')
class MentorRegister(Resource):
    @mentor_ns.doc(description='Register current user as a mentor', security='session')
    #@mentor_ns.expect(create_mentor_model)
    @mentor_ns.response(HTTPStatus.CREATED, 'Mentor registered successfully')
    @mentor_ns.response(HTTPStatus.BAD_REQUEST, 'Missing required fields')
    @mentor_ns.response(HTTPStatus.CONFLICT, 'Mentor already exists')
    @mentor_ns.response(HTTPStatus.UNAUTHORIZED, 'Authentication required')
    def post(self):
        try:
            data = request.get_json(force=True)
            
            if 'uid' in session:
                data['uid'] = session['uid']
            else:
                id_token = data.get("id-token")
                del data['id-token']
                decoded_token = auth.verify_id_token(id_token)
                uid = decoded_token['uid']
                data['uid'] = User.objects(uid = uid).first()
            
            print(data['uid'])


            missing = requiredCheck(Mentor, data)
            # check for missing fields
            if missing:
                print("missing ", missing)
                return {'success': False, 'message': f"missing fields: {', '.join(missing)}"}, 400

            match = Mentor.objects(uid = data['uid']).first()

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


@mentor_ns.route('/<string:_uid>')
class MentorProfile(Resource):
    @mentor_ns.doc(description='Get mentor profile by user ID')
    @mentor_ns.response(HTTPStatus.OK, 'Mentor profile retrieved', mentor_response_model)
    @mentor_ns.response(HTTPStatus.NOT_FOUND, 'Mentor not found')
    @mentor_ns.response(HTTPStatus.BAD_REQUEST, 'Bad request')
    def get(self, _uid):
        try:
            profile = Mentor.objects(uid=_uid).first()
            if profile:
                mentor_data = {
                    'uid': str(profile.uid),
                    'biography': profile.biography if profile.biography else '',
                    'field_of_expertise': profile.field_of_expertise if profile.field_of_expertise else '',
                    'city': profile.city if profile.city else '',
                    'created_at': profile.created_at.isoformat() if hasattr(profile, 'created_at') and profile.created_at else None,
                    'updated_at': profile.updated_at.isoformat() if hasattr(profile, 'updated_at') and profile.updated_at else None
                }
                return mentor_data, 200
            else:
                return {'success': False, 'message': 'Mentor not found'}, 404
        except Exception as e:
            abort(400, str(e))
