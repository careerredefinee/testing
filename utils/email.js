import nodemailer from 'nodemailer';
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
    // Prefer authenticated Gmail user as the from address to avoid Gmail rejection
    const gmailUser = process.env.GMAIL_USER || '';
    const emailUser = process.env.EMAIL_USERNAME || '';
    const configuredFrom = process.env.EMAIL_FROM || '';
    const fromName = process.env.EMAIL_FROM_NAME || 'careerRedefine';

    // If using Gmail, force from to be the authenticated account
    const likelyGmail = (process.env.EMAIL_HOST || '').includes('gmail') || gmailUser;
    const fromAddress = likelyGmail ? (gmailUser || emailUser) : (configuredFrom || emailUser || 'no-reply@example.com');
    this.from = `"${fromName}" <${fromAddress}>`;
  }

  // Create a transporter
  async newTransport() {
    // Production: prefer SendGrid if configured
    if (process.env.NODE_ENV === 'production') {
      if (process.env.SENDGRID_USERNAME && process.env.SENDGRID_PASSWORD) {
        return nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD,
          },
        });
      }
      // Explicit Gmail support in production
      if (
        ((process.env.EMAIL_HOST || '').includes('gmail')) ||
        (process.env.GMAIL_USER && process.env.GMAIL_PASS)
      ) {
        const tx = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER || process.env.EMAIL_USERNAME,
            pass: process.env.GMAIL_PASS || process.env.EMAIL_PASSWORD,
          },
        });
        if (process.env.NODE_ENV !== 'production') console.log('📧 Using Gmail transport (production branch)');
        return tx;
      }
      // Fallback to generic SMTP in production if explicitly provided
      if (process.env.EMAIL_HOST && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
        const port = Number(process.env.EMAIL_PORT || 587);
        const tx = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port,
          secure: port === 465, // true for 465, false for others
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        if (process.env.NODE_ENV !== 'production') console.log(`📧 Using SMTP transport ${process.env.EMAIL_HOST}:${port} (production branch)`);
        return tx;
      }
      // If nothing configured in production, throw
      throw new Error('Email transport is not configured for production');
    }

    // Development: optional override to force Ethereal regardless of creds
    if (process.env.NODE_ENV !== 'production' && process.env.USE_ETHEREAL === 'true') {
      const testAccount = await nodemailer.createTestAccount();
      const tx = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      if (process.env.NODE_ENV !== 'production') console.log('📧 Using Ethereal test transport (forced by USE_ETHEREAL=true)');
      return tx;
    }

    // Development: If Gmail creds present, prefer them
    if (
      ((process.env.EMAIL_HOST || '').includes('gmail')) ||
      (process.env.GMAIL_USER && process.env.GMAIL_PASS)
    ) {
      const tx = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || process.env.EMAIL_USERNAME,
          pass: process.env.GMAIL_PASS || process.env.EMAIL_PASSWORD,
        },
      });
      if (process.env.NODE_ENV !== 'production') console.log('📧 Using Gmail transport (development branch)');
      return tx;
    }

    // Development: If SMTP creds present (e.g., Mailtrap or other SMTP), use them
    if (process.env.EMAIL_HOST && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
      const port = Number(process.env.EMAIL_PORT || 587);
      const tx = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      if (process.env.NODE_ENV !== 'production') console.log(`📧 Using SMTP transport ${process.env.EMAIL_HOST}:${port} (development branch)`);
      return tx;
    }

    // Development fallback: Ethereal test account (no real emails sent)
    const testAccount = await nodemailer.createTestAccount();
    const tx = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    if (process.env.NODE_ENV !== 'production') console.log('📧 Using Ethereal test transport (development fallback)');
    return tx;
  }

  // Send the actual email
  async send(template, subject, context = {}) {
    try {
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
      console.error('Error sending email:', err);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('There was an error sending the email. Please try again later.');
      } else {
        // In development, do not block the flow if email fails
        console.warn('Email send failed in development. Continuing without email.');
        return;
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
