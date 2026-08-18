import React, { useState, useEffect } from 'react';
import { Clock, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 is Sunday
      const hour = now.getHours();
      const min = now.getMinutes();
      const totalMinutes = hour * 60 + min;

      const openMinutes = 9 * 60 + 30;  // 9:30 AM (570)
      const closeMinutes = 18 * 60 + 30; // 6:30 PM (1110)

      if (day === 0) {
        setIsOpen(false);
        setStatusText('Clinic is Closed Today (Sunday). Emergency helpline available.');
      } else if (totalMinutes >= openMinutes && totalMinutes <= closeMinutes) {
        setIsOpen(true);
        setStatusText('Clinic is Currently OPEN for Consultations (9:30 AM – 6:30 PM)');
      } else if (totalMinutes < openMinutes) {
        setIsOpen(false);
        setStatusText('Clinic Opens Today at 9:30 AM. Appointments can be booked online.');
      } else {
        setIsOpen(false);
        setStatusText('Clinic is Closed for Today. Next consultation begins tomorrow at 9:30 AM.');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`py-2 px-4 text-xs font-medium border-b flex items-center justify-between flex-wrap gap-2 ${
      isOpen
        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
        : 'bg-amber-50 text-amber-900 border-amber-200'
    }`}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isOpen ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </span>
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600" />
          )}
          <span>{statusText}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-slate-500">Emergency & Urgent Care:</span>
          <a
            href="tel:+919483787702"
            className="font-bold underline hover:opacity-80 flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            <span>+91 94837 87702</span>
          </a>
        </div>
      </div>
    </div>
  );
};
