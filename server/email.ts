// Resend email integration for transactional emails
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

interface RegistrationEmailData {
  fullName: string;
  email: string;
  attendanceType: string;
  needsAccommodation: boolean;
  ticketCode?: string;
}

interface BookingConfirmationData {
  fullName: string;
  email: string;
  campName: string;
  checkIn: Date;
  checkOut: Date;
  totalAmount: string;
  depositAmount: string;
  ticketCode?: string;
}

interface PaymentConfirmationData {
  fullName: string;
  email: string;
  amount: string;
  reference: string;
  campName?: string;
}

export async function sendRegistrationEmail(data: RegistrationEmailData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const ticketSection = data.ticketCode 
      ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Ticket Code</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; font-family: monospace; color: #f97316;">${data.ticketCode}</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Present this at the event entrance</p>
        </div>
      `
      : '';

    // Use production domain if available, fall back to dev domain
  const baseUrl = process.env.REPLIT_DOMAINS 
    ? 'https://' + process.env.REPLIT_DOMAINS.split(',')[0]
    : process.env.REPLIT_DEV_DOMAIN 
    ? 'https://' + process.env.REPLIT_DEV_DOMAIN 
    : '';

  const accommodationNote = data.needsAccommodation 
      ? `<p style="color: #666;">You have indicated that you need accommodation. Please proceed to our <a href="${baseUrl}/accommodation" style="color: #f97316;">accommodation page</a> to complete your booking.</p>`
      : '';

    await client.emails.send({
      from: fromEmail || 'noreply@resend.dev',
      to: data.email,
      subject: 'Welcome to Imiklomelo Ka Dakamela 2026!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">Imiklomelo Ka Dakamela</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Chief Dakamela Achievers Awards & Cultural Gathering</p>
          </div>

          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0;">Registration Confirmed!</h2>
            <p style="margin: 0; opacity: 0.9;">Thank you for registering, ${data.fullName}</p>
          </div>

          <div style="padding: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Your Registration Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">${data.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Attendance Type</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-transform: capitalize;">${data.attendanceType}</td>
              </tr>
            </table>
          </div>

          ${ticketSection}

          ${accommodationNote}

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Event Date:</strong> December 2026<br>
              <strong>Location:</strong> Chief Dakamela Cultural Village, South Africa
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2026 Imiklomelo Ka Dakamela. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Registration email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('Failed to send registration email:', error);
    return false;
  }
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();

    const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await client.emails.send({
      from: fromEmail || 'noreply@resend.dev',
      to: data.email,
      subject: 'Accommodation Booking Confirmed - Imiklomelo Ka Dakamela 2026',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">Imiklomelo Ka Dakamela</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Chief Dakamela Achievers Awards & Cultural Gathering</p>
          </div>

          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0;">Booking Confirmed!</h2>
            <p style="margin: 0; opacity: 0.9;">Your accommodation is reserved, ${data.fullName}</p>
          </div>

          <div style="padding: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Camp</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">${data.campName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Check-in</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDate(data.checkIn)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Check-out</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDate(data.checkOut)}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 15px 0; color: #333;">Payment Summary</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Total Amount</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${data.totalAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Deposit (30%)</td>
                <td style="padding: 8px 0; text-align: right; color: #f97316; font-weight: bold;">$${data.depositAmount}</td>
              </tr>
              <tr style="border-top: 2px solid #ddd;">
                <td style="padding: 12px 0; color: #666;">Balance Due at Event</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold;">$${(parseFloat(data.totalAmount) - parseFloat(data.depositAmount)).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          ${data.ticketCode ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400e;">Your Ticket Code</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; font-family: monospace; color: #f97316;">${data.ticketCode}</p>
          </div>
          ` : ''}

          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #b91c1c; font-size: 14px;">
              <strong>Important:</strong> Your deposit of $${data.depositAmount} must be paid within 48 hours to secure your booking.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2026 Imiklomelo Ka Dakamela. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Booking confirmation email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    return false;
  }
}

export async function sendPaymentConfirmationEmail(data: PaymentConfirmationData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();

    await client.emails.send({
      from: fromEmail || 'noreply@resend.dev',
      to: data.email,
      subject: 'Payment Received - Imiklomelo Ka Dakamela 2026',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">Imiklomelo Ka Dakamela</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Chief Dakamela Achievers Awards & Cultural Gathering</p>
          </div>

          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
            <h2 style="margin: 0 0 10px 0;">Payment Received!</h2>
            <p style="margin: 0; opacity: 0.9;">Thank you, ${data.fullName}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 15px 0; color: #333;">Payment Details</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Amount</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; font-size: 20px; color: #22c55e;">$${data.amount}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Reference</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-family: monospace;">${data.reference}</td>
              </tr>
              ${data.campName ? `
              <tr>
                <td style="padding: 10px 0; color: #666;">Camp</td>
                <td style="padding: 10px 0;">${data.campName}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px;">
              Your accommodation is now fully secured. We look forward to seeing you at the event!
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2026 Imiklomelo Ka Dakamela. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Payment confirmation email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    return false;
  }
}
