import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { AuthModal } from './components/AuthModal';
import { ReviewModal } from './components/ReviewModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { DoctorPage } from './pages/DoctorPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';

import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

function MainApp() {
  const { user } = useAuth();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Sync URL pathname or hash routing (direct URL entry e.g. /admin, /doctor, /dashboard)
  useEffect(() => {
    const handleUrlOrHashChange = () => {
      const pathname = window.location.pathname.replace(/^\//, '').toLowerCase();
      const hash = window.location.hash.replace('#', '').split('?')[0].toLowerCase();

      let targetPage = hash || pathname || 'home';

      // Map alias direct URLs
      if (targetPage === 'admin' || targetPage === 'admin-portal' || targetPage === 'admin-dashboard') {
        targetPage = 'admin-dashboard';
      } else if (targetPage === 'doctor' || targetPage === 'doctor-portal' || targetPage === 'doctor-dashboard') {
        targetPage = 'doctor-dashboard';
      } else if (targetPage === 'dashboard' || targetPage === 'patient' || targetPage === 'patient-dashboard') {
        targetPage = 'patient-dashboard';
      }

      setCurrentPage(targetPage);
    };

    window.addEventListener('hashchange', handleUrlOrHashChange);
    window.addEventListener('popstate', handleUrlOrHashChange);
    handleUrlOrHashChange();

    return () => {
      window.removeEventListener('hashchange', handleUrlOrHashChange);
      window.removeEventListener('popstate', handleUrlOrHashChange);
    };
  }, []);

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let hash = `#${page}`;
    const keys = Object.keys(params);
    if (keys.length > 0) {
      const q = new URLSearchParams(params).toString();
      hash += `?${q}`;
    }
    window.history.pushState(null, '', hash);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigate}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenReviewModal={() => setIsReviewOpen(true)}
          />
        )}

        {currentPage === 'services' && (
          <ServicesPage onNavigate={navigate} />
        )}

        {currentPage === 'doctor' && (
          <DoctorPage onNavigate={navigate} />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={navigate} />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={navigate} />
        )}

        {currentPage === 'book-appointment' && (
          <BookAppointmentPage
            onNavigate={navigate}
            initialServiceId={pageParams.serviceId}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentPage === 'patient-dashboard' && (
          <PatientDashboard
            onNavigate={navigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentPage === 'doctor-dashboard' && (
          <DoctorDashboard
            onNavigate={navigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboard
            onNavigate={navigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPage onNavigate={navigate} />
        )}

        {currentPage === 'terms' && (
          <TermsPage onNavigate={navigate} />
        )}
      </main>

      {/* Global Floating WhatsApp Contact Button */}
      <WhatsAppButton />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {}}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmitted={() => {}}
      />

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
