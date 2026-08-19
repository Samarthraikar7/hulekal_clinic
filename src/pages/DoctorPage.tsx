import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Award,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Calendar,
  Video,
  CheckCircle2,
  BookOpen,
  Heart,
  Star,
  Users
} from 'lucide-react';
import { Doctor } from '../types/index';
import { api } from '../lib/api';

interface DoctorPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const DoctorPage: React.FC<DoctorPageProps> = ({ onNavigate }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    api.getDoctors().then((res) => {
      if (res.doctors && res.doctors.length > 0) {
        setDoctor(res.doctors[0]);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Photo & Badge */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-3xl overflow-hidden shadow-xl border-4 border-slate-100 bg-slate-100 relative">
              <img
                src={doctor?.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800'}
                alt={doctor?.name || 'Dr. Manjushree Ramachandra V'}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">
                Verified Practitioner
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Registration No: 57749</span>
              </div>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="lg:col-span-8 space-y-5">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Chief Medical Practitioner • Hulekal Clinic
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f3b60] mt-1">
                Dr. Manjushree Ramachandra V
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                Medical Practitioner • Registration No. 57749 (Karnataka)
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Dr. Manjushree Ramachandra V is a highly respected physician serving the community in Hulekal village and the greater Sirsi taluk. Combining conventional clinical assessment with authentic Ayurvedic lifestyle and herbal therapies, she is dedicated to providing high quality, personalized healthcare for every family member.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-sky-50 p-3 rounded-2xl border border-sky-100">
                <span className="text-[10px] text-slate-500 font-bold block">EXPERIENCE</span>
                <span className="text-lg font-black text-[#0f3b60]">12+ Years</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 font-bold block">CONSULTATIONS</span>
                <span className="text-lg font-black text-emerald-800">3,450+</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                <span className="text-[10px] text-slate-500 font-bold block">PATIENT RATING</span>
                <span className="text-lg font-black text-amber-800">4.9 / 5.0 ★</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">LANGUAGES</span>
                <span className="text-xs font-bold text-slate-800">Kannada, Eng, Hindi</span>
              </div>
            </div>

            {/* Consultation Booking Actions */}
            <div className="flex flex-wrap gap-3 pt-3">
              <button
                onClick={() => onNavigate('book-appointment', { type: 'IN_CLINIC' })}
                className="px-5 py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-colors"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Book In-Clinic Slot (₹250)</span>
              </button>

              <button
                onClick={() => onNavigate('book-appointment', { type: 'ONLINE' })}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-colors"
              >
                <Video className="w-4 h-4 text-emerald-200" />
                <span>Book Online Video Call (₹250)</span>
              </button>

              <a
                href="tel:+919483787702"
                className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-sky-600" />
                <span>+91 94837 87702</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Areas of Practice & Clinical Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Areas of Consultation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Areas of Consultation</h3>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                title: 'General Medicine & Acute Illness',
                desc: 'Diagnosis and management of seasonal fevers, respiratory infections, gastrointestinal complaints, headaches, and general health evaluations.'
              },
              {
                title: 'Ayurvedic Wellness & Herbal Regimens',
                desc: 'Prakriti analysis, herbal remedies, dietary balancing, and non-invasive natural treatment for chronic joint and digestive disorders.'
              },
              {
                title: 'Preventive Health & Vital Screenings',
                desc: 'Regular blood pressure monitoring, diabetic risk checks, pulse analysis, and preventative nutritional guidance.'
              },
              {
                title: 'Pediatric & Family Healthcare',
                desc: 'Childhood growth and immunity support, common pediatric ailments, and ongoing medical care for whole families.'
              },
              {
                title: 'Elderly Care & Geriatric Health',
                desc: 'Support for aging joints, chronic ailment stabilization, medication reviews, and personalized lifestyle routines for senior citizens.'
              }
            ].map((area, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-[#0f3b60]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{area.title}</span>
                </div>
                <p className="text-xs text-slate-600 pl-6">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timings, Location & Clinic Setup */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0f3b60] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Consultation Timings</h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="font-bold text-emerald-900">Monday to Saturday</span>
                <span className="font-extrabold text-emerald-800">9:30 AM – 6:30 PM</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-600">Lunch & Sanitization Break</span>
                <span className="font-semibold text-slate-700">1:30 PM – 2:15 PM</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-600">Sunday</span>
                <span className="font-semibold text-amber-700">Emergency On-Call Only</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f3b60] text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">Clinic Location</h3>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              <strong>MQX6+96C, Vanalli Rd</strong>
              <br />
              Hancharata, Tq: Sirsi, Sirsi, Karnataka 581336, India
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('contact')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
              >
                View Driving Directions & Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
