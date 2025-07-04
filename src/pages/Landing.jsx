import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Se já estiver logado, redirecionar para dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container">
          <div className="nav-brand">
            <h1>SwapCycle</h1>
          </div>
          <nav className="nav-links">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1>Trade What You Have for What You Need</h1>
              <p>Join SwapCycle and exchange products and services without using money. 
                 Connect with your community and get exactly what you need.</p>
              
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  Start Trading Now
                </Link>
                <button 
                  className="btn btn-secondary btn-large"
                  onClick={() => {
                    document.getElementById('how-it-works').scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  How It Works
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <div className="container">
            <h2>How SwapCycle Works</h2>
            <div className="steps-grid">
              <div className="step">
                <div className="step-icon">📦</div>
                <h3>1. List Your Items</h3>
                <p>Register products or services you want to trade</p>
              </div>
              <div className="step">
                <div className="step-icon">🔍</div>
                <h3>2. Search & Browse</h3>
                <p>Find what you need from other community members</p>
              </div>
              <div className="step">
                <div className="step-icon">🤝</div>
                <h3>3. Propose Trades</h3>
                <p>Send trade proposals with messages</p>
              </div>
              <div className="step">
                <div className="step-icon">✅</div>
                <h3>4. Complete Exchange</h3>
                <p>Meet up and complete your trade</p>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2>Why Choose SwapCycle?</h2>
            <div className="features-grid">
              <div className="feature">
                <h3>🌍 Eco-Friendly</h3>
                <p>Reduce waste by giving items a second life</p>
              </div>
              <div className="feature">
                <h3>💰 Save Money</h3>
                <p>Get what you need without spending cash</p>
              </div>
              <div className="feature">
                <h3>🤝 Build Community</h3>
                <p>Connect with neighbors and local businesses</p>
              </div>
              <div className="feature">
                <h3>🔧 Services Too</h3>
                <p>Trade services like tutoring, repairs, and more</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <h2>Ready to Start Trading?</h2>
            <p>Join thousands of users already exchanging on SwapCycle</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Create Free Account
              </Link>
              <p className="cta-login">
                Already have an account? <Link to="/login">Sign in here</Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 SwapCycle. Built for community trading.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
