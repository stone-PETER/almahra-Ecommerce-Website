# Email System Integration

## Overview
The Almahra E-commerce application now includes a comprehensive email notification system that automatically sends emails for order and appointment events.

## Email Address
All emails are sent from: **support.almahra@gmail.com**

## Email Notifications

### Order Notifications

1. **Order Confirmed**
   - Triggered when: Order is created or status changes to CONFIRMED
   - Contains: Order number, items, total amount
   - Route: `POST /api/orders` or Admin updates status to CONFIRMED

2. **Order Shipped**
   - Triggered when: Admin updates order status to SHIPPED
   - Contains: Order number, tracking number
   - Route: `PUT /api/admin/orders/{id}/status`

3. **Order Out for Delivery**
   - Triggered when: Admin updates order status to OUT_FOR_DELIVERY
   - Contains: Order number, tracking number, expected delivery
   - Route: `PUT /api/admin/orders/{id}/status`

4. **Order Delivered**
   - Triggered when: Admin updates order status to DELIVERED
   - Contains: Order number, delivery confirmation
   - Route: `PUT /api/admin/orders/{id}/status`

5. **Order Cancelled**
   - Triggered when: Customer cancels order or admin sets status to CANCELLED
   - Contains: Order number, cancellation details
   - Routes: `POST /api/orders/{id}/cancel` or `PUT /api/admin/orders/{id}/status`

### Appointment Notifications

1. **Appointment Confirmed**
   - Triggered when: New appointment is created or admin confirms appointment
   - Contains: Appointment type, date, time, contact info
   - Routes: `POST /api/appointments` or `PUT /api/admin/appointments/{id}/status`

2. **Appointment Completed**
   - Triggered when: Admin updates appointment status to COMPLETED
   - Contains: Appointment type, date, thank you message
   - Route: `PUT /api/admin/appointments/{id}/status`

3. **Appointment Cancelled**
   - Triggered when: Customer or admin cancels appointment
   - Contains: Appointment details, cancellation message
   - Routes: `DELETE /api/appointments/{id}` or `PUT /api/admin/appointments/{id}/status`

## Email Configuration

### Environment Variables
To enable email sending, configure these environment variables:

```bash
# Gmail SMTP Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=support.almahra@gmail.com
MAIL_PASSWORD=your_app_password_here
MAIL_DEFAULT_SENDER=support.almahra@gmail.com
```

### Gmail Setup
1. Enable 2-Factor Authentication on the Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Generate new password
   - Use this password in `MAIL_PASSWORD` environment variable

## Email Templates

All emails use responsive HTML templates with:
- Professional Almahra branding
- Clear subject lines
- Order/appointment details
- Support contact information (support.almahra@gmail.com)
- Fallback plain text version

### Template Colors
- Order Confirmed: Green (#059669)
- Order Shipped: Purple (#7c3aed)
- Out for Delivery: Orange (#f59e0b)
- Delivered: Green (#10b981)
- Cancelled: Red (#ef4444/#dc2626)
- Appointment Confirmed: Blue (#3b82f6)
- Appointment Completed: Green (#059669)

## Implementation Files

### Modified Files
1. **backend/app/services/email_service.py**
   - Added 7 new email functions
   - Added 6 new HTML template functions
   - Updated existing templates with support email

2. **backend/app/routes/orders.py**
   - Added order confirmation email on creation
   - Added cancellation email on order cancel

3. **backend/app/routes/appointments.py**
   - Added confirmation email on appointment creation
   - Added cancellation email on appointment cancel
   - Added status-based emails in admin update

4. **backend/app/routes/admin_orders.py**
   - Added email notifications for all status changes
   - Checks old vs new status to avoid duplicate emails

5. **backend/config/config.py**
   - Updated default sender to support.almahra@gmail.com
   - Updated MAIL_USERNAME default

## Testing

### Test Order Flow
1. Create order → Receives confirmation email
2. Admin marks as SHIPPED → Receives shipped email
3. Admin marks as OUT_FOR_DELIVERY → Receives delivery email
4. Admin marks as DELIVERED → Receives delivered email
5. Customer cancels → Receives cancellation email

### Test Appointment Flow
1. Book appointment → Receives confirmation email
2. Admin marks as COMPLETED → Receives completion email
3. Customer cancels → Receives cancellation email

## Error Handling
- All email sending is wrapped in try-catch blocks
- Failed emails are logged but don't prevent operations
- Users still receive success responses even if email fails
- Errors are logged to application logs for monitoring

## Future Enhancements
- Email templates with logo images
- Order tracking links in emails
- Appointment reminder emails (24 hours before)
- Customizable email templates through admin panel
- Email delivery status tracking
- Bulk email notifications for promotions
