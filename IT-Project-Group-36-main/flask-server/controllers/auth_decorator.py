from functools import wraps
from flask import session, abort


def require_auth():
    # check if user is logged in
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'uid' not in session or not session['uid']:
                abort(401, "Authentication required")
            return f(*args, **kwargs)

        return decorated_function

    return decorator
