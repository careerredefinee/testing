import nodemailer from 'nodemailer';

class Email {
  constructor(user = {}, url = '', otp = '') {
    this.to = user?.email;
    this.firstName = user?.name?.split(' ')[0] || 'User';
    this.url = url;
    this.otp = otp;
    this.fromAddress = process.env.EMAIL_USERNAME || 'no-reply@example.com';
  }

  async transporter() {
    const user = process.env.EMAIL_USERNAME;
    const pass = process.env.EMAIL_PASSWORD;
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.EMAIL_PORT || 587);
    const secure = port === 465;
    if (!user || !pass) throw new Error('EMAIL_USERNAME and EMAIL_PASSWORD must be set');
    return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }

  async send(subject, html, text) {
    const mailOptions = {
      from: this.fromAddress,
      to: this.to,
      subject,
      html,
      text
    };
    const tx = await this.transporter();
    await tx.verify();
    await tx.sendMail(mailOptions);
  }

  async sendOTP() {
    const subject = 'Your OTP for Email Verification';
    const html = `<p>Hi ${this.firstName},</p><p>Your OTP is <b>${this.otp}</b>. It is valid for 10 minutes.</p>`;
    const text = `Your OTP is ${this.otp}. It is valid for 10 minutes.`;
    await this.send(subject, html, text);
  }

  async sendPasswordResetOTP() {
    const subject = 'Your password reset OTP (valid for 10 minutes)';
    const html = `<p>Hi ${this.firstName},</p><p>Your password reset OTP is <b>${this.otp}</b>. It is valid for 10 minutes.</p>`;
    const text = `Your password reset OTP is ${this.otp}.`;
    await this.send(subject, html, text);
  }

  async sendPasswordReset() {
    const subject = 'Your password reset link (valid for 10 minutes)';
    const html = `<p>Hi ${this.firstName},</p><p>Reset your password using this link: <a href="${this.url}">${this.url}</a></p>`;
    const text = `Reset your password using this link: ${this.url}`;
    await this.send(subject, html, text);
  }
}

export default Email;