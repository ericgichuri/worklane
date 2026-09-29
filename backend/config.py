# config.py
import os
from dotenv import load_dotenv
import pytz


load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DB_NAME = os.environ.get('DB_NAME')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JSON_SORT_KEYS = False

    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)),'static', 'uploads')
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024 

    TIMEZONE = "Africa/Nairobi"

    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')


class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False