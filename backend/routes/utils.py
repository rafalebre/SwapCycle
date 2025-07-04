from flask import Blueprint, request, jsonify
from backend.services.exchange_service import ExchangeService
from backend.services.geocoding_service import GeocodingService
from backend.models.product import ProductCategory, ProductSubcategory
from backend.models.service import ServiceCategory, ServiceSubcategory

utils_bp = Blueprint('utils', __name__)

@utils_bp.route('/currencies', methods=['GET'])
def get_currencies():
    """Get supported currencies with current exchange rates"""
    try:
        currencies = ExchangeService.get_supported_currencies()
        rates = ExchangeService.get_exchange_rates()
        
        currency_data = []
        for currency in currencies:
            formatted = ExchangeService.format_currency(100, currency)
            currency_data.append({
                'code': currency,
                'rate': rates.get(currency, 1.0) if rates else 1.0,
                'sample_format': formatted
            })
        
        return jsonify({
            'currencies': currency_data,
            'base_currency': 'USD',
            'last_updated': 'Cache info would go here'
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching currencies'}), 500

@utils_bp.route('/convert-currency', methods=['POST'])
def convert_currency():
    """Convert amount between currencies"""
    data = request.get_json()
    
    required_fields = ['amount', 'from_currency', 'to_currency']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    try:
        amount = float(data['amount'])
        from_currency = data['from_currency'].upper()
        to_currency = data['to_currency'].upper()
        
        converted_amount = ExchangeService.convert_currency(
            amount, from_currency, to_currency
        )
        
        return jsonify({
            'original': {
                'amount': amount,
                'currency': from_currency,
                'formatted': ExchangeService.format_currency(amount, from_currency)
            },
            'converted': {
                'amount': converted_amount,
                'currency': to_currency,
                'formatted': ExchangeService.format_currency(converted_amount, to_currency)
            }
        })
        
    except ValueError:
        return jsonify({'message': 'Invalid amount'}), 400
    except Exception as e:
        return jsonify({'message': 'Error converting currency'}), 500

@utils_bp.route('/geocode', methods=['POST'])
def geocode_address():
    """Convert address to coordinates"""
    data = request.get_json()
    
    if 'address' not in data:
        return jsonify({'message': 'Address is required'}), 400
    
    try:
        latitude, longitude = GeocodingService.geocode_address(data['address'])
        
        if latitude is not None and longitude is not None:
            return jsonify({
                'address': data['address'],
                'coordinates': {
                    'latitude': latitude,
                    'longitude': longitude
                },
                'success': True
            })
        else:
            return jsonify({
                'message': 'Could not geocode address',
                'success': False
            }), 404
            
    except Exception as e:
        return jsonify({'message': 'Error geocoding address'}), 500

@utils_bp.route('/reverse-geocode', methods=['POST'])
def reverse_geocode():
    """Convert coordinates to address"""
    data = request.get_json()
    
    required_fields = ['latitude', 'longitude']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    try:
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        
        if not GeocodingService.validate_coordinates(latitude, longitude):
            return jsonify({'message': 'Invalid coordinates'}), 400
        
        address = GeocodingService.reverse_geocode(latitude, longitude)
        
        if address:
            return jsonify({
                'coordinates': {
                    'latitude': latitude,
                    'longitude': longitude
                },
                'address': address,
                'success': True
            })
        else:
            return jsonify({
                'message': 'Could not reverse geocode coordinates',
                'success': False
            }), 404
            
    except ValueError:
        return jsonify({'message': 'Invalid coordinate values'}), 400
    except Exception as e:
        return jsonify({'message': 'Error reverse geocoding'}), 500

@utils_bp.route('/categories/all', methods=['GET'])
def get_all_categories():
    """Get all product and service categories"""
    try:
        # Get product categories
        product_categories = []
        for category in ProductCategory.query.all():
            subcategories = [
                {'id': sub.id, 'name': sub.name}
                for sub in category.subcategories
            ]
            product_categories.append({
                'id': category.id,
                'name': category.name,
                'type': 'product',
                'subcategories': subcategories
            })
        
        # Get service categories
        service_categories = []
        for category in ServiceCategory.query.all():
            subcategories = [
                {'id': sub.id, 'name': sub.name}
                for sub in category.subcategories
            ]
            service_categories.append({
                'id': category.id,
                'name': category.name,
                'type': 'service',
                'subcategories': subcategories
            })
        
        return jsonify({
            'product_categories': product_categories,
            'service_categories': service_categories,
            'total_categories': len(product_categories) + len(service_categories)
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching categories'}), 500

@utils_bp.route('/distance', methods=['POST'])
def calculate_distance():
    """Calculate distance between two coordinates"""
    data = request.get_json()
    
    required_fields = ['lat1', 'lng1', 'lat2', 'lng2']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    try:
        lat1 = float(data['lat1'])
        lng1 = float(data['lng1'])
        lat2 = float(data['lat2'])
        lng2 = float(data['lng2'])
        
        distance = GeocodingService.calculate_distance(lat1, lng1, lat2, lng2)
        
        if distance is not None:
            return jsonify({
                'distance_km': distance,
                'distance_miles': round(distance * 0.621371, 2)
            })
        else:
            return jsonify({'message': 'Error calculating distance'}), 500
            
    except ValueError:
        return jsonify({'message': 'Invalid coordinate values'}), 400
    except Exception as e:
        return jsonify({'message': 'Error calculating distance'}), 500
