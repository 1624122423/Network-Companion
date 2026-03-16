import logging

from flask import Flask
from flask_login import LoginManager
from os import getenv
from flask_cors import CORS
from flask_restx import Api

from mongoengine import connect, disconnect 

from db_models import User

from controllers.appointments import appointments_ns
from controllers.mentors import mentors_ns
from controllers.users import user_ns
from controllers.timeSlots import time_slots_ns
from controllers.mentor import mentor_ns
    
from firebase_admin import initialize_app, credentials
    
URI = "mongodb+srv://Desmond:Desmond@networkingcompanion.gbnniue.mongodb.net/?retryWrites=true&w=majority&appName=NetworkingCompanion"

def create_app() -> Flask:
    disconnect()
    app = Flask(__name__)
    PORT = int(getenv('PORT', 5000))

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    app.secret_key = getenv('FLASK_SECRET_KEY', 'secret')
    
    login_manager = LoginManager(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.objects(uid=user_id).first() 

    # session cookie settings   
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    
    try:
        cred = credentials.Certificate("./it-project-auth.json")
        default_app = initialize_app(cred)
    except:
        pass
    
    # 允许所有源调用 API
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
    connect(db = 'test', host = URI)

    api = Api(app, 
              version='1.0',
              title='Booking System API',
              description='API for managing mentors and appointments',
              doc='/api/docs/',
              authorizations={
                  'session': {
                      'type': 'apiKey',
                      'in': 'cookie',
                      'name': 'session'
                  }
              })

    api.add_namespace(user_ns, path='/api/users')
    api.add_namespace(mentors_ns, path='/api/mentors')
    api.add_namespace(time_slots_ns, path='/api/timeslots')
    api.add_namespace(appointments_ns, path='/api/appointments')
    api.add_namespace(appointments_ns, path='/api/mentor')
    
    @app.get('/health')
    def health_check():
        return {'status': 'ok'}

    return app


