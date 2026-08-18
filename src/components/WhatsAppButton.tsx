import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber = '919483787702' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('Hello Hulekal Clinic, I would like to enquire about an appointment.');

  const handleSendMessage = () => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#0f3b60] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Hulekal Clinic Helpdesk</h4>
                <p className="text-[11px] text-emerald-300">Typically replies within a few minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 space-y-3">
            <div className="bg-white p-3 rounded-xl rounded-tl-xs shadow-xs text-xs text-slate-700 leading-relaxed border border-slate-100">
              <p className="font-semibold text-[#0f3b60] mb-1">Dr. Manjushree Ramachandra V</p>
              <p>
                Namaste! Welcome to Hulekal Clinic. How can we help you with your consultation, appointment, or Ayurvedic healthcare inquiry today?
              </p>
              <span className="text-[10px] text-slate-400 block text-right mt-1">9:30 AM – 6:30 PM</span>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Book In-Clinic Slot',
                'Online Teleconsultation',
                'Consultation Fee & Timing',
                'Clinic Location Map'
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(`Hello Hulekal Clinic, I would like to enquire about: ${prompt}.`)}
                  className="text-[11px] bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0f3b60] px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Message input */}
            <div className="pt-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 resize-none"
                placeholder="Type your message..."
              />
            </div>

            <button
              onClick={handleSendMessage}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start Chat on WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all duration-200 focus:outline-hidden"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
        <span className="hidden sm:inline font-semibold text-xs tracking-wide">
          Chat with Clinic
        </span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-ping"></span>
      </button>
    </div>
  );
};
