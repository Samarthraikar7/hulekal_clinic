import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  DatabaseSchema,
  User,
  Doctor,
  ClinicService,
  Appointment,
  Prescription,
  MedicalRecord,
  BlockedDate,
  ClinicSettings,
  Review,
  ContactInquiry
} from '../src/types/index';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'clinic_database.json');

// Initial seed clinic settings from poster
const defaultClinicSettings: ClinicSettings = {
  id: 'clinic-settings-default',
  clinicName: 'HULEKAL CLINIC',
  tagline: 'Quality Healthcare for the Whole Family',
  doctorName: 'Dr. Manjushree Ramachandra V',
  doctorRegNo: '57749',
  address: {
    village: 'Hancharata',
    area: 'MQX6+96C',
    road: 'Vanalli Rd',
    shopNo: 'MQX6+96C',
    hancharata: 'Hancharata',
    taluk: 'Tq: Sirsi',
    district: 'Sirsi, Karnataka',
    pincode: '581336',
    fullFormatted: 'MQX6+96C, Vanalli Rd, Hancharata, Tq: Sirsi, Sirsi, Karnataka 581336, India'
  },
  consultationTiming: '9:30 AM – 6:30 PM',
  workingHours: {
    start: '09:30',
    end: '18:30',
    breakStart: '13:30',
    breakEnd: '14:15'
  },
  contactPhone: '+91 94837 87702',
  contactEmail: 'contact@hulekalclinic.com',
  whatsappNumber: '919483787702',
  defaultSlotDuration: 30,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_hulekal_2026',
  announcement: 'Online and In-Clinic appointments are open 9:30 AM to 6:30 PM. Consultations available in Kannada, English & Hindi.',
  mapEmbedUrl: 'https://maps.google.com/maps?q=Hulekal+Sirsi+Uttara+Kannada&t=&z=14&ie=UTF8&iwloc=&output=embed'
};

const defaultServices: ClinicService[] = [
  {
    id: 'srv-1',
    name: 'General Consultation',
    slug: 'general-consultation',
    shortDescription: 'Routine medical consultation and health assessment.',
    description: 'Comprehensive health checkup, physical diagnosis, acute illness management, vital signs tracking, and personalized treatment plans for adults and children.',
    icon: 'Stethoscope',
    fee: 250,
    durationMinutes: 30,
    category: 'General',
    isActive: true
  },
  {
    id: 'srv-2',
    name: 'Family Healthcare',
    slug: 'family-healthcare',
    shortDescription: 'Healthcare services for individuals and whole families.',
    description: 'Holistic care covering multi-generational health needs, routine pediatric consultations, seasonal illness management, and lifestyle counseling.',
    icon: 'Users',
    fee: 300,
    durationMinutes: 30,
    category: 'Family Medicine',
    isActive: true
  },
  {
    id: 'srv-3',
    name: 'Ayurvedic Treatment',
    slug: 'ayurvedic-treatment',
    shortDescription: 'Ayurvedic healthcare and wellness consultation.',
    description: 'Traditional herbal recommendations, Prakriti evaluation, chronic condition management, detoxification guidance, and holistic natural healing therapies.',
    icon: 'Leaf',
    fee: 350,
    durationMinutes: 30,
    category: 'Ayurveda',
    isActive: true
  },
  {
    id: 'srv-4',
    name: 'Preventive Care',
    slug: 'preventive-care',
    shortDescription: 'Health monitoring, preventive consultation & wellness guidance.',
    description: 'Early risk screening for hypertension, diabetes, lipid disorders, customized nutritional advice, and preventive wellness strategies.',
    icon: 'ShieldCheck',
    fee: 300,
    durationMinutes: 30,
    category: 'Wellness',
    isActive: true
  },
  {
    id: 'srv-5',
    name: 'Immunity & Wellness',
    slug: 'immunity-wellness',
    shortDescription: 'Wellness and immunity-focused healthcare support.',
    description: 'Targeted immune system strengthening protocols, seasonal allergy protection, dietary optimization, and vitality enhancement routines.',
    icon: 'Sparkles',
    fee: 280,
    durationMinutes: 30,
    category: 'Wellness',
    isActive: true
  },
  {
    id: 'srv-6',
    name: 'Elderly Care',
    slug: 'elderly-care',
    shortDescription: 'Healthcare support and consultation for elderly patients.',
    description: 'Specialized geriatric care including joint mobility support, chronic disease monitoring, medication management, and gentle holistic support for senior citizens.',
    icon: 'HeartPulse',
    fee: 300,
    durationMinutes: 30,
    category: 'Geriatrics',
    isActive: true
  }
];

