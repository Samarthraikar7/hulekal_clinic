import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Video,
  Building,
  Clock,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { ConsultationType, ClinicService, Doctor, Appointment } from '../types/index';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { RazorpayModal } from '../components/RazorpayModal';
import { generateAppointmentReceiptPDF } from '../lib/pdfGenerator';
import { getAppointmentWhatsAppUrl, getWhatsAppClickToChatUrl } from '../lib/whatsapp';

interface BookAppointmentPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialType?: ConsultationType;
  initialServiceId?: string;
  onOpenAuth: () => void;
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  onNavigate,
  initialType = 'IN_CLINIC',
  initialServiceId,
  onOpenAuth
}) => {
  const { user } = useAuth();

  // Booking Flow Steps: 1 to 8
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selections
  const [consultationType, setConsultationType] = useState<ConsultationType>(initialType);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [selectedService, setSelectedService] = useState<ClinicService | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Date selection (default today YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Slots
  const [availableSlots, setAvailableSlots] = useState<Array<{
    time: string;
    endTime: string;
    period: string;
    isAvailable: boolean;
    reason: string;
  }>>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isSlotsLoading, setIsSlotsLoading] = useState<boolean>(false);
  const [slotsBlockedReason, setSlotsBlockedReason] = useState<string>('');

  // Patient Info
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('Male');
  const [symptoms, setSymptoms] = useState<string>('');

  // Payment & Confirmation
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>('');
  const [activeRazorpayData, setActiveRazorpayData] = useState<any>(null);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setPatientName(user.name || '');
      setPatientPhone(user.phone || '');
      setPatientEmail(user.email || '');
      if (user.age) setPatientAge(String(user.age));
      if (user.gender) setPatientGender(user.gender);
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const [srvRes, docRes] = await Promise.all([api.getServices(), api.getDoctors()]);
        const srvs = srvRes.services || [];
        setServices(srvs);

        if (initialServiceId) {
          const match = srvs.find((s) => s.id === initialServiceId);
          if (match) setSelectedService(match);
        } else if (srvs.length > 0) {
          setSelectedService(srvs[0]);
        }

        const docs = docRes.doctors || [];
        setDoctors(docs);
        if (docs.length > 0) {
          setSelectedDoctor(docs[0]);
        }
      } catch (err) {
        console.error('Failed to load services/doctors:', err);
      }
    };
    load();
  }, [initialServiceId]);

  // Load dynamic slots when date or doctor changes
  useEffect(() => {
    if (!selectedDate || !selectedDoctor) return;

    const fetchSlots = async () => {
      setIsSlotsLoading(true);
      setSlotsBlockedReason('');
      try {
        const res = await api.getAvailableSlots(selectedDate, selectedDoctor.id);
        if (res.isBlocked) {
          setSlotsBlockedReason(res.reason || 'Doctor unavailable on this date.');
          setAvailableSlots([]);
        } else {
          setAvailableSlots(res.slots || []);
        }
      } catch (err) {
        console.error('Failed to fetch available slots:', err);
      } finally {
        setIsSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedDoctor]);

  // Handlers
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!selectedService || !selectedDoctor || !selectedDate || !selectedSlot) {
      setOrderError('Please ensure all appointment details (Service, Doctor, Date, and Time) are selected.');
      return;
    }

    setIsCreatingOrder(true);
    setOrderError('');

    try {
      const res = await api.createAppointmentOrder({
        doctorId: selectedDoctor.id,
        serviceId: selectedService.id,
        consultationType,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        patientName,
        patientPhone,
        patientEmail,
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender,
        symptoms
      });

      setCurrentAppointment(res.appointment);
      setActiveRazorpayData(res.razorpay);
      setShowRazorpayModal(true);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to lock appointment slot. It may have just been booked by another user.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    if (!currentAppointment) return;

    try {
      const res = await api.verifyPayment({
        appointmentId: currentAppointment.id,
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        razorpay_order_id: paymentDetails.razorpay_order_id,
        razorpay_signature: paymentDetails.razorpay_signature,
        paymentMethod: paymentDetails.paymentMethod
      });

      setShowRazorpayModal(false);
      setConfirmedAppointment(res.appointment);
      setCurrentStep(8); // Final Confirmation Step
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      throw err;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-[#0f3b60] text-xs font-bold">
          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hulekal Clinic • Dr. Manjushree Ramachandra V (Reg. 57749)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f3b60] tracking-tight">
          Book Your Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Timings: 9:30 AM – 6:30 PM • In-Clinic at Sirsi & Online Telehealth
        </p>
      </div>

      {/* Progress Bar (Step 1 to 8) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
          <span className="text-[#0f3b60]">Step {currentStep} of 8</span>
          <span>
            {currentStep === 1 && 'Consultation Type'}
            {currentStep === 2 && 'Select Service'}
            {currentStep === 3 && 'Select Doctor'}
            {currentStep === 4 && 'Choose Date'}
            {currentStep === 5 && 'Select Time Slot'}
            {currentStep === 6 && 'Patient Details'}
            {currentStep === 7 && 'Payment Summary'}
            {currentStep === 8 && 'Booking Confirmed'}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Multi-Step Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        {/* STEP 1: Consultation Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 1: Choose Consultation Type</h3>
              <p className="text-xs text-slate-500 mt-1">Select whether you will visit the clinic in person or consult online.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setConsultationType('IN_CLINIC')}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-4 ${
                  consultationType === 'IN_CLINIC'
                    ? 'border-[#0f3b60] bg-sky-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#0f3b60] flex items-center justify-center">
                    <Building className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    In-Person
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">In-Clinic Consultation</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Visit Hulekal Clinic at Ramnagar, Vanalli Road, Sirsi. Complete physical checkup & vital screening.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType('ONLINE')}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-4 ${
                  consultationType === 'ONLINE'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                    Telehealth
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Online Video Consultation</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Consult Dr. Manjushree via secure HD video room from anywhere. Instant digital PDF prescription.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>Proceed to Step 2</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Service Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 2: Choose Service</h3>
              <p className="text-xs text-slate-500 mt-1">Select the health specialty you need consultation for.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {services.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setSelectedService(srv)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                    selectedService?.id === srv.id
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                      {srv.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{srv.shortDescription}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-[#0f3b60]">₹{srv.fee}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>Proceed to Doctor Selection</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Doctor Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 3: Choose Doctor</h3>
              <p className="text-xs text-slate-500 mt-1">Consult with our registered clinical physician.</p>
            </div>

            <div className="p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-50/40 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0 bg-slate-200 border-2 border-white">
                <img
                  src={selectedDoctor?.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                  alt={selectedDoctor?.name || 'Dr. Manjushree Ramachandra V'}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h4 className="text-lg font-bold text-slate-900">Dr. Manjushree Ramachandra V</h4>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                    Reg 57749
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  General & Ayurvedic Healthcare • 12+ Years Experience
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 justify-center sm:justify-start pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>9:30 AM – 6:30 PM</span>
                  </span>
                  <span>★ 4.9 (3,450+ Patients)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>Choose Date</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Choose Date */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 4: Select Appointment Date</h3>
              <p className="text-xs text-slate-500 mt-1">
                Consultations are available Monday through Saturday.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Date
              </label>
              <div className="relative">
                <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-sm text-slate-800 focus:ring-2 focus:ring-[#0f3b60] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Selected Date: <strong>{selectedDate}</strong> (Consultation 9:30 AM – 6:30 PM)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>View Available Slots</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Dynamic Time Slots (9:30 AM – 6:30 PM) */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Step 5: Select Time Slot</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live availability for <strong>{selectedDate}</strong>
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Booked / Passed
                </span>
              </div>
            </div>

            {isSlotsLoading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-[#0f3b60] animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Checking live clinic schedule and slot availability...</p>
              </div>
            ) : slotsBlockedReason ? (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="font-bold text-amber-900 text-sm">Doctor Unavailable on Selected Date</h4>
                <p className="text-xs text-amber-800">{slotsBlockedReason}</p>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 bg-amber-700 text-white text-xs font-bold rounded-lg"
                >
                  Choose Another Date
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedSlot === slot.time
                          ? 'border-[#0f3b60] bg-[#0f3b60] text-white font-bold shadow-md'
                          : slot.isAvailable
                          ? 'border-emerald-200 bg-emerald-50/40 text-slate-800 hover:border-emerald-400 font-semibold cursor-pointer'
                          : 'border-slate-100 bg-slate-100/60 text-slate-400 cursor-not-allowed text-xs'
                      }`}
                    >
                      <div className="text-xs">{slot.time} - {slot.endTime}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        {slot.isAvailable ? slot.period : slot.reason}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                    <span>Selected Slot: <strong>{selectedSlot}</strong> on <strong>{selectedDate}</strong></span>
                    <span className="font-bold text-emerald-700">✓ Slot Reserved for Selection</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setCurrentStep(6)}
                className="px-6 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                <span>Enter Patient Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Patient Details Form */}
        {currentStep === 6 && (
          <form onSubmit={() => setCurrentStep(7)} className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 6: Patient Information</h3>
              <p className="text-xs text-slate-500 mt-1">Please provide accurate contact details for prescription & SMS notifications.</p>
            </div>

            {!user && (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#0f3b60]">Have a registered patient account?</p>
                  <p className="text-[11px] text-slate-600">Sign in to auto-fill medical history and sync prescriptions.</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 bg-[#0f3b60] text-white text-xs font-bold rounded-lg"
                >
                  Sign In Now
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Hegde"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number (For WhatsApp / SMS)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="9483787702"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] text-slate-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Symptoms or Reason for Consultation (Optional)
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={2}
                  placeholder="e.g. Cold, persistent cough for 3 days, joint pain, or routine checkup..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>Review & Proceed to Payment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 7: Payment Summary & Authorization */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 7: Appointment Summary & Payment</h3>
              <p className="text-xs text-slate-500 mt-1">Review your consultation details before opening the secure Indian payment gateway.</p>
            </div>

            {orderError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Bill Summary */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium block">Doctor</span>
                  <span className="font-bold text-slate-900 text-sm">Dr. Manjushree Ramachandra V</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Reg. No. 57749</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Service & Type</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedService?.name}</span>
                  <span className="text-[10px] text-slate-600 block">
                    {consultationType === 'ONLINE' ? 'Online Telehealth Video' : 'In-Clinic (Sirsi)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Date & Time</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedDate}</span>
                  <span className="text-[10px] text-slate-600 block">{selectedSlot} (30 mins duration)</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Patient</span>
                  <span className="font-bold text-slate-900 text-sm">{patientName}</span>
                  <span className="text-[10px] text-slate-600 block">{patientPhone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <span className="font-bold text-slate-800">Total Consultation Fee:</span>
                <span className="text-2xl font-black text-[#0f3b60]">₹{selectedService?.fee}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(6)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleProceedToPayment}
                disabled={isCreatingOrder}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-emerald-700/20 disabled:opacity-50"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Locking Slot & Initializing Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Proceed to Pay Securely (₹{selectedService?.fee})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: Confirmed Appointment Confirmation Card */}
        {currentStep === 8 && confirmedAppointment && (
          <div className="text-center space-y-6 py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Verified & Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b60] pt-2">
                Appointment Successfully Booked!
              </h2>
              <p className="text-xs text-slate-500">
                Booking ID: <strong className="text-slate-900 font-mono">{confirmedAppointment.appointmentNo}</strong>
              </p>
            </div>

            {/* Receipt Summary Details Box */}
            <div className="max-w-md mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-800">Dr. Manjushree Ramachandra V (Reg. 57749)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{confirmedAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-[#0f3b60]">{confirmedAppointment.appointmentDate} at {confirmedAppointment.appointmentTime}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Consultation Mode:</span>
                <span className="font-bold text-emerald-700">
                  {confirmedAppointment.consultationType === 'ONLINE' ? 'Online Telehealth Video Room' : 'In-Clinic (Vanalli Road, Sirsi)'}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-700">Fee Paid:</span>
                <span className="font-black text-slate-900">₹{confirmedAppointment.amount} (Paid via {confirmedAppointment.paymentMethod || 'UPI'})</span>
              </div>
            </div>

            {/* Actions & WhatsApp Contact Options */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => generateAppointmentReceiptPDF(confirmedAppointment)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Official PDF Receipt</span>
              </button>

              <a
                href={getAppointmentWhatsAppUrl(confirmedAppointment)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Confirm Appointment on WhatsApp</span>
              </a>

              {confirmedAppointment.consultationType === 'ONLINE' && (
                <a
                  href={confirmedAppointment.meetingUrl || `https://meet.jit.si/HulekalClinic-Appointment-${confirmedAppointment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Video Consultation (Jitsi)</span>
                </a>
              )}

              <button
                onClick={() => onNavigate('patient-dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-[#0f3b60] font-bold text-xs rounded-xl border border-sky-200"
              >
                <span>Go to Patient Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Razorpay Indian Payment Gateway Modal */}
      {showRazorpayModal && currentAppointment && (
        <RazorpayModal
          appointment={currentAppointment}
          razorpayData={activeRazorpayData}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowRazorpayModal(false)}
        />
      )}
    </div>
  );
};
