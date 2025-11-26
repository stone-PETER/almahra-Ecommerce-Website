from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from config.config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
mail = Mail()
jwt = JWTManager()

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, 
                  origins=[
                      "http://localhost:3000", 
                      "http://localhost:5173",
                      "http://localhost:4173",  # Vite preview
                      "https://*.vercel.app",  # Vercel deployments
                      "https://*.netlify.app",  # Netlify deployments
                      "*"  # Allow all origins (remove this in production after setting up proper domain)
                  ],
                  supports_credentials=True,
                  allow_headers=["Content-Type", "Authorization"],
                  methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    mail.init_app(app)
    jwt.init_app(app)
    
    # Import models so Flask-Migrate can detect them
    with app.app_context():
        from app.models import user, product, order
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.cart import cart_bp
    from app.routes.orders import orders_bp
    from app.routes.admin import admin_bp
    from app.routes.users import users_bp
    from app.routes.payments import payments_bp
    # from app.routes.ar_integration import ar_bp  # Temporarily disabled due to CV2 import issues
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    # app.register_blueprint(ar_bp, url_prefix='/api/ar')  # Temporarily disabled
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'Almahra Ecommerce API'}, 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    return app