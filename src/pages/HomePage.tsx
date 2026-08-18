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
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Star,
  ChevronRight,
  ArrowRight,
  Shield,
  HelpCircle,
  Building,
  Award,
  FileText
} from 'lucide-react';
import { ClinicService, Doctor, Review } from '../types/index';
import { api } from '../lib/api';
import { EmergencyBanner } from '../components/EmergencyBanner';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
  onOpenReviewModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenReviewModal
}) => {
  const [services, setServices] = useState<ClinicService[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const loadClinicData = async () => {
      try {
        const res = await api.getClinicInfo();
        setServices(res.services || []);
        setDoctor(res.doctor || null);
        setReviews(res.reviews || []);
      } catch (err) {
        console.error('Failed to load clinic homepage data:', err);
      }
    };
    loadClinicData();
  }, []);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className="w-6 h-6 text-[#0f3b60]" />;
      case 'Users': return <Users className="w-6 h-6 text-emerald-600" />;
      case 'Leaf': return <Leaf className="w-6 h-6 text-emerald-700" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-sky-600" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-amber-600" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6 text-rose-600" />;
      default: return <Stethoscope className="w-6 h-6 text-[#0f3b60]" />;
    }
  };

  const faqs = [
    {
      q: 'What are the consultation hours at Hulekal Clinic?',
      a: 'The clinic is open for consultations from 9:30 AM to 6:30 PM, Monday through Saturday. Both in-clinic walk-in/prior slots and online video consultations are available during these hours.'
    },
    {
      q: 'How does Online Consultation work?',
      a: 'Select "Consult Online", choose your preferred time slot, enter patient details, and complete the secure payment. You will receive an instant appointment ID and a link to join the secure telehealth room directly on your mobile or computer with no extra app installation required.'
    },
    {
      q: 'Is Ayurvedic treatment available alongside general healthcare?',
      a: 'Yes! Dr. Manjushree Ramachandra V offers integrated medical care combining general healthcare diagnosis, routine allopathic protocols, and traditional Ayurvedic wellness therapies for lasting relief.'
    },
    {
      q: 'Where is Hulekal Clinic located?',
      a: 'We are located at Ground Floor, Shop No. 3, Hancharata, Vanalli Road, Ramnagar, Hulekal Village, Tq: Sirsi, Dist: Uttara Kannada – 581336.'
    },
    {
      q: 'Can I download digital prescriptions after my consultation?',
      a: 'Yes. All consultations generate an official digital prescription with Dr. Manjushree Ramachandra V’s signature, registration number (57749), vitals, and medicine timings which you can download as a high-resolution PDF from your patient portal.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Live Operational Status Banner */}
      <EmergencyBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f3b60]/5 via-sky-50/50 to-white pt-6 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Doctor & Reg Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-900 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Dr. Manjushree Ramachandra V • Reg. No. 57749</span>
              </div>

              {/* Main Headline from Poster */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f3b60] tracking-tight leading-[1.1]">
                  HULEKAL CLINIC
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-emerald-800 tracking-tight">
                  Quality Healthcare for the Whole Family
                </p>
              </div>

              <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                Comprehensive, compassionate medical consultations, preventive screening, and authentic Ayurvedic wellness in Hulekal Village, Sirsi. Book your in-clinic appointment or consult online from the comfort of your home.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('book-appointment', { type: 'IN_CLINIC' })}
                  className="px-6 py-3.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Book In-Clinic Appointment</span>
                </button>

                <button
                  onClick={() => onNavigate('book-appointment', { type: 'ONLINE' })}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
                >
                  <Video className="w-4 h-4 text-emerald-200" />
                  <span>Consult Doctor Online</span>
                </button>
              </div>

              {/* Key Trust Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>9:30 AM – 6:30 PM Timings</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0f3b60] shrink-0" />
                  <span>Govt. Reg. Doctor #57749</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Vanalli Road, Sirsi</span>
                </div>
              </div>
            </div>

            {/* Right Card / Doctor Showcase */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/60 border border-slate-200/80">
                {/* Visual Top Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0f3b60] to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      HC
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        Dr. Manjushree R. V
                      </h3>
                      <p className="text-xs text-emerald-700 font-semibold">Reg. No. 57749</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                    ★ 4.9 Rating
                  </span>
                </div>

                {/* Consultation details badge */}
                <div className="py-4 space-y-3">
                  <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f3b60] block">
                      Services Provided at Clinic
                    </span>
                    <p className="text-xs text-slate-700 font-medium">
                      General Healthcare • Ayurvedic Therapies • Preventive Care • Immunity & Elderly Care
                    </p>
                  </div>

                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                        Clinic Timings
                      </span>
                      <span className="text-xs font-bold text-emerald-800">
                        9:30 AM – 6:30 PM
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                        Consultation Fee
                      </span>
                      <span className="text-xs font-bold text-emerald-800">
                        ₹250 onwards
                      </span>
                    </div>
                  </div>
                </div>

                {/* Doctor profile link */}
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('doctor')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Complete Doctor Profile</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section from Poster (6 Services) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-[#0f3b60] text-xs font-bold">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span>Comprehensive Healthcare Offerings</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f3b60] tracking-tight">
            Our Medical & Wellness Services
          </h2>
          <p className="text-sm text-slate-600">
            Dedicated healthcare programs carefully designed for every age group and wellness goal in our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-[#0f3b60]/40"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getServiceIcon(srv.icon)}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0f3b60] transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {srv.shortDescription}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Fee</span>
                  <span className="text-sm font-bold text-[#0f3b60]">₹{srv.fee}</span>
                </div>

                <button
                  onClick={() => onNavigate('book-appointment', { serviceId: srv.id })}
                  className="px-3.5 py-2 bg-sky-50 hover:bg-[#0f3b60] text-[#0f3b60] hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Book Slot</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0f3b60] hover:underline"
          >
            <span>Explore All 6 Clinical Specialties in Detail</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Doctor Highlight Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="w-72 sm:w-80 h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-t from-[#0f3b60] to-slate-200">
                  <img
                    src={doctor?.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800'}
                    alt={doctor?.name || 'Dr. Manjushree Ramachandra V'}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 text-center">
                  <p className="text-xs font-bold text-[#0f3b60]">Reg. No. 57749</p>
                  <p className="text-[10px] text-slate-500">Karnataka Medical Council</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>Lead Medical Practitioner</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f3b60]">
                Dr. Manjushree Ramachandra V
              </h2>

              <p className="text-sm font-semibold text-slate-700">
                Registration No. 57749 • Ground Floor, Shop No. 3, Hulekal Village, Sirsi
              </p>

              <p className="text-sm text-slate-600 leading-relaxed">
                With a strong dedication to the health and vitality of the families in Hulekal, Sirsi, and Uttara Kannada, Dr. Manjushree Ramachandra V brings a caring, patient-first approach to medicine. Her practice seamlessly bridges modern medical assessment and traditional Ayurvedic wellness to treat acute ailments and foster long-term immunity.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Personalized consultation for all age groups (Pediatrics to Geriatrics)',
                  'Holistic Ayurvedic evaluations and herbal wellness recommendations',
                  'Preventive health screenings and lifestyle risk management',
                  'Convenient online telemedicine for remote patients and elderly seniors'
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => onNavigate('doctor')}
                  className="px-5 py-2.5 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  View Doctor Profile & Credentials
                </button>
                <a
                  href="tel:+919483787702"
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call +91 94837 87702</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us & How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Why Choose Hulekal Clinic */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Reliable Healthcare
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b60] mt-1">
                Why Choose Hulekal Clinic
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'Convenient In-Clinic & Online Slots',
                  desc: 'Zero waiting queues. Book guaranteed 30-minute consultation slots from 9:30 AM to 6:30 PM.',
                  icon: Calendar
                },
                {
                  title: 'Registered & Experienced Doctor',
                  desc: 'Consult directly with Dr. Manjushree Ramachandra V (Reg. No. 57749).',
                  icon: Award
                },
                {
                  title: 'Integrated Ayurvedic & Modern Care',
                  desc: 'Synergistic wellness plans for immunity, joint health, and chronic illness recovery.',
                  icon: Leaf
                },
                {
                  title: 'Secure Digital Records & E-Prescriptions',
                  desc: 'Access your consultation history, lab documents, and official PDF prescriptions anytime.',
                  icon: FileText
                },
                {
                  title: 'Instant Indian Digital Payments (UPI / Cards)',
                  desc: 'Seamless Razorpay checkout with Google Pay, PhonePe, Paytm, and Netbanking.',
                  icon: ShieldCheck
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0f3b60] flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works (4 Steps) */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Simple Booking Flow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b60] mt-1">
                How It Works
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: '01',
                  title: 'Choose Service & Consultation Type',
                  desc: 'Select In-Clinic appointment at our Sirsi clinic or convenient Online Video Consultation.'
                },
                {
                  step: '02',
                  title: 'Select Date & Live Available Slot',
                  desc: 'Choose from real-time dynamic time slots available between 9:30 AM and 6:30 PM.'
                },
                {
                  step: '03',
                  title: 'Complete Secure Payment (UPI/Cards)',
                  desc: 'Instant booking confirmation with zero double-booking lock.'
                },
                {
                  step: '04',
                  title: 'Consult Doctor & Receive Digital Rx',
                  desc: 'Meet Dr. Manjushree Ramachandra V and download your official authenticated prescription.'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                  <span className="text-2xl font-black text-emerald-600/70 shrink-0 font-mono">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('book-appointment')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Start Your Appointment Booking Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Online Consultation Telehealth Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-[#0f3b60] via-[#0c4a6e] to-emerald-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 inline-block">
              Telemedicine & Video Consultation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Consult Dr. Manjushree from the Comfort of Your Home
            </h2>
            <p className="text-sm text-sky-100 leading-relaxed">
              Living outside Hulekal or unable to travel to Sirsi? Connect with high-definition secure video consultation. Receive diagnosis, clinical advice, and digital PDF prescriptions instantly.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate('book-appointment', { type: 'ONLINE' })}
                className="px-6 py-3 bg-white text-[#0f3b60] hover:bg-sky-50 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <span>Book Online Video Consultation (₹250)</span>
              </button>
              <button
                onClick={() => onNavigate('patient-dashboard')}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors"
              >
                <span>Join Existing Video Room</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Patient Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b60] mt-1">
              What Our Patients Say
            </h2>
          </div>
          <button
            onClick={onOpenReviewModal}
            className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-[#0f3b60] text-xs font-bold rounded-xl border border-sky-200 transition-colors flex items-center gap-1.5"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Leave a Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={`star-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{rev.patientName}</p>
                  <p className="text-[10px] text-slate-500">{rev.serviceName}</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                  Verified Patient
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location & Google Maps Section */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Visit Hulekal Clinic
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b60]">
                Clinic Address & Directions
              </h2>

              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 text-sm">HULEKAL CLINIC</p>
                  <p className="leading-relaxed">
                    Hulekal Village, Ramnagar
                    <br />
                    Vanalli Road, Ground Floor, Shop No. 3
                    <br />
                    Hancharata, Tq: Sirsi
                    <br />
                    Dist: Uttara Kannada – 581336
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-semibold text-emerald-900">Consultation Timings:</span>
                  <span className="font-bold text-emerald-800">9:30 AM – 6:30 PM</span>
                </div>

                <div className="p-3.5 bg-sky-50/80 rounded-xl border border-sky-200 flex items-center justify-between">
                  <span className="font-semibold text-sky-900">Helpline / Contact:</span>
                  <a href="tel:+919483787702" className="font-bold text-sky-800 underline">
                    +91 94837 87702
                  </a>
                </div>
              </div>
            </div>

            {/* Map Frame */}
            <div className="lg:col-span-7">
              <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-200 relative">
                <iframe
                  title="Hulekal Clinic Location Map"
                  src="https://maps.google.com/maps?q=Hulekal+Sirsi+Uttara+Kannada&t=&z=14&ie=UTF8&iwloc=&output=embed"
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
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-12">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b60] mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:text-[#0f3b60]"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeFaq === idx ? 'rotate-90 text-[#0f3b60]' : ''
                  }`}
                />
              </button>

              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
