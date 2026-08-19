import React from 'react';

interface ConsultationRoomPageProps {
  appointmentId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ConsultationRoomPage: React.FC<ConsultationRoomPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">In-Clinic Consultations Only</h2>
      <p className="text-xs text-slate-500">
        Hulekal Clinic provides in-clinic consultations. Please visit our clinic at Sirsi for your appointment.
      </p>
      <button
        onClick={() => onNavigate('home')}
        className="px-6 py-2 bg-[#0f3b60] text-white text-xs font-bold rounded-xl"
      >
        Go to Home
      </button>
    </div>
  );
};
