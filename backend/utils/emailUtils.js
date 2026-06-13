import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Tenancy Slate'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Tenancy Slate Password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #003441 0%, #0f4c5c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #003441; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .button:hover { background-color: #002b33; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset the password for your Tenancy Slate account. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below. This link will expire in <strong>1 hour</strong>.</p>
            <center><a href="${resetUrl}" class="button">Reset Your Password</a></center>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;"><code>${resetUrl}</code></p>
            <div class="warning">
              <strong>Security Tip:</strong> Never share your password reset link with anyone. Our team will never ask you for your password.
            </div>
            <p>Best regards,<br><strong>Tenancy Slate Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tenancy Slate. All rights reserved.</p>
            <p>Need help? Contact <a href="mailto:support@tenancyslate.com" style="color: #003441; text-decoration: none;">support@tenancyslate.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n=========================================\n[DEV] PASSWORD RESET LINK FOR ${email}:\n${resetUrl}\n=========================================\n`);
    }
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendTwoFactorEmail = async (email, code) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Tenancy Slate'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Two-Factor Authentication Code - Tenancy Slate',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #003441 0%, #0f4c5c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .code-box { background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 6px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #003441; word-break: break-all; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verification Code</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>For security purposes, we need to verify your identity. Please use the code below to complete your login:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 14px;"><strong>This code expires in 10 minutes</strong></p>
            
            <div class="alert">
              <strong>Security Notice:</strong> Do not share this code with anyone. Our team will never ask you for this code.
            </div>
            
            <p>If you didn't request this code, please ignore this email or contact us immediately if you suspect unauthorized access to your account.</p>
            
            <p>Best regards,<br><strong>Tenancy Slate Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tenancy Slate. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n=========================================\n[DEV] 2FA CODE FOR ${email}:\n${code}\n=========================================\n`);
    }
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};

