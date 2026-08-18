import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [patientName, setPatientName] = useState('');
  const [rating, setRating] = useState(5);
  const [serviceName, setServiceName] = useState('General Consultation');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !comment) return;

    setLoading(true);
    try {
      await api.addReview({
        patientName,
        rating,
        serviceName,
        comment
      });
      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0f3b60] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Share Your Clinic Feedback</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-bold text-slate-800 text-lg">Thank You!</h4>
              <p className="text-xs text-slate-600">Your feedback has been verified and posted.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Mahabaleshwar Hegde"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] focus:outline-hidden text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-slate-700 text-sm">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultation / Service</label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] focus:outline-hidden text-slate-800"
                >
                  <option>General Consultation</option>
                  <option>Family Healthcare</option>
                  <option>Ayurvedic Treatment</option>
                  <option>Preventive Care</option>
                  <option>Immunity & Wellness</option>
                  <option>Elderly Care</option>
                  <option>Online Video Consultation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Experience & Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share details of your diagnosis, Dr. Manjushree's consultation, or clinic experience..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0f3b60] focus:outline-hidden text-slate-800 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0f3b60] hover:bg-[#0c2f4d] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Verified Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
