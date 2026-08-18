import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import { User, ConsultationType } from '../src/types/index';
import {
  sendNewAppointmentEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail
} from './email';

export const apiRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hulekal_clinic_secure_jwt_secret_token_2026';

// Helper to calculate end time for 12h or 24h formatted time strings
function calculateSlotEndTime(timeStr: string, durationMinutes: number = 30): string {
  try {
    const is12Hour = /am|pm/i.test(timeStr);
    const isPM = /pm/i.test(timeStr);
    const cleanTime = timeStr.replace(/[^0-9:]/g, '').trim();
    const parts = cleanTime.split(':');
    let hour = parseInt(parts[0] || '9', 10);
    let minute = parseInt(parts[1] || '30', 10);

    if (is12Hour) {
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    }

    const totalMinutes = hour * 60 + minute + durationMinutes;
    let endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;

    if (is12Hour) {
      const period = endHour >= 12 ? 'PM' : 'AM';
      const displayHour = endHour % 12 === 0 ? 12 : endHour % 12;
      return `${String(displayHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')} ${period}`;
    }

    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  } catch {
    return '10:00 AM';
  }
}

// Middleware: Authenticate JWT token
export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err || !decoded) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }
    req.user = user;
    next();
  });
};

// Middleware: Role authorization
export const requireRole = (roles: Array<'PATIENT' | 'DOCTOR' | 'ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions.' });
    }
    next();
  };
};

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

// Register Patient
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, gender, dob, age, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone number, and password are required.' });
    }

    const existingUser = db.findUserByEmailOrPhone(email) || db.findUserByEmailOrPhone(phone);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email or phone number already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({
      name,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'PATIENT',
      passwordHash,
      gender,
      dob,
      age: age ? Number(age) : undefined,
      address
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Registration successful! Welcome to Hulekal Clinic.',
      token,
      user: safeUser
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login (Patient, Doctor, Admin)
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide your email/phone and password.' });
    }

    const user = db.findUserByEmailOrPhone(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email/phone number or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/phone number or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Get Current Logged-in User
apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { passwordHash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

// Update Profile
apiRouter.put('/auth/update-profile', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, phone, gender, dob, age, address } = req.body;
  const updated = db.updateUser(req.user.id, {
    name: name || req.user.name,
    phone: phone || req.user.phone,
    gender: gender || req.user.gender,
    dob: dob || req.user.dob,
    age: age ? Number(age) : req.user.age,
    address: address !== undefined ? address : req.user.address
  });

  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, ...safeUser } = updated;
  return res.json({ message: 'Profile updated successfully.', user: safeUser });
});

// Change Password
apiRouter.post('/auth/change-password', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, req.user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  db.updateUser(req.user.id, { passwordHash });

  return res.json({ message: 'Password changed successfully.' });
});

// Reset Password (Forgot Password Flow)
apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { identifier, newPassword } = req.body;
  if (!identifier || !newPassword) {
    return res.status(400).json({ error: 'Email/phone number and new password are required.' });
  }

  const user = db.findUserByEmailOrPhone(identifier);
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email or phone number.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  db.updateUser(user.id, { passwordHash });

  return res.json({ message: 'Password reset successfully! You can now sign in with your new password.' });
});

// ==========================================
// 2. CLINIC PUBLIC INFO & SETTINGS
// ==========================================

apiRouter.get('/clinic-info', (req: Request, res: Response) => {
  const settings = db.getClinicSettings();
  const doctors = db.getDoctors();
  const services = db.getServices();
  const reviews = db.getReviews();

  return res.json({
    settings,
    doctor: doctors[0] || null,
    services,
    reviews
  });
});

apiRouter.put('/admin/settings', authenticateToken, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const updates = req.body;
  const updated = db.updateClinicSettings(updates);
  return res.json({ message: 'Clinic settings updated successfully.', settings: updated });
});

// ==========================================
// 3. SERVICES & DOCTORS
// ==========================================

apiRouter.get('/services', (req: Request, res: Response) => {
  return res.json({ services: db.getServices() });
});

