import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  Send,
  CheckCircle2,
  Calendar,
  Video,
  ShieldCheck,
  Building
} from 'lucide-react';
import { api } from '../lib/api';

interface ContactPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitContactInquiry({ name, phone, email, subject, message });
      setSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
          <span>Dr. Manjushree Ramachandra V • Reg. No. 57749</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f3b60] tracking-tight">
          Contact Hulekal Clinic
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Have an inquiry, need location assistance, or want to schedule an urgent consultation? Reach out directly.
        </p>
      </div>

      {/* Grid: Contact Info Cards & Inquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clinic Contact Details from Poster */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-[#0f3b60] text-white flex items-center justify-center font-bold text-lg">
                HC
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">HULEKAL CLINIC</h3>
                <p className="text-xs text-emerald-700 font-semibold">Dr. Manjushree Ramachandra V (Reg. 57749)</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Clinic Address</span>
                  <p className="text-slate-600 leading-relaxed mt-0.5">
                    Hulekal clinic, MQX6+96C, Vanalli Rd
                    <br />
                    Hancharata, Karnataka 581336 Hancharata, Tq: Sirsi
                    <br />
                    Sirsi, Karnataka 581336, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Consultation Timings</span>
                  <p className="text-slate-600 mt-0.5">
                    Monday to Saturday: <strong>9:30 AM – 6:30 PM</strong>
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Walk-ins and Online bookings welcome</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#0f3b60] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Contact Number</span>
                  <a
                    href="tel:+919483787702"
                    className="text-base font-bold text-[#0f3b60] hover:underline block mt-0.5"
                  >
                    +91 94837 87702
                  </a>
                  <a
                    href="https://wa.me/919483787702?text=Hello%20Dr.%20Manjushree,%20I%20would%20like%20to%20inquire%20about%20Hulekal%20Clinic"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-700 hover:underline block mt-1"
                  >
                    Chat on WhatsApp (+91 94837 87702) →
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('book-appointment', { type: 'IN_CLINIC' })}
                className="w-full py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Book In-Clinic Appointment</span>
              </button>

              <button
                onClick={() => onNavigate('book-appointment', { type: 'ONLINE' })}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Video className="w-4 h-4 text-emerald-200" />
                <span>Consult Doctor Online (₹250)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form & Google Map */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Send an Inquiry or Message</h3>
            <p className="text-xs text-slate-500">
              Leave your inquiry for Dr. Manjushree Ramachandra V or clinic assistance.
            </p>

            {success ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Message Sent Successfully!</h4>
                <p className="text-xs text-emerald-700">
                  Our clinic desk will review your message and reach back at {phone || 'your number'}.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-xs font-bold text-emerald-900 underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anand Bhat"
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9483787702"
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Appointment query / Ayurvedic medicine"
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Describe your health question or clinic visit requirement..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Embedded Google Map */}
          <div className="w-full h-64 rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
            <iframe
              title="Hulekal Clinic Location Map"
              src="https://maps.google.com/maps?q=MQX6%2B96C+Vanalli+Rd+Hancharata+Karnataka+581336+Sirsi&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};
