from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models import db, User, UserRole
from app.utils.auth import (
    validate_password_strength, 
    generate_verification_token, 
    generate_reset_token,
    is_token_expired,
    sanitize_user_data,
    format_validation_errors,
    handle_auth_errors
)
from app.utils.validators import validate_json, validate_email, validate_required_fields
from app.services.email_service import send_verification_email, send_password_reset_email
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@validate_json
@handle_auth_errors
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name']
    validation_errors = validate_required_fields(data, required_fields)
    
    if validation_errors:
        return jsonify(format_validation_errors(validation_errors)), 400
    
    # Validate email format
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email'].lower().strip()).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Validate password strength
    password_errors = validate_password_strength(data['password'])
    if password_errors:
        return jsonify(format_validation_errors(password_errors)), 400
    
    # Sanitize user data
    sanitized_data = sanitize_user_data(data)
    
    try:
        # Create new user
        user = User(
            email=sanitized_data['email'].lower().strip(),
            first_name=sanitized_data['first_name'],
            last_name=sanitized_data['last_name'],
            phone=sanitized_data.get('phone'),
            role=UserRole.CUSTOMER,
            verification_token=generate_verification_token()
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Send verification email
        try:
            send_verification_email(user.email, user.verification_token)
        except Exception as e:
            current_app.logger.error(f"Failed to send verification email: {str(e)}")
        
        # Create access token - identity must be a string
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
@validate_json
@handle_auth_errors
def login():
    """Login user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password']
    validation_errors = validate_required_fields(data, required_fields)
    
    if validation_errors:
        return jsonify(format_validation_errors(validation_errors)), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    # Debug logging
    current_app.logger.info(f"Login attempt - Email: {email}, User found: {user is not None}")
    if user:
        password_check = user.check_password(password)
        current_app.logger.info(f"Password check result: {password_check}")
        current_app.logger.info(f"User role: {user.role}")
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create tokens - identity must be a string
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    # current_user_id is already a string from JWT, but ensure it stays a string
    user = User.query.get(int(current_user_id) if current_user_id.isdigit() else current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    new_access_token = create_access_token(identity=str(current_user_id))
    
    return jsonify({
        'access_token': new_access_token
    }), 200

@auth_bp.route('/verify-email', methods=['POST'])
@validate_json
def verify_email():
    """Verify user email with token"""
    data = request.get_json()
    
    if 'token' not in data:
        return jsonify({'error': 'Verification token is required'}), 400
    
    user = User.query.filter_by(verification_token=data['token']).first()
    
    if not user:
        return jsonify({'error': 'Invalid verification token'}), 400
    
    if user.is_verified:
        return jsonify({'message': 'Email already verified'}), 200
    
    # Mark user as verified
    user.is_verified = True
    user.verification_token = None
    db.session.commit()
    
    return jsonify({'message': 'Email verified successfully'}), 200

@auth_bp.route('/resend-verification', methods=['POST'])
@validate_json
def resend_verification():
    """Resend verification email"""
    data = request.get_json()
    
    if 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    email = data['email'].lower().strip()
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.is_verified:
        return jsonify({'message': 'Email already verified'}), 200
    
    # Generate new verification token
    user.verification_token = generate_verification_token()
    db.session.commit()
    
    # Send verification email
    try:
        send_verification_email(user.email, user.verification_token)
        return jsonify({'message': 'Verification email sent'}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email: {str(e)}")
        return jsonify({'error': 'Failed to send verification email'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
@validate_json
def forgot_password():
    """Send password reset email"""
    data = request.get_json()
    
    if 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    email = data['email'].lower().strip()
    user = User.query.filter_by(email=email).first()
    
    # Always return success to prevent email enumeration
    if not user:
        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
    
    # Generate reset token
    user.reset_password_token = generate_reset_token()
    user.reset_password_expires = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()
    
    # Send reset email
    try:
        send_password_reset_email(user.email, user.reset_password_token)
    except Exception as e:
        current_app.logger.error(f"Failed to send reset email: {str(e)}")
    
    return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
@validate_json
def reset_password():
    """Reset password with token"""
    data = request.get_json()
    
    required_fields = ['token', 'new_password']
    validation_errors = validate_required_fields(data, required_fields)
    
    if validation_errors:
        return jsonify(format_validation_errors(validation_errors)), 400
    
    # Find user by reset token
    user = User.query.filter_by(reset_password_token=data['token']).first()
    
    if not user:
        return jsonify({'error': 'Invalid reset token'}), 400
    
    # Check if token has expired
    if is_token_expired(user.reset_password_expires, hours=1):
        return jsonify({'error': 'Reset token has expired'}), 400
    
    # Validate new password
    password_errors = validate_password_strength(data['new_password'])
    if password_errors:
        return jsonify(format_validation_errors(password_errors)), 400
    
    # Update password
    user.set_password(data['new_password'])
    user.reset_password_token = None
    user.reset_password_expires = None
    db.session.commit()
    
    return jsonify({'message': 'Password reset successfully'}), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
@validate_json
def change_password():
    """Change user password (authenticated)"""
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    required_fields = ['current_password', 'new_password']
    validation_errors = validate_required_fields(data, required_fields)
    
    if validation_errors:
        return jsonify(format_validation_errors(validation_errors)), 400
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify current password
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    # Validate new password
    password_errors = validate_password_strength(data['new_password'])
    if password_errors:
        return jsonify(format_validation_errors(password_errors)), 400
    
    # Update password
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/check-email', methods=['POST'])
@validate_json
def check_email():
    """Check if email is available"""
    data = request.get_json()
    
    if 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    email = data['email'].lower().strip()
    
    if not validate_email(email):
        return jsonify({'available': False, 'reason': 'Invalid email format'}), 200
    
    user_exists = User.query.filter_by(email=email).first() is not None
    
    return jsonify({
        'available': not user_exists,
        'reason': 'Email already registered' if user_exists else None
    }), 200