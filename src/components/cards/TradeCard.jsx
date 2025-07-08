import React from 'react';
import { Link } from 'react-router-dom';

const TradeCard = ({ trade, userType = 'proposer' }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { label: 'Pending', className: 'status-pending' },
      'accepted': { label: 'Accepted', className: 'status-accepted' },
      'declined': { label: 'Declined', className: 'status-declined' },
      'cancelled': { label: 'Cancelled', className: 'status-cancelled' },
      'completed': { label: 'Completed', className: 'status-completed' }
    };
    
    return badges[status] || { label: status, className: 'status-default' };
  };

  const statusBadge = getStatusBadge(trade?.status);

  const getOfferedItem = () => {
    if (trade?.offered_product) {
      return {
        type: 'product',
        name: trade.offered_product.name,
        value: trade.offered_product.estimated_value,
        id: trade.offered_product.id
      };
    }
    if (trade?.offered_service) {
      return {
        type: 'service',
        name: trade.offered_service.name,
        value: trade.offered_service.estimated_value,
        id: trade.offered_service.id
      };
    }
    return null;
  };

  const getRequestedItem = () => {
    if (trade?.requested_product) {
      return {
        type: 'product',
        name: trade.requested_product.name,
        value: trade.requested_product.estimated_value,
        id: trade.requested_product.id
      };
    }
    if (trade?.requested_service) {
      return {
        type: 'service',
        name: trade.requested_service.name,
        value: trade.requested_service.estimated_value,
        id: trade.requested_service.id
      };
    }
    return null;
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const offeredItem = getOfferedItem();
  const requestedItem = getRequestedItem();

  const handleAcceptTrade = () => {
    // TODO: Implement accept trade functionality
    console.log('Accept trade:', trade.id);
  };

  const handleDeclineTrade = () => {
    // TODO: Implement decline trade functionality
    console.log('Decline trade:', trade.id);
  };

  const handleCancelTrade = () => {
    // TODO: Implement cancel trade functionality
    console.log('Cancel trade:', trade.id);
  };

  return (
    <div className="trade-card">
      <div className="trade-header">
        <div className="trade-info">
          <h3 className="trade-title">
            Trade #{trade?.id}
          </h3>
          <span className={`status-badge ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>
        <div className="trade-date">
          {formatDate(trade?.created_at)}
        </div>
      </div>

      <div className="trade-content">
        <div className="trade-items">
          {/* Offered Item */}
          <div className="trade-item offered">
            <h4>Offering</h4>
            {offeredItem ? (
              <div className="item-details">
                <div className="item-type-badge">
                  {offeredItem.type === 'product' ? '📦' : '🛠️'} 
                  {offeredItem.type}
                </div>
                <p className="item-name">{offeredItem.name}</p>
                <p className="item-value">{formatPrice(offeredItem.value)}</p>
                <Link 
                  to={`/${offeredItem.type}/${offeredItem.id}`}
                  className="view-item-link"
                >
                  View Details
                </Link>
              </div>
            ) : (
              <p className="no-item">No item specified</p>
            )}
          </div>

          <div className="trade-arrow">
            ⇄
          </div>

          {/* Requested Item */}
          <div className="trade-item requested">
            <h4>Requesting</h4>
            {requestedItem ? (
              <div className="item-details">
                <div className="item-type-badge">
                  {requestedItem.type === 'product' ? '📦' : '🛠️'} 
                  {requestedItem.type}
                </div>
                <p className="item-name">{requestedItem.name}</p>
                <p className="item-value">{formatPrice(requestedItem.value)}</p>
                <Link 
                  to={`/${requestedItem.type}/${requestedItem.id}`}
                  className="view-item-link"
                >
                  View Details
                </Link>
              </div>
            ) : (
              <p className="no-item">No item specified</p>
            )}
          </div>
        </div>

        {/* Trade Message */}
        {trade?.message && (
          <div className="trade-message">
            <h4>Message</h4>
            <p>"{trade.message}"</p>
          </div>
        )}

        {/* Participants */}
        <div className="trade-participants">
          <div className="participant">
            <strong>Proposer:</strong> {trade?.proposer?.name || 'Unknown'}
          </div>
          <div className="participant">
            <strong>Receiver:</strong> {trade?.receiver?.name || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Trade Actions */}
      <div className="trade-actions">
        {trade?.status === 'pending' && (
          <>
            {userType === 'receiver' && (
              <>
                <button 
                  onClick={handleAcceptTrade}
                  className="btn btn-success"
                >
                  Accept Trade
                </button>
                <button 
                  onClick={handleDeclineTrade}
                  className="btn btn-danger"
                >
                  Decline Trade
                </button>
              </>
            )}
            
            {userType === 'proposer' && (
              <button 
                onClick={handleCancelTrade}
                className="btn btn-secondary"
              >
                Cancel Trade
              </button>
            )}
          </>
        )}

        <Link 
          to={`/dashboard/trade/${trade?.id}`}
          className="btn btn-outline"
        >
          View Full Details
        </Link>
      </div>
    </div>
  );
};

export default TradeCard;
