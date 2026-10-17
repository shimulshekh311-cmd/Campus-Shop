import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Package,
  CheckCircle,
  KeyRound,
  Phone,
  RefreshCw,
  Clock,
  AlertCircle,
  ShieldCheck,
  Coins,
  Search,
  Check,
} from 'lucide-react';
import { Order, Campus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface PickupStaffDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: Campus[];
  onOrderUpdated: () => void;
}

export const PickupStaffDashboard: React.FC<PickupStaffDashboardProps> = ({
  isOpen,
  onClose,
  campuses,
  onOrderUpdated,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'student_handover' | 'runner_intake' | 'completed'>('student_handover');
  
  // Handover state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [cashCollected, setCashCollected] = useState<boolean>(false);
  const [handoverError, setHandoverError] = useState<string>('');
  const [handoverSuccess, setHandoverSuccess] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const fetchPickupOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`, {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load pickup orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPickupOrders();
      setHandoverError('');
      setHandoverSuccess('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const currentCampus = campuses.find((c) => c.id === user?.campusId);

  // 1. Receive parcel from delivery runner into booth custody
  const handleIntakeFromRunner = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/booth-receive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          staffId: user?.id,
          staffName: user?.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        setHandoverSuccess(`পার্সেল #${orderId} রানার থেকে বুঝে নিয়ে বুথ স্টকে এন্ট্রি সম্পন্ন হয়েছে।`);
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Failed to receive from runner:', err);
    }
  };

  // 2. Student secret OTP verification and cash collection
  const handleCompleteStudentHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandoverError('');
    setHandoverSuccess('');

    if (!selectedOrder) return;

    if (!enteredOtp.trim()) {
      setHandoverError('শিক্ষার্থীর গোপন ওটিপি (OTP) কোডটি প্রবেশ করান।');
      return;
    }

    if (!cashCollected) {
      setHandoverError('শিক্ষার্থীর কাছ থেকে পুরো ক্যাশ টাকা বুঝে নিয়ে চেকবক্সে টিক দিন।');
      return;
    }

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/booth-handover`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          staffName: user?.name,
          otp: enteredOtp.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? data.order : o))
        );
        setHandoverSuccess(`অভিনন্দন! অর্ডার #${selectedOrder.id} এর ৳ ${selectedOrder.totalAmount} ক্যাশ আদায় ও শিক্ষার্থীকে হস্তান্তর সফল হয়েছে।`);
        setSelectedOrder(null);
        setEnteredOtp('');
        setCashCollected(false);
        onOrderUpdated();
      } else {
        setHandoverError(data.message || 'ওটিপি ভেরিফিকেশন ব্যর্থ হয়েছে। কোড মিলিয়ে আবার চেষ্টা করুন।');
      }
    } catch {
      setHandoverError('সার্ভার যোগাযোগ ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    }
  };

  // Categorize orders
  const runnerIntakeOrders = orders.filter(
    (o) => !o.isDigitalOrder && (o.status === 'in_runner_custody' || o.status === 'sealed_at_factory')
  );

  const readyForStudentOrders = orders.filter(
    (o) => !o.isDigitalOrder && (o.status === 'ready_for_pickup' || o.status === 'received_at_booth')
  );

  const completedOrders = orders.filter(
    (o) => o.status === 'completed'
  );

  // Search filter
  const filteredReadyOrders = readyForStudentOrders.filter((o) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      o.id.toLowerCase().includes(q) ||
      o.buyerName.toLowerCase().includes(q) ||
      o.buyerPhone.includes(q) ||
      (o.sealInfo?.sealNumber && o.sealInfo.sealNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-teal-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-900 flex items-center justify-center text-amber-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                ক্যাম্পাস পিকআপ পয়েন্ট কর্মী ড্যাশবোর্ড
              </h2>
              <p className="text-xs text-teal-200">
                বুথ কর্মী: {user?.name} · {currentCampus?.nameBn || 'ঢাকা কলেজ'} বুথ নেটওয়ার্ক
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPickupOrders}
              className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-900"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Operational Banner */}
        <div className="p-3.5 bg-teal-50 border-b border-teal-200 text-xs text-teal-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">বুথ কর্মী দায়ভার ও ক্যাশ কালেকশন নিয়মাবলী:</span>
            <p className="text-stone-700 text-[11px] mt-0.5">
              ১. রানার আসলে পার্সেলের সিল ও দাম মিলিয়ে বুঝে নিন। ২. শিক্ষার্থী আসলে শিক্ষার্থীর অ্যাপে প্রদর্শিত গোপন ওটিপি (Secret OTP) মিলিয়ে নিন এবং নগদ টাকা বুঝে নিয়ে হস্তান্তর সম্পন্ন করুন। ওটিপি ছাড়া কোনো পণ্য হস্তান্তর করা যাবে না।
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-stone-200 flex gap-4 bg-stone-50/50 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('student_handover');
              setHandoverError('');
            }}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'student_handover'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>শিক্ষার্থী ডেলিভারি ও ক্যাশ কালেকশন</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-900 font-mono">
              {readyForStudentOrders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('runner_intake');
              setHandoverError('');
            }}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'runner_intake'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>রানার থেকে পার্সেল গ্রহণ</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono">
              {runnerIntakeOrders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('completed');
              setHandoverError('');
            }}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>সম্পন্ন ও ক্যাশ হিস্ট্রি</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-800 font-mono">
              {completedOrders.length}
            </span>
          </button>
        </div>

        {/* Success Banner */}
        {handoverSuccess && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{handoverSuccess}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              বুথ পার্সেল ডাটা লোড হচ্ছে...
            </div>
          ) : (
            <>
              {/* TAB 1: Student Delivery & Cash Collection */}
              {activeTab === 'student_handover' && (
                <div className="space-y-4">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="শিক্ষার্থীর নাম, মোবাইল নম্বর বা অর্ডার আইডি দিয়ে খুঁজুন..."
                      className="w-full h-10 pl-10 pr-3 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:border-teal-700 shadow-2xs"
                    />
                  </div>

                  {filteredReadyOrders.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <Package className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-stone-700">বুথে শিক্ষার্থী সংগ্রহের জন্য কোনো পার্সেল অপেক্ষমান নেই</p>
                      <p className="text-xs text-stone-400 mt-1">রানার পার্সেল পৌঁছে দিলে এখানে তালিকাভুক্ত হবে।</p>
                    </div>
                  ) : (
                    filteredReadyOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
                          <div className="text-xs">
                            <span className="font-mono font-bold text-teal-950 text-sm">#{order.id}</span>
                            <span className="mx-1.5 text-stone-300">|</span>
                            <span className="text-stone-700 font-semibold">
                              শিক্ষার্থী: {order.buyerName} ({order.buyerPhone})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                              বুথে মজুদ
                            </span>
                            <span className="font-mono font-extrabold text-sm text-[#0D5C3A]">
                              আদায়যোগ্য: ৳ {order.totalAmount}
                            </span>
                          </div>
                        </div>

                        {/* Order info */}
                        <div className="bg-white p-3 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-stone-400 text-[10px] block">আইটেম বিবরণ:</span>
                            <span className="font-medium text-stone-900">
                              {order.items[0]?.productTitle} {order.items[0]?.selectedDesign ? `(ডিজাইন: ${order.items[0].selectedDesign})` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block">সিল ট্র্যাকিং:</span>
                            <span className="font-mono font-bold text-indigo-700">
                              {order.sealInfo?.sealNumber || 'SEAL-DCU-9842'}
                            </span>
                          </div>
                        </div>

                        {/* Action: Open OTP & Cash Input */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200">
                          <span className="text-[11px] text-stone-500">
                            পেমেন্ট পদ্ধতি: <strong>ক্যাশ অন পিকআপ (হাতে হাতে টাকা)</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setEnteredOtp('');
                              setCashCollected(false);
                              setHandoverError('');
                            }}
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-800 hover:bg-teal-900 text-white shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <KeyRound className="w-4 h-4 text-amber-300" />
                            <span>শিক্ষার্থীর ওটিপি ও ক্যাশ মিলিয়ে ডেলিভারি দিন</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: Runner Intake */}
              {activeTab === 'runner_intake' && (
                runnerIntakeOrders.length === 0 ? (
                  <div className="py-12 text-center text-stone-400">
                    <Clock className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">রানার থেকে কোনো ইনটেক পার্সেল অপেক্ষমান নেই</p>
                  </div>
                ) : (
                  runnerIntakeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2 text-xs">
                        <span className="font-mono font-bold text-stone-900">#{order.id}</span>
                        <span className="font-mono font-bold text-sm text-[#0D5C3A]">
                          ৳ {order.totalAmount} (ক্যাশ)
                        </span>
                      </div>
                      <div className="text-xs text-stone-700">
                        <p>সিল নং: <strong>{order.sealInfo?.sealNumber || 'SEAL-DCU-XXXX'}</strong></p>
                        <p className="text-stone-500 text-[11px] mt-0.5">আইটেম: {order.items[0]?.productTitle}</p>
                      </div>
                      <div className="pt-2 flex justify-end border-t border-stone-200">
                        <button
                          onClick={() => handleIntakeFromRunner(order.id)}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>সিল অক্ষত আছে — বুথে দায়ভার গ্রহণ করুন</span>
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* TAB 3: Completed & Cash History */}
              {activeTab === 'completed' && (
                completedOrders.length === 0 ? (
                  <div className="py-12 text-center text-stone-400">
                    <CheckCircle className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">এখনো কোনো ডেলিভারি রেকর্ড নেই</p>
                  </div>
                ) : (
                  completedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">#{order.id}</span>
                          <span className="text-stone-400">·</span>
                          <span className="font-semibold text-stone-800">{order.buyerName}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          ওটিপি ভেরিফাইড ({order.handoverOtp}) · সম্পন্ন: {new Date(order.completedAt || order.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#0D5C3A]">৳ {order.totalAmount}</span>
                        <span className="block text-[10px] text-emerald-700 font-bold">ক্যাশ সংগৃহীত</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </>
          )}
        </div>

        {/* Modal: Student Secret OTP Verification & Cash Entry */}
        {selectedOrder && (
          <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-300 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-stone-200">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-teal-700" />
                  <h3 className="font-bold text-sm text-stone-900">শিক্ষার্থী ওটিপি ও ক্যাশ কালেকশন</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-stone-400 hover:text-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2">
                <div className="flex justify-between border-b pb-1.5 border-stone-200">
                  <span className="text-stone-500">অর্ডার নম্বর:</span>
                  <span className="font-mono font-bold text-stone-900">#{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-stone-200">
                  <span className="text-stone-500">শিক্ষার্থী ক্রেতা:</span>
                  <span className="font-bold text-stone-900">{selectedOrder.buyerName}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-stone-200">
                  <span className="text-stone-500">মোবাইল নম্বর:</span>
                  <span className="font-mono font-semibold text-stone-800">{selectedOrder.buyerPhone}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-stone-900">আদায়যোগ্য ক্যাশ:</span>
                  <span className="text-[#0D5C3A] font-mono">৳ {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {handoverError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{handoverError}</span>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleCompleteStudentHandover} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    শিক্ষার্থীর প্রদর্শিত ৪-সংখ্যার গোপন ওটিপি (Secret OTP):
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="যেমন: 4821"
                    className="w-full h-12 text-center text-lg font-mono font-bold tracking-widest rounded-xl border border-teal-300 bg-teal-50/50 text-teal-950 focus:outline-none focus:border-teal-700 focus:bg-white"
                    required
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    শিক্ষার্থীর ফোনে 'আমার অর্ডার' সেকশনে এই কোডটি রয়েছে।
                  </span>
                </div>

                {/* Cash Received Checkbox */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cashCollected}
                    onChange={(e) => setCashCollected(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#0D5C3A] rounded border-stone-300 focus:ring-0"
                    required
                  />
                  <div className="text-xs">
                    <span className="font-bold text-stone-900">
                      নগদ টাকা ৳ {selectedOrder.totalAmount.toLocaleString()} সম্পূর্ণ বুঝে পেয়েছি
                    </span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">
                      টাকা বুঝে নেওয়া নিশ্চিত না করে পার্সেল হস্তান্তর করবেন না।
                    </span>
                  </div>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 h-11 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    ওটিপি যাচাই ও ডেলিভারি সম্পন্ন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