apiRouter.post('/admin/services', authenticateToken, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const { name, shortDescription, description, icon, fee, durationMinutes, category } = req.body;
  if (!name || !shortDescription || !fee) {
    return res.status(400).json({ error: 'Name, short description, and fee are required.' });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const service = db.createService({
    name,
    slug,
    shortDescription,
    description: description || shortDescription,
    icon: icon || 'Stethoscope',
    fee: Number(fee),
    durationMinutes: Number(durationMinutes) || 30,
    category: category || 'General',
    isActive: true
  });
  return res.status(201).json({ message: 'Service created successfully.', service });
});

apiRouter.put('/admin/services/:id', authenticateToken, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const updated = db.updateService(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Service not found.' });
  return res.json({ message: 'Service updated successfully.', service: updated });
});

apiRouter.delete('/admin/services/:id', authenticateToken, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const success = db.deleteService(req.params.id);
  if (!success) return res.status(404).json({ error: 'Service not found.' });
  return res.json({ message: 'Service deleted successfully.' });
});

apiRouter.get('/doctors', (req: Request, res: Response) => {
  return res.json({ doctors: db.getDoctors() });
});

apiRouter.put('/admin/doctors/:id', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  const updated = db.updateDoctor(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Doctor not found.' });
  return res.json({ message: 'Doctor details updated successfully.', doctor: updated });
});

// ==========================================
// 4. SMART TIME SLOTS (9:30 AM – 6:30 PM)
// ==========================================

apiRouter.get('/slots/available', (req: Request, res: Response) => {
  try {
    const { doctorId, date } = req.query as { doctorId?: string; date?: string };

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD).' });
    }

    const targetDoctorId = doctorId || db.getDoctors()[0]?.id || 'doc-1';
    const settings = db.getClinicSettings();

    // Check if entire date is blocked
    if (db.isDateBlocked(targetDoctorId, date)) {
      return res.json({
        date,
        doctorId: targetDoctorId,
        isBlocked: true,
        reason: 'The doctor is unavailable on this date.',
        slots: []
      });
    }

    // Check day of week (0 = Sunday, clinic closed on Sundays by default or configurable)
    const selectedDate = new Date(`${date}T00:00:00`);
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0) {
      return res.json({
        date,
        doctorId: targetDoctorId,
        isBlocked: true,
        reason: 'Clinic is closed on Sundays for routine consultations. Emergency calls welcome.',
        slots: []
      });
    }

    // Generate slots: 9:30 AM to 6:30 PM (09:30 to 18:30) with 30 min duration
    // Standard schedule:
    // Morning: 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00
    // Lunch Break: 13:30 - 14:15
    // Afternoon/Evening: 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00
    const rawSlotTimes = [
      { start: '09:30', end: '10:00', period: 'Morning' },
      { start: '10:00', end: '10:30', period: 'Morning' },
      { start: '10:30', end: '11:00', period: 'Morning' },
      { start: '11:00', end: '11:30', period: 'Morning' },
      { start: '11:30', end: '12:00', period: 'Morning' },
      { start: '12:00', end: '12:30', period: 'Morning' },
      { start: '12:30', end: '13:00', period: 'Morning' },
      { start: '13:00', end: '13:30', period: 'Morning' },
      { start: '14:30', end: '15:00', period: 'Afternoon' },
      { start: '15:00', end: '15:30', period: 'Afternoon' },
      { start: '15:30', end: '16:00', period: 'Afternoon' },
      { start: '16:00', end: '16:30', period: 'Evening' },
      { start: '16:30', end: '17:00', period: 'Evening' },
      { start: '17:00', end: '17:30', period: 'Evening' },
      { start: '17:30', end: '18:00', period: 'Evening' },
      { start: '18:00', end: '18:30', period: 'Evening' }
    ];

    // Determine if today and check past times
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = date === todayStr;
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const slots = rawSlotTimes.map(s => {
      const [slotH, slotM] = s.start.split(':').map(Number);
      let isAvailable = true;
      let reason = 'Available';

      // Past check if date is today
      if (isToday) {
        if (slotH < currentHour || (slotH === currentHour && slotM <= currentMin)) {
          isAvailable = false;
          reason = 'Time has passed';
        }
      }

      // Check database booking status
      if (isAvailable && db.isSlotBooked(targetDoctorId, date, s.start)) {
        isAvailable = false;
        reason = 'Already booked';
      }

      return {
        time: s.start,
        endTime: s.end,
        period: s.period,
        isAvailable,
        reason
      };
    });

    return res.json({
      date,
      doctorId: targetDoctorId,
      isBlocked: false,
      slots
    });
  } catch (error: any) {
    console.error('Slot generation error:', error);
    return res.status(500).json({ error: 'Failed to calculate available time slots.' });
  }
});

