import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_reset_link(email, reset_link, subject="Reset Password"):
    # Fetch configurations from Flask app config, with safe fallbacks
    mail_username = current_app.config.get('MAIL_USERNAME')
    mail_password = current_app.config.get('MAIL_PASSWORD')
    smtp_host = current_app.config.get('MAIL_SERVER', 'smtp.gmail.com')
    smtp_port = current_app.config.get('MAIL_PORT', 587)

    if not mail_username or not mail_password:
        raise ValueError("SMTP configuration credentials (MAIL_USERNAME/MAIL_PASSWORD) are missing.")

    sender_email = mail_username
    receiver_email = email

    # HTML Email Template styled with your Worklane colors
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" max-width="600px" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); max-width: 600px; width: 100%;">
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #172554; padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Worklane</h1>
                            </td>
                        </tr>
                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 40px 30px; color: #334155;">
                                <h2 style="color: #172554; font-size: 20px; margin-top: 0; margin-bottom: 16px;">{subject}</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin-top: 0; margin-bottom: 24px;">
                                    You requested to reset your password. Click the button below to proceed. This link expires in <strong>15 minutes</strong>.
                                </p>
                                <!-- Button -->
                                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                    <tr>
                                        <td align="center" style="border-radius: 6px; background-color: #0F766E;">
                                            <a href="{reset_link}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; border: 1px solid #0F766E; display: inline-block; font-weight: 500;">
                                                Reset Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="font-size: 14px; color: #64748b; line-height: 1.4; margin-top: 32px; margin-bottom: 0;">
                                    If you didn't request this, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                                &copy; 2026 Worklane. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Build MIME message
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email
    message.attach(MIMEText(html_content, "html"))

    # Connect and send via SMTP
    with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
        server.starttls()
        server.login(mail_username, mail_password)
        server.sendmail(sender_email, receiver_email, message.as_string())