import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
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
import { ClinicService, Doctor, Appointment } from '../types/index';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { generateAppointmentReceiptPDF } from '../lib/pdfGenerator';
import { getAppointmentWhatsAppUrl } from '../lib/whatsapp';

interface BookAppointmentPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialServiceId?: string;
  onOpenAuth: () => void;
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  onNavigate,
  initialServiceId,
  onOpenAuth
}) => {
  const { user } = useAuth();

  // Booking Flow Steps: 1 to 7
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selections
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

  // Confirmation
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>('');
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

  // Load initial services & doctors
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

  // Handle final appointment confirmation
  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!selectedService || !selectedDoctor || !selectedDate || !selectedSlot) {
      setBookingError('Please ensure all appointment details (Service, Doctor, Date, and Time) are selected.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const res = await api.createAppointment({
        doctorId: selectedDoctor.id,
        serviceId: selectedService.id,
        consultationType: 'IN_CLINIC',
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        patientName,
        patientPhone,
        patientEmail,
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender,
        symptoms
      });

      setConfirmedAppointment(res.appointment);
      setCurrentStep(7); // Final Confirmation Step
    } catch (err: any) {
      setBookingError(err.message || 'Failed to lock appointment slot. It may have just been booked by another patient.');
    } finally {
      setIsSubmitting(false);
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
          Book In-Clinic Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Timings: 9:30 AM – 6:30 PM • Direct In-Clinic Consultations at Sirsi
        </p>
      </div>

      {/* Progress Bar (Step 1 to 7) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
          <span className="text-[#0f3b60]">Step {currentStep} of 7</span>
          <span>
            {currentStep === 1 && 'Select Service'}
            {currentStep === 2 && 'Select Doctor'}
            {currentStep === 3 && 'Choose Date'}
            {currentStep === 4 && 'Select Time Slot'}
            {currentStep === 5 && 'Patient Details'}
            {currentStep === 6 && 'Review & Confirm'}
            {currentStep === 7 && 'Booking Confirmed'}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Multi-Step Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        {/* STEP 1: Select Service */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 1: Select Healthcare Service</h3>
              <p className="text-xs text-slate-500 mt-1">Choose the primary reason for your clinic visit.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedService?.id === srv.id
                      ? 'border-[#0f3b60] bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">{srv.shortDescription}</p>
                    </div>
                    <span className="font-bold text-xs text-[#0f3b60] bg-sky-100 px-2.5 py-1 rounded-lg">
                      ₹{srv.fee}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Duration: {srv.durationMinutes} minutes</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={!selectedService}
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <span>Continue to Doctor Selection</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Doctor */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 2: Select Consulting Doctor</h3>
              <p className="text-xs text-slate-500 mt-1">Consult with our chief medical officer & Ayurvedic physician.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    selectedDoctor?.id === doc.id
                      ? 'border-[#0f3b60] bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={doc.photoUrl}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{doc.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Reg: {doc.regNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{doc.qualification} • {doc.experienceYears} Years Experience</p>
                      <p className="text-xs text-slate-500">{doc.intro}</p>
                    </div>
                  </div>

                  <div className="sm:text-right text-xs">
                    <span className="font-bold text-[#0f3b60] block">In-Clinic Fee</span>
                    <span className="text-lg font-black text-slate-900">₹{doc.inClinicFee}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedDoctor}
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <span>Select Appointment Date</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Choose Date */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 3: Choose Appointment Date</h3>
              <p className="text-xs text-slate-500 mt-1">Select a consultation date for your visit.</p>
            </div>

            <div className="max-w-xs space-y-2">
              <label className="block text-xs font-bold text-slate-700">Appointment Date</label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] focus:outline-hidden text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedDate}
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <span>View Available Time Slots</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Select Time Slot */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 4: Select Available Time Slot</h3>
              <p className="text-xs text-slate-500 mt-1">
                Showing live real-time slots for <strong>{selectedDate}</strong> with <strong>{selectedDoctor?.name}</strong>.
              </p>
            </div>

            {isSlotsLoading ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#0f3b60] animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Checking live slot availability in database...</p>
              </div>
            ) : slotsBlockedReason ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">Doctor Unavailable</span>
                  <span>{slotsBlockedReason}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-3 rounded-xl border text-center transition-all text-xs ${
                        !slot.isAvailable
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : selectedSlot === slot.time
                          ? 'bg-[#0f3b60] text-white font-bold border-[#0f3b60] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 font-semibold'
                      }`}
                    >
                      <span className="block font-bold">{slot.time}</span>
                      <span className="text-[10px] opacity-80">{slot.endTime}</span>
                    </button>
                  ))}
                </div>

                {availableSlots.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">No available slots for this date.</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <span>Enter Patient Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Patient Details */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 5: Patient Details</h3>
              <p className="text-xs text-slate-500 mt-1">Provide information for clinical record generation.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Patient Full Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Bhat"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Phone Number *</label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Email Address *</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="e.g. ramesh@gmail.com"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="35"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Symptoms / Primary Complaint (Optional)</label>
                <textarea
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your health issue (e.g. fever, joint pain, digestive trouble)..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60]"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!patientName || !patientPhone || !patientEmail}
                onClick={() => setCurrentStep(6)}
                className="px-6 py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <span>Review & Confirm</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Confirm Appointment */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Step 6: Review & Confirm Appointment</h3>
              <p className="text-xs text-slate-500 mt-1">Please verify your in-clinic consultation summary.</p>
            </div>

            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-800">{selectedService?.name} (₹{selectedService?.fee})</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-800">{selectedDoctor?.name} (Reg. {selectedDoctor?.regNo})</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-[#0f3b60]">{selectedDate} at {selectedSlot}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Consultation Mode:</span>
                <span className="font-bold text-emerald-700">In-Clinic Visit</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-800">{patientName} ({patientPhone})</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-700">Clinic Address:</span>
                <span className="font-bold text-slate-900 text-right">
                  Hulekal clinic, MQX6+96C, Vanalli Rd,<br />Hancharata, Tq: Sirsi, Sirsi 581336
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleConfirmAppointment}
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-emerald-700/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Appointment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Appointment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Confirmed Appointment Confirmation Card */}
        {currentStep === 7 && confirmedAppointment && (
          <div className="text-center space-y-6 py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✓ Appointment Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b60] pt-2">
                HULEKAL CLINIC
              </h2>
              <p className="text-xs text-slate-500">
                Appointment ID: <strong className="text-slate-900 font-mono">{confirmedAppointment.appointmentNo}</strong>
              </p>
            </div>

            {/* Receipt Summary Details Box */}
            <div className="max-w-md mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-800">{confirmedAppointment.doctorName} (Reg. 57749)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{confirmedAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold text-[#0f3b60]">{confirmedAppointment.appointmentDate}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Time:</span>
                <span className="font-bold text-[#0f3b60]">{confirmedAppointment.appointmentTime}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Consultation:</span>
                <span className="font-bold text-emerald-700">In-Clinic</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-700">Clinic Address:</span>
                <span className="font-semibold text-slate-800 text-right">
                  MQX6+96C, Vanalli Rd, Hancharata, Sirsi
                </span>
              </div>
            </div>

            {/* Actions & WhatsApp Options */}
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
    </div>
  );
};