// ==========================================
// 5. APPOINTMENTS & PAYMENTS (RAZORPAY INTEGRATION)
// ==========================================

// Create Appointment & Payment Order
apiRouter.post('/appointments/create-order', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const {
      doctorId,
      serviceId,
      consultationType,
      appointmentDate,
      appointmentTime,
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      patientGender,
      symptoms,
      notes
    } = req.body;

    if (!doctorId || !serviceId || !consultationType || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Missing required appointment booking details.' });
    }

    const doctor = db.getDoctorById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

    const service = db.getServiceById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    // Calculate end time
    const slotEndTime = calculateSlotEndTime(appointmentTime, service.durationMinutes || 30);

    const amount = consultationType === 'ONLINE' ? (doctor.onlineFee || service.fee) : service.fee;

    // Atomically create appointment in database with double-booking lock
    const bookingResult = db.createAppointment({
      patientId: req.user.id,
      patientName: patientName || req.user.name,
      patientPhone: patientPhone || req.user.phone,
      patientEmail: patientEmail || req.user.email,
      patientAge: patientAge ? Number(patientAge) : req.user.age,
      patientGender: patientGender || req.user.gender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      serviceId: service.id,
      serviceName: service.name,
      consultationType: consultationType as ConsultationType,
      appointmentDate,
      appointmentTime,
      slotEndTime,
      amount,
      symptoms,
      notes,
      paymentStatus: 'PENDING',
      appointmentStatus: 'PENDING'
    });

    if (!bookingResult.success || !bookingResult.appointment) {
      return res.status(409).json({ error: bookingResult.error || 'This slot is no longer available.' });
    }

    const appointment = bookingResult.appointment;
    
    // Dispatch background new appointment email notification
    sendNewAppointmentEmail(appointment, req.user?.email).catch(err => console.warn('Email dispatch warning:', err));

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    const isConfigured = Boolean(
      razorpayKeyId &&
      razorpayKeySecret &&
      !razorpayKeyId.includes('placeholder') &&
      !razorpayKeySecret.includes('placeholder')
    );

    const razorpayData = isConfigured ? {
      key: razorpayKeyId,
      amount: amount * 100, // in paise for Razorpay
      currency: 'INR',
      name: 'Hulekal Clinic',
      description: `${service.name} (${consultationType === 'ONLINE' ? 'Online Video' : 'In-Clinic'})`,
      order_id: `order_${appointment.id}`,
      prefill: {
        name: appointment.patientName,
        email: appointment.patientEmail,
        contact: appointment.patientPhone
      },
      notes: {
        appointmentId: appointment.id,
        appointmentNo: appointment.appointmentNo
      },
      theme: {
        color: '#0f3b60'
      }
    } : null;

    return res.status(201).json({
      message: 'Appointment reserved successfully.',
      appointment,
      isRazorpayConfigured: isConfigured,
      razorpay: razorpayData
    });
  } catch (error: any) {
    console.error('Create appointment order error:', error);
    return res.status(500).json({ error: 'Failed to initiate appointment booking.' });
  }
});

