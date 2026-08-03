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

export interface OrderApprovalEmailParams {
  customerName: string;
  customerEmail: string;
  orderId: string;
  totalAmount: number;
  currency: string;
  shippingAddress?: string | null;
  items: Array<{
    productTitle: string;
    productType: string;
    downloadUrl?: string | null;
  }>;
}

export async function sendOrderApprovalEmail(params: OrderApprovalEmailParams): Promise<EmailDispatchResult> {
  const { customerName, customerEmail, orderId, totalAmount, currency, shippingAddress, items } = params;

  let productDetailsHtml = "";

  for (const item of items) {
    productDetailsHtml += `<div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">`;
    productDetailsHtml += `<p style="font-size: 16px; font-weight: bold; margin: 0 0 6px 0;">📦 ${item.productTitle}</p>`;

    if (item.productType === "DIGITAL_DOWNLOAD") {
      productDetailsHtml += `<p style="margin: 4px 0; color: #475569;"><strong>Tipo:</strong> Descarga Digital</p>`;
      if (item.downloadUrl) {
        productDetailsHtml += `<div style="margin-top: 10px;">
          <a href="${item.downloadUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">⬇️ Descargar Producto / Archivo</a>
        </div>`;
      } else {
        productDetailsHtml += `<p style="margin: 4px 0; color: #64748b; font-style: italic;">Tu producto digital ha sido procesado. Accede a tu cuenta para más detalles.</p>`;
      }
    } else if (item.productType === "PHYSICAL") {
      productDetailsHtml += `<p style="margin: 4px 0; color: #475569;"><strong>Tipo:</strong> Producto Físico</p>`;
      productDetailsHtml += `<p style="margin: 4px 0; color: #047857; font-weight: bold;">🚚 Tu pedido ha sido confirmado para envío.</p>`;
      if (shippingAddress) {
        productDetailsHtml += `<p style="margin: 4px 0; color: #334155;"><strong>Dirección de Envío registrada:</strong><br />${shippingAddress.replace(/\n/g, "<br />")}</p>`;
      }
    } else if (item.productType === "VIRTUAL_COURSE") {
      productDetailsHtml += `<p style="margin: 4px 0; color: #475569;"><strong>Tipo:</strong> Curso Virtual</p>`;
      productDetailsHtml += `<div style="margin-top: 10px;">
        <a href="${process.env.NEXTAUTH_URL || ""}/my-account/courses" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">🎓 Acceder al Curso en Mi Cuenta</a>
      </div>`;
    }

    productDetailsHtml += `</div>`;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4f46e5; margin-top: 0;">¡Pago Aprobado y Compra Confirmada! 🎉</h2>
      <p>Hola <strong>${customerName}</strong>,</p>
      <p>Nos complace informarte que tu pago para la orden <strong>#${orderId.slice(0, 8)}</strong> por un total de <strong>$${totalAmount.toLocaleString()} ${currency}</strong> ha sido verificado y aprobado con éxito.</p>
      
      <h3 style="border-bottom: 2px solid #4f46e5; padding-bottom: 6px; color: #1e293b;">Detalles de la compra:</h3>
      ${productDetailsHtml}

      <div style="margin-top: 24px; padding: 12px; background-color: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b; text-align: center;">
        YRRG CMS &bull; Gracias por tu compra
      </div>
    </div>
  `;

  return sendNewsletterEmail({
    subject: `¡Pago Aprobado! Detalles de tu compra #${orderId.slice(0, 8)}`,
    htmlContent,
    recipients: [customerEmail],
  });
}
