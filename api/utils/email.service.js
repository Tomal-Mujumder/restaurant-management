import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send OTP email to user
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<void>}
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Banglar Heshel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - Your OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #7f1d1d;
              color: #ffffff;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #7f1d1d;
              letter-spacing: 8px;
              margin: 30px 0;
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 8px;
              border: 2px dashed #7f1d1d;
            }
            .message {
              color: #4b5563;
              font-size: 16px;
              line-height: 1.6;
              margin: 20px 0;
            }
            .warning {
              color: #dc2626;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Banglar Heshel</h1>
            </div>
            <div class="content">
              <h2 style="color: #1f2937; margin-bottom: 10px;">Email Verification</h2>
              <p class="message">Thank you for signing up! Please use the following OTP code to verify your email address:</p>
              <div class="otp-code">${otp}</div>
              <p class="message">This code will expire in <strong>5 minutes</strong>.</p>
              <p class="warning">⚠️ If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Banglar Heshel. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
