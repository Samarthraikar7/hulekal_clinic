import React from 'react';
import {
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Heart,
  ChevronRight,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Clinic Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">HULEKAL CLINIC</h3>
                <p className="text-xs text-emerald-400 font-semibold">Reg. No. 57749</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Quality healthcare for the whole family. Offering integrated general consultations, Ayurvedic wellness, preventive screening, and digital telehealth under the guidance of Dr. Manjushree Ramachandra V.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Govt. Registered Medical Facility</span>
              </div>
            </div>
          </div>

          {/* Column 2: Healthcare Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Clinic Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'General Consultation', slug: 'general-consultation' },
                { name: 'Family Healthcare', slug: 'family-healthcare' },
                { name: 'Ayurvedic Treatment', slug: 'ayurvedic-treatment' },
                { name: 'Preventive Care', slug: 'preventive-care' },
                { name: 'Immunity & Wellness', slug: 'immunity-wellness' },
                { name: 'Elderly Care', slug: 'elderly-care' }
              ].map((srv) => (
                <li key={srv.slug}>
                  <button
                    onClick={() => onNavigate('services')}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>{srv.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Quick Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('book-appointment')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Book In-Clinic Slot</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('book-appointment', { type: 'ONLINE' })}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Online Teleconsultation</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('doctor')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Doctor Profile & Credentials</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Location Map & Sirsi Route</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('patient-dashboard')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Patient Medical Records & Rx</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Location & Contact from Poster */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Clinic Address
            </h4>

            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Hulekal Clinic</strong>
                <br />
                MQX6+96C, Vanalli Rd, Hancharata
                <br />
                Karnataka 581336 Hancharata, Tq: Sirsi, Sirsi, Karnataka 581336, India
              </p>
            </div>

            <div className="flex items-center gap-2.5 text-sm pt-1">
              <Phone className="w-4 h-4 text-sky-400 shrink-0" />
              <a href="tel:+919483787702" className="hover:text-white font-medium">
                +91 94837 87702
              </a>
            </div>

            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>9:30 AM – 6:30 PM (Mon - Sat)</span>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919483787702?text=Hello%20Hulekal%20Clinic,%20I%20would%20like%20to%20enquire%20about%20an%20appointment."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Instant Inquiry</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} <strong>Hulekal Clinic</strong>. All rights reserved. Dr. Manjushree Ramachandra V (Reg. No. 57749).
          </p>
          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <button onClick={() => onNavigate('privacy')} className="hover:text-emerald-400 transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-emerald-400 transition-colors">
              Terms of Service
            </button>
          </div>
          <p className="flex items-center gap-1 text-slate-400">
            <span>Crafted for family health in Sirsi & Uttara Kannada</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
