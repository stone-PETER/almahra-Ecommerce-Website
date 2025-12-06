from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.models import db, Order, OrderStatus
from app.utils.auth import admin_required
from app.utils.validators import validate_pagination_params, validate_json

admin_orders_bp = Blueprint('admin_orders', __name__)

@admin_orders_bp.route('', methods=['GET'])
@jwt_required()
@admin_required
def get_all_orders():
    """Get all orders (admin only)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '').strip()
        
        # Validate pagination
        page, per_page, pagination_errors = validate_pagination_params(page, per_page, 100)
        if pagination_errors:
            return jsonify({'errors': pagination_errors}), 400
        
        # Build query
        query = Order.query
        
        # Apply status filter if provided
        if status:
            try:
                status_enum = OrderStatus(status.upper())
                query = query.filter_by(status=status_enum)
            except ValueError:
                return jsonify({'error': 'Invalid order status'}), 400
        
        # Execute query with pagination
        orders_pagination = query.order_by(Order.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        orders = orders_pagination.items
        
        return jsonify({
            'orders': [order.to_dict(include_items=True) for order in orders],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': orders_pagination.total,
                'pages': orders_pagination.pages,
                'has_next': orders_pagination.has_next,
                'has_prev': orders_pagination.has_prev
            }
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching all orders: {str(e)}")
        return jsonify({'error': 'Failed to fetch orders'}), 500

@admin_orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_order_details(order_id):
    """Get order details (admin only)"""
    try:
        order = Order.query.get(order_id)
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify({
            'order': order.to_dict(include_items=True)
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching order {order_id}: {str(e)}")
        return jsonify({'error': 'Failed to fetch order'}), 500

@admin_orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    """Update order status (admin only)"""
    current_app.logger.error(f"!!!!! UPDATE_ORDER_STATUS FUNCTION ENTERED - ORDER ID: {order_id} !!!!!")
    print(f"========== UPDATE ORDER STATUS CALLED FOR ORDER {order_id} ==========", flush=True)
    print(f"Request method: {request.method}", flush=True)
    print(f"Request content type: {request.content_type}", flush=True)
    print(f"Request data: {request.data}", flush=True)
    
    try:
        # Try to get JSON data
        data = request.get_json(force=True, silent=True)
        print(f"Parsed data: {data}")
        
        if not data:
            current_app.logger.error(f"No data received. request.data: {request.data}")
            current_app.logger.error(f"Content-Type: {request.content_type}")
            return jsonify({'error': 'No data provided'}), 400
        
        current_app.logger.info(f"Updating order {order_id} with data: {data}")
        
        if 'status' not in data:
            current_app.logger.error(f"'status' field missing from data: {data}")
            return jsonify({'error': 'Status is required'}), 400
        
        order = Order.query.get(order_id)
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        try:
            status_upper = data['status'].upper()
            current_app.logger.info(f"Attempting to set status to: {status_upper}")
            new_status = OrderStatus(status_upper)
            order.status = new_status
            db.session.commit()
            
            current_app.logger.info(f"Order {order_id} status updated successfully to {new_status}")
            
            return jsonify({
                'message': 'Order status updated successfully',
                'order': order.to_dict(include_items=True)
            }), 200
        except ValueError as ve:
            current_app.logger.error(f"Invalid status value: {data['status']} (uppercase: {data['status'].upper()}). Valid values: {[s.value for s in OrderStatus]}")
            return jsonify({
                'error': f'Invalid order status: {data["status"]}',
                'valid_statuses': [s.value for s in OrderStatus]
            }), 400
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating order {order_id} status: {str(e)}")
        import traceback
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Failed to update order status'}), 500
