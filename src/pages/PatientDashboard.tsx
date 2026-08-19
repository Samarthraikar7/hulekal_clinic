import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Download,
  Plus,
  User as UserIcon,
  ShieldCheck,
  Building,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Phone,
  RefreshCw
} from 'lucide-react';
import { Appointment, Prescription, MedicalRecord } from '../types/index';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { generatePrescriptionPDF, generateAppointmentReceiptPDF } from '../lib/pdfGenerator';
import { getAppointmentWhatsAppUrl } from '../lib/whatsapp';

interface PatientDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'APPOINTMENTS' | 'PRESCRIPTIONS' | 'RECORDS' | 'PROFILE'>('APPOINTMENTS');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [address, setAddress] = useState(user?.address || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Upload record
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordType, setRecordType] = useState<any>('LAB_REPORT');
  const [recordDesc, setRecordDesc] = useState('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [aptRes, prxRes, recRes] = await Promise.all([
        api.getMyAppointments(),
        api.getMyPrescriptions(),
        api.getMyMedicalRecords()
      ]);
      setAppointments(aptRes.appointments || []);
      setPrescriptions(prxRes.prescriptions || []);
      setRecords(recRes.records || []);
    } catch (err) {
      console.error('Failed to load patient dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
      setName(user.name);
      setPhone(user.phone);
      if (user.age) setAge(String(user.age));
      if (user.gender) setGender(user.gender);
      if (user.address) setAddress(user.address);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({
        name,
        phone,
        age: age ? Number(age) : undefined,
        gender,
        address
      });
      updateUser(res.user);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileMsg('Error: ' + err.message);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle || !recordDesc) return;
    try {
      await api.createMedicalRecord({
        title: recordTitle,
        recordType,
        description: recordDesc,
        date: new Date().toISOString().split('T')[0]
      });
      setShowUploadModal(false);
      setRecordTitle('');
      setRecordDesc('');
      loadData();
    } catch (err) {
      console.error('Failed to upload record:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-[#0f3b60] mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Patient Sign In Required</h2>
        <p className="text-xs text-slate-500">
          Please sign in to access your appointments, medical history, and digital prescriptions.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-[#0f3b60] text-white text-xs font-bold rounded-xl shadow-md"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const upcomingApts = appointments.filter((a) => a.appointmentStatus === 'CONFIRMED' || a.appointmentStatus === 'PENDING');
  const pastApts = appointments.filter((a) => a.appointmentStatus === 'COMPLETED' || a.appointmentStatus === 'CANCELLED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Patient Header Banner */}
      <div className="bg-gradient-to-r from-[#0f3b60] to-[#0369a1] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-[10px] font-bold rounded-md border border-emerald-400/30">
                Patient Account
              </span>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">{user.email} • {user.phone}</p>
            <p className="text-[11px] text-slate-300 mt-1">
              Registered with Hulekal Clinic • Dr. Manjushree Ramachandra V (Reg. 57749)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('book-appointment')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('APPOINTMENTS')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'APPOINTMENTS'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PRESCRIPTIONS')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'PRESCRIPTIONS'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Digital Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RECORDS')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'RECORDS'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Medical Records ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'PROFILE'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Settings</span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'APPOINTMENTS' && (
        <div className="space-y-8">
          {/* Upcoming Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>Upcoming Consultations</span>
            </h3>

            {upcomingApts.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600">You have no upcoming consultations scheduled.</p>
                <button
                  onClick={() => onNavigate('book-appointment')}
                  className="px-4 py-2 bg-[#0f3b60] text-white text-xs font-bold rounded-xl"
                >
                  Book Your Slot Now (9:30 AM - 6:30 PM)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingApts.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {apt.appointmentNo}
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          apt.appointmentStatus === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {apt.appointmentStatus}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{apt.serviceName}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Dr. Manjushree Ramachandra V • Reg. 57749
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">DATE</span>
                          <span className="font-bold text-slate-800">{apt.appointmentDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">TIME</span>
                          <span className="font-bold text-[#0f3b60]">{apt.appointmentTime} - {apt.slotEndTime}</span>
                        </div>
                      </div>

                      <div className="text-xs flex items-center justify-between text-slate-600">
                        <span>Mode: <strong>In-Clinic (Sirsi)</strong></span>
                        <span>Fee: <strong>₹{apt.amount}</strong></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => generateAppointmentReceiptPDF(apt)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Receipt PDF</span>
                      </button>

                      <a
                        href={getAppointmentWhatsAppUrl(apt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Confirm on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Consultations */}
          {pastApts.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Past Consultations & History</h3>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Service</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Mode</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pastApts.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-slate-800">{apt.appointmentNo}</td>
                        <td className="p-3.5 font-semibold text-slate-900">{apt.serviceName}</td>
                        <td className="p-3.5 text-slate-600">{apt.appointmentDate} at {apt.appointmentTime}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[10px]">
                            {apt.consultationType}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-emerald-700 font-bold">{apt.appointmentStatus}</span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => generateAppointmentReceiptPDF(apt)}
                            className="text-[#0f3b60] hover:underline font-bold"
                          >
                            Receipt
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

      {/* TAB 2: PRESCRIPTIONS */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Official Medical Prescriptions</h3>
              <p className="text-xs text-slate-500">
                Issued by Dr. Manjushree Ramachandra V (Reg. No. 57749). Downloadable high-resolution PDFs.
              </p>
            </div>
          </div>

          {prescriptions.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600">No prescriptions recorded yet. They will appear here right after your consultation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((prx) => (
                <div
                  key={prx.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">PRESCRIPTION NO</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{prx.prescriptionNo}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">DATE</span>
                      <span className="font-bold text-slate-700 text-xs">{prx.date}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Diagnosis: {prx.diagnosis}</h4>
                    <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                      Doctor: {prx.doctorName} (Reg. {prx.doctorRegNo})
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Prescribed Medicines ({prx.medicines.length})
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {prx.medicines.map((m, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-slate-500">{m.dosage} ({m.frequency})</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => generatePrescriptionPDF(prx)}
                    className="w-full py-2 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Official PDF Prescription</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEDICAL RECORDS */}
      {activeTab === 'RECORDS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Medical Records & Lab Reports</h3>
              <p className="text-xs text-slate-500">Securely stored and accessible by Dr. Manjushree during consultations.</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 bg-[#0f3b60] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record / Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((rec) => (
              <div key={rec.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-sky-100 text-[#0f3b60] px-2 py-0.5 rounded-md">
                    {rec.recordType}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{rec.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>
                <p className="text-xs text-slate-600">{rec.description}</p>
              </div>
            ))}
          </div>

          {/* Add Record Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
              <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900">Add Medical Document / Note</h3>
                <form onSubmit={handleAddRecord} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={recordTitle}
                      onChange={(e) => setRecordTitle(e.target.value)}
                      placeholder="e.g. Blood Sugar Report / Lipid Profile"
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Record Type</label>
                    <select
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="LAB_REPORT">Lab Report</option>
                      <option value="DIAGNOSIS">Diagnosis Note</option>
                      <option value="CONSULTATION_NOTE">Consultation Note</option>
                      <option value="OTHER">Other Health Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description / Key Values</label>
                    <textarea
                      value={recordDesc}
                      onChange={(e) => setRecordDesc(e.target.value)}
                      rows={3}
                      placeholder="e.g. Fasting Sugar: 95 mg/dL, HbA1c: 5.6%..."
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#0f3b60] text-white rounded-lg font-bold"
                    >
                      Save Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="max-w-xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500">Update your patient contact details.</p>
          </div>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="w-full p-2.5 border rounded-xl bg-slate-100 text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2.5 border rounded-xl"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Address / Village (Sirsi / Uttara Kannada)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Hulekal Village, Sirsi"
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold rounded-xl transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
