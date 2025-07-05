from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.product import Product, ProductCategory
from backend.models.service import Service, ServiceCategory
from sqlalchemy import and_, or_, func
import math

search_bp = Blueprint('search', __name__)

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in kilometers"""
    if not all([lat1, lng1, lat2, lng2]):
        return None
    
    # Convert to radians
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth radius in kilometers
    r = 6371
    return c * r

@search_bp.route('/', methods=['GET'])
def search_all():
    """Universal search for products and services with map support"""
    # Get search parameters
    keyword = request.args.get('keyword', '').strip()
    search_type = request.args.get('type', 'all')  # all, products, services
    category_id = request.args.get('category_id', type=int)
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    
    # Location-based search parameters
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 10, type=float)  # km
    
    # Map bounds search (for when map is moved)
    north = request.args.get('north', type=float)
    south = request.args.get('south', type=float)
    east = request.args.get('east', type=float)
    west = request.args.get('west', type=float)
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    results = []
    
    # Search products
    if search_type in ['all', 'products']:
        product_query = Product.query.filter_by(availability_status='available')
        
        # Apply text and category filters
        if keyword:
            product_query = product_query.filter(
                or_(
                    Product.name.ilike(f'%{keyword}%'),
                    Product.description.ilike(f'%{keyword}%')
                )
            )
        if category_id:
            product_query = product_query.filter_by(category_id=category_id)
        if min_price:
            product_query = product_query.filter(Product.estimated_value >= min_price)
        if max_price:
            product_query = product_query.filter(Product.estimated_value <= max_price)
        
        # Apply location filters
        if north and south and east and west:
            # Map bounds filtering
            product_query = product_query.filter(
                and_(
                    Product.latitude.between(south, north),
                    Product.longitude.between(west, east)
                )
            )
        elif lat and lng and radius:
            # Radius filtering (simplified - for production use PostGIS)
            lat_range = radius / 111.0  # 1 degree ≈ 111 km
            lng_range = radius / (111.0 * math.cos(math.radians(lat)))
            
            product_query = product_query.filter(
                and_(
                    Product.latitude.between(lat - lat_range, lat + lat_range),
                    Product.longitude.between(lng - lng_range, lng + lng_range)
                )
            )
        
        products = product_query.all()
        
        for product in products:
            result = product.to_dict()
            result['type'] = 'product'
            
            # Calculate distance if user location provided
            if lat and lng and product.latitude and product.longitude:
                distance = calculate_distance(lat, lng, product.latitude, product.longitude)
                result['distance'] = round(distance, 2) if distance else None
            
            results.append(result)
    
    # Search services (only physical services for map)
    if search_type in ['all', 'services']:
        service_query = Service.query.filter(
            and_(
                Service.availability_status == 'available',
                Service.is_online == False  # Only physical services for map
            )
        )
        
        # Apply text and category filters
        if keyword:
            service_query = service_query.filter(
                or_(
                    Service.name.ilike(f'%{keyword}%'),
                    Service.description.ilike(f'%{keyword}%')
                )
            )
        if category_id:
            service_query = service_query.filter_by(category_id=category_id)
        if min_price:
            service_query = service_query.filter(Service.estimated_value >= min_price)
        if max_price:
            service_query = service_query.filter(Service.estimated_value <= max_price)
        
        # Apply location filters
        if north and south and east and west:
            # Map bounds filtering
            service_query = service_query.filter(
                and_(
                    Service.latitude.between(south, north),
                    Service.longitude.between(west, east)
                )
            )
        elif lat and lng and radius:
            # Radius filtering
            lat_range = radius / 111.0
            lng_range = radius / (111.0 * math.cos(math.radians(lat)))
            
            service_query = service_query.filter(
                and_(
                    Service.latitude.between(lat - lat_range, lat + lat_range),
                    Service.longitude.between(west - lng_range, lng + lng_range)
                )
            )
        
        services = service_query.all()
        
        for service in services:
            result = service.to_dict()
            result['type'] = 'service'
            
            # Calculate distance if user location provided
            if lat and lng and service.latitude and service.longitude:
                distance = calculate_distance(lat, lng, service.latitude, service.longitude)
                result['distance'] = round(distance, 2) if distance else None
            
            results.append(result)
    
    # Sort by distance if location provided, otherwise by creation date
    if lat and lng:
        results.sort(key=lambda x: x.get('distance') or float('inf'))
    else:
        results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    # Manual pagination
    total = len(results)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_results = results[start:end]
    
    return jsonify({
        'results': paginated_results,
        'total': total,
        'page': page,
        'pages': math.ceil(total / per_page),
        'per_page': per_page,
        'has_location_data': bool(lat and lng)
    })

@search_bp.route('/map-data', methods=['GET'])
def get_map_data():
    """Get simplified data for map markers"""
    # Get search parameters
    keyword = request.args.get('keyword', '').strip()
    search_type = request.args.get('type', 'all')
    category_id = request.args.get('category_id', type=int)
    
    # Map bounds (required for this endpoint)
    north = request.args.get('north', type=float)
    south = request.args.get('south', type=float)
    east = request.args.get('east', type=float)
    west = request.args.get('west', type=float)
    
    if not all([north, south, east, west]):
        return jsonify({'error': 'Map bounds required'}), 400
    
    markers = []
    
    # Get products for map
    if search_type in ['all', 'products']:
        product_query = Product.query.filter(
            and_(
                Product.availability_status == 'available',
                Product.latitude.between(south, north),
                Product.longitude.between(west, east),
                Product.latitude.isnot(None),
                Product.longitude.isnot(None)
            )
        )
        
        if keyword:
            product_query = product_query.filter(Product.name.ilike(f'%{keyword}%'))
        if category_id:
            product_query = product_query.filter_by(category_id=category_id)
        
        products = product_query.limit(100).all()  # Limit for performance
        
        for product in products:
            markers.append({
                'id': product.id,
                'type': 'product',
                'title': product.name,
                'price': product.estimated_value,
                'currency': product.currency,
                'latitude': product.latitude,
                'longitude': product.longitude,
                'image_url': product.image_url,
                'category': product.category.name if product.category else None
            })
    
    # Get services for map (only physical)
    if search_type in ['all', 'services']:
        service_query = Service.query.filter(
            and_(
                Service.availability_status == 'available',
                Service.is_online == False,
                Service.latitude.between(south, north),
                Service.longitude.between(west, east),
                Service.latitude.isnot(None),
                Service.longitude.isnot(None)
            )
        )
        
        if keyword:
            service_query = service_query.filter(Service.name.ilike(f'%{keyword}%'))
        if category_id:
            service_query = service_query.filter_by(category_id=category_id)
        
        services = service_query.limit(100).all()
        
        for service in services:
            markers.append({
                'id': service.id,
                'type': 'service',
                'title': service.name,
                'price': service.estimated_value,
                'currency': service.currency,
                'latitude': service.latitude,
                'longitude': service.longitude,
                'image_url': service.image_url,
                'category': service.category.name if service.category else None
            })
    
    return jsonify({
        'markers': markers,
        'total': len(markers)
    })

@search_bp.route('/products', methods=['GET'])
def search_products():
    """Search only products"""
    args = dict(request.args)
    args['type'] = 'products'
    
    # Forward to main search with type filter
    request.args = type('Args', (), args)()
    return search_all()

@search_bp.route('/services', methods=['GET'])
def search_services():
    """Search only physical services"""
    args = dict(request.args)
    args['type'] = 'services'
    
    request.args = type('Args', (), args)()
    return search_all()

@search_bp.route('/online-services', methods=['GET'])
def search_online_services():
    """Search only online services (no map needed)"""
    keyword = request.args.get('keyword', '').strip()
    category_id = request.args.get('category_id', type=int)
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), 100)
    
    query = Service.query.filter(
        and_(
            Service.availability_status == 'available',
            Service.is_online == True
        )
    )
    
    # Apply filters
    if keyword:
        query = query.filter(
            or_(
                Service.name.ilike(f'%{keyword}%'),
                Service.description.ilike(f'%{keyword}%')
            )
        )
    if category_id:
        query = query.filter_by(category_id=category_id)
    if min_price:
        query = query.filter(Service.estimated_value >= min_price)
    if max_price:
        query = query.filter(Service.estimated_value <= max_price)
    
    services = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    results = []
    for service in services.items:
        result = service.to_dict()
        result['type'] = 'service'
        results.append(result)
    
    return jsonify({
        'results': results,
        'total': services.total,
        'page': page,
        'pages': services.pages,
        'per_page': per_page
    })

@search_bp.route('/categories', methods=['GET'])
def get_search_categories():
    """Get categories for search filters"""
    search_type = request.args.get('type', 'all')
    
    categories = []
    
    if search_type in ['all', 'products']:
        product_categories = ProductCategory.query.all()
        for cat in product_categories:
            categories.append({
                'id': cat.id,
                'name': cat.name,
                'type': 'product',
                'count': Product.query.filter_by(
                    category_id=cat.id, 
                    availability_status='available'
                ).count()
            })
    
    if search_type in ['all', 'services']:
        service_categories = ServiceCategory.query.all()
        for cat in service_categories:
            categories.append({
                'id': cat.id,
                'name': cat.name,
                'type': 'service',
                'count': Service.query.filter_by(
                    category_id=cat.id, 
                    availability_status='available'
                ).count()
            })
    
    return jsonify({'categories': categories})
