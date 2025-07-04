import requests
from config import Config
import logging

class GeocodingService:
    
    @staticmethod
    def geocode_address(address):
        """Convert address to latitude/longitude using Google Geocoding API"""
        try:
            api_key = Config.GOOGLE_MAPS_API_KEY
            if not api_key:
                logging.warning("No Google Maps API key configured")
                return None, None
            
            url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                'address': address,
                'key': api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data['status'] == 'OK' and data['results']:
                    location = data['results'][0]['geometry']['location']
                    return location['lat'], location['lng']
                elif data['status'] == 'ZERO_RESULTS':
                    logging.warning(f"No results found for address: {address}")
                    return None, None
                else:
                    logging.error(f"Geocoding API error: {data['status']}")
                    return None, None
            else:
                logging.error(f"Geocoding API request failed: {response.status_code}")
                return None, None
                
        except Exception as e:
            logging.error(f"Error geocoding address '{address}': {e}")
            return None, None
    
    @staticmethod
    def reverse_geocode(latitude, longitude):
        """Convert latitude/longitude to address using Google Geocoding API"""
        try:
            api_key = Config.GOOGLE_MAPS_API_KEY
            if not api_key:
                logging.warning("No Google Maps API key configured")
                return None
            
            url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                'latlng': f"{latitude},{longitude}",
                'key': api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data['status'] == 'OK' and data['results']:
                    return data['results'][0]['formatted_address']
                else:
                    logging.error(f"Reverse geocoding API error: {data['status']}")
                    return None
            else:
                logging.error(f"Reverse geocoding API request failed: {response.status_code}")
                return None
                
        except Exception as e:
            logging.error(f"Error reverse geocoding coordinates ({latitude}, {longitude}): {e}")
            return None
    
    @staticmethod
    def validate_coordinates(latitude, longitude):
        """Validate latitude and longitude values"""
        try:
            lat = float(latitude)
            lng = float(longitude)
            
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                return True
            else:
                return False
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def calculate_distance(lat1, lng1, lat2, lng2):
        """Calculate distance between two coordinates using Haversine formula"""
        try:
            import math
            
            # Convert to radians
            lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
            
            # Haversine formula
            dlat = lat2 - lat1
            dlng = lng2 - lng1
            a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
            c = 2 * math.asin(math.sqrt(a))
            
            # Earth radius in kilometers
            earth_radius = 6371
            distance = earth_radius * c
            
            return round(distance, 2)
            
        except Exception as e:
            logging.error(f"Error calculating distance: {e}")
            return None
    
    @staticmethod
    def get_nearby_bounds(latitude, longitude, radius_km=10):
        """Get bounding box coordinates for a given radius"""
        try:
            import math
            
            # Earth radius in kilometers
            earth_radius = 6371
            
            # Convert radius from kilometers to degrees
            lat_delta = radius_km / earth_radius * (180 / math.pi)
            lng_delta = radius_km / earth_radius * (180 / math.pi) / math.cos(math.radians(latitude))
            
            bounds = {
                'north': latitude + lat_delta,
                'south': latitude - lat_delta,
                'east': longitude + lng_delta,
                'west': longitude - lng_delta
            }
            
            return bounds
            
        except Exception as e:
            logging.error(f"Error calculating bounds: {e}")
            return None
