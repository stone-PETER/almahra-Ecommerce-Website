"""Test user registration directly"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, UserRole

def test_user_creation():
    """Test creating a user directly"""
    app = create_app()
    
    with app.app_context():
        # Check existing users
        existing_users = User.query.count()
        print(f"Existing users in database: {existing_users}")
        
        # Try to create a test user
        test_email = "test_user_001@example.com"
        
        # Delete if exists
        existing = User.query.filter_by(email=test_email).first()
        if existing:
            print(f"Deleting existing test user: {test_email}")
            db.session.delete(existing)
            db.session.commit()
        
        try:
            print(f"\nCreating new user: {test_email}")
            print(f"UserRole.CUSTOMER value: '{UserRole.CUSTOMER.value}'")
            
            user = User(
                email=test_email,
                first_name="Test",
                last_name="User",
                phone="1234567890",
                role=UserRole.CUSTOMER
            )
            user.set_password("TestPassword123!")
            
            db.session.add(user)
            db.session.commit()
            
            print(f"✓ User created successfully!")
            print(f"  User ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Role: {user.role}")
            print(f"  Role value: {user.role.value}")
            
            # Test querying back
            fetched_user = User.query.filter_by(email=test_email).first()
            if fetched_user:
                print(f"\n✓ User can be fetched from database")
                print(f"  Fetched role: {fetched_user.role}")
                print(f"  Fetched role value: {fetched_user.role.value}")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"\n✗ Error creating user:")
            print(f"  Error type: {type(e).__name__}")
            print(f"  Error message: {str(e)}")
            import traceback
            print(f"\nFull traceback:")
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = test_user_creation()
    sys.exit(0 if success else 1)
