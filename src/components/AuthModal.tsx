import React, { useState } from 'react';
import { X, Sparkles, User, ShieldCheck, Store, Mail, Phone, MapPin, Truck, Factory, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Campus, CampusId, UserRole } from '../types/index.ts';

interface AuthModalProps {
  campuses: Campus[];
}

export const AuthModal: React.FC<AuthModalProps> = ({ campuses }) => {
  const { isAuthModalOpen, closeAuthModal, login, register, loginDemo } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCampusId, setRegCampusId] = useState<CampusId>('dhaka-college');
  const [regDepartment, setRegDepartment] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('buyer');

  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const success = await login(loginEmail);
    setIsSubmitting(false);
    if (!success) {
      setErrorMsg('লগইন করা যায়নি। সঠিক ইমেইল/ফোন দিন অথবা নিচের ডেমো বোতামে ক্লিক করুন।');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');
    setIsSubmitting(true);

    const res = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      campusId: regCampusId,
      department: regDepartment,
      studentId: regStudentId,
      role: regRole,
    });

    setIsSubmitting(false);

    if (res.success) {
      if (res.isPendingApproval) {
        setSuccessNotice(
          res.message ||
            'আপনার আবেদনটি জমা হয়েছে! বায়ার একাউন্ট ছাড়া অন্য রোলে অ্যাডমিন অনুমোদনের পর একাউন্ট সক্রিয় হবে।'
        );
      }
    } else {
      setErrorMsg(res.message || 'নিবন্ধন সম্পন্ন করা যায়নি।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {tab === 'login' ? 'ক্যাম্পাসশপ একাউন্টে লগইন' : 'নতুন একাউন্ট রেজিস্ট্রেশন'}
            </h2>
            <p className="text-xs text-stone-500">ঢাকা সেন্ট্রাল ইউনিভার্সিটি মার্কেটপ্লেস</p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Fast Evaluator Accounts Banner for ALL 6 ROLES */}
        <div className="p-3 bg-stone-50 border-b border-stone-200">
          <p className="text-[11px] font-bold text-stone-700 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>১-ক্লিকে যেকোনো রোলের ডেমো অ্যাকাউন্টে ঢুকুন:</span>
          </p>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <button
              onClick={() => loginDemo('buyer')}
              className="py-1.5 px-1 rounded-lg bg-white border border-stone-200 font-bold hover:bg-emerald-50 text-stone-800"
            >
              বায়ার (ক্রেতা)
            </button>
            <button
              onClick={() => loginDemo('seller')}
              className="py-1.5 px-1 rounded-lg bg-white border border-stone-200 font-bold hover:bg-emerald-50 text-[#0D5C3A]"
            >
              সেলার
            </button>
            <button
              onClick={() => loginDemo('pickup_staff')}
              className="py-1.5 px-1 rounded-lg bg-white border border-stone-200 font-bold hover:bg-teal-50 text-teal-800"
            >
              পিকআপ কর্মী
            </button>
            <button
              onClick={() => loginDemo('delivery_man')}
              className="py-1.5 px-1 rounded-lg bg-white border border-stone-200 font-bold hover:bg-blue-50 text-blue-800"
            >
              ডেলিভারি ম্যান
            </button>
            <button
              onClick={() => loginDemo('factory_staff')}
              className="py-1.5 px-1 rounded-lg bg-white border border-stone-200 font-bold hover:bg-amber-50 text-amber-800"
            >
              ফ্যাক্টরি কর্মী
            </button>
            <button
              onClick={() => loginDemo('admin')}
              className="py-1.5 px-1 rounded-lg bg-white border border-red-200 font-bold hover:bg-red-50 text-red-700"
            >
              সুপার অ্যাডমিন
            </button>
          </div>
        </div>

        {/* Tabs: Login / Register */}
        <div className="flex border-b border-stone-200">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              tab === 'login'
                ? 'border-[#0D5C3A] text-[#0D5C3A]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            লগইন
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              tab === 'register'
                ? 'border-[#0D5C3A] text-[#0D5C3A]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            নতুন অ্যাকাউন্ট রেজিস্ট্রেশন
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {successNotice && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ইমেইল বা মোবাইল নম্বর
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="rafiqul@student.dcu.edu.bd বা 01711..."
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#0D5C3A]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white text-xs font-bold shadow-sm transition-all"
            >
              {isSubmitting ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">আপনার পূর্ণ নাম *</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="যেমন: সায়েম হোসেন"
                className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#0D5C3A]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ইমেইল *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="student@dcu.edu.bd"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ফোন নম্বর *</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="018xxxxxxxx"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ক্যাম্পাস *</label>
                <select
                  value={regCampusId}
                  onChange={(e) => setRegCampusId(e.target.value as CampusId)}
                  className="w-full h-9 px-2 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">বিভাগ / বর্ষ</label>
                <input
                  type="text"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  placeholder="যেমন: সমাজবিজ্ঞান ৩য় বর্ষ"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                অ্যাকাউন্টের ধরন নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setRegRole('buyer')}
                  className={`p-2 rounded-xl border font-bold text-left transition-all ${
                    regRole === 'buyer'
                      ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A]'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  বায়ার (সরাসরি সক্রিয়)
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('seller')}
                  className={`p-2 rounded-xl border font-bold text-left transition-all ${
                    regRole === 'seller'
                      ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A]'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  সেলার (অ্যাডমিন অনুমোদন)
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('pickup_staff')}
                  className={`p-2 rounded-xl border font-bold text-left transition-all ${
                    regRole === 'pickup_staff'
                      ? 'border-teal-700 bg-teal-50 text-teal-800'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  পিকআপ কর্মী (অনুমোদন)
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('delivery_man')}
                  className={`p-2 rounded-xl border font-bold text-left transition-all ${
                    regRole === 'delivery_man'
                      ? 'border-blue-700 bg-blue-50 text-blue-800'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  ডেলিভারি ম্যান (অনুমোদন)
                </button>
              </div>

              {regRole !== 'buyer' && (
                <p className="text-[11px] text-amber-800 font-medium mt-1">
                  * বায়ার ছাড়া অন্য সকল অ্যাকাউন্টের জন্য অ্যাডমিন এর অ্যাপ্রুভ প্রয়োজন হবে।
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white text-xs font-bold shadow-sm transition-all mt-2"
            >
              {isSubmitting ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
