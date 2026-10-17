import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  RefreshCw,
  CheckCircle,
  ShieldAlert,
  Bus,
  Coins,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Order, Campus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface DeliveryRunnerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: Campus[];
  onOrderUpdated: () => void;
}

export const DeliveryRunnerDashboard: React.FC<DeliveryRunnerDashboardProps> = ({
  isOpen,
  onClose,
  campuses,
  onOrderUpdated,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'factory_pickup' | 'active_transit' | 'history'>('factory_pickup');
  const [actionMsg, setActionMsg] = useState<string>('');

  const fetchDeliveryOrders = async () => {
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
      console.error('Failed to load delivery orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDeliveryOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Runner takes custody from Factory
  const handleRunnerFactoryPickup = async (orderId: string) => {
    setActionMsg('');
    try {
      const res = await fetch(`/api/orders/${orderId}/runner-pickup`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          runnerId: user?.id,
          runnerName: user?.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`পার্সেল #${orderId} এর দায়ভার আনুষ্ঠানিকভাবে আপনার অধীনে নেওয়া হয়েছে। পাবলিক বাসে যাত্রা শুরু করুন।`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Failed to take factory custody:', err);
    }
  };

  // 2. Runner hands over custody to Campus Booth Staff
  const handleRunnerBoothHandoff = async (orderId: string) => {
    setActionMsg('');
    try {
      const res = await fetch(`/api/orders/${orderId}/booth-receive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          staffId: 'user-pickup-1',
          staffName: 'ক্যাম্পাস বুথ প্রতিনিধি',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`পার্সেল #${orderId} সফলভাবে ক্যাম্পাসের পিকআপ বুথ কর্মীর কাছে হস্তান্তর সম্পন্ন হয়েছে।`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Failed to hand over to booth:', err);
    }
  };

  // Filter orders by runner workflow
  const factoryPickupOrders = orders.filter(
    (o) => !o.isDigitalOrder && (o.status === 'sealed_at_factory' || o.status === 'in_production')
  );
  const inTransitOrders = orders.filter(
    (o) => !o.isDigitalOrder && (o.status === 'in_runner_custody' || o.currentCustody === 'delivery_runner')
  );
  const deliveredOrders = orders.filter(
    (o) => !o.isDigitalOrder && (o.status === 'ready_for_pickup' || o.status === 'received_at_booth' || o.status === 'completed')
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-blue-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-amber-300">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                ক্যাম্পাস ডেলিভারি রানার ড্যাশবোর্ড
              </h2>
              <p className="text-xs text-blue-200">
                রানার: {user?.name} · দৈনিক পাবলিক বাস রুট (স্টুডেন্ট আইডি হাফ-পাস নেটওয়ার্ক)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDeliveryOrders}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Operational Banner */}
        <div className="p-3.5 bg-blue-50/80 border-b border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">রানার দায়ভার ও ট্রানজিট নির্দেশিকা:</span>
            <p className="text-stone-700 text-[11px] mt-0.5">
              ফ্যাক্টরি থেকে পণ্য সংগ্রহের সময় সিল নম্বর, আইটেম ও ক্যাশ মূল্য মিলিয়ে নিন। ফ্যাক্টরি থেকে পিকআপ পয়েন্ট পর্যন্ত সম্পূর্ণ দায়ভার রানারের। প্রতিদিন ১ বার পাবলিক পরিবহনে স্টুডেন্ট আইডি ব্যবহার করে ৭ ক্যাম্পাসের বুথে পার্সেল পৌঁছে দিন।
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-stone-200 flex gap-4 bg-stone-50/50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('factory_pickup')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'factory_pickup'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>ফ্যাক্টরি পার্সেল পিকআপ</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-900 font-mono">
              {factoryPickupOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active_transit')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'active_transit'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>আমার জিম্মায় ট্রানজিটে আছে</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono">
              {inTransitOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>বুথ ডেলিভারি সম্পন্ন</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono">
              {deliveredOrders.length}
            </span>
          </button>
        </div>

        {/* Feedback message */}
        {actionMsg && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              রানার ট্রানজিট টাস্ক লোড হচ্ছে...
            </div>
          ) : (
            <>
              {/* Tab 1: Factory Pickup */}
              {activeTab === 'factory_pickup' && (
                factoryPickupOrders.length === 0 ? (
                  <div className="py-12 text-center text-stone-400">
                    <Truck className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">ফ্যাক্টরিতে কোনো পার্সেল অপেক্ষমান নেই</p>
                  </div>
                ) : (
                  factoryPickupOrders.map((order) => {
                    const destCampus = campuses.find((c) => c.id === order.campusId);
                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
                          <div className="text-xs">
                            <span className="font-mono font-bold text-blue-900">#{order.id}</span>
                            <span className="mx-1.5 text-stone-300">|</span>
                            <span className="text-stone-600">গন্তব্য: <strong>{destCampus?.nameBn}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                              {order.sealInfo ? `সিল নং: ${order.sealInfo.sealNumber}` : 'ফ্যাক্টরি সিল প্রস্তুত'}
                            </span>
                            <span className="font-mono font-bold text-xs text-[#0D5C3A]">
                              আদায়যোগ্য: ৳ {order.totalAmount}
                            </span>
                          </div>
                        </div>

                        {/* Route & Booth */}
                        <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                          <p className="font-semibold text-stone-800">
                            বুথ পয়েন্ট: <span className="text-[#0D5C3A]">{order.pickupPointName}</span>
                          </p>
                          <p className="text-stone-600 text-[11px]">
                            আইটেম: {order.items[0]?.productTitle} {order.items[0]?.selectedDesign ? `(ডিজাইন: ${order.items[0].selectedDesign})` : ''} ({order.items[0]?.quantity}টি)
                          </p>
                        </div>

                        {/* Handover Action */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200">
                          <span className="text-[11px] text-stone-500">
                            ফ্যাক্টরি ইনচার্জ: {order.sealInfo?.factoryInspector || 'মিরপুর ফ্যাক্টরি'}
                          </span>
                          <button
                            onClick={() => handleRunnerFactoryPickup(order.id)}
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-800 hover:bg-blue-900 text-white shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-300" />
                            <span>সিল মিলিয়ে দায়ভার গ্রহণ করুন ও বাসে যাত্রা শুরু করুন</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              )}

              {/* Tab 2: In Runner Transit */}
              {activeTab === 'active_transit' && (
                inTransitOrders.length === 0 ? (
                  <div className="py-12 text-center text-stone-400">
                    <Bus className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">বর্তমানে কোনো পার্সেল ট্রানজিটে নেই</p>
                    <p className="text-xs text-stone-400 mt-1">ফ্যাক্টরি থেকে পার্সেল বুঝে নিলে এখানে প্রদর্শিত হবে।</p>
                  </div>
                ) : (
                  inTransitOrders.map((order) => {
                    const destCampus = campuses.find((c) => c.id === order.campusId);
                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                          <div className="text-xs">
                            <span className="font-mono font-bold text-amber-950 text-sm">#{order.id}</span>
                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                              আপনার জিম্মায় পাবলিক বাসে
                            </span>
                          </div>
                          <span className="font-mono font-extrabold text-sm text-[#0D5C3A]">
                            আদায়যোগ্য ক্যাশ: ৳ {order.totalAmount}
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-stone-400 text-[10px] block">গন্তব্য কলেজ:</span>
                            <span className="font-bold text-stone-900">{destCampus?.nameBn}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block">নির্দিষ্ট পিকআপ বুথ:</span>
                            <span className="font-bold text-[#0D5C3A]">{order.pickupPointName}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block">সিল নম্বর:</span>
                            <span className="font-mono font-bold text-indigo-700">{order.sealInfo?.sealNumber || 'SEAL-DCU-9842'}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block">শিক্ষার্থী ক্রেতা:</span>
                            <span className="font-medium text-stone-800">{order.buyerName} ({order.buyerPhone})</span>
                          </div>
                        </div>

                        {/* Handover Action to Campus Booth */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200">
                          <span className="text-[11px] text-amber-900 font-medium">
                            ক্যাম্পাসে পৌঁছে বুথ কর্মীকে সিল পরীক্ষা করতে দিন
                          </span>
                          <button
                            onClick={() => handleRunnerBoothHandoff(order.id)}
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-200" />
                            <span>ক্যাম্পাস বুথ কর্মীর কাছে পার্সেল হস্তান্তর করুন</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              )}

              {/* Tab 3: History */}
              {activeTab === 'history' && (
                deliveredOrders.length === 0 ? (
                  <div className="py-12 text-center text-stone-400">
                    <CheckCircle className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">এখনো কোনো ডেলিভারি সম্পন্ন হয়নি</p>
                  </div>
                ) : (
                  deliveredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">#{order.id}</span>
                          <span className="text-stone-400">·</span>
                          <span className="font-semibold text-[#0D5C3A]">{order.campusId}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          বুথ: {order.pickupPointName} · সিল: {order.sealInfo?.sealNumber || 'যাচাইকৃত'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#0D5C3A]">৳ {order.totalAmount}</span>
                        <span className="block text-[10px] text-emerald-700 font-bold">
                          {order.status === 'completed' ? 'শিক্ষার্থী গ্রহণ সম্পন্ন' : 'বুথে মজুদ'}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
