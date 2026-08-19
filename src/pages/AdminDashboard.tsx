import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BarChart3,
  Calendar,
  IndianRupee,
  Users,
  Building,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Video,
  Download,
  Search,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Appointment, ClinicService, Doctor, BlockedDate } from '../types/index';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { generateAppointmentReceiptPDF } from '../lib/pdfGenerator';
import { getDoctorPatientWhatsAppUrl } from '../lib/whatsapp';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'APPOINTMENTS' | 'SCHEDULE' | 'SERVICES' | 'DOCTOR_PROFILE'>('OVERVIEW');
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Doctor Profile Form
  const [docPhotoUrlVal, setDocPhotoUrlVal] = useState('');
  const [docIntroVal, setDocIntroVal] = useState('');
  const [docTimingsVal, setDocTimingsVal] = useState('');
  const [docSaving, setDocSaving] = useState(false);
  const [docMsg, setDocMsg] = useState('');

  // Block Date Form
  const [blockDateVal, setBlockDateVal] = useState('');
  const [blockReasonVal, setBlockReasonVal] = useState('');

  // Service Edit
  const [editingService, setEditingService] = useState<ClinicService | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statRes, aptRes, srvRes, docRes, blkRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAllAppointments(),
        api.getServices(),
        api.getDoctors(),
        api.getBlockedDates()
      ]);
      setStats(statRes.stats);
      setAppointments(aptRes.appointments || []);
      setServices(srvRes.services || []);
      setDoctors(docRes.doctors || []);
      setBlockedDates(blkRes.blockedDates || []);

      if (docRes.doctors && docRes.doctors[0]) {
        const doc = docRes.doctors[0];
        setDocPhotoUrlVal(doc.photoUrl || '');
        setDocIntroVal(doc.intro || '');
        setDocTimingsVal(doc.availableTimings || '');
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500">
          This panel is restricted to the clinic administration and management team.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-[#0f3b60] text-white text-xs font-bold rounded-xl shadow-md"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDateVal || !doctors[0]) return;
    try {
      await api.blockDoctorDate({
        doctorId: doctors[0].id,
        date: blockDateVal,
        reason: blockReasonVal || 'Doctor on leave / Clinic maintenance'
      });
      setBlockDateVal('');
      setBlockReasonVal('');
      loadAdminData();
    } catch (err) {
      console.error('Failed to block date:', err);
    }
  };

  const handleUnblockDate = async (id: string) => {
    try {
      await api.unblockDoctorDate(id);
      loadAdminData();
    } catch (err) {
      console.error('Failed to unblock date:', err);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      await api.updateService(editingService.id, editingService);
      setEditingService(null);
      loadAdminData();
    } catch (err) {
      console.error('Failed to save service:', err);
    }
  };

  const handleStatusChange = async (aptId: string, status: any) => {
    try {
      await api.updateAppointmentStatus(aptId, status);
      loadAdminData();
    } catch (err) {
      console.error('Failed to update status:', err);
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
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Hulekal Clinic Operations Hub</h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-400/30">
                ADMIN ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sirsi, Uttara Kannada • Lead Doctor: Dr. Manjushree Ramachandra V (Reg. 57749)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'OVERVIEW'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('APPOINTMENTS')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'APPOINTMENTS'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments Management ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULE')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'SCHEDULE'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Doctor Schedule & Leave Blockers</span>
        </button>

        <button
          onClick={() => setActiveTab('SERVICES')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'SERVICES'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Services & Price List ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DOCTOR_PROFILE')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'DOCTOR_PROFILE'
              ? 'border-b-2 border-[#0f3b60] text-[#0f3b60]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Doctor Profile & Photo</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'OVERVIEW' && stats && (
        <div className="space-y-8">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">TOTAL APPOINTMENTS</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#0f3b60]">{stats.totalAppointments}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {stats.confirmedAppointments} Confirmed
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">IN-CLINIC VISITS</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-sky-800">{stats.inClinicAppointments || stats.totalAppointments}</span>
                <span className="text-[10px] text-sky-600 font-semibold">Sirsi Hancharata</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500">COMPLETED CONSULTATIONS</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-800">{stats.completedAppointments || 0}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Rx Generated</span>
              </div>
            </div>
          </div>

          {/* Quick Clinic Summary */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Hulekal Clinic Details</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Address:</strong> Ground Floor, Shop No. 3, Hancharata, Vanalli Road, Ramnagar, Hulekal Village, Sirsi, Uttara Kannada – 581336.
              <br />
              <strong>Doctor:</strong> Dr. Manjushree Ramachandra V (Karnataka Medical Council Reg. 57749).
              <br />
              <strong>Daily Timings:</strong> 9:30 AM to 6:30 PM.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS MANAGEMENT */}
      {activeTab === 'APPOINTMENTS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, phone number, ID..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Patient Details</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Service & Mode</th>
                    <th className="p-3.5">Fee & Payment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{apt.appointmentNo}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{apt.patientName}</div>
                        <div className="text-slate-500 text-[11px]">{apt.patientPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{apt.appointmentDate}</div>
                        <div className="text-slate-500 text-[11px]">{apt.appointmentTime}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{apt.serviceName}</div>
                        <span className="text-[10px] text-slate-500">{apt.consultationType}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">₹{apt.amount}</div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                          {apt.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={apt.appointmentStatus}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className="p-1 border rounded text-[11px] font-semibold"
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="NO_SHOW">NO_SHOW</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right space-x-2">

                        <a
                          href={getDoctorPatientWhatsAppUrl(apt.patientPhone, `Namaste ${apt.patientName}, Hulekal Clinic Desk here regarding your booking ${apt.appointmentNo}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline font-bold text-xs"
                        >
                          WhatsApp
                        </a>

                        <button
                          onClick={() => generateAppointmentReceiptPDF(apt)}
                          className="text-[#0f3b60] hover:underline font-bold text-xs"
                        >
                          Receipt PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR SCHEDULE & LEAVE BLOCKERS */}
      {activeTab === 'SCHEDULE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Block Date Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Block Doctor Unavailable Date</h3>
            <p className="text-xs text-slate-500">
              When a date is blocked, patients will not be able to book slots on that day.
            </p>

            <form onSubmit={handleBlockDate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Date to Block</label>
                <input
                  type="date"
                  value={blockDateVal}
                  onChange={(e) => setBlockDateVal(e.target.value)}
                  className="w-full p-2 border rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notice for Patients</label>
                <input
                  type="text"
                  value={blockReasonVal}
                  onChange={(e) => setBlockReasonVal(e.target.value)}
                  placeholder="e.g. Doctor attending medical conference"
                  className="w-full p-2 border rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors"
              >
                Block Date
              </button>
            </form>
          </div>

          {/* Currently Blocked Dates List */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Blocked Dates List</h3>
            {blockedDates.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No blocked dates. Doctor is available on all regular days.</p>
            ) : (
              <div className="space-y-2">
                {blockedDates.map((blk) => (
                  <div
                    key={blk.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{blk.date}</span>
                      <p className="text-slate-500 text-[11px]">{blk.reason}</p>
                    </div>
                    <button
                      onClick={() => handleUnblockDate(blk.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES & PRICING */}
      {activeTab === 'SERVICES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Clinic Healthcare Services & Fees</h3>
              <p className="text-xs text-slate-500">Edit consultation charges and service details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div key={srv.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {srv.category}
                  </span>
                  <button
                    onClick={() => setEditingService(srv)}
                    className="text-[#0f3b60] hover:text-[#0c2f4d] p-1"
                    title="Edit Service"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{srv.shortDescription}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-black text-[#0f3b60] text-base">₹{srv.fee}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Service Modal */}
          {editingService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
              <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900">Edit Service: {editingService.name}</h3>
                <form onSubmit={handleSaveService} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Service Name</label>
                    <input
                      type="text"
                      value={editingService.name}
                      onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Consultation Fee (INR ₹)</label>
                    <input
                      type="number"
                      value={editingService.fee}
                      onChange={(e) => setEditingService({ ...editingService, fee: Number(e.target.value) })}
                      className="w-full p-2 border rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={editingService.shortDescription}
                      onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#0f3b60] text-white rounded-lg font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DOCTOR PROFILE & PHOTO */}
      {activeTab === 'DOCTOR_PROFILE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 max-w-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Dr. Manjushree Profile & Photo Settings</h3>
            <p className="text-xs text-slate-500 mt-1">
              Update Dr. Manjushree Ramachandra V's photo URL and clinic intro details.
            </p>
          </div>

          {docMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{docMsg}</span>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setDocSaving(true);
              setDocMsg('');
              try {
                await api.updateDoctorProfile({
                  photoUrl: docPhotoUrlVal,
                  intro: docIntroVal,
                  availableTimings: docTimingsVal
                });
                setDocMsg('Doctor photo & profile updated successfully! The new photo is now active across all pages.');
                loadAdminData();
              } catch (err: any) {
                alert('Failed to update doctor profile: ' + (err.message || 'Error'));
              } finally {
                setDocSaving(false);
              }
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Doctor Photo URL or Path *
              </label>
              <input
                type="text"
                value={docPhotoUrlVal}
                onChange={(e) => setDocPhotoUrlVal(e.target.value)}
                placeholder="e.g. /doctor-photo.jpg or https://your-domain.com/photo.jpg"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-800"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Place an image in your project's <code>public/</code> folder (e.g. <code>public/doctor-photo.jpg</code>) and type <code>/doctor-photo.jpg</code> here, or paste any image link!
              </p>
            </div>

            {/* Live Preview */}
            {docPhotoUrlVal && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">Live Photo Preview:</span>
                <div className="w-28 h-36 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-200">
                  <img
                    src={docPhotoUrlVal}
                    alt="Doctor Preview"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Doctor Introduction / Bio
              </label>
              <textarea
                value={docIntroVal}
                onChange={(e) => setDocIntroVal(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Available Consultation Hours
              </label>
              <input
                type="text"
                value={docTimingsVal}
                onChange={(e) => setDocTimingsVal(e.target.value)}
                placeholder="e.g. 9:30 AM – 6:30 PM (Mon - Sat)"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={docSaving}
              className="w-full py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
            >
              {docSaving ? 'Saving Doctor Profile...' : 'Save & Update Doctor Photo Live'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
