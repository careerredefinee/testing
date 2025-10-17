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
      pool: true,
      maxConnections: 1,
      maxMessages: 50,
      connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '15000', 10),
      socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT || '20000', 10),
      greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || '10000', 10),
      tls: {
        minVersion: 'TLSv1.2',
      },
    });
  }

  async transporter() {
    try {
      // Try Gmail first
      if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
        const host = process.env.EMAIL_HOST || "smtp.gmail.com";
        const primaryPort = parseInt(process.env.EMAIL_PORT || '587', 10);
        // Attempt primary port first (default 587 STARTTLS)
        try {
          const txPrimary = await this.createTransporter(host, process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD, primaryPort);
          await txPrimary.verify();
          console.log(`✅ SMTP transporter ready on ${host}:${primaryPort}`);
          return txPrimary;
        } catch (e1) {
          console.error(`❌ SMTP verify failed on ${host}:${primaryPort} ->`, e1?.code || e1?.name || 'Error', e1?.message);
          // If 587 failed, try implicit TLS on 465 as fallback
          const fallbackPort = 465;
          if (primaryPort !== fallbackPort) {
            try {
              const txTLS = await this.createTransporter(host, process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD, fallbackPort);
              await txTLS.verify();
              console.log(`✅ SMTP transporter ready on ${host}:${fallbackPort}`);
              return txTLS;
            } catch (e2) {
              console.error(`❌ SMTP verify failed on ${host}:${fallbackPort} ->`, e2?.code || e2?.name || 'Error', e2?.message);
              throw e2;
            }
          }
          throw e1;
        }
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

  async sendHTTP(subject, html, text) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = this.fromAddress;
    const senderName = process.env.EMAIL_SENDER_NAME || "No Reply";
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": String(apiKey || ""),
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: this.to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Brevo HTTP error ${res.status}: ${msg}`);
    }
  }

  async send(subject, html, text) {
    const useHttp = String(process.env.USE_BREVO_HTTP || "").toLowerCase() === "true";
    const canHttp = Boolean(process.env.BREVO_API_KEY);
    if (useHttp && canHttp) {
      await this.sendHTTP(subject, html, text);
      console.log(`📨 Email sent to ${this.to}`);
      return;
    }
    const mailOptions = {
      from: this.fromAddress,
      to: this.to,
      subject,
      html,
      text,
    };
    const tx = await this.transporter();
    try {
      await tx.sendMail(mailOptions);
      console.log(`📨 Email sent to ${this.to}`);
    } catch (e) {
      console.error('❌ Nodemailer sendMail failed:', e?.code || e?.name || 'Error', e?.message);
      throw e;
    }
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
