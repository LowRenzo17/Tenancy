import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #003441; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendTwoFactorEmail = async (email, code) => {
  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Two-Factor Authentication Code',
    html: `
      <h2>Two-Factor Authentication</h2>
      <p>Your authentication code is:</p>
      <h3 style="background-color: #f3faff; padding: 10px; border-radius: 5px; font-family: monospace;">${code}</h3>
      <p>This code expires in 10 minutes.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendRentReminderEmail = async (email, tenantName, amount, dueDate) => {
  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Rent Payment Reminder',
    html: `
      <h2>Rent Payment Reminder</h2>
      <p>Dear ${tenantName},</p>
      <p>This is a friendly reminder that your rent payment of <strong>$${amount}</strong> is due on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
      <p>Please ensure payment is made by the due date to avoid late fees.</p>
      <p>Thank you!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendMaintenanceNotificationEmail = async (email, maintenanceTitle, status) => {
  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: `Maintenance Request Update: ${maintenanceTitle}`,
    html: `
      <h2>Maintenance Request Update</h2>
      <p>Your maintenance request has been updated.</p>
      <p><strong>Title:</strong> ${maintenanceTitle}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p>We'll keep you updated on the progress.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
