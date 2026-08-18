import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  Leaf,
  ShieldCheck,
  Sparkles,
  HeartPulse,
  Calendar,
  Video,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ClinicService } from '../types/index';
import { api } from '../lib/api';

interface ServicesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<ClinicService[]>([]);

  useEffect(() => {
    api.getServices().then((res) => setServices(res.services || [])).catch(console.error);
  }, []);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className="w-8 h-8 text-[#0f3b60]" />;
      case 'Users': return <Users className="w-8 h-8 text-emerald-600" />;
      case 'Leaf': return <Leaf className="w-8 h-8 text-emerald-700" />;
      case 'ShieldCheck': return <ShieldCheck className="w-8 h-8 text-sky-600" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-amber-600" />;
      case 'HeartPulse': return <HeartPulse className="w-8 h-8 text-rose-600" />;
      default: return <Stethoscope className="w-8 h-8 text-[#0f3b60]" />;
    }
  };

  const getServiceBenefits = (serviceName: string) => {
    switch (serviceName) {
      case 'General Consultation':
        return [
          'Detailed physical assessment and acute illness treatment',
          'Blood pressure, pulse, temperature & SpO2 vital screening',
          'Prescription for seasonal cough, fever, infections and digestive issues',
          'Follow-up guidance and specialist referrals when needed'
        ];
      case 'Family Healthcare':
        return [
          'Continuous health tracking for children, adults & senior family members',
          'Pediatric common ailment management and child nutrition advice',
          'Seasonal flu vaccination consultation & home immunity remedies',
          'Family medical history profiling and hereditary risk prevention'
        ];
      case 'Ayurvedic Treatment':
        return [
          'Authentic Prakriti (body constitution) and Dosha balance assessment',
          'Traditional herbal medicine formulations (Sitopaladi, Guduchi, Triphala)',
          'Chronic joint pain, arthritis & digestion wellness therapies',
          'Natural detox strategies and lifestyle Dinacharya recommendations'
        ];
      case 'Preventive Care':
        return [
          'Early risk screening for hypertension, diabetes, and lipid levels',
          'Cardiovascular health evaluation and routine vitals tracking',
          'Dietary and stress-reduction protocols for busy professionals',
          'Personalized preventive health report and lifestyle roadmap'
        ];
      case 'Immunity & Wellness':
        return [
          'Immune defense strengthening for monsoon and winter seasons',
          'Digestive vitality (Agni) optimization and gut health remedies',
          'Herbal tonics and revitalizing Ayurvedic Rasayana guidance',
          'Dietary micro-nutrition counseling for sustained energy'
        ];
      case 'Elderly Care':
        return [
          'Senior-friendly gentle medical examination and blood pressure monitoring',
          'Osteoarthritis, knee pain, and mobility management',
          'Multiple medication review to avoid adverse drug interactions',
          'Caregiver guidance and comfortable online follow-ups from home'
        ];
      default:
        return [
          'Professional medical consultation with Dr. Manjushree Ramachandra V',
          'Comprehensive diagnosis and treatment plan',
          'Official digital prescription with Reg. No. 57749'
        ];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
          <span>Dr. Manjushree Ramachandra V • Reg. No. 57749</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f3b60] tracking-tight">
          Clinical & Wellness Services
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          At Hulekal Clinic, we provide high-standard medical care combining modern clinical precision and time-tested Ayurvedic wellness for individuals and whole families.
        </p>
      </div>

      {/* Detailed Services Grid */}
      <div className="space-y-10">
        {services.map((srv, idx) => (
          <div
            key={srv.id}
            id={srv.slug}
            className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-8 items-start justify-between ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Left Content */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                  {getServiceIcon(srv.icon)}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    {srv.category}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">{srv.name}</h3>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {srv.shortDescription}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed">
                {srv.description}
              </p>

              {/* What is Included / Key Clinical Points */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  What This Consultation Includes:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getServiceBenefits(srv.name).map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Booking Card */}
            <div className="w-full lg:w-72 bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-4 shrink-0">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Consultation Fee</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-extrabold text-[#0f3b60]">₹{srv.fee}</span>
                  <span className="text-xs text-slate-500">/ 30 min session</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Duration: {srv.durationMinutes} Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                  <span>Dr. Manjushree (Reg 57749)</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onNavigate('book-appointment', { serviceId: srv.id, type: 'IN_CLINIC' })}
                  className="w-full py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Book In-Clinic Slot</span>
                </button>

                <button
                  onClick={() => onNavigate('book-appointment', { serviceId: srv.id, type: 'ONLINE' })}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Book Online Video Call</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