export const sendRentReminderEmail = async (email, tenantName, amount, dueDate) => {
  const dueDateObj = new Date(dueDate);
  const formattedDueDate = dueDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const daysUntilDue = Math.ceil((dueDateObj - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const statusColor = isOverdue ? '#ef4444' : (daysUntilDue <= 5 ? '#f59e0b' : '#10b981');
  const statusText = isOverdue ? 'OVERDUE' : (daysUntilDue <= 5 ? 'DUE SOON' : 'UPCOMING');

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Tenancy Slate'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: `Rent Payment Due - ${formattedDueDate}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #003441 0%, #0f4c5c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-badge { display: inline-block; background-color: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 20px; }
          .payment-details { background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .payment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #cbd5e1; }
          .payment-row:last-child { border-bottom: none; }
          .label { color: #666; font-weight: 500; }
          .amount { font-size: 24px; font-weight: 700; color: #003441; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .button { display: inline-block; background-color: #003441; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rent Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${tenantName}</strong>,</p>
            
            <div>
              <span class="status-badge">${statusText}</span>
            </div>
            
            <p>This is a friendly reminder that your rent payment is due soon.</p>
            
            <div class="payment-details">
              <div class="payment-row">
                <span class="label">Amount Due:</span>
                <span class="amount">Ksh ${amount.toLocaleString()}</span>
              </div>
              <div class="payment-row">
                <span class="label">Due Date:</span>
                <strong>${formattedDueDate}</strong>
              </div>
              ${daysUntilDue > 0 ? `<div class="payment-row" style="color: #666;"><span class="label">Days Remaining:</span><strong>${daysUntilDue}</strong></div>` : `<div class="payment-row" style="color: #ef4444;"><span class="label">Days Overdue:</span><strong>${Math.abs(daysUntilDue)}</strong></div>`}
            </div>
            
            <p>Please ensure payment is submitted by the due date to avoid late fees or other penalties.</p>
            
            ${isOverdue ? '<p style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; color: #991b1b;"><strong>⚠ Payment Overdue:</strong> Please submit your payment immediately to avoid further action.</p>' : ''}
            
            <p>If you have already made this payment, please disregard this reminder. Thank you!</p>
            
            <p>Best regards,<br><strong>Tenancy Slate Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tenancy Slate. All rights reserved.</p>
            <p>Need help? Contact <a href="mailto:support@tenancyslate.com" style="color: #003441; text-decoration: none;">support@tenancyslate.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendMaintenanceNotificationEmail = async (email, maintenanceTitle, status) => {
  const statusColors = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    completed: '#10b981',
    cancelled: '#6b7280'
  };
  const statusColor = statusColors[status] || '#6b7280';

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Tenancy Slate'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: `Maintenance Update: ${maintenanceTitle}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #003441 0%, #0f4c5c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-badge { display: inline-block; background-color: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 12px; text-transform: uppercase; }
          .info-box { background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Maintenance Request Update</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>There's an update on your maintenance request.</p>
            
            <div class="info-box">
              <p style="margin-top: 0;"><strong>Request:</strong> ${maintenanceTitle}</p>
              <p><span class="status-badge">${status}</span></p>
            </div>
            
            <p>Your property management team is working to resolve this issue. If you have any urgent questions, please contact them directly.</p>
            
            <p>Thank you for your patience.</p>
            <p>Best regards,<br><strong>Tenancy Slate Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tenancy Slate. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendTenantOnboardingEmail = async (email, tempPassword, tenantName) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Tenancy Slate'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to Tenancy Slate - Your Account is Ready',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #003441 0%, #0f4c5c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #003441; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .button:hover { background-color: #002b33; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .credentials { background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .credentials-label { font-size: 12px; color: #0c4a6e; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
          .password-box { font-family: 'Courier New', monospace; background-color: white; border: 1px solid #cbd5e1; padding: 12px; border-radius: 4px; font-size: 16px; letter-spacing: 1px; word-break: break-all; text-align: center; color: #003441; font-weight: 600; }
          .alert { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 4px; color: #7f1d1d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Tenancy Slate!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${tenantName}</strong>,</p>
            <p>Your property manager has invited you to join <strong>Tenancy Slate</strong>, a modern platform for managing rent, maintenance requests, and lease information seamlessly.</p>
            
            <h3 style="color: #003441; margin-top: 25px;">Getting Started</h3>
            <p>Your account has been created and is ready to use. Use the temporary password below to log in for the first time.</p>
            
            <div class="credentials">
              <div class="credentials-label">Temporary Password</div>
              <div class="password-box">${tempPassword}</div>
            </div>
            
            <p>After you log in, you will be <strong>required to create a new password</strong> for security reasons.</p>
            
            <center><a href="${loginUrl}" class="button">Log In to Tenancy Slate</a></center>
            
            <h3 style="color: #003441; margin-top: 25px;">What You Can Do</h3>
            <ul style="color: #555;">
              <li>View and track your rent payment history</li>
              <li>Submit and track maintenance requests</li>
              <li>Review your lease agreement</li>
              <li>Communicate directly with your property manager</li>
            </ul>
            
            <div class="alert">
              <strong>Important:</strong> Do not share your password with anyone. Your property manager will never ask for your login credentials.
            </div>
            
            <p>If you have any questions or need assistance, please contact your property manager.</p>
            <p>Best regards,<br><strong>Tenancy Slate Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tenancy Slate. All rights reserved.</p>
            <p>Need help? Contact <a href="mailto:support@tenancyslate.com" style="color: #003441; text-decoration: none;">support@tenancyslate.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n=========================================\n[DEV] TENANT ONBOARDING CREDENTIALS FOR ${email}:\nPASSWORD: ${tempPassword}\n=========================================\n`);
    }
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending onboarding email:', error.message);
    return false;
  }
};

export const sendTenantInviteEmail = async (email, inviteToken, tenantName, propertyName, unitNumber, ownerName) => {
  const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/accept?token=${inviteToken}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Tenancy Slate'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: `Tenancy Invitation - ${propertyName} Unit ${unitNumber}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #003441 0%, #0f4c5c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #003441; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .button:hover { background-color: #002b33; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .details-box { background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .details-row:last-child { border-bottom: none; }
          .label { color: #0c4a6e; font-weight: 600; }
          .alert { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; border-radius: 4px; color: #14532d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Tenancy Slate!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${tenantName}</strong>,</p>
            <p>You have been invited by <strong>${ownerName}</strong> to join <strong>Tenancy Slate</strong> and onboard as a resident for your new rental unit.</p>
            
            <div class="details-box">
              <div class="details-row">
                <span class="label">Property:</span>
                <span>${propertyName}</span>
              </div>
              <div class="details-row">
                <span class="label">Unit Identifier:</span>
                <span>${unitNumber || 'N/A'}</span>
              </div>
            </div>
            
            <p>To accept your invitation, review your lease details, and configure your account profile, please click the invitation link below:</p>
            
            <center><a href="${inviteUrl}" class="button">Accept Invitation</a></center>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;"><code>${inviteUrl}</code></p>
            
            <div class="alert">
              <strong>Please Note:</strong> This invitation link is valid for <strong>7 days</strong>. After completing your profile, you will instantly gain access to your resident dashboard.
            </div>
            
            <p>Best regards,<br><strong>Tenancy Slate Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tenancy Slate. All rights reserved.</p>
            <p>Need help? Contact <a href="mailto:support@tenancyslate.com" style="color: #003441; text-decoration: none;">support@tenancyslate.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n=========================================\n[DEV] TENANT INVITATION LINK FOR ${email}:\nURL: ${inviteUrl}\n=========================================\n`);
    }
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending tenant invitation email:', error.message);
    return false;
  }
};
