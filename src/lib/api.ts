import { User, ClinicService, Doctor, Appointment, Prescription, MedicalRecord, ClinicSettings, Review } from '../types/index';

const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/$/, '')}/api` : '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('hc_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('hc_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('hc_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (err: any) {
    throw new Error('Unable to connect to Hulekal Clinic server. Please check your internet connection and try again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) => request<{ message: string; token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  login: (payload: { identifier: string; password: string }) => request<{ message: string; token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getMe: () => request<{ user: User }>('/auth/me'),

  updateProfile: (payload: any) => request<{ message: string; user: User }>('/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) => request<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  resetPassword: (payload: { identifier: string; newPassword: string }) => request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Public Info
  getClinicInfo: () => request<{ settings: ClinicSettings; doctor: Doctor; services: ClinicService[]; reviews: Review[] }>('/clinic-info'),

  getServices: () => request<{ services: ClinicService[] }>('/services'),

  getDoctors: () => request<{ doctors: Doctor[] }>('/doctors'),

  getAvailableSlots: (date: string, doctorId?: string) => request<{
    date: string;
    doctorId: string;
    isBlocked: boolean;
    reason?: string;
    slots: Array<{ time: string; endTime: string; period: string; isAvailable: boolean; reason: string }>;
  }>(`/slots/available?date=${date}${doctorId ? `&doctorId=${doctorId}` : ''}`),

  // Appointments
  createAppointment: (payload: any) => request<{
    message: string;
    appointment: Appointment;
  }>('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getMyAppointments: () => request<{ appointments: Appointment[] }>('/appointments/my'),

  getAppointmentById: (id: string) => request<{ appointment: Appointment; prescription?: Prescription }>(`/appointments/${id}`),

  cancelAppointment: (id: string, reason?: string) => request<{ message: string; appointment: Appointment }>(`/appointments/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),

  // Doctor Flow
  getDoctorAppointments: () => request<{ appointments: Appointment[] }>('/doctor/appointments'),

  updateAppointmentStatus: (id: string, status: string, notes?: string) => request<{ message: string; appointment: Appointment }>(`/doctor/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  }),

  createPrescription: (payload: any) => request<{ message: string; prescription: Prescription }>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getMyPrescriptions: () => request<{ prescriptions: Prescription[] }>('/prescriptions/my'),

  getPrescriptionById: (id: string) => request<{ prescription: Prescription }>(`/prescriptions/${id}`),

  // Medical Records
  getMyMedicalRecords: () => request<{ records: MedicalRecord[] }>('/medical-records/my'),

  createMedicalRecord: (payload: any) => request<{ message: string; record: MedicalRecord }>('/medical-records', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Admin
  getAdminOverview: () => request<{
    kpis: {
      totalPatients: number;
      totalAppointments: number;
      todayAppointments: number;
      upcomingAppointments: number;
      completedConsultations: number;
      onlineConsultations: number;
      inClinicConsultations: number;
      totalRevenue: number;
      pendingPayments: number;
      cancelledAppointments: number;
    };
    stats: {
      totalAppointments: number;
      confirmedAppointments: number;
      totalRevenue: number;
      inClinicAppointments: number;
      onlineAppointments: number;
    };
    servicePopularity: Array<{ name: string; count: number }>;
    recentAppointments: Appointment[];
  }>('/admin/overview'),

  getAdminAnalytics: () => request<{
    stats: {
      totalAppointments: number;
      confirmedAppointments: number;
      totalRevenue: number;
      inClinicAppointments: number;
      onlineAppointments: number;
    };
  }>('/admin/overview'),

  getAllAppointments: (params?: { date?: string; status?: string; type?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ appointments: Appointment[] }>(`/admin/appointments${qs ? `?${qs}` : ''}`);
  },

  getAllPrescriptions: () => request<{ prescriptions: Prescription[] }>('/prescriptions/my'),

  getAdminAppointments: (params?: { date?: string; status?: string; type?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ appointments: Appointment[] }>(`/admin/appointments${qs ? `?${qs}` : ''}`);
  },

  getAdminPatients: () => request<{ patients: any[] }>('/admin/patients'),

  updateClinicSettings: (settings: Partial<ClinicSettings>) => request<{ message: string; settings: ClinicSettings }>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  }),

  updateDoctorProfile: (profile: Partial<Doctor>) => request<{ message: string; doctor: Doctor }>('/admin/doctor-profile', {
    method: 'PUT',
    body: JSON.stringify(profile)
  }),

  createService: (service: any) => request<{ message: string; service: ClinicService }>('/admin/services', {
    method: 'POST',
    body: JSON.stringify(service)
  }),

  updateService: (id: string, service: any) => request<{ message: string; service: ClinicService }>(`/admin/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(service)
  }),

  deleteService: (id: string) => request<{ message: string }>(`/admin/services/${id}`, {
    method: 'DELETE'
  }),

  getBlockedDates: () => request<{ blockedDates: any[] }>('/admin/blocked-dates'),

  addBlockedDate: (date: string, reason: string, doctorId?: string) => request<{ message: string; blocked: any }>('/admin/blocked-dates', {
    method: 'POST',
    body: JSON.stringify({ date, reason, doctorId })
  }),

  blockDoctorDate: (payload: { doctorId?: string; date: string; reason: string }) => request<{ message: string; blocked: any }>('/admin/blocked-dates', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  removeBlockedDate: (id: string) => request<{ message: string }>(`/admin/blocked-dates/${id}`, {
    method: 'DELETE'
  }),

  unblockDoctorDate: (id: string) => request<{ message: string }>(`/admin/blocked-dates/${id}`, {
    method: 'DELETE'
  }),

  // Reviews
  getReviews: () => request<{ reviews: Review[] }>('/reviews'),

  addReview: (payload: { patientName: string; rating: number; comment: string; serviceName?: string }) => request<{ message: string; review: Review }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Contact Inquiries
  submitContactInquiry: (payload: { name: string; phone: string; email?: string; subject: string; message: string }) => request<{ message: string; inquiry: any }>('/contact-inquiries', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getAdminContactInquiries: () => request<{ inquiries: any[] }>('/admin/contact-inquiries'),

  // AI Health Assistant
  askAIHealthAssistant: (prompt: string) => request<{ response: string }>('/ai/health-assistant', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  })
};
