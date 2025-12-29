# Email System Setup Guide

## Quick Setup for support.almahra@gmail.com

### Step 1: Gmail Account Configuration

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Click on "2-Step Verification"
   - Follow the prompts to enable 2FA

2. **Generate App Password**
   - After enabling 2FA, go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Almahra Backend"
   - Click "Generate"
   - **Save the 16-character password** (you won't see it again)

### Step 2: Backend Environment Configuration

Create or update your `.env` file in the `backend/` directory:

```bash
# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=support.almahra@gmail.com
MAIL_PASSWORD=your_16_char_app_password_here
MAIL_DEFAULT_SENDER=support.almahra@gmail.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### Step 3: Test the Email System

1. **Start the backend server:**
   ```bash
   cd backend
   python run.py
   ```

2. **Test order confirmation email:**
   - Create a new order through the frontend or API
   - Check that you receive an email confirmation

3. **Test appointment confirmation email:**
   - Book a new appointment
   - Check that you receive an email confirmation

### Step 4: Verify Email Logs

Check the backend logs for email sending status:
- Look for: "Email sent successfully to..."
- Or errors: "Failed to send email..."

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAIL_SERVER` | No | smtp.gmail.com | SMTP server address |
| `MAIL_PORT` | No | 587 | SMTP server port |
| `MAIL_USE_TLS` | No | true | Use TLS encryption |
| `MAIL_USERNAME` | Yes | support.almahra@gmail.com | Gmail account |
| `MAIL_PASSWORD` | Yes | - | Gmail app password |
| `MAIL_DEFAULT_SENDER` | No | support.almahra@gmail.com | From email address |
| `FRONTEND_URL` | No | http://localhost:3000 | Frontend URL for links |

## Troubleshooting

### Emails not sending?

1. **Check Gmail credentials:**
   - Verify MAIL_USERNAME and MAIL_PASSWORD are correct
   - Ensure you're using an App Password, not your regular password

2. **Check Gmail security settings:**
   - Make sure 2FA is enabled
   - Check if Google blocked suspicious activity
   - Visit: https://myaccount.google.com/notifications

3. **Check backend logs:**
   ```bash
   # Look for email-related errors
   grep -i "email" backend/logs/*.log
   ```

4. **Test SMTP connection:**
   ```python
   # Run this in Python console
   import smtplib
   server = smtplib.SMTP('smtp.gmail.com', 587)
   server.starttls()
   server.login('support.almahra@gmail.com', 'your_app_password')
   print("Connection successful!")
   server.quit()
   ```

### Common Errors

**"Authentication failed"**
- Wrong password or not using App Password
- 2FA not enabled on Gmail account

**"Connection refused"**
- Wrong MAIL_SERVER or MAIL_PORT
- Firewall blocking port 587

**"Sender address rejected"**
- MAIL_USERNAME and MAIL_DEFAULT_SENDER don't match
- Gmail account not verified

## Production Deployment

For production, use environment variables through your hosting platform:

### Heroku
```bash
heroku config:set MAIL_USERNAME=support.almahra@gmail.com
heroku config:set MAIL_PASSWORD=your_app_password
```

### Docker
```yaml
environment:
  - MAIL_USERNAME=support.almahra@gmail.com
  - MAIL_PASSWORD=your_app_password
```

### Vercel/Railway
Add environment variables through the dashboard UI.

## Email Sending Limits

Gmail has sending limits:
- **Free account:** 500 emails/day
- **Google Workspace:** 2000 emails/day

For high-volume needs, consider:
- SendGrid
- AWS SES
- Mailgun
- Postmark

## Security Best Practices

1. **Never commit .env files** - Already in .gitignore
2. **Use App Passwords** - Not your main Gmail password
3. **Rotate passwords regularly** - Every 90 days
4. **Monitor email logs** - Watch for unauthorized use
5. **Use environment variables** - Never hardcode credentials

## Next Steps

Once emails are working:
1. Customize email templates in `backend/app/services/email_service.py`
2. Add company logo to emails
3. Test all email triggers (order created, shipped, delivered, etc.)
4. Set up email analytics/tracking
5. Configure automated reminder emails
