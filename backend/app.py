from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # FIX: Disable strict slashes to prevent 308 redirects
    app.url_map.strict_slashes = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS with specific settings
    CORS(app, 
         origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True,
         expose_headers=['Content-Length', 'X-JSON'])
    
    # Import models (needed for migrations)
    from backend.models.user import User
    from backend.models.product import Product, ProductCategory, ProductSubcategory
    from backend.models.service import Service, ServiceCategory, ServiceSubcategory
    from backend.models.trade import Trade
    from backend.models.favorite import Favorite
    
    # Register blueprints
    from backend.routes.auth import auth_bp
    from backend.routes.products import products_bp
    from backend.routes.services import services_bp
    from backend.routes.search import search_bp
    from backend.routes.utils import utils_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(services_bp, url_prefix='/api/services')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(utils_bp, url_prefix='/api/utils')
    
    # Health check route
    @app.route('/api/health')
    def health():
        return {'status': 'OK', 'message': 'SwapCycle API is running'}
    
    return app
