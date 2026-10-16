const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

// Initialize Nodemailer if SMTP credentials are provided
if (config.email.host && config.email.user && config.email.pass) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
  console.log(`[EmailService] Configured SMTP via ${config.email.host}:${config.email.port}`);
} else {
  console.log('[EmailService] SMTP not configured. Running in preview/log mode (emails logged to console).');
}

const EmailService = {
  /**
   * Send notification to portfolio owner when a new inquiry is submitted
   */
  async notifyNewInquiry(inquiry) {
    const formattedBudget = inquiry.budget > 0 ? `₹${inquiry.budget.toLocaleString()}` : 'Flexible / TBD';
    const subject = `🚀 New Project Inquiry from ${inquiry.client_name} [${inquiry.project_type}]`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0d14; color: #f1f5f9; padding: 2rem; border-radius: 12px; border: 1px solid #1e2235;">
        <div style="border-bottom: 1px solid #2a2f4c; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h2 style="color: #8b5cf6; margin: 0 0 0.5rem 0;">✨ New Creative Brief Received!</h2>
          <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">Submitted via Tejashwini Portfolio on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
          <tr>
            <td style="padding: 0.5rem 0; color: #94a3b8; width: 140px;">Client Name:</td>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #ffffff;">${inquiry.client_name}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; color: #94a3b8;">Email:</td>
            <td style="padding: 0.5rem 0; color: #00f2fe;"><a href="mailto:${inquiry.client_email}" style="color: #00f2fe; text-decoration: none;">${inquiry.client_email}</a></td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; color: #94a3b8;">Project Category:</td>
            <td style="padding: 0.5rem 0; color: #ff2a70; font-weight: 600;">${inquiry.project_type}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; color: #94a3b8;">Estimated Budget:</td>
            <td style="padding: 0.5rem 0; color: #10b981; font-weight: 700;">${formattedBudget}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; color: #94a3b8;">Estimated Turnaround:</td>
            <td style="padding: 0.5rem 0; color: #ffffff;">${inquiry.timeline || 'Flexible'}</td>
          </tr>
        </table>

        <div style="background: #141622; padding: 1.25rem; border-radius: 8px; border-left: 4px solid #8b5cf6; margin-bottom: 1.5rem;">
          <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a78bfa; margin-bottom: 0.5rem; font-weight: 600;">Client Brief / Scope:</div>
          <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; color: #e2e8f0;">${inquiry.project_brief}</p>
        </div>

        <div style="text-align: center; margin-top: 2rem;">
          <a href="mailto:${inquiry.client_email}?subject=Re:%20${encodeURIComponent(inquiry.project_type)}%20Inquiry%20-%20Tejashwini" 
             style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #00f2fe); color: #000; font-weight: 700; text-decoration: none; padding: 0.75rem 1.75rem; border-radius: 50px;">
            Reply to Client Directly
          </a>
        </div>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: config.email.from,
          to: config.email.notificationReceiver,
          subject,
          html: htmlContent
        });
        console.log(`[EmailService] Inquiry notification dispatched to ${config.email.notificationReceiver}`);
        return { delivered: true };
      } catch (err) {
        console.error('[EmailService] SMTP error sending email:', err.message);
        return { delivered: false, error: err.message };
      }
    } else {
      // Local preview mode
      console.log('----------------------------------------------------');
      console.log(`[Email Notification Log]`);
      console.log(`To: ${config.email.notificationReceiver}`);
      console.log(`Subject: ${subject}`);
      console.log(`Client: ${inquiry.client_name} <${inquiry.client_email}>`);
      console.log(`Budget: ${formattedBudget}`);
      console.log(`Brief: ${inquiry.project_brief}`);
      console.log('----------------------------------------------------');
      return { delivered: false, previewMode: true };
    }
  }
};

module.exports = EmailService;
