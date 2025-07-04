from backend.app import db
from datetime import datetime

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Either product_id OR service_id will be populated, not both
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='favorites')
    
    # Constraints to ensure only one type of item is favorited
    __table_args__ = (
        db.CheckConstraint(
            '(product_id IS NOT NULL AND service_id IS NULL) OR '
            '(product_id IS NULL AND service_id IS NOT NULL)',
            name='favorite_item_type_check'
        ),
        db.UniqueConstraint('user_id', 'product_id', name='unique_user_product_favorite'),
        db.UniqueConstraint('user_id', 'service_id', name='unique_user_service_favorite'),
    )
    
    def to_dict(self):
        item_data = None
        item_type = None
        
        if self.product_id:
            item_type = 'product'
            if self.product:
                item_data = {
                    'id': self.product.id,
                    'name': self.product.name,
                    'estimated_value': self.product.estimated_value,
                    'availability_status': self.product.availability_status,
                    'images': self.product.images,
                    'location': self.product.address
                }
        elif self.service_id:
            item_type = 'service'
            if self.service:
                item_data = {
                    'id': self.service.id,
                    'name': self.service.name,
                    'estimated_value': self.service.estimated_value,
                    'availability_status': self.service.availability_status,
                    'images': self.service.images,
                    'is_online': self.service.is_online,
                    'location': self.service.address if not self.service.is_online else None
                }
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'item_type': item_type,
            'item_data': item_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def get_user_favorites(cls, user_id, item_type=None):
        """Get all favorites for a user, optionally filtered by type"""
        query = cls.query.filter_by(user_id=user_id)
        
        if item_type == 'product':
            query = query.filter(cls.product_id.isnot(None))
        elif item_type == 'service':
            query = query.filter(cls.service_id.isnot(None))
            
        return query.all()
    
    @classmethod
    def is_favorited_by_user(cls, user_id, product_id=None, service_id=None):
        """Check if an item is favorited by a user"""
        if product_id:
            return cls.query.filter_by(user_id=user_id, product_id=product_id).first() is not None
        elif service_id:
            return cls.query.filter_by(user_id=user_id, service_id=service_id).first() is not None
        return False
