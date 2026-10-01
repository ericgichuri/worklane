from flask import Flask, jsonify, request,Blueprint
from flask_cors import CORS
from datetime import datetime, timezone
from extensions import db,login_manager,migrate
from config import Config

app = Flask(__name__)

app.config.from_object(Config)
db.init_app(app)
migrate.init_app(app, db)
login_manager.init_app(app)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"]
)

from models.models import *
from routes.auth import auth_bp

app.register_blueprint(auth_bp)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


if __name__ == "__main__":
    app.run(debug=True, port=5000)