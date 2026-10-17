import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReview: (order: Order) => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  onOpenReview,
}) => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
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
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            অর্ডার গৃহীত (Placed)
          </span>
        );
      case 'in_production':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            ফ্যাক্টরি প্রোডাকশন (In Production)
          </span>
        );
      case 'sealed_at_factory':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            ফ্যাক্টরি সিল সম্পন্ন (Factory Sealed)
          </span>
        );
      case 'in_runner_custody':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 animate-pulse">
            বাসে রানার ট্রানজিটে (In Transit via Bus)
          </span>
        );
      case 'received_at_booth':
      case 'ready_for_pickup':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            বুথে পিকআপের জন্য প্রস্তুত (Ready at Booth)
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
            হস্তান্তর সম্পন্ন (Delivered & Paid)
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            বাতিল (Cancelled)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0D5C3A]" />
            <h2 className="text-base font-bold text-stone-900">
              {lang === 'bn' ? 'আমার ক্যাম্পাস অর্ডার হিস্ট্রি' : 'My Campus Orders'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              অর্ডার লোড হচ্ছে...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">
                এখনো কোনো অর্ডার নেই
              </p>
              <p className="text-xs text-stone-400 mt-1">
                পণ্য নির্বাচন করে ক্যাম্পাসের পিকআপ পয়েন্টে দেখা করার অর্ডার দিন।
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-50/60 rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-3"
              >
                {/* Top Row: Order ID, Status, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-[#0D5C3A]">
                      #{order.id}
                    </span>
                    <span className="text-stone-400 text-xs">·</span>
                    <span className="text-xs text-stone-500">
                      বিক্রেতা: <strong className="text-stone-800">{order.sellerName}</strong>
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items in order */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.imageUrl || '/src/assets/images/academic_textbooks_1792159211354.jpg'}
                          alt={item.productTitle}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-semibold text-stone-900 line-clamp-1">
                            {item.productTitle}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            পরিমাণ: {item.quantity}টি
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        ৳ {(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Physical Goods: Secret Pickup OTP & Custody Chain */}
                {!order.isDigitalOrder && (
                  <div className="space-y-2">
                    {/* Secret OTP Box for student verification */}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <div className="bg-teal-50/90 border border-teal-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                            আপনার গোপন পিকআপ কোড (Secret OTP):
                          </p>
                          <p className="text-[11px] text-teal-800 mt-0.5">
                            পিকআপ বুথ কর্মীকে এই ওটিপি মিলিয়ে পণ্য বুঝে নেবেন এবং ক্যাশ ৳ {order.totalAmount} প্রদান করবেন।
                          </p>
                        </div>
                        <div className="text-right sm:text-center shrink-0">
                          <span className="inline-block px-3 py-1 font-mono font-extrabold text-base text-teal-900 bg-white rounded-lg border border-teal-300 shadow-2xs tracking-widest">
                            {order.handoverOtp || '4821'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 4-Step Custody Timeline */}
                    <div className="bg-white rounded-xl p-3 border border-stone-200/80 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-stone-700 mb-2">
                        <span>পণ্য দায়ভার ও ট্র্যাকিং চেইন:</span>
                        <span className="text-[10px] text-stone-500 font-normal">
                          {order.sealInfo ? `সিল নং: ${order.sealInfo.sealNumber}` : 'যাচাইকৃত পার্সেল'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        <div className={`p-1.5 rounded-lg ${['in_production', 'sealed_at_factory', 'in_runner_custody', 'received_at_booth', 'ready_for_pickup', 'completed'].includes(order.status) ? 'bg-amber-100/80 text-amber-900 font-bold' : 'bg-stone-100 text-stone-400'}`}>
                          ১. ফ্যাক্টরি সিল
                        </div>
                        <div className={`p-1.5 rounded-lg ${['in_runner_custody', 'received_at_booth', 'ready_for_pickup', 'completed'].includes(order.status) ? 'bg-blue-100/80 text-blue-900 font-bold' : 'bg-stone-100 text-stone-400'}`}>
                          ২. বাস ট্রানজিট
                        </div>
                        <div className={`p-1.5 rounded-lg ${['received_at_booth', 'ready_for_pickup', 'completed'].includes(order.status) ? 'bg-emerald-100/80 text-emerald-900 font-bold' : 'bg-stone-100 text-stone-400'}`}>
                          ৩. বুথে মজুদ
                        </div>
                        <div className={`p-1.5 rounded-lg ${order.status === 'completed' ? 'bg-[#0D5C3A] text-white font-bold' : 'bg-stone-100 text-stone-400'}`}>
                          ৪. শিক্ষার্থী গ্রহণ
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital Order Instant Access */}
                {order.isDigitalOrder && (
                  <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-blue-950">ডিজিটাল পণ্য তাৎক্ষণিক এক্সেস সক্রিয়!</p>
                      <p className="text-[11px] text-blue-800">
                        পেমেন্ট যাচাই সফল হয়েছে। আপনি এখনই আপনার ডিজিটাল ফাইল পড়তে ও ডাউনলোড করতে পারেন।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`ডিজিটাল ফাইল অ্যাক্সেস: ${order.items[0]?.productTitle || 'নোটস'} ডাউনলোড শুরু হয়েছে।`)}
                      className="px-3 py-1.5 rounded-lg bg-[#0D5C3A] hover:bg-[#09432a] text-white font-bold text-xs shrink-0 shadow-2xs"
                    >
                      ডাউনলোড করুন
                    </button>
                  </div>
                )}

                {/* Pickup Details Box */}
                <div className="bg-white rounded-xl p-3 border border-stone-200/70 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-[#0D5C3A] shrink-0" />
                    <span className="text-stone-500">পিকআপ:</span>
                    <span className="font-medium text-stone-900 truncate">
                      {order.pickupPointName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="text-stone-500">সময়:</span>
                    <span className="font-medium text-stone-900">
                      {order.preferredDateTime}
                    </span>
                  </div>
                </div>

                {/* Footer: Payment & Review Action */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80">
                  <div className="text-xs">
                    <span className="text-stone-500">পেমেন্ট: </span>
                    <strong className="text-stone-800">
                      {order.paymentMethod === 'cash_on_pickup'
                        ? 'ক্যাশ অন পিকআপ (হাতে হাতে)'
                        : `${order.paymentMethod.toUpperCase()} (TrxID: ${order.transactionId || 'পেইড'})`}
                    </strong>
                    <span className="ml-1 text-[11px] font-semibold text-emerald-700">
                      ({order.paymentStatus === 'verified' ? 'পেইড' : 'অপেক্ষমান'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-[#0D5C3A]">
                      মোট: ৳ {order.totalAmount.toLocaleString()}
                    </span>

                    {order.status === 'completed' && !order.hasReviewed && (
                      <button
                        onClick={() => {
                          onOpenReview(order);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 transition-colors"
                      >
                        <Star className="w-3 h-3 fill-white" />
                        <span>রিভিউ দিন</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
