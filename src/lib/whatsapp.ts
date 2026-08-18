import { Appointment, Prescription } from '../types/index';

export const CLINIC_WHATSAPP_NUMBER = '919483787702';

/**
 * Generate a free WhatsApp Click-to-Chat URL
 * Uses standard https://wa.me/919483787702?text=... (Zero API Key required)
 */
export function getWhatsAppClickToChatUrl(customMessage?: string): string {
  const defaultText = 'Namaste Hulekal Clinic! I would like to inquire about medical consultation.';
  const encodedText = encodeURIComponent(customMessage || defaultText);
  return `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodedText}`;
}

/**
 * Generate WhatsApp link for confirming/sharing an appointment
 */
export function getAppointmentWhatsAppUrl(appointment: Partial<Appointment>): string {
  const text = `Namaste Hulekal Clinic!
Appointment Booking Ref: ${appointment.appointmentNo || 'HC-Pending'}
Patient Name: ${appointment.patientName || 'Patient'}
Service: ${appointment.serviceName || 'General Consultation'}
Mode: ${appointment.consultationType === 'ONLINE' ? 'Online Video Call' : 'In-Clinic (Sirsi)'}
Date & Time: ${appointment.appointmentDate} at ${appointment.appointmentTime}
Payment Status: ${appointment.paymentStatus || 'Pending'}
Phone: ${appointment.patientPhone || ''}

I would like to verify/confirm my appointment details with Dr. Manjushree.`;

  return `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate WhatsApp link for doctor/admin to contact a patient directly
 */
export function getDoctorPatientWhatsAppUrl(patientPhone: string, message: string): string {
  const cleanPhone = patientPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${formattedPhone || CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate WhatsApp link for prescription sharing
 */
export function getPrescriptionWhatsAppUrl(prescription: Prescription): string {
  const appUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const text = `Namaste!
Official Digital Prescription Ref: ${prescription.prescriptionNo}
Patient Name: ${prescription.patientName}
Date: ${prescription.date}
Diagnosis: ${prescription.diagnosis}
Doctor: Dr. Manjushree Ramachandra V (Reg. 57749)

Link to Prescription Archive: ${appUrl}/#patient-dashboard`;

  return `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
