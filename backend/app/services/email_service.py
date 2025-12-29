from flask import current_app, render_template_string
from flask_mail import Message, Mail
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

mail = Mail()

def send_email(to_email, subject, html_body, text_body=None):
    """Send email using Flask-Mail"""
    try:
        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=html_body,
            body=text_body or strip_html_tags(html_body),
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_verification_email(email, token):
    """Send email verification email"""
    subject = "Verify Your Almahra Account"
    
    # Create verification URL
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    verification_url = f"{frontend_url}/verify-email?token={token}"
    
    html_body = render_verification_email_template(verification_url)
    text_body = f"""
Welcome to Almahra!

Please verify your email address by clicking the link below:
{verification_url}

If you didn't create an account with Almahra, you can safely ignore this email.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_password_reset_email(email, token):
    """Send password reset email"""
    subject = "Reset Your Almahra Password"
    
    # Create reset URL
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    reset_url = f"{frontend_url}/reset-password?token={token}"
    
    html_body = render_password_reset_email_template(reset_url)
    text_body = f"""
Hello,

You requested to reset your password for your Almahra account.

Please click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_order_confirmation_email(email, order):
    """Send order confirmation email"""
    subject = f"Order Confirmation - {order.order_number}"
    
    html_body = render_order_confirmation_template(order)
    text_body = f"""
Thank you for your order!

Order Number: {order.order_number}
Total: ${order.total_amount:.2f}

We'll send you another email when your order ships.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_order_shipped_email(email, order):
    """Send order shipped notification"""
    subject = f"Your Order Has Shipped - {order.order_number}"
    
    html_body = render_order_shipped_template(order)
    text_body = f"""
Great news! Your order has shipped.

Order Number: {order.order_number}
Tracking Number: {order.tracking_number}

You can track your package using the tracking number above.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_order_out_for_delivery_email(email, order):
    """Send order out for delivery notification"""
    subject = f"Your Order is Out for Delivery - {order.order_number}"
    
    html_body = render_order_out_for_delivery_template(order)
    text_body = f"""
Great news! Your order is out for delivery today.

Order Number: {order.order_number}
Tracking Number: {order.tracking_number or 'N/A'}

Your package should arrive later today.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_order_delivered_email(email, order):
    """Send order delivered notification"""
    subject = f"Your Order Has Been Delivered - {order.order_number}"
    
    html_body = render_order_delivered_template(order)
    text_body = f"""
Your order has been delivered successfully!

Order Number: {order.order_number}

We hope you enjoy your purchase. If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_order_cancelled_email(email, order):
    """Send order cancellation notification"""
    subject = f"Order Cancelled - {order.order_number}"
    
    html_body = render_order_cancelled_template(order)
    text_body = f"""
Your order has been cancelled.

Order Number: {order.order_number}
Total: ${order.total_amount:.2f}

If you didn't request this cancellation or have any questions, please contact our support team.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_appointment_confirmed_email(email, appointment):
    """Send appointment confirmation email"""
    subject = f"Appointment Confirmed - {appointment.appointment_type.value}"
    
    html_body = render_appointment_confirmed_template(appointment)
    text_body = f"""
Your appointment has been confirmed!

Type: {appointment.appointment_type.value}
Date: {appointment.appointment_date.strftime('%B %d, %Y')}
Time: {appointment.appointment_time}

{"Name: " + appointment.guest_name if appointment.guest_name else ""}
{"Email: " + appointment.guest_email if appointment.guest_email else ""}
{"Phone: " + appointment.guest_phone if appointment.guest_phone else ""}

{("Notes: " + appointment.notes) if appointment.notes else ""}

We look forward to seeing you!

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_appointment_completed_email(email, appointment):
    """Send appointment completion notification"""
    subject = f"Appointment Completed - {appointment.appointment_type.value}"
    
    html_body = render_appointment_completed_template(appointment)
    text_body = f"""
Thank you for your appointment!

Type: {appointment.appointment_type.value}
Date: {appointment.appointment_date.strftime('%B %d, %Y')}

We hope you had a great experience. If you have any feedback or questions, please don't hesitate to reach out.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_appointment_cancelled_email(email, appointment):
    """Send appointment cancellation notification"""
    subject = f"Appointment Cancelled - {appointment.appointment_type.value}"
    
    html_body = render_appointment_cancelled_template(appointment)
    text_body = f"""
