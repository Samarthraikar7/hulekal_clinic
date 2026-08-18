export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  passwordHash: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  age?: number;
  address?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  regNo: string;
  intro: string;
  qualification: string;
  experienceYears: number;
  areasOfConsultation: string[];
  inClinicFee: number;
  onlineFee: number;
  availableTimings: string;
  rating: number;
  totalPatients: number;
  photoUrl: string;
  isActive: boolean;
}

export interface ClinicService {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  fee: number;
  durationMinutes: number;
  category: string;
  isActive: boolean;
}

export type ConsultationType = 'IN_CLINIC' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  appointmentNo: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  consultationType: ConsultationType;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  slotEndTime: string; // HH:mm
  amount: number;
  paymentStatus: PaymentStatus;
  appointmentStatus: AppointmentStatus;
  paymentId?: string;
  orderId?: string;
  paymentMethod?: string;
  meetingUrl?: string;
  meetingId?: string;
  symptoms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1 (After food)"
  duration: string;  // e.g. "5 days"
  instructions: string;
}

export interface Prescription {
  id: string;
  prescriptionNo: string;
  appointmentId: string;
  appointmentNo: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorRegNo: string;
  date: string;
  diagnosis: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    temperature?: string;
    weight?: string;
    spO2?: string;
  };
  medicines: MedicineItem[];
  doctorNotes?: string;
  dietaryAdvice?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string;
  title: string;
  recordType: 'CONSULTATION_NOTE' | 'PRESCRIPTION' | 'LAB_REPORT' | 'DIAGNOSIS' | 'OTHER';
  description: string;
  fileUrl?: string;
  fileName?: string;
  date: string;
  createdAt: string;
}

export interface BlockedDate {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface ClinicSettings {
  id: string;
  clinicName: string;
  tagline: string;
  doctorName: string;
  doctorRegNo: string;
  address: {
    village: string;
    area: string;
    road: string;
    shopNo: string;
    hancharata: string;
    taluk: string;
    district: string;
    pincode: string;
    fullFormatted: string;
  };
  consultationTiming: string;
  workingHours: {
    start: string; // "09:30"
    end: string;   // "18:30"
    breakStart?: string; // "13:30"
    breakEnd?: string;   // "14:30"
  };
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  defaultSlotDuration: number;
  razorpayKeyId: string;
  announcement?: string;
  mapEmbedUrl: string;
}

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  serviceName: string;
  verified: boolean;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'PENDING' | 'RESPONDED' | 'ARCHIVED';
}

export interface DatabaseSchema {
  users: User[];
  doctors: Doctor[];
  services: ClinicService[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  medicalRecords: MedicalRecord[];
  blockedDates: BlockedDate[];
  clinicSettings: ClinicSettings;
  reviews: Review[];
  contactInquiries?: ContactInquiry[];
}
