from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.product import Product, ProductCategory
from backend.models.service import Service, ServiceCategory
from sqlalchemy import and_, or_, func

search_bp = Blueprint('search', __name__)

@search_bp.route('/', methods=['GET'])
def search_all():
    """Universal search for products and services"""
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
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    
    results = []
    
    # Search products
    if search_type in ['all', 'products']:
        product_query = Product.query.filter_by(availability_status='available')
        
        # Apply filters
        if keyword:
            product_query = product_query.filter(Product.name.ilike(f'%{keyword}%'))
        if category_id:
            product_query = product_query.filter_by(category_id=category_id)
        if min_price:
            product_query = product_query.filter(Product.estimated_value >= min_price)
        if max_price:
            product_query = product_query.filter(Product.estimated_value <= max_price)
        
        # Location-based filtering for products
        if lat and lng:
            # Using simple distance calculation (for more accuracy, use PostGIS)
            distance_filter = func.sqrt(
                func.power(Product.latitude - lat, 2) + 
                func.power(Product.longitude - lng, 2)
            ) * 111.32 <= radius  # Rough km conversion
            product_query = product_query.filter(distance_filter)
        
        products = product_query.all()
        for product in products:
            result = product.to_dict()
            result['type'] = 'product'
            if lat and lng and product.latitude and product.longitude:
                # Calculate approximate distance
                distance = ((product.latitude - lat) ** 2 + (product.longitude - lng) ** 2) ** 0.5 * 111.32
                result['distance'] = round(distance, 2)
            results.append(result)
    
    # Search physical services
    if search_type in ['all', 'services']:
        service_query = Service.query.filter_by(
            availability_status='available',
            is_online=False
        )
        
        # Apply filters
        if keyword:
            service_query = service_query.filter(Service.name.ilike(f'%{keyword}%'))
        if category_id:
            service_query = service_query.filter_by(category_id=category_id)
        if min_price:
            service_query = service_query.filter(Service.estimated_value >= min_price)
        if max_price:
            service_query = service_query.filter(Service.estimated_value <= max_price)
        
        # Location-based filtering for services
        if lat and lng:
            distance_filter = func.sqrt(
                func.power(Service.latitude - lat, 2) + 
                func.power(Service.longitude - lng, 2)
            ) * 111.32 <= radius
            service_query = service_query.filter(distance_filter)
        
        services = service_query.all()
        for service in services:
            result = service.to_dict()
            result['type'] = 'service'
            if lat and lng and service.latitude and service.longitude:
                distance = ((service.latitude - lat) ** 2 + (service.longitude - lng) ** 2) ** 0.5 * 111.32
                result['distance'] = round(distance, 2)
            results.append(result)
    
    # Sort by distance if location provided, otherwise by creation date
    if lat and lng:
        results.sort(key=lambda x: x.get('distance', float('inf')))
    else:
        results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    # Implement pagination manually
    total = len(results)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_results = results[start:end]
    
    return jsonify({
        'results': paginated_results,
        'total': total,
        'page': page,
        'pages': (total + per_page - 1) // per_page,
        'per_page': per_page
    })

@search_bp.route('/products', methods=['GET'])
def search_products():
    """Search only products"""
    # Redirect to main search with type filter
    args = request.args.to_dict()
    args['type'] = 'products'
    
    # Rebuild query string
    query_string = '&'.join([f'{k}={v}' for k, v in args.items()])
    
    # Use the main search function but filter the request args
    request.args = request.args.copy()
    return search_all()

@search_bp.route('/services', methods=['GET'])
def search_services():
    """Search only physical services"""
    args = request.args.to_dict()
    args['type'] = 'services'
    return search_all()

@search_bp.route('/online-services', methods=['GET'])
def search_online_services():
    """Search only online services"""
    keyword = request.args.get('keyword', '').strip()
    category_id = request.args.get('category_id', type=int)
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), 100)
    
    query = Service.query.filter_by(
        availability_status='available',
        is_online=True
    )
    
    # Apply filters
    if keyword:
        query = query.filter(Service.name.ilike(f'%{keyword}%'))
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
                'type': 'product'
            })
    
    if search_type in ['all', 'services']:
        service_categories = ServiceCategory.query.all()
        for cat in service_categories:
            categories.append({
                'id': cat.id,
                'name': cat.name,
                'type': 'service'
            })
    
    return jsonify({'categories': categories})