Your appointment has been cancelled.

Type: {appointment.appointment_type.value}
Date: {appointment.appointment_date.strftime('%B %d, %Y')}
Time: {appointment.appointment_time}

If you'd like to reschedule or have any questions, please contact us.

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def send_welcome_email(email, first_name):
    """Send welcome email to new users"""
    subject = "Welcome to Almahra!"
    
    html_body = render_welcome_email_template(first_name)
    text_body = f"""
Hi {first_name},

Welcome to Almahra! We're excited to have you as part of our community.

Start exploring our collection of premium eyewear and enjoy:
- Free shipping on orders over $100
- 30-day return policy
- Virtual try-on with AR technology
- Expert customer support

Best regards,
The Almahra Team
    """.strip()
    
    return send_email(email, subject, html_body, text_body)

def render_verification_email_template(verification_url):
    """Render verification email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to Almahra</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for creating an account with Almahra! To complete your registration, please verify your email address by clicking the button below:</p>
            
            <a href="{{ verification_url }}" class="button">Verify Email Address</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="{{ verification_url }}">{{ verification_url }}</a></p>
            
            <p>If you didn't create an account with Almahra, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, verification_url=verification_url)

def render_password_reset_email_template(reset_url):
    """Render password reset email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Password Reset</h1>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password for your Almahra account. Click the button below to create a new password:</p>
            
            <a href="{{ reset_url }}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="{{ reset_url }}">{{ reset_url }}</a></p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, reset_url=reset_url)

def render_order_confirmation_template(order):
    """Render order confirmation email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-item { border-bottom: 1px solid #e5e7eb; padding: 15px 0; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
            <h2>Thank you for your order</h2>
            <p><strong>Order Number:</strong> {{ order.order_number }}</p>
            <p><strong>Order Date:</strong> {{ order.created_at.strftime('%B %d, %Y') }}</p>
            
            <h3>Order Items:</h3>
            {% for item in order.items %}
            <div class="order-item">
                <p><strong>{{ item.product_name }}</strong></p>
                <p>Quantity: {{ item.quantity }} × ${{ "%.2f"|format(item.unit_price) }} = ${{ "%.2f"|format(item.total_price) }}</p>
            </div>
            {% endfor %}
            
            <div class="total">
                <p>Total: ${{ "%.2f"|format(order.total_amount) }}</p>
            </div>
            
            <p>We'll send you another email when your order ships.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, order=order)

def render_order_shipped_template(order):
    """Render order shipped email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .tracking { background-color: #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Your Order Has Shipped!</h1>
        </div>
        <div class="content">
            <p><strong>Order Number:</strong> {{ order.order_number }}</p>
            
            {% if order.tracking_number %}
            <div class="tracking">
                <p><strong>Tracking Number:</strong> {{ order.tracking_number }}</p>
                <p>You can track your package using this tracking number.</p>
            </div>
            {% endif %}
            
            <p>Your order is on its way! You should receive it within 3-7 business days.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, order=order)

def render_welcome_email_template(first_name):
    """Render welcome email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Almahra</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .feature { margin: 15px 0; padding-left: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to Almahra</h1>
        </div>
        <div class="content">
            <h2>Hi {{ first_name }}!</h2>
            <p>Welcome to Almahra! We're excited to have you as part of our community.</p>
            
            <p>Start exploring our collection of premium eyewear and enjoy:</p>
            <div class="feature">✓ Free shipping on orders over $100</div>
            <div class="feature">✓ 30-day return policy</div>
            <div class="feature">✓ Virtual try-on with AR technology</div>
            <div class="feature">✓ Expert customer support</div>
            
            <p>If you have any questions, our support team is here to help!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, first_name=first_name)

def render_order_out_for_delivery_template(order):
    """Render order out for delivery email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Out for Delivery</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .tracking { background-color: #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📦 Out for Delivery!</h1>
        </div>
        <div class="content">
            <p><strong>Order Number:</strong> {{ order.order_number }}</p>
            
            {% if order.tracking_number %}
            <div class="tracking">
                <p><strong>Tracking Number:</strong> {{ order.tracking_number }}</p>
            </div>
            {% endif %}
            
            <p>Great news! Your order is out for delivery and should arrive today.</p>
            <p>Please ensure someone is available to receive the package.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, order=order)

