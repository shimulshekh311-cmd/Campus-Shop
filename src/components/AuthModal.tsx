import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Store,
  Mail,
  Phone,
  Lock,
  MapPin,
  Truck,
  Factory,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Campus, CampusId, UserRole } from '../types/index.ts';

interface AuthModalProps {
  campuses: Campus[];
}

export const AuthModal: React.FC<AuthModalProps> = ({ campuses }) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    authModalInitialTab,
    checkAdminStatus,
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [hasAdmin, setHasAdmin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Login form
  const [loginCredential, setLoginCredential] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCampusId, setRegCampusId] = useState<CampusId>('dhaka-college');
  const [regDepartment, setRegDepartment] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('buyer');
  const [regStoreName, setRegStoreName] = useState('');
  const [regPickupPointId, setRegPickupPointId] = useState('');
  const [regFactoryName, setRegFactoryName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tab with context trigger
  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalInitialTab);
      setErrorMsg('');
      setSuccessNotice('');
      // Check if an admin exists
      checkAdminStatus().then((exists) => {
        setHasAdmin(exists);
        if (exists && regRole === 'admin') {
          setRegRole('buyer');
        }
      });
    }
  }, [isAuthModalOpen, authModalInitialTab]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');
    setIsSubmitting(true);

    const res = await login(loginCredential.trim(), loginPassword.trim());
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message || 'লগইন করা যায়নি। সঠিক তথ্য দিন অথবা প্রথমে রেজিস্ট্রেশন করুন।');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (regRole === 'admin' && hasAdmin) {
      setErrorMsg('সিস্টেমে ইতিমধ্যে ১টি অ্যাডমিন অ্যাকাউন্ট নিবন্ধিত আছে। আর কোনো অ্যাডমিন হতে পারবে না।');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setErrorMsg('কমপক্ষে ৪ অক্ষরের একটি নিরাপদ পাসওয়ার্ড দিন।');
      return;
    }

    setIsSubmitting(true);

    const res = await register({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword.trim(),
      campusId: regCampusId,
      department: regDepartment.trim(),
      studentId: regStudentId.trim(),
      role: regRole,
      storeName: regStoreName.trim() || undefined,
      pickupPointId: regPickupPointId || undefined,
      factoryName: regFactoryName.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      if (res.isPendingApproval) {
        setSuccessNotice(
          res.message ||
            'আপনার আবেদনটি জমা হয়েছে! অ্যাডমিন অনুমোদনের পর আপনি লগইন করতে পারবেন।'
        );
      } else {
        setSuccessNotice('রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম CampusShop-এ।');
      }
    } else {
      setErrorMsg(res.message || 'নিবন্ধন সম্পন্ন করা যায়নি।');
    }
  };

  const selectedCampusObj = campuses.find((c) => c.id === regCampusId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {tab === 'login' ? 'ক্যাম্পাসশপ একাউন্টে লগইন' : 'নতুন একাউন্ট রেজিস্ট্রেশন'}
            </h2>
            <p className="text-xs text-stone-500">
              বাস্তব প্রোডাকশন পোর্টাল · ঢাকা সেন্ট্রাল ইউনিভার্সিটি
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Login / Register */}
        <div className="flex border-b border-stone-200 bg-stone-50/50">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
              setSuccessNotice('');
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'login'
                ? 'border-[#0D5C3A] text-[#0D5C3A] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            ১. লগইন করুন (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
              setSuccessNotice('');
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'register'
                ? 'border-[#0D5C3A] text-[#0D5C3A] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            ২. নতুন রেজিস্ট্রেশন (Register)
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {successNotice && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{successNotice}</div>
          </div>
        )}

        {/* Tab 1: Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                রেজিস্টার্ড ইমেইল অথবা মোবাইল নম্বর *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={loginCredential}
                  onChange={(e) => setLoginCredential(e.target.value)}
                  placeholder="যেমন: name@student.dcu.edu.bd বা 01711223344"
                  className="w-full h-10 pl-10 pr-3 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0D5C3A] focus:ring-1 focus:ring-[#0D5C3A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                পাসওয়ার্ড (Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="রেজিস্ট্রেশনের সময় দেওয়া পাসওয়ার্ড"
                  className="w-full h-10 pl-10 pr-10 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0D5C3A] focus:ring-1 focus:ring-[#0D5C3A]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
            </button>

            <div className="pt-2 text-center">
              <p className="text-xs text-stone-500">
                অ্যাকাউন্ট নেই?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="font-bold text-[#0D5C3A] hover:underline cursor-pointer"
                >
                  এখানে ক্লিক করে রেজিস্ট্রেশন করুন
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Tab 2: Register Form */
          <form onSubmit={handleRegisterSubmit} className="p-5 sm:p-6 space-y-3.5 max-h-[65vh] overflow-y-auto">
            
            {/* Role Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  অ্যাকাউন্টের ভূমিকা (Role) নির্বাচন করুন: *
                </label>
                {hasAdmin && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    অ্যাডমিন পূর্ণ (১/১)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {/* 1. Buyer */}
                <button
                  type="button"
                  onClick={() => setRegRole('buyer')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    regRole === 'buyer'
                      ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A] ring-1 ring-[#0D5C3A]'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold">১. বায়ার (ক্রেতা)</p>
                  <p className="text-[10px] text-stone-500">সাধারণ শিক্ষার্থী</p>
                </button>

                {/* 2. Seller */}
                <button
                  type="button"
                  onClick={() => setRegRole('seller')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    regRole === 'seller'
                      ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A] ring-1 ring-[#0D5C3A]'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold">২. সেলার (বিক্রেতা)</p>
                  <p className="text-[10px] text-stone-500">বই ও পণ্য বিক্রি</p>
                </button>

                {/* 3. Pickup Staff */}
                <button
                  type="button"
                  onClick={() => setRegRole('pickup_staff')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    regRole === 'pickup_staff'
                      ? 'border-teal-700 bg-teal-50 text-teal-800 ring-1 ring-teal-700'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold">৩. পিকআপ কর্মী</p>
                  <p className="text-[10px] text-stone-500">বুথ হ্যান্ডওভার</p>
                </button>

                {/* 4. Delivery Runner */}
                <button
                  type="button"
                  onClick={() => setRegRole('delivery_man')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    regRole === 'delivery_man'
                      ? 'border-blue-700 bg-blue-50 text-blue-800 ring-1 ring-blue-700'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold">৪. ডেলিভারি ম্যান</p>
                  <p className="text-[10px] text-stone-500">পাবলিক বাস রুট</p>
                </button>

                {/* 5. Factory Staff */}
                <button
                  type="button"
                  onClick={() => setRegRole('factory_staff')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    regRole === 'factory_staff'
                      ? 'border-amber-700 bg-amber-50 text-amber-800 ring-1 ring-amber-700'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold">৫. ফ্যাক্টরি হাব</p>
                  <p className="text-[10px] text-stone-500">পোশাক ও ব্যাগ প্রস্তুত</p>
                </button>

                {/* 6. Single Super Admin */}
                <button
                  type="button"
                  disabled={hasAdmin}
                  onClick={() => !hasAdmin && setRegRole('admin')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    hasAdmin
                      ? 'opacity-40 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                      : regRole === 'admin'
                      ? 'border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600 cursor-pointer'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold">৬. সুপার অ্যাডমিন</p>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    {hasAdmin ? 'আসন পূর্ণ (১টি অনুমোদিত)' : 'একমাত্র অ্যাডমিন অ্যাকাউন্ট'}
                  </p>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">আপনার পূর্ণ নাম *</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="যেমন: সায়েম হোসেন"
                className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0D5C3A]"
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ইমেইল *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="student@dcu.edu.bd"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0D5C3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="018xxxxxxxx"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0D5C3A]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">পাসওয়ার্ড নির্ধারণ করুন *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="কমপক্ষে ৪ সংখ্যার পাসওয়ার্ড দিন"
                  className="w-full h-9 pl-3 pr-10 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0D5C3A]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campus & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ক্যাম্পাস *</label>
                <select
                  value={regCampusId}
                  onChange={(e) => setRegCampusId(e.target.value as CampusId)}
                  className="w-full h-9 px-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-[#0D5C3A]"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">বিভাগ / দপ্তর</label>
                <input
                  type="text"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  placeholder="যেমন: ইংরেজি বিভাগ"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0D5C3A]"
                />
              </div>
            </div>

            {/* Student ID / Staff ID */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {regRole === 'admin'
                  ? 'অ্যাডমিন কোড / পদবি'
                  : regRole === 'buyer' || regRole === 'seller'
                  ? 'শিক্ষার্থী আইডি (Student ID)'
                  : 'কর্মী আইডি / রেফারেন্স'}
              </label>
              <input
                type="text"
                value={regStudentId}
                onChange={(e) => setRegStudentId(e.target.value)}
                placeholder="যেমন: DC-2023-ENG-402"
                className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0D5C3A]"
              />
            </div>

            {/* Role-Specific fields */}
            {regRole === 'seller' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  আপনার স্টোর বা দোকানের নাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={regStoreName}
                  onChange={(e) => setRegStoreName(e.target.value)}
                  placeholder="যেমন: ঢাকা কলেজ বুক কর্নার"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300"
                />
              </div>
            )}

            {regRole === 'pickup_staff' && selectedCampusObj && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  দায়িত্বপ্রাপ্ত বুথ নির্বাচন করুন
                </label>
                <select
                  value={regPickupPointId}
                  onChange={(e) => setRegPickupPointId(e.target.value)}
                  className="w-full h-9 px-2 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  <option value="">বুথ নির্বাচন করুন</option>
                  {selectedCampusObj.pickupPoints.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameBn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {regRole === 'factory_staff' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ফ্যাক্টরি বা উৎপাদন ইউনিটের নাম
                </label>
                <input
                  type="text"
                  value={regFactoryName}
                  onChange={(e) => setRegFactoryName(e.target.value)}
                  placeholder="যেমন: মিরপুর সেন্ট্রাল গার্মেন্টস ইউনিট"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-stone-300"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white text-xs font-bold shadow-md transition-all cursor-pointer mt-3"
            >
              {isSubmitting ? 'নিবন্ধন সম্পন্ন হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}
            </button>

            <div className="pt-2 text-center">
              <p className="text-xs text-stone-500">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="font-bold text-[#0D5C3A] hover:underline cursor-pointer"
                >
                  এখানে ক্লিক করে লগইন করুন
                </button>
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
