import requests
from datetime import datetime, timedelta
from backend.app import db
from config import Config
import json
import os

class ExchangeService:
    
    # Supported currencies
    SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BRL', 'JPY']
    BASE_CURRENCY = 'USD'
    CACHE_FILE = 'exchange_rates_cache.json'
    CACHE_DURATION = timedelta(hours=24)  # Cache for 24 hours
    
    @staticmethod
    def _get_cache_file_path():
        """Get full path to cache file"""
        return os.path.join(os.path.dirname(__file__), ExchangeService.CACHE_FILE)
    
    @staticmethod
    def _load_cached_rates():
        """Load cached exchange rates"""
        try:
            cache_path = ExchangeService._get_cache_file_path()
            if os.path.exists(cache_path):
                with open(cache_path, 'r') as f:
                    cache_data = json.load(f)
                    
                # Check if cache is still valid
                cache_time = datetime.fromisoformat(cache_data['timestamp'])
                if datetime.now() - cache_time < ExchangeService.CACHE_DURATION:
                    return cache_data['rates']
        except Exception as e:
            print(f"Error loading cached rates: {e}")
        
        return None
    
    @staticmethod
    def _save_cached_rates(rates):
        """Save exchange rates to cache"""
        try:
            cache_data = {
                'timestamp': datetime.now().isoformat(),
                'rates': rates
            }
            cache_path = ExchangeService._get_cache_file_path()
            with open(cache_path, 'w') as f:
                json.dump(cache_data, f)
        except Exception as e:
            print(f"Error saving cached rates: {e}")
    
    @staticmethod
    def _fetch_rates_from_api():
        """Fetch exchange rates from external API"""
        try:
            api_key = Config.EXCHANGE_RATE_API_KEY
            if not api_key:
                print("Warning: No Exchange Rate API key configured")
                return None
            
            url = f"https://v6.exchangerate-api.com/v6/{api_key}/latest/USD"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('result') == 'success':
                    return data['conversion_rates']
            
        except Exception as e:
            print(f"Error fetching exchange rates: {e}")
        
        return None
    
    @staticmethod
    def get_exchange_rates():
        """Get current exchange rates (cached or fresh)"""
        # Try to load from cache first
        rates = ExchangeService._load_cached_rates()
        
        if rates is None:
            # Fetch fresh rates from API
            rates = ExchangeService._fetch_rates_from_api()
            
            if rates:
                # Save to cache
                ExchangeService._save_cached_rates(rates)
            else:
                # Fallback to default rates if API fails
                rates = ExchangeService._get_fallback_rates()
        
        return rates
    
    @staticmethod
    def _get_fallback_rates():
        """Fallback exchange rates when API is unavailable"""
        return {
            'USD': 1.0,
            'EUR': 0.85,
            'GBP': 0.73,
            'CAD': 1.25,
            'AUD': 1.35,
            'BRL': 5.0,
            'JPY': 110.0
        }
    
    @staticmethod
    def convert_currency(amount, from_currency, to_currency):
        """Convert amount from one currency to another"""
        if from_currency == to_currency:
            return amount
        
        rates = ExchangeService.get_exchange_rates()
        
        if not rates:
            return amount
        
        # Convert to USD first, then to target currency
        if from_currency != 'USD':
            if from_currency not in rates:
                return amount
            amount_usd = amount / rates[from_currency]
        else:
            amount_usd = amount
        
        if to_currency != 'USD':
            if to_currency not in rates:
                return amount
            return amount_usd * rates[to_currency]
        
        return amount_usd
    
    @staticmethod
    def get_supported_currencies():
        """Get list of supported currencies"""
        return ExchangeService.SUPPORTED_CURRENCIES
    
    @staticmethod
    def format_currency(amount, currency):
        """Format currency amount for display"""
        currency_symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'CAD': 'C$',
            'AUD': 'A$',
            'BRL': 'R$',
            'JPY': '¥'
        }
        
        symbol = currency_symbols.get(currency, currency)
        
        if currency == 'JPY':
            # No decimal places for JPY
            return f"{symbol}{amount:,.0f}"
        else:
            return f"{symbol}{amount:,.2f}"