def render_order_delivered_template(order):
    """Render order delivered email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✅ Delivered Successfully!</h1>
        </div>
        <div class="content">
            <p><strong>Order Number:</strong> {{ order.order_number }}</p>
            
            <p>Your order has been delivered successfully!</p>
            
            <p>We hope you enjoy your purchase. If you have any questions or concerns about your order, please don't hesitate to contact us.</p>
            
            <p>Thank you for shopping with Almahra!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, order=order)

def render_order_cancelled_template(order):
    """Render order cancelled email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-details { background-color: #fee2e2; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Order Cancelled</h1>
        </div>
        <div class="content">
            <p>Your order has been cancelled.</p>
            
            <div class="order-details">
                <p><strong>Order Number:</strong> {{ order.order_number }}</p>
                <p><strong>Total:</strong> ${{ "%.2f"|format(order.total_amount) }}</p>
            </div>
            
            <p>If you didn't request this cancellation or have any questions, please contact our support team immediately.</p>
            
            <p>We hope to serve you again soon!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, order=order)

def render_appointment_confirmed_template(appointment):
    """Render appointment confirmed email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmed</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment-details { background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📅 Appointment Confirmed!</h1>
        </div>
        <div class="content">
            <p>Your appointment has been confirmed!</p>
            
            <div class="appointment-details">
                <p><strong>Type:</strong> {{ appointment.appointment_type.value }}</p>
                <p><strong>Date:</strong> {{ appointment.appointment_date.strftime('%B %d, %Y') }}</p>
                <p><strong>Time:</strong> {{ appointment.appointment_time }}</p>
                {% if appointment.guest_name %}
                <p><strong>Name:</strong> {{ appointment.guest_name }}</p>
                {% endif %}
                {% if appointment.notes %}
                <p><strong>Notes:</strong> {{ appointment.notes }}</p>
                {% endif %}
            </div>
            
            <p>We look forward to seeing you!</p>
            
            <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, appointment=appointment)

def render_appointment_completed_template(appointment):
    """Render appointment completed email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Completed</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✓ Appointment Completed</h1>
        </div>
        <div class="content">
            <p>Thank you for your appointment!</p>
            
            <p><strong>Type:</strong> {{ appointment.appointment_type.value }}</p>
            <p><strong>Date:</strong> {{ appointment.appointment_date.strftime('%B %d, %Y') }}</p>
            
            <p>We hope you had a great experience with us. If you have any feedback or questions, please don't hesitate to reach out.</p>
            
            <p>We look forward to serving you again!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, appointment=appointment)

def render_appointment_cancelled_template(appointment):
    """Render appointment cancelled email HTML template"""
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Cancelled</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment-details { background-color: #fee2e2; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Appointment Cancelled</h1>
        </div>
        <div class="content">
            <p>Your appointment has been cancelled.</p>
            
            <div class="appointment-details">
                <p><strong>Type:</strong> {{ appointment.appointment_type.value }}</p>
                <p><strong>Date:</strong> {{ appointment.appointment_date.strftime('%B %d, %Y') }}</p>
                <p><strong>Time:</strong> {{ appointment.appointment_time }}</p>
            </div>
            
            <p>If you'd like to reschedule or have any questions, please contact us.</p>
            
            <p>We hope to see you soon!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Almahra Team</p>
            <p style="font-size: 12px; margin-top: 10px;">Contact us: support.almahra@gmail.com</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(template, appointment=appointment)

def strip_html_tags(html_text):
    """Strip HTML tags for plain text email"""
    import re
    clean = re.compile('<.*?>')
    return re.sub(clean, '', html_text)