// Verify Payment & Confirm Appointment
apiRouter.post('/appointments/verify-payment', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId, razorpay_payment_id, razorpay_order_id, razorpay_signature, paymentMethod } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID is required.' });
    }

    const appointment = db.getAppointmentById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    // Check ownership: Patient cannot confirm payment for another patient's appointment
    if (req.user && req.user.role === 'PATIENT' && appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot confirm payment for another patient\'s appointment.' });
    }

    // Prevent duplicate confirmation for already paid appointments
    if (appointment.paymentStatus === 'SUCCESS') {
      return res.status(400).json({ error: 'This appointment payment has already been completed and confirmed.' });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    const isConfigured = razorpayKeyId &&
      razorpaySecret &&
      !razorpayKeyId.includes('placeholder') &&
      !razorpaySecret.includes('placeholder');

    if (!isConfigured) {
      return res.status(400).json({
        status: 'BLOCKED',
        reason: 'TEST CREDENTIALS NOT CONFIGURED',
        error: 'RAZORPAY = BLOCKED | Reason = TEST CREDENTIALS NOT CONFIGURED (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are missing).'
      });
    }

    // Verify signature if Razorpay secret is set
    if (razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        db.updateAppointment(appointmentId, { paymentStatus: 'FAILED' });
        return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
      }
    }

    const paymentId = razorpay_payment_id || `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Update appointment status to CONFIRMED and payment to SUCCESS
    const updated = db.updateAppointment(appointmentId, {
      paymentStatus: 'SUCCESS',
      appointmentStatus: 'CONFIRMED',
      paymentId,
      orderId: razorpay_order_id || appointment.orderId,
      paymentMethod: paymentMethod || 'UPI / Razorpay'
    });

    if (updated) {
      sendAppointmentConfirmationEmail(updated, req.user?.email).catch(err => console.warn('Email dispatch warning:', err));
    }

    return res.json({
      message: 'Payment verified successfully! Your appointment is confirmed.',
      appointment: updated
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed.' });
  }
});

// Option A: Pay at Clinic
apiRouter.post('/appointments/:id/pay-at-clinic', authenticateToken, (req: AuthRequest, res: Response) => {
  const appointment = db.getAppointmentById(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  if (req.user?.role === 'PATIENT' && appointment.patientId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const updated = db.updateAppointment(req.params.id, {
    paymentStatus: 'Pay at Clinic' as any,
    appointmentStatus: 'CONFIRMED',
    paymentMethod: 'Pay at Clinic'
  });

  if (updated) {
    sendAppointmentConfirmationEmail(updated, req.user?.email).catch(err => console.warn('Email dispatch warning:', err));
  }

  return res.json({ message: 'Appointment confirmed! You can pay at the clinic counter during your visit.', appointment: updated });
});

// Option B: Direct UPI QR Code Payment
apiRouter.post('/appointments/:id/pay-via-upi', authenticateToken, (req: AuthRequest, res: Response) => {
  const appointment = db.getAppointmentById(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  if (req.user?.role === 'PATIENT' && appointment.patientId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const updated = db.updateAppointment(req.params.id, {
    paymentStatus: 'PENDING',
    appointmentStatus: 'CONFIRMED',
    paymentMethod: 'Direct UPI (QR Code)'
  });

  if (updated) {
    sendAppointmentConfirmationEmail(updated, req.user?.email).catch(err => console.warn('Email dispatch warning:', err));
  }

  return res.json({ message: 'Appointment confirmed! Please complete your UPI payment using the QR code.', appointment: updated });
});

// Handle Payment Failure / Modal Cancellation
apiRouter.post('/appointments/payment-failed', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId, reason } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID is required.' });
    }

    const appointment = db.getAppointmentById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    if (req.user && req.user.role === 'PATIENT' && appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Unauthorized access.' });
    }

    // Do NOT mark as SUCCESS or CONFIRMED. Set paymentStatus to FAILED
    const updated = db.updateAppointment(appointmentId, {
      paymentStatus: 'FAILED',
      appointmentStatus: 'PENDING'
    });

    return res.json({
      message: 'Payment attempt failed or was cancelled. Appointment remains unconfirmed.',
      appointment: updated
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to record payment failure status.' });
  }
});

// Patient: Get My Appointments
apiRouter.get('/appointments/my', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const appointments = db.getAppointmentsByPatientId(req.user.id);
  // Sort descending by appointmentDate + appointmentTime
  appointments.sort((a, b) => (b.appointmentDate + b.appointmentTime).localeCompare(a.appointmentDate + a.appointmentTime));
  return res.json({ appointments });
});

// Get Appointment Details
apiRouter.get('/appointments/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const appointment = db.getAppointmentById(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  // Ensure user owns appointment or is doctor/admin
  if (req.user?.role === 'PATIENT' && appointment.patientId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied to this appointment.' });
  }

  const prescription = db.getPrescriptionByAppointmentId(appointment.id);
  return res.json({ appointment, prescription });
});

// Telehealth Video Room Access Endpoint (With Video Provider Check & Authorization)
apiRouter.get('/consultation/room-access/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const appointment = db.getAppointmentById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  // 1. Check Video Provider Configuration
  const videoApiKey = process.env.VIDEO_API_KEY;
  const isVideoConfigured = videoApiKey &&
    !videoApiKey.includes('placeholder') &&
    !videoApiKey.includes('token') &&
    videoApiKey.trim().length > 10;

  if (!isVideoConfigured) {
    return res.status(400).json({
      status: 'BLOCKED',
      reason: 'VIDEO PROVIDER NOT CONFIGURED',
      error: 'ONLINE CONSULTATION = BLOCKED | Reason = VIDEO PROVIDER NOT CONFIGURED (VIDEO_API_KEY environment variable is missing).'
    });
  }

  // 2. Authorization Check: Authorized Patient or Doctor/Admin only
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const isAuthorizedPatient = req.user.id === appointment.patientId;
  const isAuthorizedDoctor = req.user.role === 'DOCTOR' || req.user.role === 'ADMIN' || req.user.id === appointment.doctorId;

  if (!isAuthorizedPatient && !isAuthorizedDoctor) {
    return res.status(403).json({
      status: 'DENIED',
      error: 'Access denied: Unrelated users cannot enter this private video consultation room.'
    });
  }

  return res.json({
    status: 'GRANTED',
    message: 'Authorized access granted to video consultation room.',
    roomUrl: appointment.meetingUrl || `/consultation/room/${appointment.id}`,
    role: isAuthorizedDoctor ? 'DOCTOR' : 'PATIENT',
        user: {
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Notification Provider Status & Verification Endpoint
apiRouter.get('/notifications/provider-status', (req: Request, res: Response) => {
  const emailConfigured = Boolean(
    process.env.EMAIL_SERVER &&
    process.env.EMAIL_USERNAME &&
    process.env.EMAIL_PASSWORD &&
    !process.env.EMAIL_PASSWORD.includes('placeholder')
  );

  const smsConfigured = Boolean(
    process.env.SMS_API_KEY &&
    !process.env.SMS_API_KEY.includes('placeholder')
  );

  const whatsAppConfigured = Boolean(
    process.env.WHATSAPP_API_KEY &&
    !process.env.WHATSAPP_API_KEY.includes('placeholder')
  );

  const getEventStatus = (isConfigured: boolean) => {
    return isConfigured ? 'DELIVERED (Live Gateway)' : 'NOT CONFIGURED';
  };

  return res.json({
    providers: {
      email: {
        status: emailConfigured ? 'CONFIGURED' : 'NOT CONFIGURED',
        server: process.env.EMAIL_SERVER || null
      },
      sms: {
        status: smsConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'
      },
      whatsApp: {
        status: whatsAppConfigured ? 'CONFIGURED' : 'NOT CONFIGURED',
        phone: process.env.CLINIC_WHATSAPP || '919483787702'
      }
    },
    notificationEvents: {
      appointmentConfirmation: {
        email: getEventStatus(emailConfigured),
        sms: getEventStatus(smsConfigured),
        whatsApp: getEventStatus(whatsAppConfigured)
      },
      paymentConfirmation: {
        email: getEventStatus(emailConfigured),
        sms: getEventStatus(smsConfigured),
        whatsApp: getEventStatus(whatsAppConfigured)
      },
      reminder: {
        email: getEventStatus(emailConfigured),
        sms: getEventStatus(smsConfigured),
        whatsApp: getEventStatus(whatsAppConfigured)
      },
      cancellation: {
        email: getEventStatus(emailConfigured),
        sms: getEventStatus(smsConfigured),
        whatsApp: getEventStatus(whatsAppConfigured)
      },
      prescriptionNotification: {
        email: getEventStatus(emailConfigured),
        sms: getEventStatus(smsConfigured),
        whatsApp: getEventStatus(whatsAppConfigured)
      }
    }
  });
});

// Cancel Appointment
apiRouter.post('/appointments/:id/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
  const appointment = db.getAppointmentById(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  if (req.user?.role === 'PATIENT' && appointment.patientId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const updated = db.updateAppointment(req.params.id, {
    appointmentStatus: 'CANCELLED',
    notes: req.body.reason ? `Cancelled reason: ${req.body.reason}` : appointment.notes
  });

  return res.json({ message: 'Appointment cancelled.', appointment: updated });
});

// ==========================================
// 6. DOCTOR WORKFLOW & PRESCRIPTIONS
// ==========================================

apiRouter.get('/doctor/appointments', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const doctor = db.getDoctors()[0];
  const doctorId = doctor ? doctor.id : 'doc-1';
  const appointments = db.getAppointmentsByDoctorId(doctorId);
  appointments.sort((a, b) => (b.appointmentDate + b.appointmentTime).localeCompare(a.appointmentDate + a.appointmentTime));
  return res.json({ appointments });
});

apiRouter.put('/doctor/appointments/:id/status', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body;
  const updated = db.updateAppointment(req.params.id, {
    appointmentStatus: status,
    notes: notes || undefined
  });
  if (!updated) return res.status(404).json({ error: 'Appointment not found.' });
  return res.json({ message: 'Appointment status updated.', appointment: updated });
});

// Create Prescription (Doctor Only)
apiRouter.post('/prescriptions', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), (req: AuthRequest, res: Response) => {
  try {
    const {
      appointmentId,
      patientId,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      diagnosis,
      vitals,
      medicines,
      doctorNotes,
      dietaryAdvice,
      followUpDate
    } = req.body;

    if (!patientId || !diagnosis || !medicines || !Array.isArray(medicines)) {
      return res.status(400).json({ error: 'Patient, diagnosis, and medicines list are required.' });
    }

    const doctor = db.getDoctors()[0];
    const appointment = appointmentId ? db.getAppointmentById(appointmentId) : null;

    const prescription = db.createPrescription({
      appointmentId: appointmentId || '',
      appointmentNo: appointment?.appointmentNo || `HC-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      patientName: patientName || appointment?.patientName || 'Patient',
      patientAge: patientAge ? Number(patientAge) : appointment?.patientAge,
      patientGender: patientGender || appointment?.patientGender,
      patientPhone: patientPhone || appointment?.patientPhone || '',
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorRegNo: doctor.regNo,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      vitals,
      medicines,
      doctorNotes,
      dietaryAdvice,
      followUpDate
    });

    // Mark appointment as COMPLETED if linked
    if (appointmentId) {
      db.updateAppointment(appointmentId, { appointmentStatus: 'COMPLETED' });
    }

    return res.status(201).json({ message: 'Prescription generated successfully.', prescription });
  } catch (error: any) {
    console.error('Prescription generation error:', error);
    return res.status(500).json({ error: 'Failed to create prescription.' });
  }
});

