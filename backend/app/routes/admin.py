from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from app.models import (
    db, User, Product, Order, OrderItem, Review, 
    Category, Brand, OrderStatus, PaymentStatus, UserRole
)
from app.utils.auth import admin_required, super_admin_required
from app.utils.validators import (
    validate_json, validate_required_fields, validate_product_data,
    validate_pagination_params
)
from app.services.email_service import send_order_shipped_email

admin_bp = Blueprint('admin', __name__)

# Dashboard and Analytics

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard():
    """Get admin dashboard data"""
    try:
        # Get date range for analytics
        days = request.args.get('days', 30, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Sales metrics - only count delivered orders for revenue
        revenue_query = db.session.query(
            func.sum(Order.total_amount)
        ).filter(
            and_(
                Order.created_at >= start_date,
                Order.status == OrderStatus.DELIVERED
            )
        ).first()
        
        total_revenue = float(revenue_query[0]) if revenue_query[0] else 0
        
        # Total orders count - all orders in date range
        total_orders = Order.query.filter(
            Order.created_at >= start_date
        ).count()
        
        # Product metrics
        total_products = Product.query.filter_by(is_active=True).count()
        low_stock_products = Product.query.filter(
            and_(
                Product.is_active == True,
                Product.track_inventory == True,
                Product.stock_quantity <= Product.low_stock_threshold
            )
        ).count()
        
        # User metrics
        total_customers = User.query.filter_by(role=UserRole.CUSTOMER).count()
        new_customers = User.query.filter(
            and_(
                User.role == UserRole.CUSTOMER,
                User.created_at >= start_date
            )
        ).count()
        
        # Pending orders
        pending_orders = Order.query.filter(
            Order.status.in_([OrderStatus.PENDING, OrderStatus.CONFIRMED])
        ).count()
        
        # Recent orders
        recent_orders = Order.query.order_by(
            Order.created_at.desc()
        ).limit(10).all()
        
        # Format recent orders for dashboard display
        formatted_recent_orders = []
        for order in recent_orders:
            # Get first product name from order items
            product_name = "N/A"
            if order.items:
                first_item = order.items[0] if hasattr(order.items, '__iter__') else order.items.first()
                if first_item:
                    product_name = first_item.product_name
                    if len(list(order.items)) > 1:
                        product_name += f" (+{len(list(order.items)) - 1} more)"
            
            formatted_recent_orders.append({
                'id': order.id,
                'order_number': order.order_number,
                'customer': order.customer_email,
                'product': product_name,
                'amount': f"₹{float(order.total_amount):,.0f}",
                'status': order.status.value,
                'created_at': order.created_at.isoformat() if order.created_at else None
            })
        
        # Top selling products - only count delivered orders
        top_products = db.session.query(
            Product.name,
            func.sum(OrderItem.quantity).label('total_sold'),
            func.sum(OrderItem.total_price).label('total_revenue')
        ).join(
            OrderItem, Product.id == OrderItem.product_id
        ).join(
            Order, OrderItem.order_id == Order.id
        ).filter(
            and_(
                Order.created_at >= start_date,
                Order.status == OrderStatus.DELIVERED
            )
        ).group_by(
            Product.id, Product.name
        ).order_by(
            func.sum(OrderItem.quantity).desc()
        ).limit(5).all()
        
        return jsonify({
            'metrics': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'total_products': total_products,
                'low_stock_products': low_stock_products,
                'total_customers': total_customers,
                'new_customers': new_customers,
                'pending_orders': pending_orders,
                'average_order_value': total_revenue / total_orders if total_orders > 0 else 0
            },
            'recent_orders': formatted_recent_orders,
            'top_products': [
                {
                    'name': product[0],
                    'total_sold': product[1],
                    'total_revenue': float(product[2])
                }
                for product in top_products
            ],
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            }
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching dashboard data: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500

# Order Management

@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    """Get all orders with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '').strip()
        search = request.args.get('search', '').strip()
        
        # Validate pagination
        page, per_page, pagination_errors = validate_pagination_params(page, per_page, 100)
        if pagination_errors:
            return jsonify({'errors': pagination_errors}), 400
        
        # Build query
        query = Order.query
        
        # Apply status filter
        if status:
            try:
                status_enum = OrderStatus(status)
                query = query.filter_by(status=status_enum)
            except ValueError:
                return jsonify({'error': 'Invalid order status'}), 400
        
        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    Order.order_number.ilike(f'%{search}%'),
                    Order.customer_email.ilike(f'%{search}%'),
                    Order.customer_phone.ilike(f'%{search}%')
                )
            )
        
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
        current_app.logger.error(f"Error fetching orders: {str(e)}")
        return jsonify({'error': 'Failed to fetch orders'}), 500

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    """Update order status"""
    try:
        data = request.get_json(force=True, silent=True)
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Validate status - convert to uppercase first
        try:
            status_value = data['status'].upper()
            new_status = OrderStatus(status_value)
        except ValueError:
            return jsonify({
                'error': f'Invalid order status: {data["status"]}',
                'valid_statuses': [s.value for s in OrderStatus]
            }), 400
        
        old_status = order.status
        order.status = new_status
        
        # Handle stock reduction when order is confirmed
        if new_status == OrderStatus.CONFIRMED and old_status != OrderStatus.CONFIRMED:
            for item in order.items:
                product = Product.query.get(item.product_id)
                if product and product.track_inventory:
                    if product.stock_quantity >= item.quantity:
                        product.stock_quantity -= item.quantity
                        current_app.logger.info(f"Reduced stock for product {product.id} by {item.quantity}")
                    else:
                        # Log warning but don't block the order
                        current_app.logger.warning(f"Insufficient stock for product {product.id}: requested {item.quantity}, available {product.stock_quantity}")
        
        # Handle stock restoration when order is cancelled or returned
        elif new_status in [OrderStatus.CANCELLED, OrderStatus.RETURNED] and old_status == OrderStatus.CONFIRMED:
            for item in order.items:
                product = Product.query.get(item.product_id)
                if product and product.track_inventory:
                    product.stock_quantity += item.quantity
                    current_app.logger.info(f"Restored stock for product {product.id} by {item.quantity}")
        
        # Handle shipping information
        if new_status == OrderStatus.SHIPPED:
            order.shipped_at = datetime.utcnow()
            if 'tracking_number' in data:
                order.tracking_number = data['tracking_number']
            if 'shipping_method' in data:
                order.shipping_method = data['shipping_method']
        
        elif new_status == OrderStatus.DELIVERED:
            order.delivered_at = datetime.utcnow()
            if not order.shipped_at:
                order.shipped_at = datetime.utcnow()
        
        # Add admin notes if provided
        if 'notes' in data:
            timestamp = datetime.utcnow().isoformat()
            new_note = f"[{timestamp}] Status changed from {old_status.value} to {new_status.value}. {data['notes']}"
            order.admin_notes = f"{order.admin_notes}\n{new_note}" if order.admin_notes else new_note
        
        db.session.commit()
        
        # Send notification email if order shipped
        if new_status == OrderStatus.SHIPPED and old_status != OrderStatus.SHIPPED:
            try:
                send_order_shipped_email(order.customer_email, order)
            except Exception as e:
                current_app.logger.error(f"Failed to send shipping notification: {str(e)}")
        
        return jsonify({
            'message': 'Order status updated successfully',
            'order': order.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating order status: {str(e)}")
        return jsonify({'error': 'Failed to update order status'}), 500

# Product Management

@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_all_products():
    """Get all products for admin (including inactive)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '').strip()
        category_id = request.args.get('category_id', type=int)
        brand_id = request.args.get('brand_id', type=int)
        is_active = request.args.get('is_active', type=bool)
        
        # Validate pagination
        page, per_page, pagination_errors = validate_pagination_params(page, per_page, 100)
        if pagination_errors:
            return jsonify({'errors': pagination_errors}), 400
        
        # Build query (include inactive products for admin)
        query = Product.query
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f'%{search}%'),
                    Product.sku.ilike(f'%{search}%'),
                    Product.description.ilike(f'%{search}%')
                )
            )
        
        if category_id:
            query = query.join(Product.categories).filter(Category.id == category_id)
        
        if brand_id:
            query = query.filter(Product.brand_id == brand_id)
        
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
        
        # Execute query with pagination
        products_pagination = query.order_by(Product.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        products = products_pagination.items
        
        return jsonify({
            'products': [product.to_dict(include_details=True) for product in products],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': products_pagination.total,
                'pages': products_pagination.pages,
                'has_next': products_pagination.has_next,
                'has_prev': products_pagination.has_prev
            }
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching products: {str(e)}")
        return jsonify({'error': 'Failed to fetch products'}), 500

@admin_bp.route('/products', methods=['POST'])
@admin_required
@validate_json
def create_product():
    """Create new product"""
    try:
        data = request.get_json()
        
        # Validate product data
        validation_errors = validate_product_data(data)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        # Check if SKU already exists
        existing_product = Product.query.filter_by(sku=data['sku']).first()
        if existing_product:
            return jsonify({'error': 'SKU already exists'}), 409
        
        # Create product
        product = Product(
            name=data['name'],
            description=data['description'],
            short_description=data.get('short_description'),
            sku=data['sku'],
            slug=data.get('slug') or data['name'].lower().replace(' ', '-'),
            price=data['price'],
            compare_price=data.get('compare_price'),
            cost_price=data.get('cost_price'),
            stock_quantity=data.get('stock_quantity', 0),
            track_inventory=data.get('track_inventory', True),
            brand_id=data.get('brand_id'),
            weight=data.get('weight'),
            dimensions=data.get('dimensions'),
            material=data.get('material'),
            color=data.get('color'),
            frame_type=data.get('frame_type'),
            frame_style=data.get('frame_style'),
            lens_type=data.get('lens_type'),
            frame_width=data.get('frame_width'),
            lens_width=data.get('lens_width'),
            bridge_width=data.get('bridge_width'),
            temple_length=data.get('temple_length'),
            is_active=data.get('is_active', True),
            is_featured=data.get('is_featured', False)
        )
        
        # Handle tags
        if 'tags' in data:
            product.set_tags(data['tags'])
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict(include_details=True)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating product: {str(e)}")
        return jsonify({'error': 'Failed to create product'}), 500

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
@validate_json
def update_product(product_id):
    """Update product"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.get_json()
        
        # Validate product data
        validation_errors = validate_product_data(data)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        # Check if SKU already exists (excluding current product)
        if 'sku' in data:
            existing_product = Product.query.filter_by(sku=data['sku']).first()
            if existing_product and existing_product.id != product_id:
                return jsonify({'error': 'SKU already exists'}), 409
        
        # Update product fields
        updatable_fields = [
            'name', 'description', 'short_description', 'sku', 'slug',
            'price', 'compare_price', 'cost_price', 'stock_quantity',
            'track_inventory', 'brand_id', 'weight', 'dimensions',
            'material', 'color', 'frame_type', 'frame_style',
            'lens_type', 'frame_width', 'lens_width', 'bridge_width',
            'temple_length', 'is_active', 'is_featured'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(product, field, data[field])
        
        # Handle tags
        if 'tags' in data:
            product.set_tags(data['tags'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict(include_details=True)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating product: {str(e)}")
        return jsonify({'error': 'Failed to update product'}), 500

# User Management

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '').strip()
        role = request.args.get('role', '').strip()
        
        # Validate pagination
        page, per_page, pagination_errors = validate_pagination_params(page, per_page, 100)
        if pagination_errors:
            return jsonify({'errors': pagination_errors}), 400
        
        # Build query
        query = User.query
        
        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    User.email.ilike(f'%{search}%'),
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%'),
                    User.phone.ilike(f'%{search}%')
                )
            )
        
        # Apply role filter
        if role:
            try:
                role_enum = UserRole(role)
                query = query.filter_by(role=role_enum)
            except ValueError:
                return jsonify({'error': 'Invalid user role'}), 400
        
        # Execute query with pagination
        users_pagination = query.order_by(User.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        users = users_pagination.items
        
        return jsonify({
            'users': [user.to_dict() for user in users],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users_pagination.total,
                'pages': users_pagination.pages,
                'has_next': users_pagination.has_next,
                'has_prev': users_pagination.has_prev
            }
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'error': 'Failed to fetch users'}), 500