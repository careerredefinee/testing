import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Email {
  constructor(user, url, otp) {
    this.to = user.email;
    this.firstName = user.name?.split(' ')[0] || 'User';
    this.url = url;
    this.otp = otp;
    // From details and sender info
    const emailUser = process.env.EMAIL_USERNAME || process.env.EMAIL_USER || '';
    this.fromName = process.env.EMAIL_FROM_NAME || 'careerRedefine';
    this.fromAddress = process.env.EMAIL_FROM_ADDRESS || emailUser || 'no-reply@example.com';
    const explicitFrom = process.env.EMAIL_FROM;
    this.from = explicitFrom || `"${this.fromName}" <${this.fromAddress}>`;
  }

  // Create a transporter
  async newTransport() {
    // Support both EMAIL_* and SMTP_* variable names
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
    const user = process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
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
      const transporter = await this.newTransport();
      try {
        await transporter.verify();
        const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
        const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
        const secure = port === 465;
        console.log('Nodemailer connected', { host, port, secure });
      } catch (verifyErr) {
        console.error('Nodemailer not working (verify failed)', {
          message: verifyErr?.message,
          code: verifyErr?.code
        });
        throw verifyErr;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log('Nodemailer send success', { messageId: info?.messageId, response: info?.response });
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(`📧 Email preview URL: ${previewUrl}`);
      }
    } catch (smtpErr) {
      console.error('Nodemailer not working (send failed)', {
        message: smtpErr?.message,
        code: smtpErr?.code,
        command: smtpErr?.command
      });

      // Brevo fallback if API key provided
      const brevoKey = process.env.BREVO_API_KEY || process.env.SIB_API_KEY || process.env.SENDINBLUE_API_KEY;
      if (!brevoKey) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Email sending failed and no Brevo API key is configured for fallback.');
        } else {
          console.warn('Email send failed in development and no Brevo key. Continuing without email.');
          return;
        }
      }

      try {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        defaultClient.authentications['api-key'].apiKey = brevoKey;
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = {
          sender: { name: this.fromName, email: this.fromAddress },
          to: [{ email: this.to, name: this.firstName }],
          subject,
          htmlContent: html,
          textContent: htmlToText(html),
        };
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Brevo fallback email sent successfully');
      } catch (brevoErr) {
        console.error('Brevo fallback failed:', {
          message: brevoErr?.message,
          status: brevoErr?.status,
        });
        if (process.env.NODE_ENV === 'production') {
          throw new Error('There was an error sending the email via SMTP and Brevo. Please try again later.');
        } else {
          console.warn('Both SMTP and Brevo failed in development. Continuing without email.');
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