from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.service import Service, ServiceCategory, ServiceSubcategory
from backend.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

services_bp = Blueprint('services', __name__)

@services_bp.route('/', methods=['GET'])
def get_services():
    """Get all services with optional filtering"""
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    category_id = request.args.get('category_id', type=int)
    subcategory_id = request.args.get('subcategory_id', type=int)
    user_id = request.args.get('user_id', type=int)
    is_online = request.args.get('is_online', type=str)
    
    query = Service.query
    
    # Apply filters
    if category_id:
        query = query.filter_by(category_id=category_id)
    if subcategory_id:
        query = query.filter_by(subcategory_id=subcategory_id)
    if user_id:
        query = query.filter_by(user_id=user_id)
    if is_online is not None:
        query = query.filter_by(is_online=is_online.lower() == 'true')
    
    # Only show available services by default
    query = query.filter_by(availability_status='available')
    
    services = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'services': [service.to_dict() for service in services.items],
        'total': services.total,
        'pages': services.pages,
        'current_page': page
    })

@services_bp.route('/', methods=['POST'])
@jwt_required()
def create_service():
    """Create a new service"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'estimated_value', 'category_id', 'is_online']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    # Validate category exists
    category = ServiceCategory.query.get(data['category_id'])
    if not category:
        return jsonify({'message': 'Invalid category'}), 400
    
    # Validate subcategory if provided
    if 'subcategory_id' in data and data['subcategory_id']:
        subcategory = ServiceSubcategory.query.get(data['subcategory_id'])
        if not subcategory or subcategory.category_id != data['category_id']:
            return jsonify({'message': 'Invalid subcategory'}), 400
    
    # Validate location for physical services
    if not data['is_online'] and not data.get('address'):
        return jsonify({'message': 'Physical services must have an address'}), 400
    
    try:
        service = Service(
            name=data['name'],
            description=data.get('description'),
            estimated_value=float(data['estimated_value']),
            is_online=data['is_online'],
            address=data.get('address') if not data['is_online'] else None,
            latitude=data.get('latitude') if not data['is_online'] else None,
            longitude=data.get('longitude') if not data['is_online'] else None,
            user_id=user_id,
            category_id=data['category_id'],
            subcategory_id=data.get('subcategory_id')
        )
        
        # Validate location requirements
        service.validate_location()
        
        db.session.add(service)
        db.session.commit()
        
        return jsonify({
            'message': 'Service created successfully',
            'service': service.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating service'}), 500

@services_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    """Get a specific service"""
    service = Service.query.get_or_404(service_id)
    return jsonify({'service': service.to_dict()})

@services_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(service_id):
    """Update a service (only owner can update)"""
    user_id = get_jwt_identity()
    service = Service.query.get_or_404(service_id)
    
    # Check ownership
    if service.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        service.name = data['name']
    if 'description' in data:
        service.description = data['description']
    if 'estimated_value' in data:
        service.estimated_value = float(data['estimated_value'])
    if 'is_online' in data:
        service.is_online = data['is_online']
    if 'address' in data:
        service.address = data['address'] if not service.is_online else None
    if 'latitude' in data:
        service.latitude = data['latitude'] if not service.is_online else None
    if 'longitude' in data:
        service.longitude = data['longitude'] if not service.is_online else None
    
    try:
        service.validate_location()
        db.session.commit()
        return jsonify({
            'message': 'Service updated successfully',
            'service': service.to_dict()
        })
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating service'}), 500

@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    """Delete a service (only owner can delete)"""
    user_id = get_jwt_identity()
    service = Service.query.get_or_404(service_id)
    
    # Check ownership
    if service.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        db.session.delete(service)
        db.session.commit()
        return jsonify({'message': 'Service deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting service'}), 500

@services_bp.route('/categories', methods=['GET'])
def get_service_categories():
    """Get all service categories with subcategories"""
    categories = ServiceCategory.query.all()
    
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

@services_bp.route('/online', methods=['GET'])
def get_online_services():
    """Get only online services"""
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), 100)
    category_id = request.args.get('category_id', type=int)
    keyword = request.args.get('keyword', '')
    
    query = Service.query.filter_by(is_online=True, availability_status='available')
    
    # Apply filters
    if category_id:
        query = query.filter_by(category_id=category_id)
    if keyword:
        query = query.filter(Service.name.ilike(f'%{keyword}%'))
    
    services = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'services': [service.to_dict() for service in services.items],
        'total': services.total,
        'pages': services.pages,
        'current_page': page
    })
