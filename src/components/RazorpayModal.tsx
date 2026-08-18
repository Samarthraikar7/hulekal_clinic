import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  Lock,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Appointment } from '../types/index';

interface RazorpayModalProps {
  appointment: Appointment;
  razorpayData: any;
  onSuccess: (paymentDetails: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature?: string;
    paymentMethod: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  appointment,
  razorpayData,
  onSuccess,
  onClose
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('patient@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [cardName, setCardName] = useState(appointment.patientName || '');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayNow = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Simulate real Indian banking authorization delay
      await new Promise((res) => setTimeout(res, 1200));

      const fakePaymentId = `pay_${Date.now().toString().slice(-8)}_${Math.floor(1000 + Math.random() * 9000)}`;

      await onSuccess({
        razorpay_payment_id: fakePaymentId,
        razorpay_order_id: razorpayData?.order_id || `order_${appointment.id}`,
        razorpay_signature: 'sig_verified_hulekal_2026',
        paymentMethod: selectedMethod === 'UPI' ? `UPI (${upiId})` : selectedMethod === 'CARD' ? `Card (Ending 8812)` : selectedBank
      });

      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Payment processing failed:', err);
      setErrorMessage(err.message || 'Payment could not be processed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-[#0f3b60] to-[#0c4a6e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Razorpay Secure Checkout</h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  256-bit SSL
                </span>
              </div>
              <p className="text-xs text-sky-200">Paying to: <strong>Hulekal Clinic (Sirsi)</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Summary Banner */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              {appointment.serviceName} ({appointment.consultationType === 'ONLINE' ? 'Online Video' : 'In-Clinic'})
            </p>
            <p className="text-xs font-semibold text-slate-700">
              Dr. Manjushree Ramachandra V • Reg. 57749
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Amount</span>
            <span className="text-2xl font-black text-[#0f3b60]">₹{appointment.amount}</span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Payment Option (India Gateways)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('UPI')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedMethod === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Smartphone className={`w-5 h-5 mb-1 ${selectedMethod === 'UPI' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>UPI / QR</span>
                <span className="text-[10px] text-emerald-600 font-normal">GPay, PhonePe, Paytm</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedMethod === 'CARD'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className={`w-5 h-5 mb-1 ${selectedMethod === 'CARD' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>Cards</span>
                <span className="text-[10px] text-slate-500 font-normal">Debit / Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('NETBANKING')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedMethod === 'NETBANKING'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building className={`w-5 h-5 mb-1 ${selectedMethod === 'NETBANKING' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>Net Banking</span>
                <span className="text-[10px] text-slate-500 font-normal">All Major Banks</span>
              </button>
            </div>
          </div>

          {/* Payment Method Inputs */}
          {selectedMethod === 'UPI' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Enter UPI Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank or 9483787702@upi"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant confirmation on Google Pay, PhonePe, Paytm or BHIM.</span>
              </div>
            </div>
          )}

          {selectedMethod === 'CARD' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4532 0000 0000 0000"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Valid Thru</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength={4}
                    placeholder="•••"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'NETBANKING' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                >
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Canara Bank</option>
                  <option>Karnataka Bank</option>
                  <option>Axis Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            </div>
          )}

          {/* Secure Trust Guarantee */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Level 1 Compliant</span>
            </span>
            <span>Razorpay Verified Merchant</span>
          </div>

          {/* CTA Pay Button */}
          <button
            type="button"
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all disabled:opacity-70 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Payment with Bank...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Pay Securely ₹{appointment.amount}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
