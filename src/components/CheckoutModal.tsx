import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Coins,
  CreditCard,
  AlertCircle,
  ArrowRightLeft,
  UserPlus,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Campus, CampusId, PaymentMethod, Order } from '../types/index.ts';

interface CheckoutModalProps {
  campuses: Campus[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  campuses,
  onOrderSuccess,
}) => {
  const { isCheckoutOpen, closeCheckout, cartItems, cartTotal, clearCart } = useCart();
  const { user, role, linkedAccounts, switchAccount, createLinkedBuyerAccount } = useAuth();
  const { lang } = useLanguage();

  const [selectedCampusId, setSelectedCampusId] = useState<CampusId>(
    user?.campusId || 'dhaka-college'
  );
  const [selectedPickupPointId, setSelectedPickupPointId] = useState<string>('');
  const [preferredDateTime, setPreferredDateTime] = useState<string>('আগামীকাল দুপুর ১:৩০');
  const [buyerPhone, setBuyerPhone] = useState<string>(user?.phone || '01711223344');
  const [notes, setNotes] = useState<string>('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_pickup');
  const [transactionId, setTransactionId] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Auto set payment method based on physical vs digital
  useEffect(() => {
    const hasPhysical = cartItems.some((i) => !i.isDigital);
    if (hasPhysical) {
      setPaymentMethod('cash_on_pickup');
    } else if (cartItems.length > 0) {
      setPaymentMethod('bkash');
    }
  }, [cartItems, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const currentCampus = campuses.find((c) => c.id === selectedCampusId) || campuses[0];
  const pickupPoints = currentCampus?.pickupPoints || [];

  const activePickupPoint =
    pickupPoints.find((p) => p.id === selectedPickupPointId) || pickupPoints[0];

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (role !== 'buyer') {
      setErrorMsg(
        'কোনো বিক্রেতা বা স্টাফ একাউন্ট থেকে সরাসরি পণ্য কেনা যাবে না। পণ্য কিনতে বায়ার একাউন্টে সুইচ বা রেজিস্ট্রেশন করুন।'
      );
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('আপনার শপিং ব্যাগে কোনো পণ্য নেই।');
      return;
    }

    if (!buyerPhone) {
      setErrorMsg('অনুগ্রহ করে যোগাযোগ নম্বর (মোবাইল) প্রদান করুন।');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId) {
      setErrorMsg('বিকাশ বা নগদ ট্রানজ্যাকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-buyer-1',
        },
        body: JSON.stringify({
          items: cartItems,
          paymentMethod,
          transactionId: transactionId.trim() || undefined,
          senderPhone: senderPhone.trim() || undefined,
          campusId: selectedCampusId,
          pickupPointId: activePickupPoint?.id || 'dc-main-gate',
          pickupPointName: activePickupPoint?.nameBn || 'ক্যাম্পাস প্রধান ফটক বুথ',
          preferredDateTime,
          notes,
          buyerPhone,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCompletedOrder(data.order);
        clearCart();
        onOrderSuccess(data.order);
      } else {
        setErrorMsg(data.message || 'অর্ডার সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch {
      setErrorMsg('সার্ভারে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingBuyer = linkedAccounts.find((a) => a.role === 'buyer');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              {completedOrder ? 'অর্ডার সফলভাবে প্রাপ্ত হয়েছে' : 'ক্যাম্পাস পিকআপ চেকআউট'}
            </h2>
            <p className="text-xs text-stone-500">
              {completedOrder
                ? 'আপনার অর্ডার আইটেম ক্যাম্পাসের নির্দিষ্ট পয়েন্টে পৌঁছে দেওয়া হবে'
                : 'ক্যাম্পাস নির্ধারণ করে সরাসরি দেখা করে পণ্য বুঝে নিন'}
            </p>
          </div>
          <button
            onClick={() => {
              setCompletedOrder(null);
              closeCheckout();
            }}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NON-BUYER ACCOUNT WARNING BANNER */}
        {role !== 'buyer' && !completedOrder && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  আপনি বর্তমানে "{role}" অ্যাকাউন্টে লগইন আছেন।
                </p>
                <p className="text-stone-600 mt-0.5">
                  নিয়ম অনুযায়ী কোনো সেলার বা বিশেষ ধরনের অ্যাকাউন্ট থেকে সরাসরি পণ্য কেনা যাবে না। পণ্য কিনতে বায়ার অ্যাকাউন্টে সুইচ করুন বা একটি বায়ার অ্যাকাউন্ট যুক্ত করুন।
                </p>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              {existingBuyer ? (
                <button
                  type="button"
                  onClick={() => switchAccount(existingBuyer.id)}
                  className="px-4 py-1.5 rounded-xl bg-[#0D5C3A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>আমার বায়ার অ্যাকাউন্টে স্যুইচ করুন ({existingBuyer.name})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => createLinkedBuyerAccount()}
                  className="px-4 py-1.5 rounded-xl bg-[#0D5C3A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>১-ক্লিকে বায়ার অ্যাকাউন্ট তৈরি ও লিংক করুন</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Confirmation View */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-stone-900 mb-1">
              অভিনন্দন! আপনার অর্ডার নিশ্চিত করা হয়েছে
            </h3>
            <p className="text-sm font-semibold text-[#0D5C3A] font-mono mb-4">
              অর্ডার নম্বর: #{completedOrder.id}
            </p>

            <div className="w-full bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-stone-200/70 pb-2">
                <span className="text-stone-500">পিকআপ ক্যাম্পাস:</span>
                <span className="font-bold text-stone-800">{currentCampus.nameBn}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200/70 pb-2">
                <span className="text-stone-500">পিকআপ বুথ পয়েন্ট:</span>
                <span className="font-bold text-stone-800">{completedOrder.pickupPointName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200/70 pb-2">
                <span className="text-stone-500">সাক্ষাতের সময়:</span>
                <span className="font-semibold text-stone-800">{completedOrder.preferredDateTime}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200/70 pb-2">
                <span className="text-stone-500">পিকআপ ভেরিফিকেশন কোড (OTP):</span>
                <span className="font-mono font-bold text-base text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {completedOrder.handoverOtp || '4821'}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-stone-900">মোট টাকা:</span>
                <span className="text-[#0D5C3A] font-mono">
                  ৳ {completedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 mb-6 max-w-md">
              বুথ কর্মী বা রানারকে ৪-সংখ্যার ওটিপি দেখিয়ে পণ্য সংগ্রহ করুন।
            </p>

            <button
              onClick={() => {
                setCompletedOrder(null);
                closeCheckout();
              }}
              className="w-full h-11 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white font-bold text-xs shadow-sm transition-all"
            >
              ঠিক আছে
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="p-5 sm:p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Select Campus */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0D5C3A]" />
                <span>১. পিকআপ ক্যাম্পাস নির্বাচন করুন</span>
              </label>
              <select
                value={selectedCampusId}
                onChange={(e) => {
                  setSelectedCampusId(e.target.value as CampusId);
                  setSelectedPickupPointId('');
                }}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-[#0D5C3A]"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameBn} ({c.locationBn})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Designated Pickup Point */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                ২. ক্যাম্পাসের নির্দিষ্ট পিকআপ পয়েন্ট
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pickupPoints.map((pt) => {
                  const isSelected =
                    (selectedPickupPointId || activePickupPoint?.id) === pt.id;
                  return (
                    <div
                      key={pt.id}
                      onClick={() => setSelectedPickupPointId(pt.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0D5C3A] bg-emerald-50/50 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-stone-900">
                          {pt.nameBn}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#0D5C3A]" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">{pt.landmark}</p>
                      <p className="text-[10px] text-amber-700 mt-1 font-medium">
                        সময়: {pt.timeAdvice}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Date, Time & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>সাক্ষাতের পছন্দের সময়</span>
                </label>
                <input
                  type="text"
                  value={preferredDateTime}
                  onChange={(e) => setPreferredDateTime(e.target.value)}
                  placeholder="যেমন: আগামীকাল দুপুর ১:৩০ বা ক্লাস শেষে"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:border-[#0D5C3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>আপনার সচল ফোন নম্বর</span>
                </label>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:border-[#0D5C3A]"
                  required
                />
              </div>
            </div>

            {/* Step 4: Payment Method Enforcing Physical Goods COD and Digital Instant Unlock */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  ৩. পেমেন্ট পদ্ধতি
                </label>
                <span className="text-[11px] font-semibold text-stone-500">
                  {cartItems.some(i => !i.isDigital)
                    ? 'বাস্তবে লেনদেনযোগ্য পণ্য: শুধুমাত্র ক্যাশ অন ডেলিভারি'
                    : 'ডিজিটাল পণ্য: বিকাশ / নগদ'}
                </span>
              </div>

              {/* If order has physical goods: ONLY Cash on Delivery */}
              {cartItems.some(i => !i.isDigital) ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2.5 text-[#0D5C3A]">
                    <Coins className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">ক্যাশ অন পিকআপ / ডেলিভারি (Cash on Delivery)</p>
                      <p className="text-[11px] text-emerald-900 mt-0.5">
                        বাস্তবে লেনদেনযোগ্য পণ্যের জন্য শর্তহীনভাবে শুধুমাত্র ক্যাশ অন ডেলিভারি সিস্টেম চালু রয়েছে।
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 flex items-center justify-between">
                    <span>ক্যাম্পাস পিকআপ বুথে পণ্য হাতে পেয়ে পরিশোধ করবেন:</span>
                    <span className="font-mono font-bold text-sm text-[#0D5C3A]">৳ {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                /* Purely Digital Goods: bKash or Nagad */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 font-medium'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-pink-600" />
                      <span className="text-xs">বিকাশ (bKash)</span>
                      <span className="text-[10px] text-stone-500">সেন্ড মানি</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'nagad'
                          ? 'border-orange-600 bg-orange-50 text-orange-700 font-bold'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 font-medium'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-orange-600" />
                      <span className="text-xs">নগদ (Nagad)</span>
                      <span className="text-[10px] text-stone-500">সেন্ড মানি</span>
                    </button>
                  </div>
                </div>
              )}

              {/* bKash / Nagad Manual Payment Details Form */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className="mt-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">
                      {paymentMethod === 'bkash' ? 'বিকাশ সেন্ড মানি নম্বর:' : 'নগদ সেন্ড মানি নম্বর:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {paymentMethod === 'bkash' ? '01822334455' : '01933445566'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(paymentMethod === 'bkash' ? '01822334455' : '01933445566')
                        }
                        className="p-1 text-stone-500 hover:text-stone-900"
                      >
                        {copiedNumber ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    উক্ত নম্বরে সর্বমোট <strong>৳ {cartTotal}</strong> সেন্ড মানি করে নিচের ট্রানজ্যাকশন আইডি (TrxID) ইনপুট দিন।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="TrxID (যেমন: BK9A772X41)"
                        className="w-full h-10 px-3 text-xs uppercase font-mono font-bold rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#0D5C3A]"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                        className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#0D5C3A]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="যেমন: আমি লাইব্রেরি মাঠের সামনের বুথে থাকব..."
                className="w-full h-16 p-2.5 text-xs rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:border-[#0D5C3A]"
              />
            </div>

            {/* Order Total & Submit */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 block">সর্বমোট প্রদেয়:</span>
                <span className="text-xl font-bold font-mono text-[#0D5C3A]">
                  ৳ {cartTotal.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || role !== 'buyer'}
                className={`h-12 px-6 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-[0.98] ${
                  role === 'buyer'
                    ? 'bg-[#0D5C3A] hover:bg-[#09432a]'
                    : 'bg-stone-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span>প্রসেস হচ্ছে...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>অর্ডার কনফার্ম করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
