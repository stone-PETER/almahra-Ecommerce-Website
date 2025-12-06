from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, CartItem, Product, ProductVariant, Prescription
from app.utils.auth import token_required, get_current_user
from app.utils.validators import validate_json, validate_required_fields
import json

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    """Get user's cart items"""
    try:
        current_user_id = get_jwt_identity()
        
        cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
        
        total_amount = sum(item.total_price for item in cart_items)
        
        return jsonify({
            'cart_items': [item.to_dict() for item in cart_items],
            'total_items': len(cart_items),
            'total_amount': total_amount
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching cart: {str(e)}")
        return jsonify({'error': 'Failed to fetch cart'}), 500

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
@validate_json
def add_to_cart():
    """Add item to cart"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        current_app.logger.info(f"Add to cart request - User: {current_user_id}, Data: {data}")
        
        # Map variant_id to product_variant_id if provided
        if 'variant_id' in data and 'product_variant_id' not in data:
            data['product_variant_id'] = data['variant_id']
        
        # Validate required fields
        required_fields = ['product_id', 'quantity']
        validation_errors = validate_required_fields(data, required_fields)
        if validation_errors:
            current_app.logger.error(f"Validation errors: {validation_errors}")
            return jsonify({'errors': validation_errors}), 400
        
        product_id = data['product_id']
        quantity = data['quantity']
        product_variant_id = data.get('product_variant_id')
        prescription_id = data.get('prescription_id')
        lens_options = data.get('lens_options', {})
        frame_adjustments = data.get('frame_adjustments', {})
        special_instructions = data.get('special_instructions', '')
        
        # Validate quantity
        if not isinstance(quantity, int) or quantity <= 0:
            current_app.logger.error(f"Invalid quantity: {quantity}, type: {type(quantity)}")
            return jsonify({'error': 'Quantity must be a positive integer'}), 400
        
        # Check if product exists
        product = Product.query.filter_by(id=product_id, is_active=True).first()
        if not product:
            current_app.logger.error(f"Product not found: {product_id}")
            return jsonify({'error': 'Product not found'}), 404
        
        # Check if product variant exists (if provided)
        if product_variant_id:
            variant = ProductVariant.query.filter_by(
                id=product_variant_id,
                product_id=product_id,
                is_active=True
            ).first()
            if not variant:
                return jsonify({'error': 'Product variant not found'}), 404
        
        # Check if prescription exists (if provided)
        if prescription_id:
            prescription = Prescription.query.filter_by(
                id=prescription_id,
                user_id=current_user_id
            ).first()
            if not prescription:
                return jsonify({'error': 'Prescription not found'}), 404
        
        # Check stock availability
        if product.track_inventory:
            available_stock = product.stock_quantity
            if product_variant_id:
                variant = ProductVariant.query.get(product_variant_id)
                available_stock = variant.stock_quantity
            
            current_app.logger.info(f"Stock check - Product: {product_id}, Track inventory: {product.track_inventory}, Available: {available_stock}, Requested: {quantity}")
            
            if available_stock < quantity:
                current_app.logger.error(f"Insufficient stock - Available: {available_stock}, Requested: {quantity}")
                return jsonify({
                    'error': 'Insufficient stock',
                    'available_stock': available_stock
                }), 400
        
        # Check if item already exists in cart
        existing_item = CartItem.query.filter_by(
            user_id=current_user_id,
            product_id=product_id,
            product_variant_id=product_variant_id,
            prescription_id=prescription_id
        ).first()
        
        current_app.logger.info(f"Existing item check - Found: {existing_item is not None}")
        
        if existing_item:
            # Update existing item
            new_quantity = existing_item.quantity + quantity
            
            current_app.logger.info(f"Updating existing item - Current qty: {existing_item.quantity}, Adding: {quantity}, New total: {new_quantity}")
            
            # Check stock for new quantity
            if product.track_inventory:
                available_stock = product.stock_quantity
                if product_variant_id:
                    variant = ProductVariant.query.get(product_variant_id)
                    available_stock = variant.stock_quantity
                
                current_app.logger.info(f"Stock check - Available: {available_stock}, New total requested: {new_quantity}")
                
                if available_stock < new_quantity:
                    current_app.logger.error(f"Insufficient stock - Available: {available_stock}, Already in cart: {existing_item.quantity}, Trying to add: {quantity}")
                    return jsonify({
                        'error': f'Cannot add {quantity} more. You have {existing_item.quantity} in cart. Only {available_stock} available in stock.',
                        'available_stock': available_stock,
                        'current_in_cart': existing_item.quantity
                    }), 400
            
            existing_item.quantity = new_quantity
            existing_item.lens_options = json.dumps(lens_options) if lens_options else None
            existing_item.frame_adjustments = json.dumps(frame_adjustments) if frame_adjustments else None
            existing_item.special_instructions = special_instructions
        else:
            # Create new cart item
            current_app.logger.info(f"Creating new cart item")
            cart_item = CartItem(
                user_id=current_user_id,
                product_id=product_id,
                product_variant_id=product_variant_id,
                prescription_id=prescription_id,
                quantity=quantity,
                lens_options=json.dumps(lens_options) if lens_options else None,
                frame_adjustments=json.dumps(frame_adjustments) if frame_adjustments else None,
                special_instructions=special_instructions
            )
            db.session.add(cart_item)
        
        current_app.logger.info(f"About to commit to database")
        db.session.commit()
        current_app.logger.info(f"Successfully committed")
        
        return jsonify({'message': 'Item added to cart successfully'}), 201
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding to cart: {str(e)}")
        return jsonify({'error': 'Failed to add item to cart'}), 500

@cart_bp.route('/update/<int:cart_item_id>', methods=['PUT'])
@jwt_required()
@validate_json
def update_cart_item(cart_item_id):
    """Update cart item"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        current_app.logger.info(f"Update cart item - User: {current_user_id}, Item ID: {cart_item_id}, Data: {data}")
        
        cart_item = CartItem.query.filter_by(
            id=cart_item_id,
            user_id=current_user_id
        ).first()
        
        if not cart_item:
            current_app.logger.error(f"Cart item not found - ID: {cart_item_id}, User: {current_user_id}")
            return jsonify({'error': 'Cart item not found'}), 404
        
        # Update quantity if provided
        if 'quantity' in data:
            quantity = data['quantity']
            
            current_app.logger.info(f"Updating quantity to: {quantity}")
            
            if not isinstance(quantity, int) or quantity <= 0:
                current_app.logger.error(f"Invalid quantity: {quantity}, type: {type(quantity)}")
                return jsonify({'error': 'Quantity must be a positive integer'}), 400
            
            # Check stock availability
            if cart_item.product.track_inventory:
                available_stock = cart_item.product.stock_quantity
                if cart_item.product_variant_id:
                    available_stock = cart_item.product_variant.stock_quantity
                
                current_app.logger.info(f"Stock check for update - Available: {available_stock}, Requested: {quantity}")
                
                if available_stock < quantity:
                    current_app.logger.error(f"Insufficient stock - Available: {available_stock}, Requested: {quantity}")
                    return jsonify({
                        'error': f'Only {available_stock} item(s) available in stock',
                        'available_stock': available_stock
                    }), 400
            
            cart_item.quantity = quantity
        
        # Update other fields if provided
        if 'lens_options' in data:
            cart_item.lens_options = json.dumps(data['lens_options']) if data['lens_options'] else None
        
        if 'frame_adjustments' in data:
            cart_item.frame_adjustments = json.dumps(data['frame_adjustments']) if data['frame_adjustments'] else None
        
        if 'special_instructions' in data:
            cart_item.special_instructions = data['special_instructions']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Cart item updated successfully',
            'cart_item': cart_item.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating cart item: {str(e)}")
        return jsonify({'error': 'Failed to update cart item'}), 500

@cart_bp.route('/remove/<int:cart_item_id>', methods=['DELETE'])
@jwt_required()
def remove_cart_item(cart_item_id):
    """Remove item from cart"""
    try:
        current_user_id = get_jwt_identity()
        
        cart_item = CartItem.query.filter_by(
            id=cart_item_id,
            user_id=current_user_id
        ).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Item removed from cart successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error removing cart item: {str(e)}")
        return jsonify({'error': 'Failed to remove cart item'}), 500

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear all items from cart"""
    try:
        current_user_id = get_jwt_identity()
        
        cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
        
        for item in cart_items:
            db.session.delete(item)
        
        db.session.commit()
        
        return jsonify({'message': 'Cart cleared successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error clearing cart: {str(e)}")
        return jsonify({'error': 'Failed to clear cart'}), 500

@cart_bp.route('/count', methods=['GET'])
@jwt_required()
def get_cart_count():
    """Get cart item count"""
    try:
        current_user_id = get_jwt_identity()
        
        count = CartItem.query.filter_by(user_id=current_user_id).count()
        
        return jsonify({'count': count}), 200
    
    except Exception as e:
        current_app.logger.error(f"Error getting cart count: {str(e)}")
        return jsonify({'error': 'Failed to get cart count'}), 500

@cart_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_cart():
    """Validate cart items before checkout"""
    try:
        current_user_id = get_jwt_identity()
        
        cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
        
        if not cart_items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        validation_errors = []
        
        for item in cart_items:
            # Check if product is still active
            if not item.product.is_active:
                validation_errors.append({
                    'item_id': item.id,
                    'error': f'Product "{item.product.name}" is no longer available'
                })
                continue
            
            # Check stock availability
            if item.product.track_inventory:
                available_stock = item.product.stock_quantity
                if item.product_variant_id:
                    available_stock = item.product_variant.stock_quantity
                
                if available_stock < item.quantity:
                    validation_errors.append({
                        'item_id': item.id,
                        'error': f'Only {available_stock} items available for "{item.product.name}"',
                        'available_stock': available_stock
                    })
        
        if validation_errors:
            return jsonify({
                'valid': False,
                'errors': validation_errors
            }), 400
        
        return jsonify({
            'valid': True,
            'message': 'Cart is valid for checkout'
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error validating cart: {str(e)}")
        return jsonify({'error': 'Failed to validate cart'}), 500