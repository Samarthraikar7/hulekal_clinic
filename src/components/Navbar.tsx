import React, { useState } from 'react';
import {
  Stethoscope,
  Phone,
  Clock,
  Calendar,
  Video,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenAuth }) => {
  const { user, logout, isDoctor, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getDashboardLabel = () => {
    if (isAdmin) return 'Admin Portal';
    if (isDoctor) return 'Doctor Dashboard';
    return 'Patient Portal';
  };

  const getDashboardPage = () => {
    if (isAdmin) return 'admin';
    if (isDoctor) return 'doctor-dashboard';
    return 'patient-dashboard';
  };

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-[#0f3b60] text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1 font-medium text-emerald-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Consultation: 9:30 AM – 6:30 PM (Mon-Sat)</span>
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Reg. No. 57749 | Sirsi, Uttara Kannada</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:+919483787702"
              className="flex items-center gap-1.5 text-slate-100 hover:text-emerald-300 transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 94837 87702</span>
            </a>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => onNavigate('contact')}
              className="text-slate-200 hover:text-white underline text-xs"
            >
              Directions
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Logo & Clinic Branding */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left group focus:outline-hidden"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0f3b60] to-[#0284c7] flex items-center justify-center text-white shadow-md shadow-sky-900/10 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f3b60]">
                HULEKAL CLINIC
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                Reg 57749
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Dr. Manjushree Ramachandra V • Sirsi
            </p>
          </div>
        </button>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors hover:text-[#0f3b60] ${
              currentPage === 'home' ? 'text-[#0f3b60] font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className={`transition-colors hover:text-[#0f3b60] ${
              currentPage === 'services' ? 'text-[#0f3b60] font-semibold' : ''
            }`}
          >
            Services
          </button>
          <button
            onClick={() => handleNavClick('doctor')}
            className={`transition-colors hover:text-[#0f3b60] ${
              currentPage === 'doctor' ? 'text-[#0f3b60] font-semibold' : ''
            }`}
          >
            Doctor Profile
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`transition-colors hover:text-[#0f3b60] ${
              currentPage === 'about' ? 'text-[#0f3b60] font-semibold' : ''
            }`}
          >
            About Clinic
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`transition-colors hover:text-[#0f3b60] ${
              currentPage === 'contact' ? 'text-[#0f3b60] font-semibold' : ''
            }`}
          >
            Contact & Timings
          </button>
        </nav>

        {/* Action Buttons & Auth */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => onNavigate('book-appointment', { type: 'ONLINE' })}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0f3b60] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors shadow-2xs"
          >
            <Video className="w-4 h-4 text-emerald-600" />
            <span>Online Consult</span>
          </button>

          <button
            onClick={() => onNavigate('book-appointment', { type: 'IN_CLINIC' })}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0f3b60] hover:bg-[#0c2f4d] rounded-lg transition-colors shadow-md shadow-sky-900/15"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Book Appointment</span>
          </button>

          {/* User Account / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => onNavigate(getDashboardPage())}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0f3b60]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <span>{getDashboardLabel()}</span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#0f3b60] hover:bg-slate-100/80 rounded-lg transition-colors border border-slate-200"
            >
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-800">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Services (6 Specialties)
            </button>
            <button
              onClick={() => handleNavClick('doctor')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Dr. Manjushree Ramachandra V
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              About Clinic & Reg No 57749
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Contact, Maps & Hours
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('book-appointment')}
              className="w-full py-2.5 bg-[#0f3b60] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Book Appointment (In-Clinic or Online)</span>
            </button>

            {user ? (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleNavClick(getDashboardPage())}
                  className="flex items-center gap-2 text-sm font-semibold text-[#0f3b60]"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span>{getDashboardLabel()} ({user.name})</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="text-xs text-rose-600 font-medium px-2 py-1 bg-rose-50 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2 border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Patient / Doctor Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
