from flask import Flask,jsonify,request
from flask_login import LoginManger, login_user,logout_user,login_required,current_user
from flask_migrate import Migrate
from werkzueg.security import generate_password_hash,check_password_hash
from flask_cors import CORS
from datetime import datetime,timezone