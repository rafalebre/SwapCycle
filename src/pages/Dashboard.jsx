// Main dashboard layout
import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h3>Dashboard</h3>
        <nav>
          <button>Register Product</button>
          <button>Register Service</button>
          <button>Search</button>
          <button>My Listings</button>
          <button>Trades</button>
          <button>Favorites</button>
        </nav>
      </aside>
      <main className="content">
        <h2>Welcome to SwapCycle Dashboard</h2>
        <p>Select an option from the sidebar</p>
      </main>
    </div>
  );
};

export default Dashboard;
