import nodemailer from "nodemailer";

class Email {
  constructor(user = {}, url = "", otp = "") {
    this.to = user?.email;
    this.firstName = user?.name?.split(" ")[0] || "User";
    this.url = url;
    this.otp = otp;
    this.fromAddress =
      process.env.EMAIL_FROM || process.env.EMAIL_USERNAME || "no-reply@example.com";
  }

  async createTransporter(host, user, pass, port = 587) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async transporter() {
    try {
      // Try Gmail first
      if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
        const gmailTransport = await this.createTransporter(
          process.env.EMAIL_HOST || "smtp.gmail.com",
          process.env.EMAIL_USERNAME,
          process.env.EMAIL_PASSWORD
        );
        await gmailTransport.verify();
        console.log("✅ Gmail transporter ready");
        return gmailTransport;
      }
      throw new Error("Gmail creds missing");
    } catch (err) {
      console.warn("⚠️ Gmail failed, falling back to Brevo:", err.message);
      // Fallback: Brevo SMTP
      const brevoTransport = await this.createTransporter(
        "smtp-relay.brevo.com",
        process.env.BREVO_USER || process.env.EMAIL_FROM,
        process.env.BREVO_API_KEY,
        587
      );
      await brevoTransport.verify();
      console.log("✅ Brevo transporter ready");
      return brevoTransport;
    }
  }

  async send(subject, html, text) {
    const mailOptions = {
      from: this.fromAddress,
      to: this.to,
      subject,
      html,
      text,
    };
    const tx = await this.transporter();
    await tx.sendMail(mailOptions);
    console.log(`📨 Email sent to ${this.to}`);
  }

  async sendOTP() {
    const subject = "Your OTP for Email Verification";
    const html = `<p>Hi ${this.firstName},</p><p>Your OTP is <b>${this.otp}</b>. It is valid for 10 minutes.</p>`;
    await this.send(subject, html, `Your OTP is ${this.otp}.`);
  }

  async sendPasswordResetOTP() {
    const subject = "Your password reset OTP (valid for 10 minutes)";
    const html = `<p>Hi ${this.firstName},</p><p>Your password reset OTP is <b>${this.otp}</b>. It is valid for 10 minutes.</p>`;
    await this.send(subject, html, `Your password reset OTP is ${this.otp}.`);
  }

  async sendPasswordReset() {
    const subject = "Your password reset link (valid for 10 minutes)";
    const html = `<p>Hi ${this.firstName},</p><p>Reset your password using this link: <a href="${this.url}">${this.url}</a></p>`;
    await this.send(subject, html, `Reset your password using this link: ${this.url}`);
  }
}

export default Email;
