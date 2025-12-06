from functools import wraps
from flask import jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.models import User, UserRole
import uuid
import secrets
from datetime import datetime, timedelta

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            current_app.logger.info(f"Admin required - User ID from token: {current_user_id}")
            
            # Convert string ID to int for database query
            user_id = int(current_user_id) if isinstance(current_user_id, str) and current_user_id.isdigit() else current_user_id
            user = User.query.get(user_id)
            
            if not user:
                current_app.logger.error(f"User not found for ID: {current_user_id}")
                return jsonify({'error': 'User not found'}), 404
            
            current_app.logger.info(f"User found: {user.email}, Role: {user.role}")
            
            if user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
                current_app.logger.warning(f"Access denied - User {user.email} is not admin")
                return jsonify({'error': 'Admin access required'}), 403
            
            current_app.logger.info(f"Admin check passed, calling function: {f.__name__}")
            return f(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(f"Admin auth error: {str(e)}")
            raise
    return decorated

def super_admin_required(f):
    """Decorator to require super admin role"""
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        current_user_id = get_jwt_identity()
        # Convert string ID to int for database query
        user_id = int(current_user_id) if isinstance(current_user_id, str) and current_user_id.isdigit() else current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role != UserRole.SUPER_ADMIN:
            return jsonify({'error': 'Super admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated

def get_current_user():
    """Get current authenticated user"""
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        return User.query.get(current_user_id)
    except:
        return None

def validate_password_strength(password):
    """Validate password meets security requirements"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    
    special_chars = "!@#$%^&*(),.?\":{}|<>"
    if not any(c in special_chars for c in password):
        errors.append("Password must contain at least one special character")
    
    return errors

def generate_verification_token():
    """Generate secure verification token"""
    return secrets.token_urlsafe(32)

def generate_reset_token():
    """Generate secure password reset token"""
    return secrets.token_urlsafe(32)

def is_token_expired(token_timestamp, hours=24):
    """Check if token has expired"""
    if not token_timestamp:
        return True
    
    expiry_time = token_timestamp + timedelta(hours=hours)
    return datetime.utcnow() > expiry_time

def sanitize_user_data(data):
    """Sanitize user input data"""
    sanitized = {}
    
    # Remove any potentially dangerous fields
    allowed_fields = {
        'email', 'first_name', 'last_name', 'phone', 'date_of_birth'
    }
    
    for key, value in data.items():
        if key in allowed_fields and value is not None:
            if isinstance(value, str):
                sanitized[key] = value.strip()
            else:
                sanitized[key] = value
    
    return sanitized

def format_validation_errors(errors):
    """Format validation errors for API response"""
    if isinstance(errors, list):
        return {'validation_errors': errors}
    elif isinstance(errors, dict):
        formatted_errors = []
        for field, field_errors in errors.items():
            if isinstance(field_errors, list):
                for error in field_errors:
                    formatted_errors.append(f"{field}: {error}")
            else:
                formatted_errors.append(f"{field}: {field_errors}")
        return {'validation_errors': formatted_errors}
    else:
        return {'validation_errors': [str(errors)]}

class AuthenticationError(Exception):
    """Custom authentication error"""
    pass

class AuthorizationError(Exception):
    """Custom authorization error"""
    pass

def handle_auth_errors(f):
    """Decorator to handle authentication/authorization errors"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except AuthenticationError as e:
            return jsonify({'error': str(e)}), 401
        except AuthorizationError as e:
            return jsonify({'error': str(e)}), 403
        except Exception as e:
            current_app.logger.error(f"Unexpected error in {f.__name__}: {str(e)}")
            return jsonify({'error': 'An unexpected error occurred'}), 500
    return decorated