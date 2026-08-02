import nodemailer from "nodemailer";

/**
 * Email Sender service for newsletters and marketing email dispatch.
 * Supports Gmail SMTP (GMAIL_USER & GMAIL_APP_PASSWORD) or Resend API.
 */

export interface EmailDispatchResult {
  success: boolean;
  sentCount: number;
  error?: string;
}

export async function sendNewsletterEmail(params: {
  subject: string;
  htmlContent: string;
  recipients?: string[];
}): Promise<EmailDispatchResult> {
  const recipientsList =
    params.recipients && params.recipients.length > 0
      ? params.recipients
      : [process.env.TEST_EMAIL_RECIPIENT || process.env.GMAIL_USER || "admin@example.com"];

  try {
    // 1. Gmail SMTP with App Password (GMAIL_USER & GMAIL_APP_PASSWORD)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `YRRG CMS <${process.env.GMAIL_USER}>`,
        to: recipientsList.join(", "),
        subject: params.subject,
        html: params.htmlContent,
      });

      return {
        success: true,
        sentCount: recipientsList.length,
      };
    }

    // 2. Resend API HTTP fallback
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Newsletter <onboarding@resend.dev>",
          to: recipientsList,
          subject: params.subject,
          html: params.htmlContent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Resend API dispatch failed");
      }

      return {
        success: true,
        sentCount: recipientsList.length,
      };
    }

    // 3. Simulated dispatch for development
    console.log(`[Email Dispatch Simulated] Subject: "${params.subject}" -> Sent to ${recipientsList.length} recipient(s).`);
    return {
      success: true,
      sentCount: recipientsList.length,
    };
  } catch (err: unknown) {
    console.error("Error sending newsletter email:", err);
    return {
      success: false,
      sentCount: 0,
      error: err instanceof Error ? err.message : "Email dispatch failed",
    };
  }
}