// Get Prescriptions (Patient / Doctor)
apiRouter.get('/prescriptions/my', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const prescriptions = db.getPrescriptionsByPatientId(req.user.id);
  prescriptions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return res.json({ prescriptions });
});

apiRouter.get('/prescriptions/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const prescription = db.getPrescriptionById(req.params.id);
  if (!prescription) return res.status(404).json({ error: 'Prescription not found.' });

  if (req.user?.role === 'PATIENT' && prescription.patientId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  return res.json({ prescription });
});

// ==========================================
// 7. MEDICAL RECORDS
// ==========================================

apiRouter.get('/medical-records/my', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const records = db.getMedicalRecordsByPatientId(req.user.id);
  records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return res.json({ records });
});

apiRouter.post('/medical-records', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, recordType, description, fileUrl, fileName, date, targetPatientId } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const patientId = (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN') && targetPatientId ? targetPatientId : req.user.id;
  const patient = db.findUserById(patientId);

  const record = db.createMedicalRecord({
    patientId,
    patientName: patient?.name || req.user.name,
    doctorId: req.user.role === 'DOCTOR' ? db.getDoctors()[0]?.id : undefined,
    doctorName: req.user.role === 'DOCTOR' ? db.getDoctors()[0]?.name : undefined,
    title,
    recordType: recordType || 'OTHER',
    description,
    fileUrl,
    fileName,
    date: date || new Date().toISOString().split('T')[0]
  });

  return res.status(201).json({ message: 'Medical record saved securely.', record });
});

