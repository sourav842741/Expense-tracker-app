import { PaymentPlan } from '@/types/payment';

export interface EmailReminderPayload {
  toEmail: string;
  userName: string;
  planTitle: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
}

const RESEND_API_KEY =
  process.env.EXPO_PUBLIC_RESEND_API_KEY ||
  process.env.RESEND_API_KEY ||
  '';
const REGISTERED_RESEND_EMAIL =
  process.env.EXPO_PUBLIC_RESEND_REGISTERED_EMAIL ||
  '';

export const emailService = {
  /**
   * Generates the email content for upcoming EMI reminder
   */
  generateEmiReminderTemplate(payload: EmailReminderPayload) {
    const subject = `⚠️ Payment Reminder: ${payload.planTitle} (₹${payload.amount.toLocaleString('en-IN')}) due ${
      payload.daysRemaining === 0 ? 'TODAY' : `in ${payload.daysRemaining} days`
    }`;

    const htmlContent = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:540px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;padding:24px;">
  <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #f3f4f6;">
    <h2 style="margin:0;color:#111827;font-size:20px;font-weight:700;">MoneyCircle Commitment Reminder</h2>
    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Smart Financial Commitments & Circles</p>
  </div>

  <div style="padding:20px 0;">
    <p style="font-size:15px;color:#374151;margin:0 0 12px;">Hello <strong>${payload.userName}</strong>,</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.5;margin:0 0 16px;">
      This is an automated reminder that your scheduled financial commitment is coming up soon.
    </p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:13px;color:#6b7280;">Commitment:</span>
        <strong style="font-size:14px;color:#111827;">${payload.planTitle}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:13px;color:#6b7280;">Amount Due:</span>
        <strong style="font-size:18px;color:#059669;">₹${payload.amount.toLocaleString('en-IN')}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:13px;color:#6b7280;">Due Date:</span>
        <strong style="font-size:13px;color:#d97706;">${payload.dueDate} (${payload.daysRemaining === 0 ? 'DUE TODAY' : `In ${payload.daysRemaining} days`})</strong>
      </div>
    </div>

    <p style="font-size:13px;color:#6b7280;line-height:1.5;margin:16px 0 0;">
      Please ensure sufficient funds in your linked bank account or complete the payment via your UPI app (Google Pay, PhonePe, Paytm).
    </p>
  </div>

  <div style="text-align:center;padding-top:16px;border-top:1px solid #f3f4f6;color:#9ca3af;font-size:12px;">
    Sent automatically by MoneyCircle to ${payload.toEmail}
  </div>
</div>
    `.trim();

    const bodyText = `
Hello ${payload.userName},

This is an automated reminder from MoneyCircle for your upcoming financial commitment.

Commitment: ${payload.planTitle}
Amount Due: ₹${payload.amount.toLocaleString('en-IN')}
Due Date: ${payload.dueDate} (${payload.daysRemaining === 0 ? 'DUE TODAY' : `Due in ${payload.daysRemaining} days`})

Please ensure sufficient funds in your bank account or complete payment via your UPI app.

— MoneyCircle Automated Commitments Manager
    `.trim();

    return { subject, htmlContent, bodyText };
  },

  /**
   * Dispatches an EMI reminder email via Resend API directly to Gmail.
   */
  async sendEmiReminderEmail(
    toEmail: string,
    userName: string,
    plan: PaymentPlan
  ): Promise<{ success: boolean; message: string; emailId?: string }> {
    try {
      const nextCycle = plan.cycles.find((c) => c.status !== 'paid');
      const amount = nextCycle ? nextCycle.amount : plan.amount;
      const dueDate = nextCycle ? nextCycle.dueDate : 'Upcoming';

      const diffMs = nextCycle ? new Date(nextCycle.dueDate).getTime() - Date.now() : 0;
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      // Target recipient: Priority to valid email
      const recipient = toEmail && toEmail.includes('@') ? toEmail.trim() : REGISTERED_RESEND_EMAIL;

      const { subject, htmlContent, bodyText } = this.generateEmiReminderTemplate({
        toEmail: recipient,
        userName,
        planTitle: plan.title,
        amount,
        dueDate,
        daysRemaining,
      });

      // Call Resend API directly
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MoneyCircle <onboarding@resend.dev>',
          to: [recipient],
          subject,
          html: htmlContent,
          text: bodyText,
        }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        return {
          success: true,
          message: `Live EMI notification sent to ${recipient}! Check your Gmail inbox.`,
          emailId: data.id,
        };
      }

      // If validation error occurs (e.g. testing with unverified email on Resend), retry with REGISTERED_RESEND_EMAIL
      if (data.statusCode === 403 && recipient !== REGISTERED_RESEND_EMAIL) {
        const retryRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'MoneyCircle <onboarding@resend.dev>',
            to: [REGISTERED_RESEND_EMAIL],
            subject,
            html: htmlContent,
            text: bodyText,
          }),
        });

        const retryData = await retryRes.json();
        if (retryRes.ok && retryData.id) {
          return {
            success: true,
            message: `Delivered to your registered Resend Gmail (${REGISTERED_RESEND_EMAIL})! Check your inbox.`,
            emailId: retryData.id,
          };
        }
      }

      return {
        success: false,
        message: data.message || 'Could not send email via Resend.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error while sending email.',
      };
    }
  },
};
