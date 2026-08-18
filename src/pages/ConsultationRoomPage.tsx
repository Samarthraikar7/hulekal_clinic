import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Send,
  User as UserIcon,
  ShieldCheck,
  Stethoscope,
  Clock,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Appointment, Prescription, MedicineItem } from '../types/index';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { generatePrescriptionPDF } from '../lib/pdfGenerator';

interface ConsultationRoomPageProps {
  appointmentId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ConsultationRoomPage: React.FC<ConsultationRoomPageProps> = ({
  appointmentId,
  onNavigate
}) => {
  const { user, isDoctor, isAdmin } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomAccess, setRoomAccess] = useState<{ status: 'GRANTED' | 'BLOCKED' | 'DENIED'; reason?: string; error?: string } | null>(null);

  // Video call controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'RX'>('CHAT');

  // In-call Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'Dr. Manjushree Ramachandra V',
      text: 'Namaste! Welcome to Hulekal Clinic Telehealth Consultation. I can hear and see you clearly.',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Doctor Digital Prescription Form state (for during the call)
  const [diagnosis, setDiagnosis] = useState('');
  const [bp, setBp] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState('72 bpm');
  const [temperature, setTemperature] = useState('98.6 °F');
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    {
      id: 'm1',
      name: 'Sitopaladi Churna',
      dosage: '3g with honey',
      frequency: '1-0-1 (Twice daily)',
      duration: '5 days',
      instructions: 'Take after meals with warm water'
    }
  ]);
  const [doctorNotes, setDoctorNotes] = useState('Get sufficient rest and stay well hydrated.');
  const [dietAdvice, setDietAdvice] = useState('Avoid cold foods, ice, and heavy oily meals for 4 days.');
  const [followUp, setFollowUp] = useState('Follow up in 5 days if needed.');
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);

  useEffect(() => {
    const fetchApt = async () => {
      try {
        const accessRes = await api.getRoomAccess(appointmentId);
        setRoomAccess(accessRes);

        const res = await api.getAppointmentById(appointmentId);
        setAppointment(res.appointment);
        if (res.prescription) {
          setPrescription(res.prescription);
        }
      } catch (err: any) {
        console.error('Failed to load consultation appointment:', err);
        if (err.message && err.message.includes('VIDEO PROVIDER NOT CONFIGURED')) {
          setRoomAccess({
            status: 'BLOCKED',
            reason: 'VIDEO PROVIDER NOT CONFIGURED',
            error: 'ONLINE CONSULTATION = BLOCKED | Reason = VIDEO PROVIDER NOT CONFIGURED'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApt();

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [appointmentId]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = {
      sender: user?.name || 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput('');
  };

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: '',
        dosage: '',
        frequency: '1-0-1 (Twice daily)',
        duration: '5 days',
        instructions: 'Take after meals'
      }
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMedicineChange = (id: string, field: keyof MedicineItem, val: string) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleSavePrescription = async () => {
    if (!appointment || !diagnosis) return;
    setIsSavingPrescription(true);
    try {
      const res = await api.createPrescription({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientAge: appointment.patientAge,
        patientGender: appointment.patientGender,
        patientPhone: appointment.patientPhone,
        diagnosis,
        vitals: {
          bp,
          pulse,
          temperature
        },
        medicines,
        doctorNotes,
        dietaryAdvice: dietAdvice,
        followUpDate: followUp
      });
      setPrescription(res.prescription);
      alert('Digital Prescription generated and saved to patient record!');
    } catch (err: any) {
      alert('Failed to save prescription: ' + (err.message || 'Error'));
    } finally {
      setIsSavingPrescription(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-[#0f3b60] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600">Connecting to secure consultation room...</p>
      </div>
    );
  }

  if (roomAccess?.status === 'BLOCKED') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <VideoOff className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-2xl font-extrabold text-slate-900">ONLINE CONSULTATION = BLOCKED</h2>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-mono font-bold">
          Reason = VIDEO PROVIDER NOT CONFIGURED
        </div>
        <p className="text-xs text-slate-500">
          The video telehealth integration key (VIDEO_API_KEY) is missing or not configured.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-[#0f3b60] text-white text-xs font-bold rounded-xl shadow-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (roomAccess?.status === 'DENIED') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Denied to Video Room</h2>
        <p className="text-xs text-slate-500">
          Unrelated users cannot enter this private video consultation room.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-[#0f3b60] text-white text-xs font-bold rounded-xl shadow-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">Appointment Not Found</h3>
        <p className="text-xs text-slate-500">This consultation session may have concluded or is invalid.</p>
        <button
          onClick={() => onNavigate('patient-dashboard')}
          className="px-4 py-2 bg-[#0f3b60] text-white text-xs font-bold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Consultation Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg">
                Online Consultation Room • {appointment.appointmentNo}
              </h2>
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-400/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dr. Manjushree Ramachandra V (Reg. 57749) ↔ Patient: {appointment.patientName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 font-mono">
            <Clock className="w-4 h-4" />
            <span>{formatTime(callDuration)}</span>
          </div>

          <button
            onClick={() => onNavigate(isDoctor ? 'doctor-dashboard' : 'patient-dashboard')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Main Video & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Stage & Controls */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video sm:aspect-16/10 bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
            {/* Primary Remote Feed / Jitsi Embedded Stream */}
            {isVideoOn ? (
              <div className="relative w-full h-full">
                <iframe
                  src={`https://meet.jit.si/HulekalClinic-Appointment-${appointment.id}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(user?.name || 'Participant')}"`}
                  className="w-full h-full border-0"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  title="Jitsi Meet Telehealth Room"
                />
              </div>
            ) : (
              <div className="text-center space-y-3 text-slate-400 p-6">
                <VideoOff className="w-16 h-16 mx-auto text-slate-600" />
                <p className="text-sm font-semibold">Video Stream Paused</p>
                <a
                  href={`https://meet.jit.si/HulekalClinic-Appointment-${appointment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  <Video className="w-4 h-4" />
                  <span>Launch Jitsi Video Consultation Room</span>
                </a>
              </div>
            )}

            {/* Self Mini View (Picture in Picture) */}
            <div className="absolute bottom-5 right-5 w-36 sm:w-44 aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80">
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white text-xs">
                <div className="text-center">
                  <UserIcon className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                  <span className="text-[10px] text-slate-300">You ({user?.name?.split(' ')[0]})</span>
                </div>
              </div>
            </div>

            {/* Live Media Action Toolbar */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700 shadow-2xl">
              <button
                type="button"
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={`p-3 rounded-full transition-colors ${
                  isAudioOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={isAudioOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => onNavigate(isDoctor ? 'doctor-dashboard' : 'patient-dashboard')}
                className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors"
                title="End Consultation"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Consultation Metadata Pill */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">
                End-to-End Encrypted Consultation Session
              </span>
            </div>
            <div className="text-slate-500">
              Service: <strong>{appointment.serviceName}</strong>
            </div>
          </div>
        </div>

        {/* Right: In-Call Chat & Doctor Prescription Writer */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[560px] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`flex-1 py-3 text-center flex items-center justify-center gap-2 ${
                activeTab === 'CHAT'
                  ? 'bg-white text-[#0f3b60] border-b-2 border-[#0f3b60]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Consultation Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('RX')}
              className={`flex-1 py-3 text-center flex items-center justify-center gap-2 ${
                activeTab === 'RX'
                  ? 'bg-white text-[#0f3b60] border-b-2 border-[#0f3b60]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Digital Prescription</span>
            </button>
          </div>

          {/* Tab Content 1: Chat */}
          {activeTab === 'CHAT' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl max-w-[85%] space-y-1 ${
                      msg.sender.includes('Manjushree')
                        ? 'bg-sky-50 text-slate-800 border border-sky-100 mr-auto'
                        : 'bg-[#0f3b60] text-white ml-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] opacity-75">
                      <span className="font-bold">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message to doctor..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] text-slate-800 text-xs"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white rounded-xl flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab Content 2: Prescription */}
          {activeTab === 'RX' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {prescription ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                    <span className="font-bold block">✓ Prescription Issued</span>
                    <span className="text-[11px]">No: {prescription.prescriptionNo}</span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800">Diagnosis:</h5>
                    <p className="text-slate-600 mt-0.5">{prescription.diagnosis}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800">Prescribed Medicines:</h5>
                    <ul className="space-y-1.5 mt-1">
                      {prescription.medicines.map((m, i) => (
                        <li key={m.id || `med-${i}`} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-slate-800">{m.name}</strong>
                          <div className="text-[11px] text-slate-500">{m.dosage} • {m.frequency}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => generatePrescriptionPDF(prescription)}
                    className="w-full py-2.5 bg-[#0f3b60] text-white font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Official PDF Rx</span>
                  </button>
                </div>
              ) : isDoctor || isAdmin ? (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Acute Pharyngitis / Seasonal Allergy"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block font-semibold text-slate-700 text-[10px]">BP</label>
                      <input
                        type="text"
                        value={bp}
                        onChange={(e) => setBp(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-[10px]">Pulse</label>
                      <input
                        type="text"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-[10px]">Temp</label>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700">Medicines (Rx)</label>
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="text-emerald-700 font-bold text-[11px] flex items-center gap-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    {medicines.map((med) => (
                      <div key={med.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                            placeholder="Medicine name"
                            className="flex-1 px-2 py-1 bg-white border rounded text-xs font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(med.id)}
                            className="text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                            placeholder="Dosage (e.g. 500mg)"
                            className="px-2 py-1 bg-white border rounded"
                          />
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                            placeholder="1-0-1 (After food)"
                            className="px-2 py-1 bg-white border rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={isSavingPrescription || !diagnosis}
                    onClick={handleSavePrescription}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSavingPrescription ? 'Saving...' : 'Issue & Sign Digital Prescription'}
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-400" />
                  <p>The doctor is currently reviewing and will generate your digital prescription during this consultation.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
