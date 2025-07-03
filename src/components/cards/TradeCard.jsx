// Trade proposal display card
import React from 'react';

const TradeCard = ({ trade, type = 'sent' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'accepted': return '#28a745';
      case 'declined': return '#dc3545';
      case 'cancelled': return '#6c757d';
      default: return '#007bff';
    }
  };

  return (
    <div className="trade-card">
      <div className="trade-items">
        <div className="offered-item">
          <h4>Offering:</h4>
          <p>{trade.offeredItem?.name || 'Item Name'}</p>
          <span className="value">${trade.offeredItem?.value || '0.00'}</span>
        </div>
        <div className="trade-arrow">↔</div>
        <div className="requested-item">
          <h4>Requesting:</h4>
          <p>{trade.requestedItem?.name || 'Item Name'}</p>
          <span className="value">${trade.requestedItem?.value || '0.00'}</span>
        </div>
      </div>
      
      <div className="trade-details">
        <span 
          className="status-badge" 
          style={{ backgroundColor: getStatusColor(trade.status) }}
        >
          {trade.status || 'pending'}
        </span>
        <span className="trade-date">{trade.createdAt || 'Date'}</span>
      </div>

      {trade.message && (
        <div className="trade-message">
          <p>"{trade.message}"</p>
        </div>
      )}

      {type === 'received' && trade.status === 'pending' && (
        <div className="trade-actions">
          <button className="btn btn-success">Accept</button>
          <button className="btn btn-danger">Decline</button>
        </div>
      )}

      {type === 'sent' && trade.status === 'pending' && (
        <div className="trade-actions">
          <button className="btn btn-secondary">Cancel</button>
        </div>
      )}
    </div>
  );
};

export default TradeCard;
