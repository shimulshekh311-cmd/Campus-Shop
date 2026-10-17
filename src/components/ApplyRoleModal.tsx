import React, { useState } from 'react';
import {
  X,
  Store,
  MapPin,
  Truck,
  Factory,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Campus, CampusId, UserRole } from '../types/index.ts';

interface ApplyRoleModalProps {
  campuses: Campus[];
}

export const ApplyRoleModal: React.FC<ApplyRoleModalProps> = ({ campuses }) => {
  const { user, isApplyRoleOpen, closeApplyRole, targetApplyRole, register, refreshUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(targetApplyRole || 'seller');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [campusId, setCampusId] = useState<CampusId>(user?.campusId || 'dhaka-college');
  const [department, setDepartment] = useState(user?.department || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [pickupPointId, setPickupPointId] = useState('');
  const [factoryName, setFactoryName] = useState('সেন্ট্রাল ইউনিভার্সিটি মার্চ অ্যান্ড অ্যাপারেল ফ্যাক্টরি');
  const [details, setDetails] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isApplyRoleOpen) return null;

  const currentCampus = campuses.find((c) => c.id === campusId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setErrorMsg('নাম, ইমেইল এবং ফোন নম্বর আবশ্যক');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await register({
      name,
      email,
      phone,
      campusId,
      department,
      studentId,
      role: selectedRole,
      pickupPointId: selectedRole === 'pickup_staff' ? pickupPointId || currentCampus?.pickupPoints[0]?.id : undefined,
      factoryName: selectedRole === 'factory_staff' ? factoryName : undefined,
      details,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
      setResultMsg(res.message || 'আপনার আবেদনটি সফলভাবে জমা হয়েছে। অ্যাডমিন পর্যালোচনার পর অনুমোদন করবেন।');
      await refreshUser();
    } else {
      setErrorMsg(res.message || 'আবেদন জমা দিতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#0D5C3A] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">বিশেষ অ্যাকাউন্ট আবেদন (অ্যাডমিন অনুমোদন সাপেক্ষ)</h2>
          </div>
          <button
            onClick={closeApplyRole}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#09432a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              আবেদন সফলভাবে গৃহীত হয়েছে!
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              {resultMsg}
            </p>
            <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-500">
              অ্যাডমিন অনুমোদন দিলে আপনার এই একাউন্টটি কার্যকর হবে এবং এক ক্লিকেই লগইন বা প্রোফাইল থেকে সুইচ করতে পারবেন।
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                closeApplyRole();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0D5C3A] text-white text-xs font-bold shadow-sm"
            >
              ঠিক আছে
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Admin Approval Notice Banner */}
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>নিয়মাবলী:</strong> বায়ার অ্যাকাউন্ট ছাড়া অন্য সকল ধরনের অ্যাকাউন্টের (সেলার, পিক-আপ পয়েন্ট কর্মী, ডেলিভারি ম্যান, ফ্যাক্টরি কর্মী) জন্য অ্যাডমিনের অনুমোদন বাধ্যতামূলক।
              </span>
            </div>

            {/* Select Role Type */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                কোন ধরনের অ্যাকাউন্টের জন্য আবেদন করছেন? *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('seller')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    selectedRole === 'seller'
                      ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A] font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span className="text-xs">সেলার (বিক্রেতা)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('pickup_staff')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    selectedRole === 'pickup_staff'
                      ? 'border-teal-700 bg-teal-50 text-teal-800 font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">পিক-আপ পয়েন্ট কর্মী</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('delivery_man')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    selectedRole === 'delivery_man'
                      ? 'border-blue-700 bg-blue-50 text-blue-800 font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span className="text-xs">ডেলিভারি ম্যান (রানার)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('factory_staff')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    selectedRole === 'factory_staff'
                      ? 'border-amber-700 bg-amber-50 text-amber-800 font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Factory className="w-4 h-4" />
                  <span className="text-xs">ফ্যাক্টরি কর্মী</span>
                </button>
              </div>
            </div>

            {/* Common Inputs */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                আপনার নাম *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: তানভীর আহমেদ"
                className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#0D5C3A]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">ইমেইল *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tanvir@student.dcu.edu.bd"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">ফোন নম্বর *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">ক্যাম্পাস *</label>
                <select
                  value={campusId}
                  onChange={(e) => setCampusId(e.target.value as CampusId)}
                  className="w-full h-10 px-2.5 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">শিক্ষার্থী আইডি / রোল</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="DC-2023-XXX"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300"
                />
              </div>
            </div>

            {/* Role Specific Fields */}
            {selectedRole === 'pickup_staff' && (
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  দায়িত্বপ্রাপ্ত পিক-আপ বুথ পয়েন্ট
                </label>
                <select
                  value={pickupPointId}
                  onChange={(e) => setPickupPointId(e.target.value)}
                  className="w-full h-10 px-2.5 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  {currentCampus?.pickupPoints.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.nameBn} ({pt.landmark})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedRole === 'factory_staff' && (
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  ফ্যাক্টরি / ওয়ার্কশপের নাম
                </label>
                <input
                  type="text"
                  value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                আবেদনের বিবরণ বা অভিজ্ঞতা
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="কেন আপনি এই দায়িত্বে কাজ করতে আগ্রহী..."
                className="w-full h-16 p-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#0D5C3A]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeApplyRole}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white shadow-sm"
              >
                {isSubmitting ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
