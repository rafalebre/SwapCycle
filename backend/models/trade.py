from backend.app import db
from datetime import datetime

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Users involved in trade
    proposer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Items being traded (one of each pair will be populated)
    offered_product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    offered_service_id = db.Column(db.Integer, db.ForeignKey('service.id'))
    requested_product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    requested_service_id = db.Column(db.Integer, db.ForeignKey('service.id'))
    
    # Trade status and messages
    status = db.Column(db.String(20), default='pending')  # pending, accepted, declined, cancelled
    proposal_message = db.Column(db.Text)  # Message from proposer
    response_message = db.Column(db.Text)  # Message from receiver when accepting/declining
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    proposer = db.relationship('User', foreign_keys=[proposer_id], backref='trades_proposed')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='trades_received')
    
    def to_dict(self):
        # Determine offered and requested items
        offered_item = None
        requested_item = None
        
        if self.offered_product_id:
            offered_item = {
                'type': 'product',
                'id': self.offered_product_id,
                'name': self.offered_product.name if self.offered_product else None,
                'value': self.offered_product.estimated_value if self.offered_product else None
            }
        elif self.offered_service_id:
            offered_item = {
                'type': 'service',
                'id': self.offered_service_id,
                'name': self.offered_service.name if self.offered_service else None,
                'value': self.offered_service.estimated_value if self.offered_service else None
            }
            
        if self.requested_product_id:
            requested_item = {
                'type': 'product',
                'id': self.requested_product_id,
                'name': self.requested_product.name if self.requested_product else None,
                'value': self.requested_product.estimated_value if self.requested_product else None
            }
        elif self.requested_service_id:
            requested_item = {
                'type': 'service',
                'id': self.requested_service_id,
                'name': self.requested_service.name if self.requested_service else None,
                'value': self.requested_service.estimated_value if self.requested_service else None
            }
        
        return {
            'id': self.id,
            'proposer_id': self.proposer_id,
            'receiver_id': self.receiver_id,
            'offered_item': offered_item,
            'requested_item': requested_item,
            'status': self.status,
            'proposal_message': self.proposal_message,
            'response_message': self.response_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def validate_trade_items(self):
        """Validate that trade has exactly one offered and one requested item"""
        offered_count = sum([
            1 if self.offered_product_id else 0,
            1 if self.offered_service_id else 0
        ])
        requested_count = sum([
            1 if self.requested_product_id else 0,
            1 if self.requested_service_id else 0
        ])
        
        if offered_count != 1:
            raise ValueError("Trade must have exactly one offered item")
        if requested_count != 1:
            raise ValueError("Trade must have exactly one requested item")
    
    def can_be_accepted(self):
        """Check if trade can be accepted (status is pending)"""
        return self.status == 'pending'
    
    def can_be_cancelled(self):
        """Check if trade can be cancelled by proposer"""
        return self.status == 'pending'
