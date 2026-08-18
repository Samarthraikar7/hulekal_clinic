import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f3b60] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
          <h1 className="text-3xl font-extrabold text-[#0f3b60]">Terms of Service</h1>
        </div>
        <p className="text-xs text-slate-500">
          Last updated: August 2026 • Hulekal Clinic (Dr. Manjushree Ramachandra V, Reg. No. 57749)
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            1. Scope of Medical Services
          </h3>
          <p>
            Hulekal Clinic offers integrated General Medicine, Ayurvedic healthcare, and preventive consultation led by Dr. Manjushree Ramachandra V (Reg. No. 57749). Services include in-clinic consultations at Hulekal village (Sirsi taluk) and online video teleconsultations.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            2. Telemedicine Guidelines & Emergency Notice
          </h3>
          <p>
            Online video consultations are intended for non-emergency medical inquiries, routine follow-ups, and wellness guidance. In cases of critical medical emergencies, trauma, or severe chest pain, patients are advised to visit the nearest hospital or emergency room immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">3. Appointment Booking & Cancellations</h3>
          <p>
            Appointment slots are locked upon successful payment via Razorpay. Rescheduling or cancellation can be initiated via the Patient Dashboard or by contacting the clinic desk at least 2 hours before the scheduled time slot.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">4. Official Digital Prescriptions</h3>
          <p>
            Digital prescriptions generated during consultation are authenticated by Dr. Manjushree Ramachandra V and are valid for legal medical use.
          </p>
        </section>
      </div>
    </div>
  );
};
