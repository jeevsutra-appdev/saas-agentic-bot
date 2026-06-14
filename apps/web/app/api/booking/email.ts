import nodemailer from "nodemailer";
import { LocalDbController } from "@aether/db";

export interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  appointmentId: string;
  amountCents?: number;
  currency?: string;
  notes?: string;
  consultantEmail?: string;
  consultantName?: string;
  reason?: string; // for cancellation/reschedule
  newDate?: string; // for reschedule
  newStartTime?: string;
  newEndTime?: string;
}

function formatTime12(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
    });
  } catch { return dateStr; }
}

function formatPrice(cents: number, currency = "USD") {
  if (!cents || cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

// ─── Base email shell ──────────────────────────────────────────────────────────
function baseTemplate(title: string, accentColor: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0f1128,#1a1f3c);border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;border:1px solid rgba(99,102,241,0.2);border-bottom:none;">
    <div style="display:inline-block;background:linear-gradient(135deg,${accentColor}22,${accentColor}44);border:1px solid ${accentColor}44;border-radius:12px;padding:10px 14px;margin-bottom:16px;">
      <span style="color:${accentColor};font-size:20px;">✦</span>
    </div>
    <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">${title}</h1>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#0d1021;border:1px solid rgba(255,255,255,0.07);border-top:none;border-bottom:none;padding:32px 36px;">
    ${body}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#080a16;border:1px solid rgba(255,255,255,0.07);border-top:none;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
    <p style="color:#4a4a6a;font-size:11px;margin:0;line-height:1.6;">
      Powered by <strong style="color:#6366f1;">Aether AI</strong> · Booking System<br/>
      This is an automated message. Please do not reply directly to this email.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function detailRow(label: string, value: string, color = "#a0a0c0") {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <span style="color:#6a6a8a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">${label}</span>
    </td>
    <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
      <span style="color:${color};font-size:13px;font-weight:700;">${value}</span>
    </td>
  </tr>`;
}

function ctaButton(text: string, url: string, color: string) {
  return `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;padding:12px 24px;border-radius:12px;letter-spacing:0.02em;">${text}</a>`;
}

// ─── TEMPLATE: Booking Confirmation ──────────────────────────────────────────
export function buildConfirmationEmail(d: BookingEmailData, isConsultant = false): string {
  const recipient = isConsultant ? (d.consultantName || "Consultant") : d.clientName;
  const zoomSection = d.zoomJoinUrl ? `
    <tr><td colspan="2" style="padding:20px 0 8px;">
      <a href="${isConsultant ? (d.zoomStartUrl || d.zoomJoinUrl) : d.zoomJoinUrl}"
         style="display:block;background:linear-gradient(135deg,#2563eb22,#2563eb44);border:1px solid #3b82f655;border-radius:14px;padding:16px 20px;text-decoration:none;text-align:center;">
        <div style="color:#60a5fa;font-size:18px;margin-bottom:6px;">📹</div>
        <div style="color:#ffffff;font-size:13px;font-weight:800;margin-bottom:3px;">Join Zoom Meeting</div>
        <div style="color:#60a5fa;font-size:11px;font-weight:500;">${isConsultant ? "Start meeting (host link)" : "Click to join at scheduled time"}</div>
      </a>
    </td></tr>` : "";

  const body = `
    <p style="color:#c0c0e0;font-size:14px;margin:0 0 24px;line-height:1.7;">
      Hi <strong style="color:#fff;">${recipient}</strong> 👋<br/>
      ${isConsultant
        ? `A new appointment has been booked with you. Here are the details:`
        : `Your appointment is <strong style="color:#34d399;">confirmed</strong>! Here's everything you need:`}
    </p>

    <div style="background:#090b1a;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${detailRow("Service", d.serviceName, "#a78bfa")}
        ${detailRow("Date", formatDate(d.date), "#ffffff")}
        ${detailRow("Time", `${formatTime12(d.startTime)} – ${formatTime12(d.endTime)}`, "#ffffff")}
        ${detailRow("Timezone", d.timezone || "UTC")}
        ${d.amountCents ? detailRow("Amount", formatPrice(d.amountCents, d.currency), "#fbbf24") : ""}
        ${isConsultant ? detailRow("Client", `${d.clientName} (${d.clientEmail})`, "#60a5fa") : ""}
        ${detailRow("Booking ID", `#${d.appointmentId.slice(-8).toUpperCase()}`, "#6b7280")}
        ${zoomSection}
      </table>
    </div>

    ${d.notes ? `<div style="background:#0c0e1e;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:20px;">
      <p style="color:#8a8ab0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px;">Notes from client</p>
      <p style="color:#c0c0d8;font-size:13px;margin:0;font-style:italic;">"${d.notes}"</p>
    </div>` : ""}

    ${!isConsultant ? `<p style="color:#6a6a8a;font-size:12px;margin:20px 0 0;text-align:center;line-height:1.6;">
      Need to cancel or reschedule? Contact us before the session time.<br/>
      A calendar invite (.ics) has been sent to your email provider.
    </p>` : ""}
  `;

  return baseTemplate(
    isConsultant ? `New Booking: ${d.serviceName}` : "Appointment Confirmed ✓",
    "#6366f1",
    body
  );
}

// ─── TEMPLATE: Cancellation ───────────────────────────────────────────────────
export function buildCancellationEmail(d: BookingEmailData, isConsultant = false): string {
  const recipient = isConsultant ? (d.consultantName || "Consultant") : d.clientName;
  const body = `
    <p style="color:#c0c0e0;font-size:14px;margin:0 0 24px;line-height:1.7;">
      Hi <strong style="color:#fff;">${recipient}</strong>,<br/>
      ${isConsultant
        ? `An appointment has been <strong style="color:#f87171;">cancelled</strong>.`
        : `Your appointment has been <strong style="color:#f87171;">cancelled</strong>. We're sorry for any inconvenience.`}
    </p>

    <div style="background:#090b1a;border:1px solid rgba(248,113,113,0.2);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${detailRow("Service", d.serviceName, "#f87171")}
        ${detailRow("Was Scheduled For", `${formatDate(d.date)} at ${formatTime12(d.startTime)}`)}
        ${d.amountCents ? detailRow("Refund", formatPrice(d.amountCents, d.currency), "#34d399") : ""}
        ${detailRow("Booking ID", `#${d.appointmentId.slice(-8).toUpperCase()}`, "#6b7280")}
      </table>
    </div>

    ${d.reason ? `<div style="background:#1a0a0a;border-left:3px solid #ef4444;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:20px;">
      <p style="color:#8a5050;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px;">Cancellation Reason</p>
      <p style="color:#fca5a5;font-size:13px;margin:0;">${d.reason}</p>
    </div>` : ""}

    ${!isConsultant ? `<p style="color:#6a6a8a;font-size:12px;margin:20px 0 0;text-align:center;">
      To book a new appointment, simply visit our chat or contact us directly.
    </p>` : ""}
  `;

  return baseTemplate("Appointment Cancelled", "#ef4444", body);
}

// ─── TEMPLATE: Reschedule ─────────────────────────────────────────────────────
export function buildRescheduleEmail(d: BookingEmailData, isConsultant = false): string {
  const recipient = isConsultant ? (d.consultantName || "Consultant") : d.clientName;
  const body = `
    <p style="color:#c0c0e0;font-size:14px;margin:0 0 24px;line-height:1.7;">
      Hi <strong style="color:#fff;">${recipient}</strong>,<br/>
      Your appointment has been <strong style="color:#fbbf24;">rescheduled</strong>. Here are the updated details:
    </p>

    <div style="background:#090b1a;border:1px solid rgba(251,191,36,0.2);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <p style="color:#6a6a8a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Previous Schedule</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="opacity:0.5;">
        ${detailRow("Date", `${formatDate(d.date)} at ${formatTime12(d.startTime)}`)}
      </table>

      <div style="height:1px;background:rgba(251,191,36,0.2);margin:16px 0;"></div>

      <p style="color:#fbbf24;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">✓ New Schedule</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${detailRow("Service", d.serviceName, "#a78bfa")}
        ${detailRow("New Date", d.newDate ? formatDate(d.newDate) : "—", "#ffffff")}
        ${detailRow("New Time", d.newStartTime ? `${formatTime12(d.newStartTime)} – ${formatTime12(d.newEndTime || "")}` : "—", "#ffffff")}
        ${detailRow("Timezone", d.timezone || "UTC")}
      </table>
    </div>

    ${d.zoomJoinUrl ? `<p style="color:#6a6a8a;font-size:12px;text-align:center;">
      Your Zoom link remains the same: <a href="${d.zoomJoinUrl}" style="color:#60a5fa;">Join Meeting</a>
    </p>` : ""}
  `;

  return baseTemplate("Appointment Rescheduled", "#f59e0b", body);
}

// ─── TEMPLATE: Payment Receipt ────────────────────────────────────────────────
export function buildPaymentReceiptEmail(d: BookingEmailData): string {
  const body = `
    <p style="color:#c0c0e0;font-size:14px;margin:0 0 24px;line-height:1.7;">
      Hi <strong style="color:#fff;">${d.clientName}</strong>,<br/>
      Your payment has been received. Here's your receipt:
    </p>

    <div style="background:#090b1a;border:1px solid rgba(52,211,153,0.2);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <p style="color:#34d399;font-size:32px;font-weight:900;margin:0 0 4px;text-align:center;">${formatPrice(d.amountCents || 0, d.currency)}</p>
      <p style="color:#6a6a8a;font-size:11px;text-align:center;margin:0 0 20px;text-transform:uppercase;letter-spacing:0.08em;">Payment Received</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${detailRow("Service", d.serviceName, "#a78bfa")}
        ${detailRow("Date", formatDate(d.date))}
        ${detailRow("Time", `${formatTime12(d.startTime)} – ${formatTime12(d.endTime)}`)}
        ${detailRow("Invoice ID", `INV-${d.appointmentId.slice(-8).toUpperCase()}`, "#34d399")}
        ${detailRow("Status", "PAID ✓", "#34d399")}
      </table>
    </div>

    <p style="color:#6a6a8a;font-size:12px;text-align:center;">
      Please keep this email for your records. Thank you for your payment!
    </p>
  `;

  return baseTemplate("Payment Received ✓", "#10b981", body);
}

// ─── ICS Calendar Attachment ──────────────────────────────────────────────────
export function buildICS(d: BookingEmailData): string {
  const fmt = (dt: string) => dt.replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = new Date(`${d.date}T${d.startTime}:00Z`);
  const end = new Date(`${d.date}T${d.endTime}:00Z`);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aether AI//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${d.appointmentId}@aether.ai`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(start.toISOString())}`,
    `DTEND:${fmt(end.toISOString())}`,
    `SUMMARY:${d.serviceName}`,
    `DESCRIPTION:Booking ID: ${d.appointmentId}${d.zoomJoinUrl ? "\\nZoom: " + d.zoomJoinUrl : ""}${d.notes ? "\\nNotes: " + d.notes : ""}`,
    d.zoomJoinUrl ? `LOCATION:${d.zoomJoinUrl}` : "LOCATION:Online",
    `ORGANIZER:MAILTO:${d.consultantEmail || "noreply@aether.ai"}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT:MAILTO:${d.clientEmail}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Upcoming appointment in 30 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

// ─── Core Send Function ───────────────────────────────────────────────────────
export async function sendBookingEmail(
  tenantSlug: string,
  to: string,
  subject: string,
  html: string,
  icsContent?: string
) {
  const settings = await LocalDbController.getTenantSettings(tenantSlug);
  if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPass) {
    console.log(`[Email] SMTP not configured for ${tenantSlug}. Skipping send to ${to}.`);
    console.log(`[Email] Subject: ${subject}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: (settings.smtpPort || 587) === 465,
      auth: { user: settings.smtpUser, pass: settings.smtpPass },
      tls: { rejectUnauthorized: false }
    });

    const attachments = icsContent ? [{
      filename: "appointment.ics",
      content: icsContent,
      contentType: "text/calendar; method=REQUEST"
    }] : [];

    await transporter.sendMail({
      from: `"Aether Booking" <${settings.smtpFrom || settings.smtpUser}>`,
      to,
      subject,
      html,
      attachments
    });

    console.log(`[Email] ✓ Sent "${subject}" to ${to}`);
    return true;
  } catch (err: any) {
    console.error(`[Email] ✗ Failed to send to ${to}:`, err.message);
    return false;
  }
}

// ─── High-level triggers ──────────────────────────────────────────────────────

export async function triggerConfirmationEmails(tenantSlug: string, data: BookingEmailData) {
  const ics = buildICS(data);

  // To client
  await sendBookingEmail(
    tenantSlug,
    data.clientEmail,
    `✓ Appointment Confirmed: ${data.serviceName} on ${formatDate(data.date)}`,
    buildConfirmationEmail(data, false),
    ics
  );

  // To consultant
  if (data.consultantEmail) {
    await sendBookingEmail(
      tenantSlug,
      data.consultantEmail,
      `New Booking: ${data.clientName} — ${data.serviceName}`,
      buildConfirmationEmail(data, true),
      ics
    );
  }

  // Payment receipt if paid
  if (data.amountCents && data.amountCents > 0) {
    await sendBookingEmail(
      tenantSlug,
      data.clientEmail,
      `Payment Receipt — ${data.serviceName}`,
      buildPaymentReceiptEmail(data)
    );
  }
}

export async function triggerCancellationEmails(tenantSlug: string, data: BookingEmailData) {
  await sendBookingEmail(
    tenantSlug,
    data.clientEmail,
    `Appointment Cancelled: ${data.serviceName}`,
    buildCancellationEmail(data, false)
  );
  if (data.consultantEmail) {
    await sendBookingEmail(
      tenantSlug,
      data.consultantEmail,
      `Booking Cancelled: ${data.clientName}`,
      buildCancellationEmail(data, true)
    );
  }
}

export async function triggerRescheduleEmails(tenantSlug: string, data: BookingEmailData) {
  const ics = buildICS({ ...data, date: data.newDate || data.date, startTime: data.newStartTime || data.startTime, endTime: data.newEndTime || data.endTime });
  await sendBookingEmail(
    tenantSlug,
    data.clientEmail,
    `Appointment Rescheduled: ${data.serviceName}`,
    buildRescheduleEmail(data, false),
    ics
  );
  if (data.consultantEmail) {
    await sendBookingEmail(
      tenantSlug,
      data.consultantEmail,
      `Booking Rescheduled: ${data.clientName}`,
      buildRescheduleEmail(data, true),
      ics
    );
  }
}
