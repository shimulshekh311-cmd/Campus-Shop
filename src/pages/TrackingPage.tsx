import React, { useState, useEffect } from 'react';
import {
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
  ChevronRight,
  Home,
  RefreshCw,
  QrCode,
  Building,
  ArrowRight,
  Phone
} from 'lucide-react';
import { Order, Campus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface TrackingPageProps {
  onGoHome: () => void;
  initialOrderId?: string;
  campuses: Campus[];
}

export const TrackingPage: React.FC<TrackingPageProps> = ({
  onGoHome,
  initialOrderId,
  campuses,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Load user's recent orders for quick tracking selection
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/orders?userId=${user.id}`, {
        headers: { 'x-user-id': user.id },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.orders) {
            setUserOrders(data.orders);
            // If initialOrderId wasn't passed, default to first active order if exists
            if (!initialOrderId && data.orders.length > 0) {
              setSearchedOrder(data.orders[0]);
              setSearchQuery(data.orders[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // If initialOrderId is passed or changes, search immediately
  useEffect(() => {
    if (initialOrderId) {
      setSearchQuery(initialOrderId);
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) {
      setErrorMsg('অনুগ্রহ করে অর্ডার নম্বর (যেমন: CS-2026-102) বা সিল নম্বর প্রদান করুন');
      return;
    }

    setIsSearching(true);
    setErrorMsg('');

    try {
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

  const getStepProgress = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 1;
      case 'in_production':
        return 1;
      case 'sealed_at_factory':
        return 2;
      case 'in_runner_custody':
        return 2;
      case 'received_at_booth':
      case 'ready_for_pickup':
        return 3;
      case 'completed':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = searchedOrder ? getStepProgress(searchedOrder.status) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 hover:text-[#0D5C3A] transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>হোম</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-semibold">লাইভ পার্সেল ট্র্যাকিং (Tracking Page)</span>
      </nav>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              লাইভ পার্সেল ট্র্যাকিং ও নিরাপত্তা চেইন
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              ফ্যাক্টরি সিলিং, পাবলিক বাস রুট এবং ৭টি ক্যাম্পাস পিক-আপ বুথের স্বচ্ছ হিসাব
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/80 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            নন-রিমুভাল সিল গ্যারান্টি
          </span>
        </div>
      </div>

      {/* Search Input Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 mb-6 shadow-xs">
        <div className="max-w-2xl mx-auto">
          <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-2">
            অর্ডার আইডি, নন-রিমুভাল সিল নম্বর বা মোবাইল নম্বর দিয়ে খুঁজুন
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="যেমন: CS-2026-101 বা SEAL-9831..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/20 text-sm font-mono outline-hidden"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="px-6 py-2.5 bg-[#0D5C3A] hover:bg-[#09432a] text-white rounded-xl text-sm font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>খোঁজা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>ট্র্যাক করুন</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User's quick selection pills if logged in */}
          {userOrders.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">আপনার সাম্প্রতিক অর্ডার:</span>
              {userOrders.slice(0, 4).map((uo) => (
                <button
                  key={uo.id}
                  onClick={() => {
                    setSearchQuery(uo.id);
                    handleSearch(uo.id);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                    searchedOrder?.id === uo.id
                      ? 'bg-[#0D5C3A] text-white border-[#0D5C3A]'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {uo.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Searched Order Details */}
      {searchedOrder && (
        <div className="space-y-6">
          {/* Status & Custody Highlights */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-500">অর্ডার ট্র্যাকিং:</span>
                  <span className="text-base font-bold font-mono text-stone-900">
                    {searchedOrder.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0D5C3A]/10 text-[#0D5C3A]">
                    {searchedOrder.sealInfo?.destinationCampusBn || searchedOrder.pickupPointName}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  ক্রেতা: {searchedOrder.buyerName} ({searchedOrder.buyerPhone})
                </p>
              </div>

              {searchedOrder.sealInfo && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2 text-right">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">
                    নন-রিমুভাল সিকিউরিটি সিল
                  </span>
                  <span className="text-sm font-black font-mono text-amber-900">
                    #{searchedOrder.sealInfo.sealNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Visual 4-Step Custody Timeline */}
            <div className="py-6">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-6">
                পার্সেল ট্র্যাকিং ও নিরাপত্তা স্টেজ
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-stone-200 -translate-y-1/2 z-0" />
                <div
                  className="hidden md:block absolute top-1/2 left-8 h-1 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 3) * 88}%` }}
                />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                  {/* Stage 1: Factory Packaging */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      currentStep >= 1
                        ? 'bg-emerald-50/90 border-emerald-300 text-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          currentStep >= 1
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        ১
                      </div>
                      <span className="font-bold text-xs">ফ্যাক্টরি সিলিং</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      পণ্যে ফ্যাক্টরি থেকে নন-রিমুভাল সিকিউরিটি সিল ও সকল তথ্য সংযুক্ত করা হয়েছে।
                    </p>
                    {searchedOrder.sealInfo && (
                      <div className="mt-2 text-[10px] bg-white/80 p-1.5 rounded-lg border border-emerald-200 font-mono text-emerald-900">
                        সিল: {searchedOrder.sealInfo.sealNumber}
                      </div>
                    )}
                  </div>

                  {/* Stage 2: Runner in Transit via Public Bus */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      currentStep >= 2
                        ? 'bg-emerald-50/90 border-emerald-300 text-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          currentStep >= 2
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        ২
                      </div>
                      <span className="font-bold text-xs">রানার পরিবহন</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      ডেলিভারি ম্যান পাবলিক বাসে স্টুডেন্ট আইডি ব্যবহার করে ক্যাম্পাসের উদ্দেশ্যে রওনা হয়েছে।
                    </p>
                    <div className="mt-2 text-[10px] text-blue-700 flex items-center gap-1">
                      <Bus className="w-3 h-3" />
                      <span>দৈনিক পাবলিক বাস রুট</span>
                    </div>
                  </div>

                  {/* Stage 3: Received at Campus Booth */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      currentStep >= 3
                        ? 'bg-emerald-50/90 border-emerald-300 text-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          currentStep >= 3
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        ৩
                      </div>
                      <span className="font-bold text-xs">পিকআপ পয়েন্টে জমা</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      ক্যাম্পাসের পিকআপ কর্মী পার্সেল সিল যাচাই করে বুঝে নিয়েছেন। সংগ্রহের জন্য রেডি।
                    </p>
                    <div className="mt-2 text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{searchedOrder.pickupPointName}</span>
                    </div>
                  </div>

                  {/* Stage 4: Completed Handover */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      currentStep >= 4
                        ? 'bg-emerald-50/90 border-emerald-300 text-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          currentStep >= 4
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        ৪
                      </div>
                      <span className="font-bold text-xs">ক্লায়েন্ট হ্যান্ডওভার</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      ক্লায়েন্ট বুথে উপস্থিত হয়ে নগদ মূল্য প্রদান করে এবং সিক্রেট OTP যাচাই করে পার্সেল বুঝে পেয়েছেন।
                    </p>
                    <div className="mt-2 text-[10px] text-stone-600 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span>ক্যাশ অন পিকআপ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-removal Paper Seal & OTP Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
              {/* Paper Seal Info */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-stone-900">
                    ফ্যাক্টরির নন-রিমুভাল সিল বিবরণী
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>উৎপাদন কেন্দ্র:</span>
                    <span className="font-semibold text-stone-900">
                      নির্বাচিত পার্টনার গার্মেন্টস ও টেক্সটাইল ফ্যাক্টরি
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>সিল ও কোয়ালিটি ইনচার্জ:</span>
                    <span className="font-semibold text-stone-900">
                      {searchedOrder.sealInfo?.factoryInspector || 'এম এ রহিম (ইনচার্জ)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>সিল স্ট্যাটাস:</span>
                    <span className="font-semibold text-emerald-700">
                      অক্ষত ও সিলমোহরযুক্ত (Tamper-evident)
                    </span>
                  </div>
                </div>
              </div>

              {/* Secret OTP for Handover */}
              <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    পিকআপ ভেরিফিকেশন ওটিপি (OTP)
                  </span>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    পিক-আপ পয়েন্ট কর্মীকে এই কোড দেখিয়ে নগদ ৳{searchedOrder.totalAmount} প্রদান করুন।
                  </p>
                </div>
                <div className="bg-white border-2 border-dashed border-emerald-600 px-3 py-1.5 rounded-xl text-center shadow-xs">
                  <span className="text-lg font-black font-mono text-[#0D5C3A]">
                    {searchedOrder.handoverOtp || '7392'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buyer's Own Campus Pickup Point Card */}
      {(() => {
        const buyerCampusId = searchedOrder?.buyerCampusId || user?.campusId || 'dhaka-college';
        const buyerCampus = campuses.find((c) => c.id === buyerCampusId) || campuses[0];
        const buyerPickupPoint = buyerCampus?.pickupPoints[0];

        return (
          <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#0D5C3A]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    আপনার নির্ধারিত পিক-আপ পয়েন্ট (পণ্য সংগ্রহের বুথ)
                  </h3>
                  <p className="text-xs text-stone-500">
                    বায়ার নিজ ক্যাম্পাসের নির্দিষ্ট বুথ থেকেই ক্যাশ টাকা ও ওটিপি দেখিয়ে পণ্য বুঝে নেবেন
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
                সময়: সকাল ১০:০০ - বিকাল ৫:০০
              </span>
            </div>

            {/* Pickup Booth Details Card */}
            <div className="bg-stone-50/70 rounded-2xl p-4 sm:p-5 border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-stone-500 font-medium block">ক্যাম্পাস ও বুথ:</span>
                <p className="text-sm font-bold text-stone-900">
                  {buyerCampus?.nameBn}
                </p>
                <p className="text-xs text-[#0D5C3A] font-semibold">
                  {searchedOrder?.pickupPointName || buyerPickupPoint?.nameBn || 'স্টুডেন্ট পিক-আপ বুথ'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-stone-500 font-medium block">সুনির্দিষ্ট লোকেশন:</span>
                <p className="text-xs text-stone-800 font-medium leading-relaxed">
                  {buyerPickupPoint?.landmark || buyerCampus?.locationBn}
                </p>
                <span className="text-[11px] text-stone-500">
                  ({buyerPickupPoint?.timeAdvice || 'সকাল ১০টা থেকে বিকাল ৫টার মধ্যে খোলা থাকে'})
                </span>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-xs text-stone-500 font-medium block">পণ্য সংগ্রহের নিয়ম:</span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  পার্সেল বুথে পৌঁছালে পিক-আপ কর্মীকে আপনার <strong>সিক্রেট ওটিপি (OTP)</strong> দেখাবেন এবং নগদ টাকা পরিশোধ করে সিলযুক্ত পার্সেল বুঝে নেবেন।
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
