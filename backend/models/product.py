from backend.app import db
from datetime import datetime

class ProductCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    products = db.relationship('Product', backref='category', lazy=True)
    subcategories = db.relationship('ProductSubcategory', backref='category', lazy=True)

class ProductSubcategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('product_category.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    products = db.relationship('Product', backref='subcategory', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    estimated_value = db.Column(db.Float, nullable=False)
    condition = db.Column(db.String(50), nullable=False)  # new, like-new, good, fair, poor
    quantity = db.Column(db.Integer, default=1)
    address = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    images = db.Column(db.JSON)  # Array of image paths
    availability_status = db.Column(db.String(20), default='available')  # available, unavailable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('product_category.id'), nullable=False)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('product_subcategory.id'))
    
    # Relationships
    trades_offered = db.relationship('Trade', foreign_keys='Trade.offered_product_id', backref='offered_product', lazy=True)
    trades_requested = db.relationship('Trade', foreign_keys='Trade.requested_product_id', backref='requested_product', lazy=True)
    favorites = db.relationship('Favorite', backref='product', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'estimated_value': self.estimated_value,
            'condition': self.condition,
            'quantity': self.quantity,
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
    
    def update_availability(self):
        """Update availability based on quantity"""
        if self.quantity <= 0:
            self.availability_status = 'unavailable'
        else:
            self.availability_status = 'available'
