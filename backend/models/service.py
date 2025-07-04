from backend.app import db
from datetime import datetime

class ServiceCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    services = db.relationship('Service', backref='category', lazy=True)
    subcategories = db.relationship('ServiceSubcategory', backref='category', lazy=True)

class ServiceSubcategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('service_category.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    services = db.relationship('Service', backref='subcategory', lazy=True)

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    estimated_value = db.Column(db.Float, nullable=False)
    is_online = db.Column(db.Boolean, default=False)
    address = db.Column(db.String(200))  # Optional for online services
    latitude = db.Column(db.Float)  # Optional for online services
    longitude = db.Column(db.Float)  # Optional for online services
    images = db.Column(db.JSON)  # Array of image paths
    availability_status = db.Column(db.String(20), default='available')  # available, unavailable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('service_category.id'), nullable=False)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('service_subcategory.id'))
    
    # Relationships
    trades_offered = db.relationship('Trade', foreign_keys='Trade.offered_service_id', backref='offered_service', lazy=True)
    trades_requested = db.relationship('Trade', foreign_keys='Trade.requested_service_id', backref='requested_service', lazy=True)
    favorites = db.relationship('Favorite', backref='service', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'estimated_value': self.estimated_value,
            'is_online': self.is_online,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'images': self.images,
            'availability_status': self.availability_status,
            'category': self.category.name if self.category else None,
            'subcategory': self.subcategory.name if self.subcategory else None,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def validate_location(self):
        """Validate that physical services have location data"""
        if not self.is_online and not self.address:
            raise ValueError("Physical services must have an address")
        
        if self.is_online:
            # Clear location data for online services
            self.address = None
            self.latitude = None
            self.longitude = None