const defaultReviews: Review[] = [
  {
    id: 'rev-1',
    patientName: 'Ganesh Bhat',
    rating: 5,
    comment: 'Dr. Manjushree is extremely patient and thorough. Her diagnosis was accurate and the Ayurvedic medicines helped me recover from my joint pain quickly.',
    date: '2026-07-28',
    serviceName: 'Ayurvedic Treatment',
    verified: true
  },
  {
    id: 'rev-2',
    patientName: 'Sunita Hegde',
    rating: 5,
    comment: 'Great clinic facility right here in Hulekal village. The online consultation booking was so easy for my parents. Very professional doctor.',
    date: '2026-08-04',
    serviceName: 'Family Healthcare',
    verified: true
  },
  {
    id: 'rev-3',
    patientName: 'Raghavendra Naik',
    rating: 5,
    comment: 'Best doctor in Sirsi taluk for preventive care and immunity. Clean clinic and very polite consultation.',
    date: '2026-08-11',
    serviceName: 'Preventive Care',
    verified: true
  }
];

// In-Memory Database Instance
class Database {
  private data: DatabaseSchema;
  private isWriting = false;

  constructor() {
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    this.ensureDirectory();

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      } catch (err) {
        console.error('Error loading existing database file, rebuilding from seed...', err);
      }
    }

    // Initialize fresh seed database
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);
    const doctorPasswordHash = bcrypt.hashSync('doctor123', salt);
    const patientPasswordHash = bcrypt.hashSync('patient123', salt);

    const adminUser: User = {
      id: 'usr-admin-1',
      name: 'Clinic Administrator',
      email: 'admin@hulekalclinic.com',
      phone: '9483787700',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
      createdAt: new Date().toISOString()
    };

    const doctorUser: User = {
      id: 'usr-doc-1',
      name: 'Dr. Manjushree Ramachandra V',
      email: 'doctor@hulekalclinic.com',
      phone: '9483787702',
      role: 'DOCTOR',
      passwordHash: doctorPasswordHash,
      createdAt: new Date().toISOString()
    };

    const patientUser: User = {
      id: 'usr-pat-1',
      name: 'Ramesh Hegde',
      email: 'patient@gmail.com',
      phone: '9876543210',
      role: 'PATIENT',
      passwordHash: patientPasswordHash,
      gender: 'Male',
      dob: '1988-05-14',
      age: 38,
      address: 'Ramnagar, Sirsi, Uttara Kannada',
      createdAt: new Date().toISOString()
    };

    const primaryDoctor: Doctor = {
      id: 'doc-1',
      userId: doctorUser.id,
      name: 'Dr. Manjushree Ramachandra V',
      regNo: '57749',
      intro: 'Dedicated medical practitioner serving Hulekal and surrounding Sirsi taluk with integrated modern and holistic healthcare.',
      qualification: 'Registered Medical Practitioner',
      experienceYears: 12,
      areasOfConsultation: [
        'General Medicine & Family Healthcare',
        'Ayurvedic Therapies & Wellness',
        'Preventive Health & Vital Screening',
        'Immunity Enhancement & Nutritional Advice',
        'Geriatric Healthcare & Chronic Disease Care'
      ],
      inClinicFee: 250,
      onlineFee: 250,
      availableTimings: '9:30 AM – 6:30 PM (Mon - Sat)',
      rating: 4.9,
      totalPatients: 3450,
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      isActive: true
    };

    // Today's formatted date string YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const sampleAppointment: Appointment = {
      id: 'apt-sample-1',
      appointmentNo: 'HC-948301',
      patientId: patientUser.id,
      patientName: patientUser.name,
      patientPhone: patientUser.phone,
      patientEmail: patientUser.email,
      patientAge: 38,
      patientGender: 'Male',
      doctorId: primaryDoctor.id,
      doctorName: primaryDoctor.name,
      serviceId: defaultServices[0].id,
      serviceName: defaultServices[0].name,
      consultationType: 'ONLINE',
      appointmentDate: today,
      appointmentTime: '16:30',
      slotEndTime: '17:00',
      amount: 250,
      paymentStatus: 'SUCCESS',
      appointmentStatus: 'CONFIRMED',
      paymentId: 'pay_demo_770211',
      orderId: 'order_demo_948301',
      paymentMethod: 'UPI',
      meetingUrl: '/consultation/room/apt-sample-1',
      meetingId: 'hulekal-room-apt-sample-1',
      symptoms: 'Mild seasonal allergy and throat irritation for 2 days.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const samplePrescription: Prescription = {
      id: 'prx-1',
      prescriptionNo: 'RX-2026-0811',
      appointmentId: 'apt-sample-1',
      appointmentNo: 'HC-948301',
      patientId: patientUser.id,
      patientName: patientUser.name,
      patientAge: 38,
      patientGender: 'Male',
      patientPhone: patientUser.phone,
      doctorId: primaryDoctor.id,
      doctorName: primaryDoctor.name,
      doctorRegNo: primaryDoctor.regNo,
      date: today,
      diagnosis: 'Seasonal allergic pharyngitis and mild fatigue',
      vitals: {
        bp: '120/80 mmHg',
        pulse: '74 bpm',
        temperature: '98.4 °F',
        weight: '68 kg',
        spO2: '99%'
      },
      medicines: [
        {
          id: 'med-1',
          name: 'Sitopaladi Churna + Yashtimadhu',
          dosage: '3g with warm water & honey',
          frequency: 'Twice daily (Morning & Night)',
          duration: '5 days',
          instructions: 'Take after food'
        },
        {
          id: 'med-2',
          name: 'Guduchi & Tulsi Immunity Decoction',
          dosage: '15ml',
          frequency: 'Once daily (Morning)',
          duration: '10 days',
          instructions: 'Take on empty stomach'
        },
        {
          id: 'med-3',
          name: 'Steam Inhalation with Eucalyptus',
          dosage: '5 minutes',
          frequency: 'Twice daily',
          duration: '3 days',
          instructions: 'Inhale gentle steam before bedtime'
        }
      ],
      doctorNotes: 'Keep well hydrated with warm water. Avoid cold beverages and oily fried foods for 4 days.',
      dietaryAdvice: 'Warm ginger-pepper rasam, boiled vegetables, light khichdi.',
      followUpDate: 'In 7 days if symptoms persist',
      createdAt: new Date().toISOString()
    };

    const sampleRecord: MedicalRecord = {
      id: 'rec-1',
      patientId: patientUser.id,
      patientName: patientUser.name,
      doctorId: primaryDoctor.id,
      doctorName: primaryDoctor.name,
      appointmentId: 'apt-sample-1',
      title: 'Consultation & Prescription for Seasonal Allergy',
      recordType: 'PRESCRIPTION',
      description: 'Prescription issued for allergic pharyngitis with herbal wellness regimen.',
      date: today,
      createdAt: new Date().toISOString()
    };

    const initialDb: DatabaseSchema = {
      users: [adminUser, doctorUser, patientUser],
      doctors: [primaryDoctor],
      services: defaultServices,
      appointments: [sampleAppointment],
      prescriptions: [samplePrescription],
      medicalRecords: [sampleRecord],
      blockedDates: [],
      clinicSettings: defaultClinicSettings,
      reviews: defaultReviews,
      contactInquiries: []
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(dataToSave: DatabaseSchema = this.data) {
    if (this.isWriting) return;
    this.isWriting = true;
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    } finally {
      this.isWriting = false;
    }
  }

  // Generic getter
  public getData(): DatabaseSchema {
    return this.data;
  }

  // Users
  public findUserByEmailOrPhone(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      u => u.email.toLowerCase() === clean || u.phone.replace(/[\s+-]/g, '') === clean.replace(/[\s+-]/g, '')
    );
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr-${uuidv4().slice(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveDatabase();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.saveDatabase();
    return this.data.users[index];
  }

  // Doctors
  public getDoctors(): Doctor[] {
    return this.data.doctors.filter(d => d.isActive);
  }

  public getDoctorById(id: string): Doctor | undefined {
    return this.data.doctors.find(d => d.id === id);
  }

  public updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const index = this.data.doctors.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.data.doctors[index] = { ...this.data.doctors[index], ...updates };
    this.saveDatabase();
    return this.data.doctors[index];
  }

  // Services
  public getServices(): ClinicService[] {
    return this.data.services.filter(s => s.isActive);
  }

  public getServiceById(id: string): ClinicService | undefined {
    return this.data.services.find(s => s.id === id);
  }

  public createService(service: Omit<ClinicService, 'id'>): ClinicService {
    const newService: ClinicService = {
      ...service,
      id: `srv-${uuidv4().slice(0, 8)}`
    };
    this.data.services.push(newService);
    this.saveDatabase();
    return newService;
  }

  public updateService(id: string, updates: Partial<ClinicService>): ClinicService | null {
    const index = this.data.services.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.services[index] = { ...this.data.services[index], ...updates };
    this.saveDatabase();
    return this.data.services[index];
  }

  public deleteService(id: string): boolean {
    const index = this.data.services.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.data.services[index].isActive = false;
    this.saveDatabase();
    return true;
  }

  // Appointments (ACID double-booking prevention)
  public isSlotBooked(doctorId: string, date: string, time: string, excludeAppointmentId?: string): boolean {
    return this.data.appointments.some(
      a =>
        a.doctorId === doctorId &&
        a.appointmentDate === date &&
        a.appointmentTime === time &&
        a.id !== excludeAppointmentId &&
        ['CONFIRMED', 'PENDING'].includes(a.appointmentStatus) &&
        a.paymentStatus !== 'FAILED'
    );
  }

  public isDateBlocked(doctorId: string, date: string): boolean {
    return this.data.blockedDates.some(b => (b.doctorId === doctorId || b.doctorId === 'ALL') && b.date === date);
  }

  public getAppointments(): Appointment[] {
    return this.data.appointments;
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.data.appointments.find(a => a.id === id);
  }

  public getAppointmentsByPatientId(patientId: string): Appointment[] {
    return this.data.appointments.filter(a => a.patientId === patientId);
  }

  public getAppointmentsByDoctorId(doctorId: string): Appointment[] {
    return this.data.appointments.filter(a => a.doctorId === doctorId);
  }

  public createAppointment(data: {
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
    consultationType: 'IN_CLINIC' | 'ONLINE';
    appointmentDate: string;
    appointmentTime: string;
    slotEndTime: string;
    amount: number;
    symptoms?: string;
    notes?: string;
    paymentStatus?: 'PENDING' | 'SUCCESS';
    appointmentStatus?: 'PENDING' | 'CONFIRMED';
  }): { success: boolean; appointment?: Appointment; error?: string } {
    // Check double booking atomically
    if (this.isSlotBooked(data.doctorId, data.appointmentDate, data.appointmentTime)) {
      return { success: false, error: 'This time slot is already booked. Please choose another slot.' };
    }

    if (this.isDateBlocked(data.doctorId, data.appointmentDate)) {
      return { success: false, error: 'The doctor is not available on this date.' };
    }

    const aptId = `apt-${uuidv4().slice(0, 8)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appointmentNo = `HC-${randomSuffix}`;

    const newAppointment: Appointment = {
      id: aptId,
      appointmentNo,
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      patientAge: data.patientAge,
      patientGender: data.patientGender,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      consultationType: data.consultationType,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      slotEndTime: data.slotEndTime,
      amount: data.amount,
      paymentStatus: data.paymentStatus || 'PENDING',
      appointmentStatus: data.appointmentStatus || 'PENDING',
      orderId: `order_${aptId}`,
      meetingUrl: data.consultationType === 'ONLINE' ? `https://meet.jit.si/HulekalClinic-Appointment-${aptId}` : undefined,
      meetingId: data.consultationType === 'ONLINE' ? `HulekalClinic-Appointment-${aptId}` : undefined,
      symptoms: data.symptoms,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.appointments.push(newAppointment);
    this.saveDatabase();
    return { success: true, appointment: newAppointment };
  }

  public updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const index = this.data.appointments.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.data.appointments[index] = {
      ...this.data.appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.appointments[index];
  }

  // Prescriptions
  public createPrescription(prescData: Omit<Prescription, 'id' | 'prescriptionNo' | 'createdAt'>): Prescription {
    const id = `prx-${uuidv4().slice(0, 8)}`;
    const year = new Date().getFullYear();
    const seq = Math.floor(1000 + Math.random() * 9000);
    const prescriptionNo = `RX-${year}-${seq}`;

    const prescription: Prescription = {
      ...prescData,
      id,
      prescriptionNo,
      createdAt: new Date().toISOString()
    };

    this.data.prescriptions.push(prescription);

    // Auto create medical record for this prescription
    const record: MedicalRecord = {
      id: `rec-${uuidv4().slice(0, 8)}`,
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      doctorId: prescription.doctorId,
      doctorName: prescription.doctorName,
      appointmentId: prescription.appointmentId,
      title: `Prescription #${prescriptionNo} - ${prescription.diagnosis}`,
      recordType: 'PRESCRIPTION',
      description: `Medications: ${prescription.medicines.map(m => m.name).join(', ')}`,
      date: prescription.date,
      createdAt: new Date().toISOString()
    };
    this.data.medicalRecords.push(record);

    this.saveDatabase();
    return prescription;
  }

  public getPrescriptionsByPatientId(patientId: string): Prescription[] {
    return this.data.prescriptions.filter(p => p.patientId === patientId);
  }

  public getPrescriptionById(id: string): Prescription | undefined {
    return this.data.prescriptions.find(p => p.id === id);
  }

  public getPrescriptionByAppointmentId(appointmentId: string): Prescription | undefined {
    return this.data.prescriptions.find(p => p.appointmentId === appointmentId);
  }

  // Medical Records
  public getMedicalRecordsByPatientId(patientId: string): MedicalRecord[] {
    return this.data.medicalRecords.filter(r => r.patientId === patientId);
  }

  public createMedicalRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt'>): MedicalRecord {
    const record: MedicalRecord = {
      ...recordData,
      id: `rec-${uuidv4().slice(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.data.medicalRecords.push(record);
    this.saveDatabase();
    return record;
  }

  // Clinic Settings
  public getClinicSettings(): ClinicSettings {
    return this.data.clinicSettings;
  }

  public updateClinicSettings(updates: Partial<ClinicSettings>): ClinicSettings {
    this.data.clinicSettings = { ...this.data.clinicSettings, ...updates };
    this.saveDatabase();
    return this.data.clinicSettings;
  }

  // Blocked Dates
  public getBlockedDates(doctorId?: string): BlockedDate[] {
    if (doctorId) {
      return this.data.blockedDates.filter(b => b.doctorId === doctorId || b.doctorId === 'ALL');
    }
    return this.data.blockedDates;
  }

  public addBlockedDate(doctorId: string, date: string, reason: string): BlockedDate {
    const blocked: BlockedDate = {
      id: `blk-${uuidv4().slice(0, 8)}`,
      doctorId,
      date,
      reason
    };
    this.data.blockedDates.push(blocked);
    this.saveDatabase();
    return blocked;
  }

  public removeBlockedDate(id: string): boolean {
    const index = this.data.blockedDates.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.data.blockedDates.splice(index, 1);
    this.saveDatabase();
    return true;
  }

  // Reviews
  public getReviews(): Review[] {
    return this.data.reviews;
  }

  public addReview(review: Omit<Review, 'id' | 'date' | 'verified'>): Review {
    const newRev: Review = {
      ...review,
      id: `rev-${uuidv4().slice(0, 8)}`,
      date: new Date().toISOString().split('T')[0],
      verified: true
    };
    this.data.reviews.unshift(newRev);
    this.saveDatabase();
    return newRev;
  }

  // Contact Inquiries
  public getContactInquiries(): ContactInquiry[] {
    return this.data.contactInquiries || [];
  }

  public createContactInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>): ContactInquiry {
    if (!this.data.contactInquiries) {
      this.data.contactInquiries = [];
    }
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq-${uuidv4().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    this.data.contactInquiries.unshift(newInquiry);
    this.saveDatabase();
    return newInquiry;
  }
}

export const db = new Database();
