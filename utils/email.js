import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Email {
  constructor(user, url, otp) {
    this.to = user.email;
    this.firstName = user.name?.split(' ')[0] || 'User';
    this.url = url;
    this.otp = otp;
    const emailUser = process.env.EMAIL_USERNAME || '';
    const fromName = process.env.EMAIL_FROM_NAME || 'careerRedefine';
    const fromAddress = emailUser || 'no-reply@example.com';
    const explicitFrom = process.env.EMAIL_FROM;
    this.from = explicitFrom || `"${fromName}" <${fromAddress}>`;
  }

  // Create a transporter
  async newTransport() {
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT);
    const user = process.env.EMAIL_USERNAME;
    const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    if (!host || !port || !user || !pass) {
      throw new Error('EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME and EMAIL_PASSWORD (or EMAIL_PASS) must be set');
    }

    const secure = port === 465; // true for 465, false for other ports like 587

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }

  // Send the actual email
  async send(template, subject, context = {}) {
    // 1) Render HTML based on a pug template
    const templatePath = join(
      dirname(__dirname),
      'views',
      'email',
      `${template}.pug`
    );

    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      url: this.url,
      subject,
      ...context,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    try {
      // 3) Create a transport and send email
      const transporter = await this.newTransport();
      const info = await transporter.sendMail(mailOptions);

      // Log Ethereal preview URL in development
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`📧 Email preview URL: ${previewUrl}`);
        }
      }
    } catch (err) {
      try {
        console.error('SMTP send failed:', {
          message: err?.message,
          code: err?.code,
          command: err?.command
        });

        const resendKey = process.env.RESEND_API || process.env.resend_api;
        if (!resendKey) {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('Email sending failed via SMTP, and RESEND_API is not configured.');
          } else {
            console.warn('SMTP failed and RESEND_API not set. Skipping email in non-production.');
            return;
          }
        }

        const from = this.from;
        const to = this.to;
        const body = {
          from,
          to,
          subject,
          html,
          text: htmlToText(html)
        };

        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          const errorText = await resp.text().catch(() => '');
          console.error('Resend API error:', resp.status, errorText);
          if (process.env.NODE_ENV === 'production') {
            throw new Error('Email sending failed via SMTP and Resend.');
          } else {
            console.warn('Email send failed via both SMTP and Resend in non-production. Continuing.');
            return;
          }
        }

        const json = await resp.json().catch(() => ({}));
        console.log('Email sent via Resend fallback:', json?.id || 'no-id');
      } catch (fallbackErr) {
        console.error('Email send error (final):', fallbackErr?.message || fallbackErr);
        if (process.env.NODE_ENV === 'production') {
          throw new Error('There was an error sending the email. Please try again later.');
        } else {
          console.warn('Email send failed in development. Continuing without email.');
          return;
        }
      }
    }
  }

  // Send welcome email
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendOTP() {
    await this.send('otp', 'Your OTP for Email Verification', { otp: this.otp });
  }

  // Send password reset OTP email
  async sendPasswordResetOTP() {
    await this.send(
      'otp',
      'Your password reset OTP (valid for 10 minutes)',
      {
        otp: this.otp,
        expiration: '10 minutes',
        purpose: 'password reset',
      }
    );
  }

  // Send password reset email
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)',
      {
        resetUrl: this.url,
        expiration: '10 minutes',
      }
    );
  }

  // Send OTP for email verification
  async sendVerificationOTP(otp) {
    await this.send('otp', 'Your OTP for Email Verification', {
      otp,
      expiration: '10 minutes',
      purpose: 'email verification',
    });
  }

  // Send booking confirmation
  async sendBookingConfirmation(bookingDetails) {
    await this.send('bookingConfirmation', 'Your Booking Confirmation', {
      ...bookingDetails,
    });
  }

  // Send booking status update
  async sendBookingStatusUpdate(bookingDetails) {
    await this.send('bookingStatusUpdate', 'Booking Status Update', {
      ...bookingDetails,
    });
  }

  // Send query response
  async sendQueryResponse(queryDetails) {
    await this.send('queryResponse', 'Response to Your Query', {
      ...queryDetails,
    });
  }

  // Send callback confirmation to user
  async sendCallbackConfirmation() {
    await this.send('callbackConfirmation', 'Callback Request Received', {
      firstName: this.firstName,
    });
  }

  // Send callback notification to admin
  async sendCallbackNotification(callbackDetails) {
    await this.send('callbackNotification', 'New Callback Request', {
      ...callbackDetails,
    });
  }
}

export default Email;