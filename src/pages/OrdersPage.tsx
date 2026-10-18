import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  RefreshCw,
  Truck,
  ShieldCheck,
  FileText,
  Eye,
  Download,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Home,
  Check,
  ShoppingBag
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface OrdersPageProps {
  onGoHome: () => void;
  onGoTracking: (orderId?: string) => void;
  onOpenReview: (order: Order) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  onGoHome,
  onGoTracking,
  onOpenReview,
}) => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'transit' | 'ready' | 'completed'>('all');
  const [activeDigitalReader, setActiveDigitalReader] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`, {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            অর্ডার জমা হয়েছে
          </span>
        );
      case 'in_production':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            ফ্যাক্টরিতে প্রস্তুত হচ্ছে
          </span>
        );
      case 'sealed_at_factory':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            ফ্যাক্টরি সিলযুক্ত ও রানারের অপেক্ষায়
          </span>
        );
      case 'in_runner_custody':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            রানার বাসে ক্যাম্পাসে নিয়ে আসছে
          </span>
        );
      case 'received_at_booth':
      case 'ready_for_pickup':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 animate-pulse">
            পিকআপ পয়েন্টে প্রস্তুত (টাকা দিয়ে নিন)
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            ডেলিভারি সম্পন্ন
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            বাতিল
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'transit') {
      return ['placed', 'in_production', 'sealed_at_factory', 'in_runner_custody'].includes(o.status);
    }
    if (activeFilter === 'ready') {
      return ['received_at_booth', 'ready_for_pickup'].includes(o.status);
    }
    if (activeFilter === 'completed') {
      return o.status === 'completed';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 w-full overflow-x-clip">
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
        <span className="text-stone-900 font-semibold">আমার অর্ডারসমূহ (Order Page)</span>
      </nav>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center">
              <Package className="w-5 h-5 text-[#0D5C3A]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                আমার অর্ডার ও ডেলিভারি স্ট্যাটাস
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                ফ্যাক্টরি থেকে ক্যাম্পাসের পিক-আপ পয়েন্ট পর্যন্ত অর্ডার ট্র্যাকিং এবং ডেলিভারি হিসাব
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onGoTracking()}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1.5 border border-blue-200/60"
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span>পার্সেল ট্র্যাকিং পেজ</span>
          </button>

          <button
            onClick={fetchOrders}
            className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 text-xs sm:text-sm">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            activeFilter === 'all'
              ? 'bg-[#0D5C3A] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          সকল অর্ডার ({orders.length})
        </button>
        <button
          onClick={() => setActiveFilter('transit')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            activeFilter === 'transit'
              ? 'bg-[#0D5C3A] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          ট্রানজিট / রানারের পথে ({
            orders.filter((o) =>
              ['placed', 'in_production', 'sealed_at_factory', 'in_runner_custody'].includes(o.status)
            ).length
          })
        </button>
        <button
          onClick={() => setActiveFilter('ready')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            activeFilter === 'ready'
              ? 'bg-[#0D5C3A] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          পিকআপ বুথে প্রস্তুত ({
            orders.filter((o) => ['received_at_booth', 'ready_for_pickup'].includes(o.status)).length
          })
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            activeFilter === 'completed'
              ? 'bg-[#0D5C3A] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          সম্পন্ন ({orders.filter((o) => o.status === 'completed').length})
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-[#0D5C3A] animate-spin mx-auto mb-3" />
          <p className="text-stone-600 text-sm font-medium">অর্ডারের তথ্য লোড হচ্ছে...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            কোনো অর্ডার পাওয়া যায়নি
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mb-6">
            আপনি এখনো কোনো পণ্য অর্ডার করেননি অথবা নির্বাচিত ক্যাটাগরিতে কোনো অর্ডার নেই। সরাসরি ফ্যাক্টরি রেটে পণ্য পেতে ক্যাটালগ ঘুরে দেখুন।
          </p>
          <button
            onClick={onGoHome}
            className="px-6 py-2.5 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white font-bold text-sm shadow-sm inline-flex items-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>মার্কেটপ্লেস থেকে পণ্য কিনুন</span>
          </button>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isPhysical = !order.isDigitalOrder;
            const isReadyForPickup = order.status === 'ready_for_pickup' || order.status === 'received_at_booth';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                  isReadyForPickup
                    ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                    : 'border-stone-200'
                }`}
              >
                {/* Order Top Bar */}
                <div className="bg-stone-50/80 px-4 sm:px-6 py-3.5 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div>
                      <span className="text-[11px] text-stone-500 block leading-tight">অর্ডার আইডি</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-stone-900">
                        {order.id}
                      </span>
                    </div>

                    <div className="hidden sm:block w-px h-6 bg-stone-200" />

                    <div>
                      <span className="text-[11px] text-stone-500 block leading-tight">অর্ডারের তারিখ</span>
                      <span className="text-xs font-medium text-stone-700">
                        {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {order.sealInfo?.sealNumber && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300/80">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        নন-রিমুভাল সিল: #{order.sealInfo.sealNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4 sm:p-6 space-y-5">
                  {/* Item List */}
                  <div className="divide-y divide-stone-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start gap-4">
                        <img
                          src={item.imageUrl || '/images/academic_textbooks_1792159211354.jpg'}
                          alt={item.productTitle}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/academic_textbooks_1792159211354.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                            {item.productTitle}
                          </h4>

                          {item.selectedDesign && (
                            <p className="text-xs text-amber-900 font-semibold mt-0.5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              ডিজাইন/সাইজ: {item.selectedDesign}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-stone-500">
                            <span>পরিমাণ: {item.quantity}টি</span>
                            <span>•</span>
                            <span className="font-semibold text-stone-900">৳{item.unitPrice} প্রতি ইউনিট</span>
                            {item.isDigital && (
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                ডিজিটাল ফাইল
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm sm:text-base font-bold text-[#0D5C3A]">
                            ৳{item.unitPrice * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Physical Goods: Secret Pickup OTP & Custody Chain Box */}
                  {isPhysical && (
                    <div className="space-y-4 pt-2">
                      {/* Secret OTP Highlight Box */}
                      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 text-stone-800 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider">
                                গোপন ডেলিভারি কোড
                              </span>
                              <span className="text-xs text-emerald-900 font-bold">
                                {isReadyForPickup
                                  ? 'বুথ থেকে পার্সেল সংগ্রহের জন্য প্রযোজ্য'
                                  : 'পিকআপ বুথে পৌঁছালে এই কোডটি দেখাবেন'}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-800 mt-1">
                              পিকআপ পয়েন্ট কর্মী এই কোড মিলিয়ে আপনার ক্যাশ অন ডেলিভারি (৳{order.totalAmount}) সংগ্রহ করে পণ্য বুঝিয়ে দিবেন।
                            </p>
                          </div>

                          <div className="bg-white border-2 border-dashed border-emerald-500 px-4 py-2 rounded-xl text-center shadow-xs">
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block leading-tight">
                              সিক্রেট ওটিপি (OTP)
                            </span>
                            <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-[#0D5C3A]">
                              {order.handoverOtp || '7392'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4-Step Physical Custody Progression Bar */}
                      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-blue-600" />
                            ফ্যাক্টরি থেকে পিকআপ পয়েন্টের নিরাপত্তা চেইন
                          </span>
                          <button
                            onClick={() => onGoTracking(order.id)}
                            className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                          >
                            <span>লাইভ ট্র্যাকিং পেজে দেখুন</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                          {/* Step 1 */}
                          <div className={`p-2.5 rounded-xl border ${
                            ['in_production', 'sealed_at_factory', 'in_runner_custody', 'received_at_booth', 'ready_for_pickup', 'completed'].includes(order.status)
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-stone-200 text-stone-400'
                          }`}>
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center mx-auto mb-1 font-mono">
                              ১
                            </div>
                            <span className="text-[11px] block">ফ্যাক্টরি সিলযুক্ত প্যাকিং</span>
                          </div>

                          {/* Step 2 */}
                          <div className={`p-2.5 rounded-xl border ${
                            ['in_runner_custody', 'received_at_booth', 'ready_for_pickup', 'completed'].includes(order.status)
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-stone-200 text-stone-400'
                          }`}>
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center mx-auto mb-1 font-mono">
                              ২
                            </div>
                            <span className="text-[11px] block">রানার পরিবহন (পাবলিক বাস)</span>
                          </div>

                          {/* Step 3 */}
                          <div className={`p-2.5 rounded-xl border ${
                            ['received_at_booth', 'ready_for_pickup', 'completed'].includes(order.status)
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-stone-200 text-stone-400'
                          }`}>
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center mx-auto mb-1 font-mono">
                              ৩
                            </div>
                            <span className="text-[11px] block">৭ ক্যাম্পাস বুথে রিসিভ</span>
                          </div>

                          {/* Step 4 */}
                          <div className={`p-2.5 rounded-xl border ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-stone-200 text-stone-400'
                          }`}>
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center mx-auto mb-1 font-mono">
                              ৪
                            </div>
                            <span className="text-[11px] block">ক্যাশ পরিশোধ ও হস্তান্তর</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Digital Goods: Instant Unlock Box */}
                  {order.isDigitalOrder && (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold">
                            ডিজিটাল এক্সেস সক্রিয়
                          </span>
                          <span className="text-xs font-bold text-blue-900">
                            পেমেন্ট যাচাইকরণ সফল
                          </span>
                        </div>
                        <p className="text-xs text-blue-800">
                          বিকাশ/নগদ পেমেন্ট নিশ্চিত হয়েছে। আপনার ডিজিটাল স্টাডি নোট ও গাইড সরাসরি অনলাইন ভিউয়ারে পড়ুন অথবা ডাউনলোড করুন।
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveDigitalReader(order)}
                        className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span>নোট পড়ুন ও ডাউনলোড</span>
                      </button>
                    </div>
                  )}

                  {/* Order Footer Details (Campus Point, Total, Buttons) */}
                  <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-stone-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0D5C3A]" />
                        <span className="font-semibold text-stone-900">ডেলিভারি / পিকআপ পয়েন্ট:</span>
                        <span>
                          {order.pickupPointName} {order.sealInfo?.destinationCampusBn ? `(${order.sealInfo.destinationCampusBn})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900">পেমেন্ট মেথড:</span>
                        <span>
                          {order.paymentMethod === 'cash_on_pickup'
                            ? 'ক্যাশ অন ডেলিভারি (পিকআপ পয়েন্টে নগদ টাকা পরিশোধ)'
                            : `${order.paymentMethod.toUpperCase()} (ডিজিটাল পেমেন্ট)`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] text-stone-500 block leading-tight">সর্বমোট মূল্য</span>
                        <span className="text-lg sm:text-xl font-bold text-[#0D5C3A]">
                          ৳{order.totalAmount}
                        </span>
                      </div>

                      {order.status === 'completed' && !order.hasReviewed && (
                        <button
                          onClick={() => onOpenReview(order)}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 flex items-center gap-1.5 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          <span>রিভিউ দিন</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Content Reader Modal when user clicks 'নোট পড়ুন ও ডাউনলোড' */}
      {activeDigitalReader && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in duration-150">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  ডিজিটাল নোটস ও স্টাডি ফাইল ভিউয়ার
                </h3>
              </div>
              <button
                onClick={() => setActiveDigitalReader(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>আপনার পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে। নিচে ডিজিটাল ম্যাটেরিয়ালস উন্মুক্ত করা হলো:</span>
              </div>

              {activeDigitalReader.items.map((item, i) => (
                <div key={i} className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
                  <h4 className="font-bold text-stone-900 text-sm">{item.productTitle}</h4>
                  <div className="p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 leading-relaxed font-serif">
                    <p className="font-semibold text-stone-900 mb-1">📘 ফুল কোর্স ম্যাটেরিয়াল সারসংক্ষেপ ও লেকচার নোট:</p>
                    <p>
                      ঢাকা সেন্ট্রাল ইউনিভার্সিটির সকল অ্যাফিলিয়েটেড ৭ কলেজের ৩য় ও ৪র্থ বর্ষের পরীক্ষার সিলেবাস ভিত্তিক ফাইনাল রিভিশন লেকচার। বিগত ৫ বছরের বোর্ড প্রশ্ন সমাধান, রেফারেন্স বইয়ের গুরুত্বপূর্ণ থিওরেম এবং শর্টকাট টেকনিক সংকলিত।
                    </p>
                    <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 font-mono">
                      ফাইলের সাইজ: ৪.৫ মেগাবাইট · ফরম্যাট: PDF ( searchable & printable )
                    </div>
                  </div>

                  <a
                    href={`/api/products/${item.productId}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>অফলাইন কপি (PDF) ডাউনলোড করুন</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 text-right">
              <button
                onClick={() => setActiveDigitalReader(null)}
                className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
