from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, decode_token
from backend.models.user import User
from backend.app import db
import re

class AuthService:
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_username(username):
        """Validate username format (alphanumeric, 3-20 characters)"""
        if not username or len(username) < 3 or len(username) > 20:
            return False
        return username.isalnum()
    
    @staticmethod
    def validate_password(password):
        """Validate password (minimum 8 characters, at least one number)"""
        if not password or len(password) < 8:
            return False
        return any(char.isdigit() for char in password)
    
    @staticmethod
    def check_user_exists(email, username):
        """Check if user with email or username already exists"""
        existing_user = User.query.filter(
            (User.email == email) | (User.username == username)
        ).first()
        
        if existing_user:
            if existing_user.email == email:
                return 'email'
            elif existing_user.username == username:
                return 'username'
        return None
    
    @staticmethod
    def create_user(user_data):
        """Create a new user with validation"""
        # Validate email
        if not AuthService.validate_email(user_data['email']):
            raise ValueError('Invalid email format')
        
        # Validate username
        if not AuthService.validate_username(user_data['username']):
            raise ValueError('Username must be alphanumeric and 3-20 characters')
        
        # Validate password
        if not AuthService.validate_password(user_data['password']):
            raise ValueError('Password must be at least 8 characters with at least one number')
        
        # Check if user exists
        exists = AuthService.check_user_exists(user_data['email'], user_data['username'])
        if exists == 'email':
            raise ValueError('Email already registered')
        elif exists == 'username':
            raise ValueError('Username already taken')
        
        # Create user
        user = User(
            email=user_data['email'],
            username=user_data['username'],
            name=user_data['name'],
            surname=user_data['surname'],
            address=user_data['address'],
            latitude=user_data.get('latitude'),
            longitude=user_data.get('longitude'),
            birth_date=user_data.get('birth_date'),
            preferred_currency=user_data.get('preferred_currency', 'USD')
        )
        user.set_password(user_data['password'])
        
        return user
    
    @staticmethod
    def authenticate_user(email, password):
        """Authenticate user and return user object if valid"""
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            return user
        return None
    
    @staticmethod
    def generate_tokens(user):
        """Generate access token for user"""
        return {
            'access_token': user.generate_token(),
            'user': user.to_dict()
        }
    
    @staticmethod
    def verify_token(token):
        """Verify JWT token and return user ID"""
        try:
            decoded = decode_token(token)
            return decoded['sub']  # User ID
        except:
            return None
