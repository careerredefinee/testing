// Email utility is intentionally disabled. This stub preserves the API
// so the rest of the codebase can call email methods without errors.
// No external email providers (Nodemailer/Brevo) are used.

class Email {
  constructor(user = {}, url = '', otp = '') {
    this.to = user?.email;
    this.firstName = user?.name?.split(' ')[0] || 'User';
    this.url = url;
    this.otp = otp;
  }

  async send(_template, subject, _context = {}) {
    console.log('[Email disabled] Attempted to send:', {
      to: this.to,
      subject,
      url: this.url,
      otp: this.otp,
    });
    return;
  }

  async sendWelcome() { return this.send('welcome', 'Welcome'); }
  async sendOTP() { return this.send('otp', 'OTP'); }
  async sendPasswordResetOTP() { return this.send('otp', 'Password reset OTP'); }
  async sendPasswordReset() { return this.send('passwordReset', 'Password reset'); }
  async sendVerificationOTP(otp) { return this.send('otp', 'Verification OTP', { otp }); }
  async sendBookingConfirmation(details) { return this.send('bookingConfirmation', 'Booking Confirmation', details); }
  async sendBookingStatusUpdate(details) { return this.send('bookingStatusUpdate', 'Booking Status Update', details); }
  async sendQueryResponse(details) { return this.send('queryResponse', 'Response to Your Query', details); }
  async sendCallbackConfirmation() { return this.send('callbackConfirmation', 'Callback Request Received'); }
  async sendCallbackNotification(details) { return this.send('callbackNotification', 'New Callback Request', details); }
}

export default Email;