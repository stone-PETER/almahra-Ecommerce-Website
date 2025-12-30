from flask import Blueprint, request, jsonify, current_app
from app.models import db
from app.utils.validators import validate_json, validate_required_fields
from app.services.email_service import send_email
from datetime import datetime

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('', methods=['POST'])
@validate_json
def submit_contact_form():
    """Handle contact form submission"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'subject', 'message']
        validation_errors = validate_required_fields(data, required_fields)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        name = data['name']
        email = data['email']
        phone = data['phone']
        subject = data['subject']
        message = data['message']
        
        # Send email to support team
        try:
            support_email = current_app.config.get('MAIL_DEFAULT_SENDER', 'support.almahra@gmail.com')
            
            # Email to admin/support
            admin_subject = f"New Contact Form: {subject}"
            admin_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Contact Form Submission</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                    .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                    .info-row {{ margin: 15px 0; padding: 10px; background-color: #e5e7eb; border-radius: 4px; }}
                    .info-label {{ font-weight: bold; color: #1f2937; }}
                    .message-box {{ background-color: white; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📬 New Contact Form Submission</h1>
                </div>
                <div class="content">
                    <h2>Contact Details</h2>
                    
                    <div class="info-row">
                        <span class="info-label">Name:</span> {name}
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Email:</span> {email}
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Phone:</span> {phone}
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Subject:</span> {subject}
                    </div>
                    
                    <h3>Message:</h3>
                    <div class="message-box">
                        {message}
                    </div>
                    
                    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                        Submitted at: {datetime.utcnow().strftime('%B %d, %Y at %I:%M %p UTC')}
                    </p>
                </div>
                <div class="footer">
                    <p>Almahra E-commerce Admin</p>
                </div>
            </body>
            </html>
            """
            
            send_email(support_email, admin_subject, admin_html)
            current_app.logger.info(f"Contact form notification sent to {support_email}")
            
            # Confirmation email to customer
            customer_subject = "We received your message - Almahra"
            customer_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Message Received</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                    .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>✓ Message Received</h1>
                </div>
                <div class="content">
                    <p>Hi {name},</p>
                    
                    <p>Thank you for contacting Almahra! We've received your message and our team will get back to you within 24 hours.</p>
                    
                    <p><strong>Your message details:</strong></p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>Message:</strong> {message}</p>
                    
                    <p>If you have any urgent concerns, feel free to reach out to us directly:</p>
                    <ul>
                        <li>Email: support.almahra@gmail.com</li>
                        <li>Phone: {phone}</li>
                    </ul>
                    
                    <p>Best regards,<br>The Almahra Team</p>
                </div>
                <div class="footer">
                    <p>Contact us: support.almahra@gmail.com</p>
                </div>
            </body>
            </html>
            """
            
            send_email(email, customer_subject, customer_html)
            current_app.logger.info(f"Contact form confirmation sent to {email}")
            
        except Exception as e:
            current_app.logger.error(f"Failed to send contact form emails: {str(e)}")
            # Don't fail the request if email fails
        
        return jsonify({
            'message': 'Contact form submitted successfully',
            'data': {
                'name': name,
                'email': email,
                'subject': subject
            }
        }), 201
    
    except Exception as e:
        current_app.logger.error(f"Error processing contact form: {str(e)}")
        return jsonify({'error': 'Failed to submit contact form'}), 500
