import React from 'react';
import {
  Building,
  Heart,
  Leaf,
  ShieldCheck,
  Award,
  Users,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
          <span>Dr. Manjushree Ramachandra V • Reg. No. 57749</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f3b60] tracking-tight">
          About Hulekal Clinic
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Rooted in Hulekal village and serving the greater Sirsi community in Uttara Kannada, we are dedicated to accessible, compassionate, and holistic family healthcare.
        </p>
      </div>

      {/* Main Story & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Our Healthcare Mission
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b60]">
            Bridging Modern Clinical Medicine with Time-Tested Ayurvedic Wisdom
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hulekal Clinic was established with a singular objective: to ensure every family in Hulekal village, Ramnagar, and neighboring regions has direct access to dependable, high quality medical care.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Under the guidance of <strong>Dr. Manjushree Ramachandra V (Reg. No. 57749)</strong>, our clinic treats acute infections, manages long-term health, and fosters lifelong wellness through natural Ayurvedic therapies, balanced nutrition, and preventive screenings.
          </p>

          <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Personalized medical consultations for children, adults, and elderly seniors</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full compliance with Karnataka Medical Council statutory guidelines</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero-friction telehealth video consultation for patients living at a distance</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-200/60 text-[#0f3b60] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Family Centered</h4>
              <p className="text-xs text-slate-600">Care continuity across all generations under one roof.</p>
            </div>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center font-bold">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Ayurvedic Synergy</h4>
              <p className="text-xs text-slate-600">Pure herbal wellness without harmful side effects.</p>
            </div>

            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Govt Registered</h4>
              <p className="text-xs text-slate-600">Authorized medical practitioner (Registration 57749).</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">9:30 AM – 6:30 PM</h4>
              <p className="text-xs text-slate-600">Consistent daily consultation hours for walk-ins & appointments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Facility Overview */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold text-[#0f3b60]">Visit Our Clinic in Sirsi</h3>
          <p className="text-xs text-slate-600">
            Conveniently located on Vanalli Road in Hulekal village with comfortable waiting facilities and diagnostic equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <Building className="w-6 h-6 text-[#0f3b60] mx-auto" />
            <h5 className="font-bold text-slate-900">Ground Floor Access</h5>
            <p className="text-slate-600">Shop No. 3, Ground Floor for easy accessibility by elderly patients.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <MapPin className="w-6 h-6 text-rose-600 mx-auto" />
            <h5 className="font-bold text-slate-900">Central Ramnagar Location</h5>
            <p className="text-slate-600">Hancharata, Vanalli Road, Hulekal Village, Tq: Sirsi, Dist: Uttara Kannada – 581336.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <Calendar className="w-6 h-6 text-emerald-600 mx-auto" />
            <h5 className="font-bold text-slate-900">Zero Wait Queues</h5>
            <p className="text-slate-600">Pre-booked guaranteed time slots with live status notifications.</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('book-appointment')}
            className="px-8 py-3.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold text-sm rounded-xl shadow-md transition-colors"
          >
            Book an Appointment with Dr. Manjushree
          </button>
        </div>
      </div>
    </div>
  );
};
