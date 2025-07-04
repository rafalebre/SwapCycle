from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.product import Product, ProductCategory, ProductSubcategory
from backend.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    category_id = request.args.get('category_id', type=int)
    subcategory_id = request.args.get('subcategory_id', type=int)
    user_id = request.args.get('user_id', type=int)
    
    query = Product.query
    
    # Apply filters
    if category_id:
        query = query.filter_by(category_id=category_id)
    if subcategory_id:
        query = query.filter_by(subcategory_id=subcategory_id)
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    # Only show available products by default
    query = query.filter_by(availability_status='available')
    
    products = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': page
    })

@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    """Create a new product"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'estimated_value', 'condition', 'category_id', 'address']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    # Validate category exists
    category = ProductCategory.query.get(data['category_id'])
    if not category:
        return jsonify({'message': 'Invalid category'}), 400
    
    # Validate subcategory if provided
    if 'subcategory_id' in data and data['subcategory_id']:
        subcategory = ProductSubcategory.query.get(data['subcategory_id'])
        if not subcategory or subcategory.category_id != data['category_id']:
            return jsonify({'message': 'Invalid subcategory'}), 400
    
    try:
        product = Product(
            name=data['name'],
            description=data.get('description'),
            estimated_value=float(data['estimated_value']),
            condition=data['condition'],
            quantity=data.get('quantity', 1),
            address=data['address'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            user_id=user_id,
            category_id=data['category_id'],
            subcategory_id=data.get('subcategory_id')
        )
        
        # Update availability based on quantity
        product.update_availability()
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating product'}), 500

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product"""
    product = Product.query.get_or_404(product_id)
    return jsonify({'product': product.to_dict()})

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update a product (only owner can update)"""
    user_id = get_jwt_identity()
    product = Product.query.get_or_404(product_id)
    
    # Check ownership
    if product.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'estimated_value' in data:
        product.estimated_value = float(data['estimated_value'])
    if 'condition' in data:
        product.condition = data['condition']
    if 'quantity' in data:
        product.quantity = data['quantity']
        product.update_availability()
    if 'address' in data:
        product.address = data['address']
    if 'latitude' in data:
        product.latitude = data['latitude']
    if 'longitude' in data:
        product.longitude = data['longitude']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating product'}), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product (only owner can delete)"""
    user_id = get_jwt_identity()
    product = Product.query.get_or_404(product_id)
    
    # Check ownership
    if product.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting product'}), 500

@products_bp.route('/categories', methods=['GET'])
def get_product_categories():
    """Get all product categories with subcategories"""
    categories = ProductCategory.query.all()
    
    categories_data = []
    for category in categories:
        subcategories = [
            {
                'id': sub.id,
                'name': sub.name
            }
            for sub in category.subcategories
        ]
        
        categories_data.append({
            'id': category.id,
            'name': category.name,
            'subcategories': subcategories
        })
    
    return jsonify({'categories': categories_data})
