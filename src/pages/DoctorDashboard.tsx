import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  Video,
  FileText,
  User as UserIcon,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  Search,
  Activity,
  Phone,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Appointment, Prescription, MedicineItem, Doctor } from '../types/index';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { generatePrescriptionPDF } from '../lib/pdfGenerator';
import { getDoctorPatientWhatsAppUrl } from '../lib/whatsapp';

interface DoctorDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isDoctor, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'QUEUE' | 'RX_WRITER' | 'PAST_RX' | 'PATIENTS'>('QUEUE');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Appointment for writing prescription
  const [selectedAptForRx, setSelectedAptForRx] = useState<Appointment | null>(null);

  // Prescription form state
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxBp, setRxBp] = useState('120/80 mmHg');
  const [rxPulse, setRxPulse] = useState('74 bpm');
  const [rxTemp, setRxTemp] = useState('98.6 °F');
  const [rxWeight, setRxWeight] = useState('65 kg');
  const [rxMedicines, setRxMedicines] = useState<MedicineItem[]>([
    {
      id: 'm1',
      name: 'Sitopaladi Churna',
      dosage: '3g with honey',
      frequency: '1-0-1 (Twice daily)',
      duration: '5 days',
      instructions: 'After meals with warm water'
    },
    {
      id: 'm2',
      name: 'Paracetamol 650mg',
      dosage: '1 tablet',
      frequency: 'As needed (SOS)',
      duration: '3 days',
      instructions: 'If fever > 100°F'
    }
  ]);
  const [rxDoctorNotes, setRxDoctorNotes] = useState('Drink boiled warm water. Rest adequately.');
  const [rxDietAdvice, setRxDietAdvice] = useState('Avoid deep fried snacks and sour foods.');
  const [rxFollowUp, setRxFollowUp] = useState('Review after 5 days if symptoms persist.');
  const [rxSubmitting, setRxSubmitting] = useState(false);
  const [rxSuccessMsg, setRxSuccessMsg] = useState('');

  const loadDoctorData = async () => {
    setLoading(true);
    try {
      const [aptRes, prxRes] = await Promise.all([
        api.getAllAppointments({ date: dateFilter }),
        api.getAllPrescriptions()
      ]);
      setAppointments(aptRes.appointments || []);
      setPrescriptions(prxRes.prescriptions || []);
    } catch (err) {
      console.error('Failed to load doctor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (isDoctor || isAdmin)) {
      loadDoctorData();
    }
  }, [user, isDoctor, isAdmin, dateFilter]);

  if (!user || (!isDoctor && !isAdmin)) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <Stethoscope className="w-12 h-12 text-[#0f3b60] mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Doctor Access Required</h2>
        <p className="text-xs text-slate-500">
          This portal is restricted to Dr. Manjushree Ramachandra V (Reg. No. 57749) and authorized clinic personnel.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-[#0f3b60] text-white text-xs font-bold rounded-xl shadow-md"
        >
          Sign In as Doctor / Admin
        </button>
      </div>
    );
  }

  const handleStatusChange = async (aptId: string, status: any) => {
    try {
      await api.updateAppointmentStatus(aptId, status);
      loadDoctorData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleStartRxForApt = (apt: Appointment) => {
    setSelectedAptForRx(apt);
    setRxDiagnosis(apt.symptoms ? `Consultation for: ${apt.symptoms}` : '');
    setActiveTab('RX_WRITER');
  };

  const handleAddMedicine = () => {
    setRxMedicines((prev) => [
      ...prev,
      {
        id: `med-${Date.now()}`,
        name: '',
        dosage: '',
        frequency: '1-0-1 (Twice daily)',
        duration: '5 days',
        instructions: 'Take after food'
      }
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    setRxMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMedicineChange = (id: string, field: keyof MedicineItem, val: string) => {
    setRxMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptForRx || !rxDiagnosis) return;

    setRxSubmitting(true);
    setRxSuccessMsg('');

    try {
      const res = await api.createPrescription({
        appointmentId: selectedAptForRx.id,
        patientId: selectedAptForRx.patientId,
        patientName: selectedAptForRx.patientName,
        patientAge: selectedAptForRx.patientAge,
        patientGender: selectedAptForRx.patientGender,
        patientPhone: selectedAptForRx.patientPhone,
        diagnosis: rxDiagnosis,
        vitals: {
          bp: rxBp,
          pulse: rxPulse,
          temperature: rxTemp,
          weight: rxWeight
        },
        medicines: rxMedicines,
        doctorNotes: rxDoctorNotes,
        dietaryAdvice: rxDietAdvice,
        followUpDate: rxFollowUp
      });

      // Also mark appointment as COMPLETED
      await api.updateAppointmentStatus(selectedAptForRx.id, 'COMPLETED');

      setRxSuccessMsg(`Prescription ${res.prescription.prescriptionNo} created and signed successfully!`);
      loadDoctorData();
    } catch (err: any) {
      alert('Error creating prescription: ' + (err.message || 'Error'));
    } finally {
      setRxSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(term) ||
      apt.appointmentNo.toLowerCase().includes(term) ||
      apt.patientPhone.includes(term) ||
      apt.serviceName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Doctor Header Banner */}
      <div className="bg-[#0f3b60] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-[#0369a1] flex items-center justify-center text-white shadow-md">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Dr. Manjushree Ramachandra V</h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 text-[10px] font-bold rounded-md border border-emerald-400/30">
                Reg. No. 57749
              </span>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Chief Physician • Hulekal Clinic, Ramnagar, Sirsi
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              Active Hours: 9:30 AM – 6:30 PM • Live In-Clinic & Telehealth Consultations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDoctorData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-white/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('QUEUE')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'QUEUE'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Patient Consultation Queue ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RX_WRITER')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'RX_WRITER'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Digital Prescription Writer</span>
        </button>

        <button
          onClick={() => setActiveTab('PAST_RX')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'PAST_RX'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Prescription Archive ({prescriptions.length})</span>
        </button>
      </div>

      {/* TAB 1: CONSULTATION QUEUE */}
      {activeTab === 'QUEUE' && (
        <div className="space-y-6">
          {/* Controls: Date Picker & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Filter Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-[#0f3b60] hover:underline font-bold"
              >
                View All
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient, phone, ID..."
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Appointments Table */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">No Appointments for Selected Date</h4>
              <p className="text-xs text-slate-500">Check another date or clear the filter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Time & ID</th>
                      <th className="p-3.5">Patient Details</th>
                      <th className="p-3.5">Service & Mode</th>
                      <th className="p-3.5">Symptoms / Notes</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Doctor Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{apt.appointmentTime}</div>
                          <div className="font-mono text-[10px] text-slate-500">{apt.appointmentNo}</div>
                          <div className="text-[10px] text-slate-400">{apt.appointmentDate}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{apt.patientName}</div>
                          <div className="text-[11px] text-slate-500">
                            {apt.patientAge ? `${apt.patientAge}y, ` : ''}{apt.patientGender || ''} • {apt.patientPhone}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{apt.serviceName}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-[#0f3b60]">
                            In-Clinic (Sirsi)
                          </span>
                        </td>

                        <td className="p-3.5 max-w-xs text-slate-600">
                          {apt.symptoms || <span className="text-slate-400 italic">None noted</span>}
                        </td>

                        <td className="p-3.5">
                          <select
                            value={apt.appointmentStatus}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                            className="p-1 border border-slate-300 rounded text-[11px] font-semibold"
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="NO_SHOW">NO_SHOW</option>
                          </select>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5">
                          <a
                            href={getDoctorPatientWhatsAppUrl(apt.patientPhone, `Namaste ${apt.patientName}, Dr. Manjushree Ramachandra V here regarding your Hulekal Clinic appointment ${apt.appointmentNo}.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                            title="Chat with Patient on WhatsApp"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => handleStartRxForApt(apt)}
                            className="px-2.5 py-1.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Write Rx</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESCRIPTION WRITER */}
      {activeTab === 'RX_WRITER' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Official Digital Prescription Generator</h3>
              <p className="text-xs text-slate-500">
                Dr. Manjushree Ramachandra V • Karnataka Medical Council Reg. No. 57749
              </p>
            </div>

            {selectedAptForRx && (
              <div className="bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 text-xs">
                <span className="text-slate-500">Linked to:</span>{' '}
                <strong className="text-slate-900">{selectedAptForRx.patientName}</strong> ({selectedAptForRx.appointmentNo})
              </div>
            )}
          </div>

          {rxSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{rxSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitPrescription} className="space-y-6 text-xs">
            {/* Patient Header if no appointment selected */}
            {!selectedAptForRx && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800">
                <p className="font-bold">Select a patient from the Queue tab first, or enter details below:</p>
              </div>
            )}

            {/* Vitals Section */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Patient Vitals & Clinical Examination</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Pressure (BP)</label>
                  <input
                    type="text"
                    value={rxBp}
                    onChange={(e) => setRxBp(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pulse Rate</label>
                  <input
                    type="text"
                    value={rxPulse}
                    onChange={(e) => setRxPulse(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temperature</label>
                  <input
                    type="text"
                    value={rxTemp}
                    onChange={(e) => setRxTemp(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Body Weight</label>
                  <input
                    type="text"
                    value={rxWeight}
                    onChange={(e) => setRxWeight(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block font-bold text-slate-800 text-sm mb-1">
                Clinical Diagnosis & Assessment *
              </label>
              <input
                type="text"
                value={rxDiagnosis}
                onChange={(e) => setRxDiagnosis(e.target.value)}
                placeholder="e.g. Upper Respiratory Tract Infection, Kapha-Vata Imbalance, Osteoarthritis"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900"
                required
              />
            </div>

            {/* Medicines List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#0f3b60]" />
                  <span>Prescribed Medicines / Ayurvedic Formulations (Rx)</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-3">
                {rxMedicines.map((med, idx) => (
                  <div key={med.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Medicine #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-slate-600 mb-0.5">Medicine Name</label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                          placeholder="e.g. Sitopaladi Churna / Tab Amoxicillin 500mg"
                          className="w-full p-2 bg-white border rounded-lg font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-0.5">Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                          placeholder="e.g. 1 Tablet / 3g"
                          className="w-full p-2 bg-white border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-0.5">Frequency</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                          placeholder="e.g. 1-0-1 (Morning & Night)"
                          className="w-full p-2 bg-white border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-0.5">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(med.id, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                          className="w-full p-2 bg-white border rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block font-medium text-slate-600 mb-0.5">Special Instructions</label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedicineChange(med.id, 'instructions', e.target.value)}
                          placeholder="e.g. Take with warm water / honey after food"
                          className="w-full p-2 bg-white border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Dietary Advice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor's Advice & Instructions</label>
                <textarea
                  value={rxDoctorNotes}
                  onChange={(e) => setRxDoctorNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dietary & Ayurvedic Lifestyle Guidance</label>
                <textarea
                  value={rxDietAdvice}
                  onChange={(e) => setRxDietAdvice(e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Follow-Up Instructions</label>
              <input
                type="text"
                value={rxFollowUp}
                onChange={(e) => setRxFollowUp(e.target.value)}
                className="w-full p-2 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={rxSubmitting || !selectedAptForRx}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Issue, Sign & Save Digital Prescription</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PAST PRESCRIPTIONS ARCHIVE */}
      {activeTab === 'PAST_RX' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Historical Prescriptions Archive</h3>
            <span className="text-xs text-slate-500">{prescriptions.length} Prescriptions Signed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((prx) => (
              <div key={prx.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-mono font-bold text-slate-800 text-xs">{prx.prescriptionNo}</span>
                  <span className="text-xs text-slate-500">{prx.date}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{prx.patientName}</h4>
                  <p className="text-xs text-slate-600">Diagnosis: {prx.diagnosis}</p>
                </div>
                <div className="text-xs text-slate-500">
                  {prx.medicines.length} Medicines Prescribed
                </div>
                <button
                  onClick={() => generatePrescriptionPDF(prx)}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