// Update Doctor Profile (Photo URL, Bio, Timings)
apiRouter.put('/admin/doctor-profile', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  const { photoUrl, intro, qualification, availableTimings } = req.body;
  const doctor = db.getDoctors()[0];
  if (!doctor) return res.status(404).json({ error: 'Doctor profile not found.' });

  const updated = db.updateDoctor(doctor.id, {
    photoUrl: photoUrl || doctor.photoUrl,
    intro: intro || doctor.intro,
    qualification: qualification || doctor.qualification,
    availableTimings: availableTimings || doctor.availableTimings
  });

  return res.json({ message: 'Doctor profile updated successfully.', doctor: updated });
});

// ==========================================
// 8. ADMIN DASHBOARD & ANALYTICS
// ==========================================

apiRouter.get('/admin/overview', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  const data = db.getData();
  const today = new Date().toISOString().split('T')[0];

  const totalPatients = data.users.filter(u => u.role === 'PATIENT').length;
  const totalAppointments = data.appointments.length;
  const todayAppointments = data.appointments.filter(a => a.appointmentDate === today).length;
  const upcomingAppointments = data.appointments.filter(a => a.appointmentDate >= today && a.appointmentStatus === 'CONFIRMED').length;
  const completedConsultations = data.appointments.filter(a => a.appointmentStatus === 'COMPLETED').length;
  const onlineConsultations = data.appointments.filter(a => a.consultationType === 'ONLINE' && a.paymentStatus === 'SUCCESS').length;
  const inClinicConsultations = data.appointments.filter(a => a.consultationType === 'IN_CLINIC' && a.paymentStatus === 'SUCCESS').length;

  const totalRevenue = data.appointments
    .filter(a => a.paymentStatus === 'SUCCESS')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const pendingPayments = data.appointments.filter(a => a.paymentStatus === 'PENDING').length;
  const cancelledAppointments = data.appointments.filter(a => a.appointmentStatus === 'CANCELLED').length;

  // Service popularity breakdown
  const serviceCountMap: Record<string, number> = {};
  data.appointments.forEach(a => {
    serviceCountMap[a.serviceName] = (serviceCountMap[a.serviceName] || 0) + 1;
  });

  const servicePopularity = Object.keys(serviceCountMap).map(name => ({
    name,
    count: serviceCountMap[name]
  }));

  const confirmedAppointments = data.appointments.filter(a => a.appointmentStatus === 'CONFIRMED' || a.appointmentStatus === 'COMPLETED').length;

  return res.json({
    kpis: {
      totalPatients,
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      completedConsultations,
      onlineConsultations,
      inClinicConsultations,
      totalRevenue,
      pendingPayments,
      cancelledAppointments
    },
    stats: {
      totalAppointments,
      confirmedAppointments,
      totalRevenue,
      inClinicAppointments: inClinicConsultations,
      onlineAppointments: onlineConsultations
    },
    servicePopularity,
    recentAppointments: data.appointments.slice(-8).reverse()
  });
});

