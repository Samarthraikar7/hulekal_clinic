import nodemailer from 'nodemailer';
import { Appointment } from '../src/types/index';

const EMAIL_SERVER = process.env.EMAIL_SERVER || 'smtp.gmail.com';
const EMAIL_USERNAME = process.env.EMAIL_USERNAME || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';

function createTransporter() {
  if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_SERVER,
    port: 587,
    secure: false, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD
    }
  });
}

export async function sendNewAppointmentEmail(appointment: Appointment, patientEmail?: string) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[EMAIL] Gmail SMTP credentials missing. Skipped new appointment email dispatch.');
      return { success: false, reason: 'NOT_CONFIGURED' };
    }

    const meetingInfo = '<p><strong>Location:</strong> Hulekal clinic, MQX6+96C, Vanalli Rd, Hancharata, Karnataka 581336 Hancharata, Tq: Sirsi, Sirsi, Karnataka 581336, India</p>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <div style="background-color: #0f3b60; color: #ffffff; padding: 16px; border-radius: 8px; text-align: center;">
          <h2 style="margin: 0;">Hulekal Clinic</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #38bdf8;">Dr. Manjushree Ramachandra V (Reg. No. 57749)</p>
        </div>
        <h3 style="color: #0f3b60; margin-top: 20px;">Appointment Received - Booking ${appointment.appointmentNo}</h3>
        <p>Dear ${appointment.patientName},</p>
        <p>Your appointment request has been recorded successfully at Hulekal Clinic.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Booking No:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${appointment.appointmentNo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Doctor:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">Dr. Manjushree Ramachandra V</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${appointment.serviceName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Date & Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${appointment.appointmentDate} at ${appointment.appointmentTime}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Consultation Mode:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">In-Clinic (Sirsi)</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Fee & Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">₹${appointment.amount} (${appointment.paymentStatus})</td></tr>
        </table>
        ${meetingInfo}
        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          Hulekal Clinic • MQX6+96C, Vanalli Rd, Hancharata, Sirsi 581336 • Phone: +91 94837 87702
        </p>
      </div>
    `;

    const recipient = patientEmail || EMAIL_USERNAME;
    await transporter.sendMail({
      from: `"Hulekal Clinic" <${EMAIL_USERNAME}>`,
      to: recipient,
      subject: `Appointment Booking ${appointment.appointmentNo} - Hulekal Clinic`,
      html: htmlContent
    });

    console.log(`[EMAIL] New appointment email sent successfully to ${recipient}`);
    return { success: true };
  } catch (err: any) {
    console.warn('[EMAIL] Failed to send email via SMTP:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendAppointmentConfirmationEmail(appointment: Appointment, patientEmail?: string) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('[EMAIL] Gmail SMTP credentials missing. Skipped confirmation email dispatch.');
      return { success: false, reason: 'NOT_CONFIGURED' };
    }

    const meetingInfo = '<p><strong>Clinic Address:</strong> Hulekal clinic, MQX6+96C, Vanalli Rd, Hancharata, Karnataka 581336 Hancharata, Tq: Sirsi, Sirsi, Karnataka 581336, India</p>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <div style="background-color: #059669; color: #ffffff; padding: 16px; border-radius: 8px; text-align: center;">
          <h2 style="margin: 0;">Appointment Confirmed!</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #a7f3d0;">Hulekal Clinic • Dr. Manjushree Ramachandra V (Reg. 57749)</p>
        </div>
        <p style="margin-top: 20px;">Dear ${appointment.patientName},</p>
        <p>Your appointment has been <strong>CONFIRMED</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Booking No:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${appointment.appointmentNo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Date & Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${appointment.appointmentDate} at ${appointment.appointmentTime}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${appointment.serviceName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><strong>Payment Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${appointment.paymentStatus}</td></tr>
        </table>
        ${meetingInfo}
        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          Questions? Contact Hulekal Clinic desk at +91 94837 87702.
        </p>
      </div>
    `;

    const recipient = patientEmail || EMAIL_USERNAME;
    await transporter.sendMail({
      from: `"Hulekal Clinic" <${EMAIL_USERNAME}>`,
      to: recipient,
      subject: `CONFIRMED: Appointment ${appointment.appointmentNo} - Hulekal Clinic`,
      html: htmlContent
    });

    console.log(`[EMAIL] Confirmation email sent successfully to ${recipient}`);
    return { success: true };
  } catch (err: any) {
    console.warn('[EMAIL] Failed to send confirmation email:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendAppointmentCancellationEmail(appointment: Appointment, patientEmail?: string) {
  try {
    const transporter = createTransporter();
    if (!transporter) return { success: false, reason: 'NOT_CONFIGURED' };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <div style="background-color: #e11d48; color: #ffffff; padding: 16px; border-radius: 8px; text-align: center;">
          <h2 style="margin: 0;">Appointment Cancelled</h2>
        </div>
        <p style="margin-top: 20px;">Dear ${appointment.patientName},</p>
        <p>Your appointment <strong>${appointment.appointmentNo}</strong> scheduled for ${appointment.appointmentDate} at ${appointment.appointmentTime} has been cancelled.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          To re-book, please visit our website or call +91 94837 87702.
        </p>
      </div>
    `;

    const recipient = patientEmail || EMAIL_USERNAME;
    await transporter.sendMail({
      from: `"Hulekal Clinic" <${EMAIL_USERNAME}>`,
      to: recipient,
      subject: `CANCELLED: Appointment ${appointment.appointmentNo} - Hulekal Clinic`,
      html: htmlContent
    });

    return { success: true };
  } catch (err: any) {
    console.warn('[EMAIL] Failed to send cancellation email:', err.message);
    return { success: false, error: err.message };
  }
}
