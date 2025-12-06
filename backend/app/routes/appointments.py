from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Appointment, AppointmentType, AppointmentStatus, User
from app.utils.auth import admin_required
from app.utils.validators import validate_json, validate_required_fields
from datetime import datetime, date

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('', methods=['POST'])
@jwt_required(optional=True)
@validate_json
def create_appointment():
    """Create a new appointment (for both authenticated users and guests)"""
    try:
        data = request.get_json()
        current_app.logger.info(f"Received appointment data: {data}")
        
        # Get user if authenticated
        user_id = get_jwt_identity()
        
        current_app.logger.info(f"User ID: {user_id}")
        
        # Validate required fields
        required_fields = ['appointment_type', 'appointment_date', 'appointment_time']
        validation_errors = validate_required_fields(data, required_fields)
        
        # For guest users, require contact info
        if not user_id:
            guest_fields = ['guest_name', 'guest_email', 'guest_phone']
            validation_errors.extend(validate_required_fields(data, guest_fields))
        
        if validation_errors:
            current_app.logger.error(f"Validation errors: {validation_errors}")
            return jsonify({'errors': validation_errors}), 400
        
        # Parse appointment date
        try:
            appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Validate appointment type
        try:
            appointment_type = AppointmentType(data['appointment_type'])
        except ValueError:
            return jsonify({'error': f"Invalid appointment type. Must be one of: {', '.join([t.value for t in AppointmentType])}"}), 400
        
        # Create appointment
        appointment = Appointment(
            user_id=user_id,
            guest_name=data.get('guest_name'),
            guest_email=data.get('guest_email'),
            guest_phone=data.get('guest_phone'),
            appointment_type=appointment_type,
            appointment_date=appointment_date,
            appointment_time=data['appointment_time'],
            notes=data.get('notes', ''),
            status=AppointmentStatus.CONFIRMED
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment booked successfully',
            'appointment': appointment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating appointment: {str(e)}")
        return jsonify({'error': 'Failed to create appointment'}), 500


@appointments_bp.route('', methods=['GET'])
@jwt_required()
def get_user_appointments():
    """Get all appointments for the authenticated user"""
    try:
        user_id = get_jwt_identity()
        appointments = Appointment.query.filter_by(user_id=user_id).order_by(Appointment.appointment_date.desc()).all()
        
        return jsonify({
            'appointments': [apt.to_dict() for apt in appointments]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching user appointments: {str(e)}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500


@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    """Get a specific appointment"""
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        return jsonify(appointment.to_dict()), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching appointment: {str(e)}")
        return jsonify({'error': 'Failed to fetch appointment'}), 500


@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
@validate_json
def update_appointment(appointment_id):
    """Update an appointment"""
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'appointment_date' in data:
            try:
                appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format'}), 400
        
        if 'appointment_time' in data:
            appointment.appointment_time = data['appointment_time']
        
        if 'notes' in data:
            appointment.notes = data['notes']
        
        if 'status' in data:
            try:
                appointment.status = AppointmentStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating appointment: {str(e)}")
        return jsonify({'error': 'Failed to update appointment'}), 500


@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(appointment_id):
    """Cancel an appointment"""
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        appointment.status = AppointmentStatus.CANCELLED
        db.session.commit()
        
        return jsonify({'message': 'Appointment cancelled successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error cancelling appointment: {str(e)}")
        return jsonify({'error': 'Failed to cancel appointment'}), 500


# Admin routes
@appointments_bp.route('/admin/all', methods=['GET'])
@admin_required
def get_all_appointments():
    """Get all appointments (admin only)"""
    try:
        appointments = Appointment.query.order_by(Appointment.appointment_date.desc()).all()
        
        return jsonify({
            'appointments': [apt.to_dict() for apt in appointments],
            'total': len(appointments)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching all appointments: {str(e)}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500


@appointments_bp.route('/admin/<int:appointment_id>/status', methods=['PUT'])
@admin_required
@validate_json
def update_appointment_status(appointment_id):
    """Update appointment status (admin only)"""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        try:
            appointment.status = AppointmentStatus(data['status'])
        except ValueError:
            return jsonify({'error': f"Invalid status. Must be one of: {', '.join([s.value for s in AppointmentStatus])}"}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment status updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating appointment status: {str(e)}")
        return jsonify({'error': 'Failed to update appointment status'}), 500