apiRouter.get('/admin/appointments', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  const { date, status, type } = req.query as { date?: string; status?: string; type?: string };
  let appointments = [...db.getAppointments()];

  if (date) {
    appointments = appointments.filter(a => a.appointmentDate === date);
  }
  if (status) {
    appointments = appointments.filter(a => a.appointmentStatus === status);
  }
  if (type) {
    appointments = appointments.filter(a => a.consultationType === type);
  }

  appointments.sort((a, b) => (b.appointmentDate + b.appointmentTime).localeCompare(a.appointmentDate + a.appointmentTime));
  return res.json({ appointments });
});

apiRouter.get('/admin/patients', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  const patients = db.getData().users.filter(u => u.role === 'PATIENT');
  const safePatients = patients.map(({ passwordHash: _, ...rest }) => {
    const apts = db.getAppointmentsByPatientId(rest.id);
    return {
      ...rest,
      appointmentCount: apts.length,
      lastVisit: apts[0]?.appointmentDate || 'Never'
    };
  });
  return res.json({ patients: safePatients });
});

// Admin Blocked Dates
apiRouter.get('/admin/blocked-dates', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  return res.json({ blockedDates: db.getBlockedDates() });
});

apiRouter.post('/admin/blocked-dates', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  const { doctorId, date, reason } = req.body;
  if (!date || !reason) {
    return res.status(400).json({ error: 'Date and reason are required.' });
  }
  const blocked = db.addBlockedDate(doctorId || 'doc-1', date, reason);
  return res.status(201).json({ message: 'Date blocked successfully.', blocked });
});

