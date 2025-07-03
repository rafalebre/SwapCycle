// Trade management page
import React from 'react';

const Trades = () => {
  return (
    <div className="trades-page">
      <h2>Trade Management</h2>
      <div className="tabs">
        <button className="tab active">Sent Proposals</button>
        <button className="tab">Received Proposals</button>
        <button className="tab">Completed Trades</button>
      </div>
      <div className="trades-list">
        <p>Your trade proposals will appear here</p>
      </div>
    </div>
  );
};

export default Trades;
