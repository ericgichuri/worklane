from flask import jsonify,request,Blueprint
from flask_login import login_user, login_required, current_user, logout_user
from utils.response import api_response
from utils.email_password import send_reset_link
from sqlalchemy import or_
from models.models import Role,User
from extensions import db

auth_bp = Blueprint('auth',__name__,url_prefix='/auth')

@auth_bp.route("/setup", methods=["POST"])
def setup():
    try:
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('phone') or not data.get('email') or not data.get('password'):
            return api_response(success=False, message="Missing fields required", status_code=400)
        
        if User.query.first() is not None:
            return api_response(
                success=False, 
                message="System is already set up.", 
                data={"action": "Go to login"}, 
                status_code=401
            )

        exist_user = User.query.filter(
            or_(
                User.email == data.get('email'),
                User.phone == data.get('phone')
            )
        ).first()
        
        if exist_user:
            return api_response(success=False, message="Email or phone already registered", status_code=400)

        admin_role = Role.query.filter_by(name="Admin").first()
        if not admin_role:
            admin_role = Role(
                name="Admin",
                description="Main user with all permissions of the system"
            )
            db.session.add(admin_role)

        admin_user = User(
            name=data.get('name'),
            phone=data.get('phone'),
            email=data.get('email'),
            role=admin_role
        )
        
        admin_user.password = data.get('password')
        
        db.session.add(admin_user)
        db.session.commit()

        return api_response(success=True, message="Setup complete", status_code=200)

    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message=str(e), status_code=500)

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return api_response(success=False, message="Missing fields required", status_code=400)

        user = User.query.filter_by(email=data.get('email')).first()
        
        if not user or not user.check_password(data.get('password')):
            return api_response(success=False, message="Invalid email or password", status_code=401)
            
        login_user(user)
        destination_url = '/dashboard'
        return api_response(success=True, message="Login successful", data={"url": destination_url}, status_code=200)
        
    except Exception as e:
        return api_response(success=False, message=str(e), status_code=500)

@auth_bp.route("/check-setup",methods=["GET"])
def check_setup():
    try:
        if User.query.first() is not None:
            return api_response(success=True, message="system setup exists.", status_code=200)
        else:
            destination_url = '/setup'
            return api_response(success=False,message="system setup not found",data={"url":destination_url},status_code=401)
    except Exception as e:
        return api_response(success=False,message=str(e),status_code=500)

@auth_bp.route("/recover-password", methods=["POST"])
def recover_password():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('email').strip():
            return api_response(success=False, message="Missing email required", status_code=400)

        email = data.get('email').strip()
        user = User.query.filter_by(email=email).first()
        
        if user:
            reset_token = user.generate_reset_token(expires_in_minutes=15)
            
            db.session.commit()
            
            reset_link = f"http://localhost:5173/reset-password/{reset_token}"
            
            try:
                send_reset_link(user.email, reset_link, "Reset password")
            except Exception as mail_err:
                db.session.rollback()
                return api_response(
                    success=False, 
                    message=f"SMTP Error: failed to send reset link to {user.email}", 
                    status_code=500
                )
                
            return api_response(
                success=True, 
                message="Reset instructions sent to your email, expires in 15 minutes", 
                status_code=200
            )
        else:
            return api_response(
                success=False, 
                message="Invalid email or not registered user", 
                status_code=401
            )
            
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message=str(e), status_code=500)

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        if not data or not data.get('token') or not data.get('password') or not data.get('confirm_password'):
            return api_response(success=False, message="Missing fields required", status_code=400)
        
        if data.get('password') != data.get('confirm_password'):
            return api_response(success=False, message="Passwords do not match", status_code=400)
        
        user = User.verify_reset_token(data.get('token'))
        if not user:
            return api_response(success=False, message="Password reset link invalid or expired", status_code=401)
        
        user.password = data.get('password')
        user.clear_reset_token()
        db.session.commit()
        
        destination_url = '/login'
        return api_response(success=True, message="Password reset successfully", data={'url': destination_url}, status_code=200)
    
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message=str(e), status_code=500)


@auth_bp.route("/reset-password/<string:reset_token>", methods=["GET"])
def check_reset_token(reset_token):
    try:
        if not reset_token:
            return api_response(success=False, message="Token not found", data={"url": "/login"}, status_code=400)
            
        user = User.verify_reset_token(reset_token)
        if not user:
            return api_response(success=False, message="Password reset link invalid or expired", data={"url": "/forgot-password"}, status_code=401)

        return api_response(success=True, message="Reset link active", data={"token": reset_token}, status_code=200)

    except Exception as e:
        return api_response(success=False, message=str(e), status_code=500)

@auth_bp.route("/logout",methods=["GET","POST"])
def logout():
    try:
        logout_user()
        return api_response(success=True,message="Logout successful",data={"url": "/login"},status_code=200)
    except Exception as e:
        return api_response(success=False,message="Logout failed. Try again..",status_code=500)

@auth_bp.route("/me", methods=["GET"])
def me():
    try:
        if not current_user.is_authenticated:
            return api_response(success=False, message="Not logged in", data={"url": "/login"}, status_code=401)
        
        user_data = {
            "id": current_user.id,
            "user_token": current_user.user_token,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role_id": current_user.role_id,
            "role": current_user.role.name if current_user.role else None
        }
        
        return api_response(success=True, message="User profile retrieved", data=user_data, status_code=200)
        
    except Exception as e:
        return api_response(success=False, message=str(e), status_code=500)