apiRouter.delete('/admin/blocked-dates/:id', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  const success = db.removeBlockedDate(req.params.id);
  if (!success) return res.status(404).json({ error: 'Blocked date not found.' });
  return res.json({ message: 'Blocked date removed.' });
});

// Reviews
apiRouter.get('/reviews', (req: Request, res: Response) => {
  return res.json({ reviews: db.getReviews() });
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  const { patientName, rating, comment, serviceName } = req.body;
  if (!patientName || !rating || !comment) {
    return res.status(400).json({ error: 'Name, rating, and feedback are required.' });
  }
  const review = db.addReview({
    patientName,
    rating: Number(rating),
    comment,
    serviceName: serviceName || 'General Consultation'
  });
  return res.status(201).json({ message: 'Thank you for your valuable feedback!', review });
});

// ==========================================
// 9. CONTACT INQUIRIES
// ==========================================

apiRouter.post('/contact-inquiries', (req: Request, res: Response) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !phone || !subject || !message) {
      return res.status(400).json({ error: 'Name, phone number, subject, and message are required.' });
    }

    const inquiry = db.createContactInquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      subject: subject.trim(),
      message: message.trim()
    });

    return res.status(201).json({
      message: 'Thank you! Your inquiry has been sent to Hulekal Clinic desk.',
      inquiry
    });
  } catch (err: any) {
    console.error('Contact inquiry error:', err);
    return res.status(500).json({ error: 'Failed to process inquiry.' });
  }
});

apiRouter.get('/admin/contact-inquiries', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req: AuthRequest, res: Response) => {
  return res.json({ inquiries: db.getContactInquiries() });
});

// ==========================================
// 10. AI HEALTH ASSISTANT (GEMINI INTEGRATION)
// ==========================================

apiRouter.post('/ai/health-assistant', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt string is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: `You are the AI Health Assistant for Hulekal Clinic (Dr. Manjushree Ramachandra V, Reg No: 57749), located in Hulekal village, Sirsi taluk, Uttara Kannada. 
Provide polite, informative, and medically cautious healthcare information combining modern general medicine awareness and authentic Ayurvedic wellness principles. 
Always advise consulting Dr. Manjushree in person or via the clinic's online video consultation for official diagnosis.`
          }
        });

        if (response.text) {
          return res.json({ response: response.text });
        }
      } catch (aiErr) {
        console.warn('Gemini API call failed, falling back to intelligent medical guidance:', aiErr);
      }
    }

    // Fallback response when GEMINI_API_KEY is unset or API offline
    return res.json({
      response: `Namaste! At Hulekal Clinic, Dr. Manjushree Ramachandra V (Reg. No. 57749) provides integrated General Medicine and Ayurvedic Healthcare.

Regarding your query ("${prompt.slice(0, 100)}..."):
• For acute symptoms (fever, persistent cough, joint pain, or digestive distress), warm fluids, light home-cooked meals, and adequate rest are recommended as immediate care.
• For accurate diagnosis and tailored herbal/allopathic prescriptions, we encourage booking an in-person or online video consultation with Dr. Manjushree.

Clinic Hours: Monday – Saturday, 9:30 AM – 6:30 PM
Emergency Helpline: +91 94837 87702`
    });
  } catch (error: any) {
    console.error('AI Health Assistant error:', error);
    return res.status(500).json({ error: 'Failed to process AI health query.' });
  }
});

// Global Error Handler Middleware (Never expose raw stack traces to patients)
apiRouter.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED_ERROR]', err);
  return res.status(500).json({
    error: 'An unexpected server error occurred. Please try again or contact Hulekal Clinic (+91 94837 87702).'
  });
});

