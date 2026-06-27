// Email sending via Resend (https://resend.com — 100 free emails/day)
// To enable: add RESEND_API_KEY to .env.local and Vercel env vars

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'TattooOS <noreply@tattooos.app>'

interface EmailPayload {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!RESEND_API_KEY) {
    // Email not configured — log and skip silently
    console.log(`[email] Would send to ${to}: ${subject}`)
    return
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
}

export async function sendNewBookingNotification({
  artistEmail,
  artistName,
  clientName,
  clientEmail,
  clientPhone,
  scheduledAt,
  tattooDescription,
  placement,
  size,
  depositAmount,
  bookingId,
}: {
  artistEmail: string
  artistName: string
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  scheduledAt: string
  tattooDescription?: string | null
  placement?: string | null
  size?: string | null
  depositAmount: number
  bookingId: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const date = new Date(scheduledAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const time = new Date(scheduledAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  })

  await sendEmail({
    to: artistEmail,
    subject: `New booking request from ${clientName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;background:#1a1a2e;border:1px solid rgba(124,58,237,0.3);border-radius:8px;padding:8px 14px;">
        <span style="color:#a78bfa;font-size:14px;font-weight:700;">⚡ TattooOS</span>
      </div>
    </div>

    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">New booking request</h1>
    <p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0 0 32px;">Hey ${artistName}, someone wants to book a session with you.</p>

    <div style="background:#1a1a1f;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;width:40%;">Client</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Email</td>
          <td style="padding:8px 0;color:#a78bfa;font-size:13px;"><a href="mailto:${clientEmail}" style="color:#a78bfa;text-decoration:none;">${clientEmail}</a></td>
        </tr>
        ${clientPhone ? `<tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Phone</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;">${clientPhone}</td>
        </tr>` : ''}
        <tr><td colspan="2" style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);"></td></tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Date</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;">${date}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Time</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;">${time}</td>
        </tr>
        ${tattooDescription ? `<tr><td colspan="2" style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);"></td></tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;vertical-align:top;">Tattoo</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;">${tattooDescription}</td>
        </tr>` : ''}
        ${placement ? `<tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Placement</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;">${placement}</td>
        </tr>` : ''}
        ${size ? `<tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Size</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;">${size}</td>
        </tr>` : ''}
        <tr><td colspan="2" style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);"></td></tr>
        <tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Deposit</td>
          <td style="padding:8px 0;color:#4ade80;font-size:13px;font-weight:600;">$${depositAmount} due on confirmation</td>
        </tr>
      </table>
    </div>

    <a href="${appUrl}/bookings/${bookingId}" style="display:block;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:600;margin-bottom:24px;">
      Review &amp; confirm booking →
    </a>

    <p style="color:rgba(255,255,255,0.25);font-size:12px;text-align:center;margin:0;">
      TattooOS · <a href="${appUrl}" style="color:rgba(255,255,255,0.4);text-decoration:none;">tattooos.app</a>
    </p>
  </div>
</body>
</html>
    `.trim(),
  })
}

export async function sendBookingConfirmationToClient({
  clientEmail,
  clientName,
  artistName,
  scheduledAt,
  depositAmount,
}: {
  clientEmail: string
  clientName: string
  artistName: string
  scheduledAt: string
  depositAmount: number
}) {
  const date = new Date(scheduledAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  await sendEmail({
    to: clientEmail,
    subject: `Booking request received — ${artistName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px;">Your booking request was sent!</h1>
    <p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0 0 24px;">
      Hey ${clientName}, ${artistName} received your request for <strong style="color:#fff;">${date}</strong>.
    </p>
    <div style="background:#1a1a1f;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">What happens next</p>
      <ol style="color:rgba(255,255,255,0.6);font-size:14px;padding-left:20px;margin:0;line-height:2;">
        <li>${artistName} will review your request (usually within 24 hours)</li>
        <li>You'll receive a deposit link for $${depositAmount} to confirm your session</li>
        <li>A digital consent form will arrive before your session</li>
        <li>Show up and get inked!</li>
      </ol>
    </div>
    <p style="color:rgba(255,255,255,0.25);font-size:12px;text-align:center;">
      Powered by <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:rgba(255,255,255,0.4);text-decoration:none;">TattooOS</a>
    </p>
  </div>
</body>
</html>
    `.trim(),
  })
}
