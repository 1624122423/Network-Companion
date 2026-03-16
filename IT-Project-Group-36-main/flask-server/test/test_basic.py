# flask-server/tests/test_basic.py
from flask import Flask

def test_basic():
    app = Flask(__name__)

    @app.route("/ping")
    def ping():
        return "pong"

    client = app.test_client()
    resp = client.get("/ping")
    assert resp.status_code == 200
    assert resp.data == b"pong"
