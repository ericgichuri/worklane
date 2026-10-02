from flask import Blueprint,request
from flask_login import current_user,login_required
from utils.response import api_response
from extensions import db
from models.models import User,Role
from datetime import datetime
from sqlalchemy import or_

users_bp = Blueprint('users',__name__,url_prefix='/api/users')

@users_bp.route('/')
@login_required
def list():
	try:
		users=User.query.all()
		if not users:
			return api_response(success=False,message="users not found",status_code=400)
		
		data=[{
			"id":u.id,
			"user_token":u.user_token,
			"email":u.email,
			"phone":u.phone,
			"role_id":u.role_id,
			"role": u.role.name
		} for u in users]

		return api_response(success=True,message="fetched successfully",data=data,status_code=200)
	except Exception as e:
		return api_response(success=False,message=str(e),status_code=500)

@users_bp.route('/upsert', methods=["POST","PUT"])
@login_required
def upsert():
    try:
        data = request.get_json()
        if not data:
            return api_response(success=False, message="No data provided", status_code=400)

        user_id = data.get('user_id')
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        role_input = data.get('role')  # Can be role ID or role name

        # 1. UPDATE USER FLOW
        if user_id:
            user = User.query.get(user_id)
            if not user:
                return api_response(success=False, message="User not found", status_code=404)

            # Check if email/phone are being changed to values already taken by *other* users
            if email and email != user.email:
                if User.query.filter_by(email=email).first():
                    return api_response(success=False, message="Email already registered by another user", status_code=400)
            if phone and phone != user.phone:
                if User.query.filter_by(phone=phone).first():
                    return api_response(success=False, message="Phone already registered by another user", status_code=400)

            # Update fields if provided
            if name: user.name = name.strip()
            if email: user.email = email.strip()
            if phone: user.phone = phone.strip()
            
            if role_input:
                # Handle role whether passed as ID or Name
                role = Role.query.filter(or_(Role.id == role_input, Role.name == role_input)).first()
                if not role:
                    return api_response(success=False, message="Invalid role specified", status_code=400)
                user.role_id = role.id

            # Optional password update
            if data.get('password') and data.get('password').strip():
                user.password = data.get('password').strip()

            db.session.commit()
            return api_response(success=True, message="User updated successfully", status_code=200)

        # 2. CREATE USER FLOW
        else:
            if not name or not email or not phone or not role_input or not data.get('password'):
                return api_response(success=False, message="Missing fields required for creation", status_code=400)

            if not name.strip() or not email.strip() or not phone.strip() or not data.get('password').strip():
                return api_response(success=False, message="Fields cannot be empty strings", status_code=400)

            # Check if email or phone already exists globally
            exist_user = User.query.filter(
                or_(
                    User.email == email.strip(),
                    User.phone == phone.strip()
                )
            ).first()
            
            if exist_user:
                return api_response(success=False, message="Email or phone already registered", status_code=400)

            # Resolve role
            role = Role.query.filter(or_(Role.id == role_input, Role.name == role_input)).first()
            if not role:
                return api_response(success=False, message="Invalid role specified", status_code=400)

            # Create new user
            user = User(
                name=name.strip(),
                email=email.strip(),
                phone=phone.strip(),
                role_id=role.id
            )
            user.password = data.get('password').strip()
            
            db.session.add(user)
            db.session.commit()

            return api_response(success=True, message='User created successfully', status_code=200)

    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message=str(e), status_code=500)

@users_bp.route('/roles')
@login_required
def list_roles():
	try:
		roles=Role.query.all()
		if not roles:
			return api_response(success=False,message="Roles not found",status_code=400)
		data=[{
			"id":r.id,
			"name":r.name,
			"description":r.description
		} for r in roles]
		return api_response(success=True,message="fetched successfully",data=data,status_code=200)
	except Exception as e:
		return api_response(success=False,message=str(e),status_code=500)

@users_bp.route('/roles/upsert',methods=["POST","PUT"])
@login_required
def upsert_roles():
	try:
		data=request.get_json()
		if not data:
			return api_response(success=False,message="No data provided",status_code=400)
		role_id=data.get('role_id')
		name=data.get('name')
		description=data.get('description')
		# update
		if role_id:
			role=Role.query.get(role_id)
			if not role:
				return api_response(success=False,message="role not found",status_code=404)

			if name and name!=role.name:
				if Role.query.filter_by(name=name).first():
					return api_response(success=False, message="Name already registered", status_code=400)
			if name: role.name=name.strip()
			if description: role.description=description.strip()
			db.session.commit()
			return api_response(success=False, message="Role updated successfully",status_code=200)
		# create role
		else:
			if not name or not description:
				return api_response(success=False,message="Missing fields required",status_code=400)
			if not name.strip() or description.strip():
				return api_response(success=False,message="Fields cannot be empty",status_code=400)
			# check exissting 
			exist_role=Role.query.filter_by(name=name.strip()).first()
			if exist_role:
				return api_response(success=False,message="Name already registered",status_code=400)

			role=Role(
				name=name.strip(),
				description=description.strip()
			)
			db.session.add(role)
			db.session.commit()
			return api_response(success=True,message="role added successfully",status_code=200)
	except Exception as e:
		db.session.rollback()
		return api_response(success=False,message=str(e),status_code=500)

@users_bp.route('/roles/<int:id>')
@login_required
def fetch_role(id):
	try:
		if not id:
			return api_response(success=False,message="Role not found",status_code=404)
		role=Role.query.get(id)
		if not role:
			return api_response(success=False,message="Role not found",status_code=404)
		data={
			"id":role.id,
			"name":role.name,
			"description":role.description
		}
		return api_response(success=True,message="Role found",data=data,status_code=200)
	except Exception as e:
		return api_response(success=False,message=str(e),status_code=500)

@users_bp.route('<int:id>')
@login_required
def fetch_user(id):
	try:
		if not id:
			return api_response(success=False,message="User not found",status_code=404)
		user=User.query.get(id)
		if not user:
			return api_response(success=False,message="User not found",status_code=404)
		data={
			"id":user.id,
			"user_toke":user.user_token,
			"name":user.name,
			"email":user.email,
			"phone":user.phone,
			"role_id":user.role_id,
			"role":user.role.name,
			"created_at":user.created_at
		}
		return api_response(success=True,message="user found",data=data,status_code=200)
	except Exception as e:
		return api_response(success=False,message=str(e),status_code=500)