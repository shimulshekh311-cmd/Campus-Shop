import React, { useState, useEffect } from 'react';
import {
  X,
  Factory,
  Package,
  CheckCircle,
  Clock,
  Shirt,
  RefreshCw,
  ShieldCheck,
  Tag,
  MapPin,
  Coins,
  FileCheck,
} from 'lucide-react';
import { Order, Campus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface FactoryStaffDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: Campus[];
  onOrderUpdated: () => void;
}

export const FactoryStaffDashboard: React.FC<FactoryStaffDashboardProps> = ({
  isOpen,
  onClose,
  campuses,
  onOrderUpdated,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inspectedSealOrder, setInspectedSealOrder] = useState<Order | null>(null);

  const fetchFactoryOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${user?.id}`, {
        headers: { 'x-user-id': user?.id || '' },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load factory orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFactoryOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFactorySealAndPack = async (orderId: string) => {
    try {
      const sealNumber = `SEAL-DCU-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await fetch(`/api/orders/${orderId}/factory-seal`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          inspectorName: user?.name || 'ফ্যাক্টরি কোয়ালিটি কন্ট্রোলার',
          sealNumber,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        setInspectedSealOrder(data.order);
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Failed to seal package:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-amber-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-900 flex items-center justify-center text-amber-300">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                ক্যাম্পাস মার্চেন্ডাইজ ফ্যাক্টরি ও প্রোডাকশন ইউনিট
              </h2>
              <p className="text-xs text-amber-200">
                ইনচার্জ: {user?.name} · {user?.factoryName || 'মিরপুর নিটওয়্যার টেক্সটাইল ও ব্যাগ ম্যানুফ্যাকচারিং'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFactoryOrders}
              className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Accountability Guidelines Banner */}
        <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold">ফ্যাক্টরি কোয়ালিটি ও দায়ভার হস্তান্তর নীতি:</p>
            <p className="text-stone-700 text-[11px] mt-0.5">
              শিক্ষার্থীদের সর্বনিম্ন মূল্যে পণ্য নিশ্চিত করতে সরাসরি ফ্যাক্টরি থেকে উৎপাদন করা হয়। উৎপাদনের পর প্যাকেটে নন-রিমুভাল সিল স্লিপ (পণ্য তথ্য, ডিজাইন, ও ক্যাশ মূল্য) লাগিয়ে রানারের নিকট হস্তান্তর কোড দিয়ে হস্তান্তর সম্পন্ন করুন। রানার বুঝে নেওয়ার পূর্ব পর্যন্ত দায়ভার ফ্যাক্টরির।
            </p>
          </div>
        </div>

        {/* Orders list */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              ফ্যাক্টরি ব্যাচ লোড হচ্ছে...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Factory className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">
                বর্তমানে কোনো প্রোডাকশন অর্ডার অপেক্ষমান নেই
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const destCampus = campuses.find((c) => c.id === order.campusId);
              const isSealed = Boolean(order.sealInfo) || order.status === 'sealed_at_factory';

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-2.5">
                    <div className="text-xs">
                      <span className="font-mono font-bold text-amber-950 text-sm">
                        #{order.id}
                      </span>
                      <span className="mx-1.5 text-stone-300">|</span>
                      <span className="text-stone-600">
                        ক্রেতা: <strong>{order.buyerName}</strong> ({order.buyerPhone})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                        order.status === 'in_production'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : order.status === 'sealed_at_factory'
                          ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                          : order.status === 'in_runner_custody'
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      }`}>
                        {order.status === 'in_production'
                          ? 'উৎপাদন ও সুইং চলছে'
                          : order.status === 'sealed_at_factory'
                          ? 'সিলযুক্ত (রানার সংগ্রহের অপেক্ষায়)'
                          : order.status === 'in_runner_custody'
                          ? 'রানার ট্রানজিটে (ফ্যাক্টরি হস্তান্তর সম্পন্ন)'
                          : order.status === 'completed'
                          ? 'ডেলিভারি সম্পন্ন'
                          : order.status}
                      </span>
                      <span className="font-mono font-bold text-sm text-[#0D5C3A]">
                        ৳ {order.totalAmount.toLocaleString()} (ক্যাশ)
                      </span>
                    </div>
                  </div>

                  {/* Destination & Pickup Booth Info */}
                  <div className="p-3 bg-white rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <MapPin className="w-3.5 h-3.5 text-[#0D5C3A] shrink-0" />
                      <span className="text-stone-500">গন্তব্য ক্যাম্পাস:</span>
                      <span className="font-bold text-stone-900">{destCampus?.nameBn}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="text-stone-500">বুথ পয়েন্ট:</span>
                      <span className="font-medium text-stone-900 truncate">{order.pickupPointName}</span>
                    </div>
                  </div>

                  {/* Items List with Selected Design */}
                  <div className="space-y-1.5 text-xs bg-stone-100/60 p-3 rounded-xl border border-stone-200/60">
                    <div className="text-[11px] font-bold text-stone-600 mb-1">অর্ডারকৃত আইটেম ও স্পেসিফিকেশন:</div>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex flex-wrap items-center justify-between text-stone-800">
                        <span className="font-medium">• {it.productTitle}</span>
                        <div className="flex items-center gap-3">
                          {it.selectedDesign && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                              ডিজাইন: {it.selectedDesign}
                            </span>
                          )}
                          <span className="font-mono text-stone-600 font-semibold">{it.quantity}টি</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seal Info Box if already sealed */}
                  {order.sealInfo && (
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                        <div>
                          <p className="font-bold text-indigo-950">
                            নন-রিমুভাল সিল নং: <span className="font-mono">{order.sealInfo.sealNumber}</span>
                          </p>
                          <p className="text-[11px] text-indigo-800 mt-0.5">
                            আদায়যোগ্য ক্যাশ: ৳ {order.sealInfo.priceToCollect} · ইন্সপেক্টর: {order.sealInfo.factoryInspector}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectedSealOrder(order)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs shrink-0"
                      >
                        সিল স্লিপ দেখুন
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80">
                    <span className="text-[11px] text-stone-500">
                      বর্তমান দায়িত্বপ্রাপ্ত: <strong>{order.currentCustody === 'factory' ? 'ফ্যাক্টরি প্রোডাকশন' : order.currentCustody === 'delivery_runner' ? 'ডেলিভারি রানার (সাব্বির)' : order.currentCustody}</strong>
                    </span>

                    {order.status === 'in_production' && (
                      <button
                        onClick={() => handleFactorySealAndPack(order.id)}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-800 text-white hover:bg-amber-900 transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        <span>কোয়ালিটি চেক ও সিকিউরিটি সিল তৈরি (Seal & Pack)</span>
                      </button>
                    )}

                    {order.status === 'sealed_at_factory' && (
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        রানার হ্যান্ডওভারের জন্য প্রস্তুত (Transit Ready)
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal: View Factory Handover & Seal Security Slip */}
        {inspectedSealOrder && (
          <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-300 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-stone-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <h3 className="font-bold text-sm text-stone-900">ফ্যাক্টরি সিকিউরিটি হ্যান্ডওভার স্লিপ</h3>
                </div>
                <button
                  onClick={() => setInspectedSealOrder(null)}
                  className="p-1 text-stone-400 hover:text-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2.5 font-mono">
                <div className="flex justify-between border-b pb-1.5 border-stone-200">
                  <span className="text-stone-500">সিল ট্র্যাকিং কোড:</span>
                  <span className="font-bold text-indigo-700">{inspectedSealOrder.sealInfo?.sealNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-stone-200">
                  <span className="text-stone-500">অর্ডার নম্বর:</span>
                  <span className="font-bold text-stone-800">#{inspectedSealOrder.id}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-stone-200">
                  <span className="text-stone-500">গন্তব্য ক্যাম্পাস:</span>
                  <span className="font-bold text-stone-800">{inspectedSealOrder.campusId}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-stone-200">
                  <span className="text-stone-500">বুথ পয়েন্ট:</span>
                  <span className="font-bold text-stone-800">{inspectedSealOrder.pickupPointName}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-stone-200">
                  <span className="text-stone-500">আইটেম বিবরণ:</span>
                  <span className="font-bold text-stone-800">{inspectedSealOrder.items[0]?.productTitle}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-stone-200 text-sm">
                  <span className="text-stone-900 font-bold">আদায়যোগ্য ক্যাশ:</span>
                  <span className="font-extrabold text-[#0D5C3A]">৳ {inspectedSealOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-stone-500">ইন্সপেক্টর:</span>
                  <span className="font-semibold text-stone-800">{inspectedSealOrder.sealInfo?.factoryInspector}</span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-normal text-center">
                এই নন-রিমুভাল সিল পার্সেলের উপর আটকানো থাকে। রানার এটি অক্ষত দেখে গ্রহণ করবে এবং বুথ কর্মী সিল যাচাই করে সংরক্ষণ করবে।
              </p>

              <button
                onClick={() => setInspectedSealOrder(null)}
                className="w-full h-10 rounded-xl bg-[#0D5C3A] text-white font-bold text-xs hover:bg-[#09432a]"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
