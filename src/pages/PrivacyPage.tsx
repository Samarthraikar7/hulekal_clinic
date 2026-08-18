import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
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
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <h1 className="text-3xl font-extrabold text-[#0f3b60]">Privacy Policy</h1>
        </div>
        <p className="text-xs text-slate-500">
          Last updated: August 2026 • Hulekal Clinic (Dr. Manjushree Ramachandra V, Reg. No. 57749)
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            1. Patient Confidentiality & Data Protection
          </h3>
          <p>
            At Hulekal Clinic, we prioritize patient confidentiality. All medical consultations, clinical records, diagnostic reports, and digital prescriptions created under the supervision of Dr. Manjushree Ramachandra V are protected in accordance with Indian Telemedicine Practice Guidelines and relevant healthcare privacy regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            2. Information We Collect
          </h3>
          <p>We collect essential information required for diagnosis, scheduling, and prescription delivery:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Personal Identifiers: Full name, age, gender, contact number, and email address.</li>
            <li>Clinical Data: Reported symptoms, medical history, vital signs, and doctor consultation notes.</li>
            <li>Payment Records: Transaction reference IDs and order numbers processed via secure gateway (Razorpay).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            3. Use of Information
          </h3>
          <p>
            Your information is strictly used to facilitate medical appointments, generate digital PDF prescriptions, send appointment reminders via SMS/WhatsApp, and maintain your personal health records. We do not sell or monetize patient data.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">4. Contact & Inquiries</h3>
          <p>
            For any privacy inquiries or record requests, contact us at <strong>+91 94837 87702</strong> or visit Hulekal Clinic, Ramnagar, Vanalli Road, Sirsi – 581336.
          </p>
        </section>
      </div>
    </div>
  );
};
