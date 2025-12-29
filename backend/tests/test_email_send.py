import os
import sys

# Ensure backend package is importable when running tests from the repo root
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from app.services.email_service import send_order_confirmation_email
from types import SimpleNamespace
from datetime import datetime

app = create_app()

# Create a minimal order-like object
order = SimpleNamespace()
order.order_number = 'TEST12345'
order.created_at = datetime.utcnow()
order.items = [SimpleNamespace(product_name='Test Lens', quantity=1, unit_price=49.99, total_price=49.99)]
order.total_amount = 49.99
order.tracking_number = 'TRKTEST'

with app.app_context():
    recipient = app.config.get('MAIL_USERNAME') or 'support.almahra@gmail.com'
    print(f"Sending test order confirmation email to: {recipient}")
    success = send_order_confirmation_email(recipient, order)
    print(f"Email send result: {success}")
