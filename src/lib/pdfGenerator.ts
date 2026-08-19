import { jsPDF } from 'jspdf';
import { Prescription, ClinicSettings, Appointment } from '../types/index';

export function generatePrescriptionPDF(prescription: Prescription, settings?: ClinicSettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 59, 96); // Deep Healthcare Blue #0f3b60
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Clinic Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('HULEKAL CLINIC', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Quality Healthcare for the Whole Family', 14, 23);
  doc.text('MQX6+96C, Vanalli Rd, Hancharata, Tq: Sirsi, Sirsi, Karnataka 581336, India', 14, 29);
  doc.text('Contact: +91 94837 87702 | Timing: 9:30 AM - 6:30 PM', 14, 34);

  // Doctor Details Badge on Right
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Dr. Manjushree Ramachandra V', pageWidth - 14, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Reg. No: 57749', pageWidth - 14, 22, { align: 'right' });
  doc.text('General & Ayurvedic Healthcare', pageWidth - 14, 28, { align: 'right' });

  // Rx Symbol & Title Bar
  doc.setFillColor(240, 246, 252);
  doc.rect(14, 42, pageWidth - 28, 10, 'F');
  doc.setTextColor(15, 59, 96);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MEDICAL PRESCRIPTION / RX', 18, 48.5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prescription No: ${prescription.prescriptionNo}`, pageWidth - 18, 48.5, { align: 'right' });

  // Patient Info Box
  let y = 58;
  doc.setFillColor(250, 250, 250);
  doc.rect(14, y, pageWidth - 28, 22, 'F');
  doc.setDrawColor(220, 226, 235);
  doc.rect(14, y, pageWidth - 28, 22, 'S');

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.patientName, 44, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Age / Gender:', 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${prescription.patientAge ? `${prescription.patientAge} Yrs` : 'N/A'} / ${prescription.patientGender || 'N/A'}`, 136, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', pageWidth - 45, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.date, pageWidth - 18, y + 6, { align: 'right' });

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', 18, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.patientPhone || 'N/A', 44, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Appointment ID:', 110, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.appointmentNo || 'N/A', 140, y + 13);

  // Vitals
  y += 28;
  if (prescription.vitals) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 59, 96);
    doc.text('Vitals & Examination:', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const vitalsList = [
      prescription.vitals.bp ? `BP: ${prescription.vitals.bp}` : '',
      prescription.vitals.pulse ? `Pulse: ${prescription.vitals.pulse}` : '',
      prescription.vitals.temperature ? `Temp: ${prescription.vitals.temperature}` : '',
      prescription.vitals.weight ? `Weight: ${prescription.vitals.weight}` : '',
      prescription.vitals.spO2 ? `SpO2: ${prescription.vitals.spO2}` : ''
    ].filter(Boolean).join('   |   ');

    doc.text(vitalsList || 'Routine vitals recorded normal.', 14, y);
    y += 8;
  }

  // Diagnosis
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 59, 96);
  doc.text('Diagnosis / Clinical Summary:', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(prescription.diagnosis, 14, y, { maxWidth: pageWidth - 28 });

  // Rx Medicines Section
  y += 12;
  doc.setFillColor(15, 59, 96);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('#', 17, y + 5.5);
  doc.text('Medicine / Treatment', 25, y + 5.5);
  doc.text('Dosage', 95, y + 5.5);
  doc.text('Frequency & Duration', 135, y + 5.5);
  doc.text('Instructions', pageWidth - 18, y + 5.5, { align: 'right' });

  y += 8;
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');

  prescription.medicines.forEach((med, idx) => {
    // Zebra striping
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 9, 'F');
    }
    doc.setDrawColor(230, 235, 242);
    doc.line(14, y + 9, pageWidth - 14, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}.`, 17, y + 6);
    doc.text(med.name, 25, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.text(med.dosage, 95, y + 6);
    doc.text(`${med.frequency} (${med.duration})`, 135, y + 6);
    doc.text(med.instructions || 'As advised', pageWidth - 18, y + 6, { align: 'right' });

    y += 9;
  });

  // Doctor Notes & Dietary Advice
  y += 6;
  if (prescription.doctorNotes) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 59, 96);
    doc.text('Doctor Advice & Instructions:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(prescription.doctorNotes, 14, y, { maxWidth: pageWidth - 28 });
    y += 8;
  }

  if (prescription.dietaryAdvice) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 59, 96);
    doc.text('Dietary & Lifestyle Advice:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(prescription.dietaryAdvice, 14, y, { maxWidth: pageWidth - 28 });
    y += 8;
  }

  if (prescription.followUpDate) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61); // Green
    doc.text(`Follow-up Schedule: ${prescription.followUpDate}`, 14, y);
    y += 8;
  }

  // Doctor Signature Box
  const footerY = 250;
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - 70, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 59, 96);
  doc.setFontSize(10);
  doc.text('Dr. Manjushree Ramachandra V', pageWidth - 42, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Reg. No: 57749', pageWidth - 42, footerY + 9, { align: 'center' });
  doc.text('Authorized Medical Signatory', pageWidth - 42, footerY + 13, { align: 'center' });

  // Bottom Notice
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 275, pageWidth, 22, 'F');
  doc.setTextColor(100, 110, 125);
  doc.setFontSize(7.5);
  doc.text('Hulekal Clinic - Digital Healthcare Record & E-Prescription', pageWidth / 2, 281, { align: 'center' });
  doc.text('This prescription is digitally authenticated by Dr. Manjushree Ramachandra V (Reg No: 57749).', pageWidth / 2, 286, { align: 'center' });
  doc.text('For appointments or emergency inquiry: +91 94837 87702 | Hulekal Village, Sirsi', pageWidth / 2, 291, { align: 'center' });

  // Download
  doc.save(`Hulekal_Clinic_Prescription_${prescription.prescriptionNo}.pdf`);
}

export function generateAppointmentReceiptPDF(appointment: Appointment, settings?: ClinicSettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 59, 96);
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('HULEKAL CLINIC', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Quality Healthcare for the Whole Family', 14, 22);
  doc.text('MQX6+96C, Vanalli Rd, Hancharata, Tq: Sirsi, Sirsi, Karnataka 581336, India', 14, 28);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Dr. Manjushree Ramachandra V', pageWidth - 14, 15, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Reg. No: 57749 | Ph: +91 94837 87702', pageWidth - 14, 22, { align: 'right' });

  // Title
  doc.setFillColor(240, 246, 252);
  doc.rect(14, 42, pageWidth - 28, 9, 'F');
  doc.setTextColor(15, 59, 96);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('APPOINTMENT CONFIRMATION & PAYMENT RECEIPT', 18, 48);

  doc.setFontSize(9);
  doc.text(`Booking ID: ${appointment.appointmentNo}`, pageWidth - 18, 48, { align: 'right' });

  let y = 58;
  doc.setFillColor(252, 252, 252);
  doc.rect(14, y, pageWidth - 28, 80, 'F');
  doc.setDrawColor(225, 232, 240);
  doc.rect(14, y, pageWidth - 28, 80, 'S');

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9.5);

  const leftX = 20;
  const rightX = 110;

  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', leftX, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.patientName, leftX + 30, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Doctor:', rightX, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.doctorName, rightX + 25, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', leftX, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.patientPhone, leftX + 30, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Doctor Reg No:', rightX, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.text('57749', rightX + 25, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Service:', leftX, y + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.serviceName, leftX + 30, y + 30);

  doc.setFont('helvetica', 'bold');
  doc.text('Type:', rightX, y + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.consultationType === 'ONLINE' ? 'Online Teleconsultation' : 'In-Clinic Consultation (Sirsi)', rightX + 25, y + 30);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', leftX, y + 40);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.appointmentDate, leftX + 30, y + 40);

  doc.setFont('helvetica', 'bold');
  doc.text('Time Slot:', rightX, y + 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`${appointment.appointmentTime} - ${appointment.slotEndTime}`, rightX + 25, y + 40);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment ID:', leftX, y + 50);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.paymentId || 'Verified', leftX + 30, y + 50);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Status:', rightX, y + 50);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(appointment.paymentStatus, rightX + 25, y + 50);

  doc.setTextColor(40, 40, 40);
  doc.line(leftX, y + 58, pageWidth - 20, y + 58);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Consultation Fee Paid:', leftX, y + 68);
  doc.setTextColor(15, 59, 96);
  doc.text(`INR ₹${appointment.amount}.00`, pageWidth - 20, y + 68, { align: 'right' });

  // Instructions
  y += 92;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 59, 96);
  doc.setFontSize(10);
  doc.text('Important Instructions:', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8.5);
  if (appointment.consultationType === 'ONLINE') {
    doc.text('• Please log in to your Hulekal Clinic patient portal 5 minutes prior to the scheduled consultation.', 14, y);
    y += 5;
    doc.text('• Click "Join Consultation" from your dashboard to connect directly with Dr. Manjushree Ramachandra V.', 14, y);
    y += 5;
    doc.text('• Ensure good internet connectivity, camera, and microphone permissions are enabled.', 14, y);
  } else {
    doc.text('• Please arrive at Hulekal Clinic, Ramnagar, Vanalli Road 10 minutes before your slot.', 14, y);
    y += 5;
    doc.text('• Bring previous medical reports, prescriptions, or laboratory tests if applicable.', 14, y);
    y += 5;
    doc.text('• Clinic contact number for directions: +91 94837 87702.', 14, y);
  }

  // Footer
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 275, pageWidth, 22, 'F');
  doc.setTextColor(100, 110, 125);
  doc.setFontSize(8);
  doc.text('Hulekal Clinic - Sirsi, Uttara Kannada | Official Booking Receipt', pageWidth / 2, 284, { align: 'center' });
  doc.text('Thank you for trusting Hulekal Clinic with your family healthcare.', pageWidth / 2, 289, { align: 'center' });

  doc.save(`Hulekal_Receipt_${appointment.appointmentNo}.pdf`);
}
