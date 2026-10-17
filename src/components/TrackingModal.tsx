import React, { useState } from 'react';
import {
  X,
  Search,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  CheckCircle2,
  AlertCircle,
  Bus,
  Coins,
  FileCheck,
} from 'lucide-react';
import { Order, Campus } from '../types/index.ts';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: Campus[];
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  campuses,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) {
      setErrorMsg('অনুগ্রহ করে অর্ডার নম্বর (যেমন: CS-2026-102) বা সিল নম্বর প্রদান করুন');
      return;
    }

    setIsSearching(true);
    setErrorMsg('');

    try {
      // First search in orders API
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        const found = data.orders.find(
          (o: Order) =>
            o.id.toLowerCase() === q.toLowerCase() ||
            (o.sealInfo?.sealNumber &&
              o.sealInfo.sealNumber.toLowerCase() === q.toLowerCase()) ||
            o.buyerPhone === q
        );

        if (found) {
          setSearchedOrder(found);
        } else {
          setErrorMsg(`'${q}' নম্বরে কোনো পার্সেল বা অর্ডার খুঁজে পাওয়া যায়নি। সঠিক অর্ডার আইডি দিন।`);
          setSearchedOrder(null);
        }
      }
    } catch {
      setErrorMsg('সার্ভারে যোগাযোগ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSearching(false);
    }
  };

  const getCustodyStageIndex = (order: Order) => {
    if (order.status === 'completed') return 4;
    if (order.status === 'ready_for_pickup' || order.status === 'received_at_booth') return 3;
    if (order.status === 'in_runner_custody') return 2;
    if (order.status === 'sealed_at_factory' || order.status === 'in_production') return 1;
    return 1;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-blue-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-amber-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                ক্যাম্পাস পার্সেল ট্র্যাকিং ও দায়ভার মনিটর
              </h2>
              <p className="text-xs text-blue-200">
                ফ্যাক্টরি ➔ পাবলিক বাস ট্রানজিট ➔ বুথ ➔ শিক্ষার্থী হস্তান্তর লাইভ ট্র্যাকার
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Search Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800">
              অর্ডার নম্বর বা সিকিউরিটি সিল কোড দিয়ে পার্সেল ট্র্যাক করুন:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="যেমন: CS-2026-102 অথবা SEAL-DCU-9842"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:border-blue-700 shadow-2xs"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="px-5 h-11 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                {isSearching ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
              </button>
            </div>

            {/* Quick Demo Track Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-500">
              <span>ডেমো ট্র্যাকিং:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('CS-2026-102');
                  handleSearch('CS-2026-102');
                }}
                className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono"
              >
                #CS-2026-102
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('CS-2026-101');
                  handleSearch('CS-2026-101');
                }}
                className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono"
              >
                #CS-2026-101
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Order Result Card */}
          {searchedOrder && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5 space-y-4">
              
              {/* Order Basic Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-[#0D5C3A]">
                      #{searchedOrder.id}
                    </span>
                    <span className="text-stone-300">|</span>
                    <span className="text-xs font-semibold text-stone-800">
                      ক্রেতা: {searchedOrder.buyerName}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    গন্তব্য: {searchedOrder.campusId} · বুথ: {searchedOrder.pickupPointName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono font-extrabold text-sm text-[#0D5C3A]">
                    ৳ {searchedOrder.totalAmount.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-semibold">
                    {searchedOrder.paymentMethod === 'cash_on_pickup' ? 'ক্যাশ অন পিকআপ' : searchedOrder.paymentMethod.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 4-Stage Visual Timeline */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 mb-2.5">
                  দায়ভার ও পরিবহন টাইমলাইন:
                </h4>
                
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  {/* Step 1: Factory */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    getCustodyStageIndex(searchedOrder) >= 1
                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-400'
                  }`}>
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>১. ফ্যাক্টরি সিল</span>
                    <span className="text-[9px] font-normal text-stone-500">
                      {searchedOrder.sealInfo?.sealNumber || 'সিল প্রস্তুত'}
                    </span>
                  </div>

                  {/* Step 2: Bus Transit */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    getCustodyStageIndex(searchedOrder) >= 2
                      ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-400'
                  }`}>
                    <Bus className="w-4 h-4 text-blue-700" />
                    <span>২. বাস ট্রানজিট</span>
                    <span className="text-[9px] font-normal text-stone-500">
                      রানার হাফ-পাস রুট
                    </span>
                  </div>

                  {/* Step 3: Campus Booth */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    getCustodyStageIndex(searchedOrder) >= 3
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-400'
                  }`}>
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>৩. বুথ মজুদ</span>
                    <span className="text-[9px] font-normal text-stone-500">
                      ক্যাম্পাস পয়েন্ট
                    </span>
                  </div>

                  {/* Step 4: Student Completed */}
                  <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    getCustodyStageIndex(searchedOrder) >= 4
                      ? 'bg-[#0D5C3A] border-[#0D5C3A] text-white font-bold shadow-xs'
                      : 'bg-white border-stone-200 text-stone-400'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>৪. শিক্ষার্থী গ্রহণ</span>
                    <span className="text-[9px] font-normal opacity-80">
                      ওটিপি ও ক্যাশ
                    </span>
                  </div>
                </div>
              </div>

              {/* Custody Responsibility Notice */}
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">বর্তমান দায়ভার জিম্মাদার:</span>
                  <span className="font-bold text-stone-900">
                    {searchedOrder.currentCustody === 'factory'
                      ? 'ফ্যাক্টরি প্রোডাকশন ইউনিট'
                      : searchedOrder.currentCustody === 'delivery_runner'
                      ? 'ডেলিভারি রানার (সাব্বির আহমেদ)'
                      : searchedOrder.currentCustody === 'pickup_staff'
                      ? 'ক্যাম্পাস বুথ কর্মী'
                      : 'শিক্ষার্থী ক্রেতা'}
                  </span>
                </div>

                {searchedOrder.sealInfo && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">নন-রিমুভাল সিল নং:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {searchedOrder.sealInfo.sealNumber}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-stone-500">পিকআপের সময়:</span>
                  <span className="font-semibold text-stone-800">
                    {searchedOrder.preferredDateTime}
                  </span>
                </div>
              </div>

              {/* Secret OTP for Buyer */}
              {searchedOrder.status !== 'completed' && (
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-teal-950">
                      গোপন ওটিপি ভেরিফিকেশন (Secret OTP):
                    </p>
                    <p className="text-[11px] text-teal-800">
                      বুথ কর্মীকে এই কোডটি বললে কর্মী ওটিপি মিলিয়ে নগদ ৳ {searchedOrder.totalAmount} গ্রহণ করে পণ্য দেবেন।
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white border border-teal-300 rounded-lg font-mono font-extrabold text-base text-teal-900 shrink-0">
                    {searchedOrder.handoverOtp || '4821'}
                  </span>
                </div>
              )}

              {/* Ordered Items */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-stone-700">অর্ডারকৃত পণ্য:</span>
                {searchedOrder.items.map((it, idx) => (
                  <p key={idx} className="text-stone-600">
                    • {it.productTitle} {it.selectedDesign ? `(ডিজাইন: ${it.selectedDesign})` : ''} - {it.quantity}টি
                  </p>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
