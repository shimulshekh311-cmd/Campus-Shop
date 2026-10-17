import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Package,
  Truck,
  Store,
  Factory,
  MapPin,
  Sparkles,
  ArrowRightLeft,
  UserPlus,
  LogOut,
  ChevronRight,
  Home,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Heart,
  Settings
} from 'lucide-react';
import { UserRole, Campus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface AccountPageProps {
  onGoHome: () => void;
  onGoOrders: () => void;
  onGoTracking: () => void;
  onGoFavorites: () => void;
  campuses: Campus[];
  onOpenSellerHub: () => void;
  onOpenPickupStaffDashboard: () => void;
  onOpenDeliveryRunnerDashboard: () => void;
  onOpenFactoryDashboard: () => void;
  onOpenAdminPanel: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onGoHome,
  onGoOrders,
  onGoTracking,
  onGoFavorites,
  campuses,
  onOpenSellerHub,
  onOpenPickupStaffDashboard,
  onOpenDeliveryRunnerDashboard,
  onOpenFactoryDashboard,
  onOpenAdminPanel,
}) => {
  const {
    user,
    role,
    linkedAccounts,
    logout,
    loginDemo,
    switchAccount,
    createLinkedBuyerAccount,
    openAuthModal,
    openApplyRole,
  } = useAuth();
  const { lang, t } = useLanguage();

  const getRoleDisplayName = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'সুপার অ্যাডমিন';
      case 'seller':
        return 'ভেরিফায়েড সেলার';
      case 'pickup_staff':
        return 'পিকআপ কর্মী';
      case 'delivery_man':
        return 'ডেলিভারি ম্যান (রানার)';
      case 'factory_staff':
        return 'ফ্যাক্টরি ইনচার্জ';
      default:
        return 'বায়ার (ক্রেতা শিক্ষার্থী)';
    }
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'seller':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'pickup_staff':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'delivery_man':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'factory_staff':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-[#0D5C3A]/10 text-[#0D5C3A] border-[#0D5C3A]/20';
    }
  };

  const userCampus = campuses.find((c) => c.id === user?.campusId);

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
        <span className="text-stone-900 font-semibold">অ্যাকাউন্ট ও ভূমিকা ড্যাশবোর্ড (Account Page)</span>
      </nav>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center text-lg font-bold">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {user?.name || 'ব্যবহারকারী অ্যাকাউন্ট'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getRoleBadgeStyle(role)}`}>
                {getRoleDisplayName(role)}
              </span>
              {user?.approvalStatus === 'approved' && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  অনুমোদিত
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {user?.email || 'ঢাকা সেন্ট্রাল ইউনিভার্সিটি মাল্টি-রোল অ্যাকাউন্ট পোর্টাল'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAuthModal}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors"
          >
            লগইন / অন্য অ্যাকাউন্ট
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Info & Switcher */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center justify-between">
              <span>ব্যক্তিগত ও ক্যাম্পাস তথ্য</span>
              <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                আইডি: {user?.studentId || 'DC-2023-889'}
              </span>
            </h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">নাম:</span>
                <span className="font-semibold text-stone-900">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">মোবাইল:</span>
                <span className="font-mono font-medium text-stone-900">{user?.phone || '০১৭xxxxxxxx'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">ক্যাম্পাস:</span>
                <span className="font-semibold text-stone-900">{userCampus?.nameBn || 'ঢাকা কলেজ'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">বিভাগ:</span>
                <span className="text-stone-900">{user?.department || 'কম্পিউটার সায়েন্স ও ইঞ্জিনিয়ারিং'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">সক্রিয় রোল:</span>
                <span className="font-bold text-[#0D5C3A]">{getRoleDisplayName(role)}</span>
              </div>
            </div>
          </div>

          {/* Account Requirement Warning (As per user's requirement: Special role holders must switch to/register a Buyer account to buy products) */}
          {role !== 'buyer' && (
            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xs">
              <div className="flex items-start gap-2 text-amber-900 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>পণ্য ক্রয়ের নিয়মাবলী:</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                কোনো সেলার বা অন্য বিশেষ অ্যাকাউন্টের সদস্যরা যদি পণ্য কিনতে চান, তবে তাদের <strong>বায়ার অ্যাকাউন্ট দিয়ে</strong> পণ্য অর্ডার করতে হবে।
              </p>
              <button
                onClick={createLinkedBuyerAccount}
                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>বায়ার একাউন্টে স্যুইচ করুন</span>
              </button>
            </div>
          )}

          {/* Linked Accounts Switcher */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-[#0D5C3A]" />
                <span>আপনার লিংকড অ্যাকাউন্টসমূহ</span>
              </h3>
              <span className="text-[11px] font-mono text-stone-400">
                {linkedAccounts.length}টি
              </span>
            </div>

            <p className="text-xs text-stone-500">
              একই সদস্যের একাধিক রোল অনুমোদিত হলে এখান থেকে মুহূর্তে স্যুইচ করতে পারবেন:
            </p>

            <div className="space-y-2">
              {linkedAccounts.map((acc) => {
                const isActive = acc.role === role;
                return (
                  <button
                    key={acc.id}
                    onClick={() => switchAccount(acc.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isActive
                        ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        isActive ? 'bg-[#0D5C3A] text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {acc.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block">{acc.name}</span>
                        <span className="text-[10px] text-stone-500">
                          {getRoleDisplayName(acc.role)}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0D5C3A] text-white">
                        সক্রিয়
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#0D5C3A] font-semibold">
                        স্যুইচ করুন
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Button to Apply for Special Role */}
            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={() => openApplyRole('seller')}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-300 hover:border-amber-500 text-xs font-bold text-amber-900 bg-amber-50/50 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>নতুন বিশেষ রোলের আবেদন করুন</span>
              </button>
              <p className="text-[10px] text-stone-400 text-center mt-1">
                (বায়ার ছাড়া অন্য রোলের জন্য অ্যাডমিন অনুমোদন প্রয়োজন)
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Role-Specific Action Portals & Interactive Testing Hub */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Role Quick Dashboard Access Card */}
          <div className="bg-linear-to-br from-[#0D5C3A] to-[#083e27] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs inline-block">
                  সক্রিয় ড্যাশবোর্ড
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {getRoleDisplayName(role)} পোর্টাল
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  {role === 'buyer' && 'আপনার অর্ডার ট্র্যাক করুন, পিকআপ ওটিপি দেখুন এবং ডিজিটাল কোর্স ফাইল অ্যাক্সেস করুন।'}
                  {role === 'seller' && 'পণ্য লিস্টিং ম্যানেজ করুন, নতুন আইটেম আপলোড করুন এবং ফ্যাক্টরি সরাসরি রেটের স্টক নিয়ন্ত্রণ করুন।'}
                  {role === 'pickup_staff' && 'ক্যাম্পাস বুথে ডেলিভারি ম্যান থেকে পার্সেল রিসিভ ও স্টুডেন্টদের ক্যাশ টাকা ও ওটিপি মিলিয়ে ডেলিভারি নিশ্চিত করুন।'}
                  {role === 'delivery_man' && 'ফ্যাক্টরি থেকে সিলযুক্ত পণ্য সংগ্রহ করুন এবং প্রতিদিন পাবলিক বাসে ৭টি ক্যাম্পাসে পৌঁছে দিন।'}
                  {role === 'factory_staff' && 'অর্ডার অনুযায়ী পোশাক ও ব্যাগের উৎপাদন, প্যাকিং এবং নন-রিমুভাল সিকিউরিটি সিল তৈরি করুন।'}
                  {role === 'admin' && 'সকল বিশেষ অ্যাকাউন্টের অনুমোদন, ৭ ক্যাম্পাসের বুথ কর্মী এবং ডেলিভারি রানার তদারকি করুন।'}
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-2.5">
                {role === 'buyer' && (
                  <button
                    onClick={onGoOrders}
                    className="px-5 py-3 rounded-xl bg-white text-[#0D5C3A] hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>আমার অর্ডারসমূহ দেখুন</span>
                  </button>
                )}

                {role === 'seller' && (
                  <button
                    onClick={onOpenSellerHub}
                    className="px-5 py-3 rounded-xl bg-amber-400 text-stone-900 hover:bg-amber-300 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Store className="w-4 h-4" />
                    <span>সেলার হাব ড্যাশবোর্ড খুলুন</span>
                  </button>
                )}

                {role === 'pickup_staff' && (
                  <button
                    onClick={onOpenPickupStaffDashboard}
                    className="px-5 py-3 rounded-xl bg-white text-teal-900 hover:bg-teal-50 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-teal-700" />
                    <span>পিকআপ বুথ ড্যাশবোর্ড</span>
                  </button>
                )}

                {role === 'delivery_man' && (
                  <button
                    onClick={onOpenDeliveryRunnerDashboard}
                    className="px-5 py-3 rounded-xl bg-blue-100 text-blue-900 hover:bg-blue-200 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4 text-blue-700" />
                    <span>রানার ডেলিভারি ড্যাশবোর্ড</span>
                  </button>
                )}

                {role === 'factory_staff' && (
                  <button
                    onClick={onOpenFactoryDashboard}
                    className="px-5 py-3 rounded-xl bg-amber-300 text-amber-950 hover:bg-amber-200 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Factory className="w-4 h-4 text-amber-900" />
                    <span>ফ্যাক্টরি ইনচার্জ ড্যাশবোর্ড</span>
                  </button>
                )}

                {role === 'admin' && (
                  <button
                    onClick={onOpenAdminPanel}
                    className="px-5 py-3 rounded-xl bg-red-100 text-red-950 hover:bg-red-200 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-red-700" />
                    <span>সুপার অ্যাডমিন ড্যাশবোর্ড</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={onGoOrders}
              className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#0D5C3A] text-left transition-all hover:shadow-xs group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0D5C3A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">আমার অর্ডার পেজ</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                সিক্রেট ওটিপি ও ডেলিভারি স্ট্যাটাস দেখুন
              </p>
            </button>

            <button
              onClick={onGoTracking}
              className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-blue-500 text-left transition-all hover:shadow-xs group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">পার্সেল ট্র্যাকিং পেজ</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                ফ্যাক্টরি সিল ও পাবলিক বাস রুট ট্র্যাকিং
              </p>
            </button>

            <button
              onClick={onGoFavorites}
              className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-rose-500 text-left transition-all hover:shadow-xs group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">পছন্দের তালিকা</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                সংরক্ষিত পণ্য ও বইয়ের তালিকা
              </p>
            </button>
          </div>

          {/* Interactive Role Switcher & Testing Hub (All 6 Roles Requested by User) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  সরাসরি সকল রোল টেস্ট করুন (Demo Role Testing)
                </h3>
              </div>
              <span className="text-[11px] text-stone-500">৬টি ভূমিকা অনুমোদিত</span>
            </div>

            <p className="text-xs text-stone-600">
              অ্যাপের প্রতিটি সিস্টেম (ফ্যাক্টরি থেকে ডেলিভারি ম্যান, ডেলিভারি ম্যান থেকে পিক-আপ কর্মী, এবং পিক-আপ কর্মী থেকে বায়ারের ক্যাশ অন ডেলিভারি) পরীক্ষা করতে নিচের যেকোনো রোলে ক্লিক করুন:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Role 1: Buyer */}
              <button
                onClick={() => loginDemo('buyer')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'buyer'
                    ? 'bg-emerald-50 border-[#0D5C3A] text-[#0D5C3A] ring-2 ring-[#0D5C3A]/20'
                    : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>১. বায়ার (Buyer)</span>
                  {role === 'buyer' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0D5C3A]" />}
                </div>
                <p className="text-[10px] text-stone-500 mt-1">পণ্য অর্ডার ও পিকআপ</p>
              </button>

              {/* Role 2: Seller */}
              <button
                onClick={() => loginDemo('seller')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'seller'
                    ? 'bg-emerald-50 border-[#0D5C3A] text-[#0D5C3A] ring-2 ring-[#0D5C3A]/20'
                    : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>২. সেলার (Seller)</span>
                  {role === 'seller' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0D5C3A]" />}
                </div>
                <p className="text-[10px] text-stone-500 mt-1">পণ্য লিস্টিং ও বিক্রয়</p>
              </button>

              {/* Role 3: Pickup Staff */}
              <button
                onClick={() => loginDemo('pickup_staff')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'pickup_staff'
                    ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                    : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>৩. পিক-আপ কর্মী</span>
                  {role === 'pickup_staff' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                </div>
                <p className="text-[10px] text-stone-500 mt-1">বুথ রিসিভ ও ক্যাশ ডেলিভারি</p>
              </button>

              {/* Role 4: Delivery Runner */}
              <button
                onClick={() => loginDemo('delivery_man')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'delivery_man'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-600/20'
                    : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>৪. ডেলিভারি ম্যান</span>
                  {role === 'delivery_man' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />}
                </div>
                <p className="text-[10px] text-stone-500 mt-1">ফ্যাক্টরি থেকে ৭ ক্যাম্পাসে বাস রুট</p>
              </button>

              {/* Role 5: Factory Staff */}
              <button
                onClick={() => loginDemo('factory_staff')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'factory_staff'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-600/20'
                    : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>৫. ফ্যাক্টরি কর্মী</span>
                  {role === 'factory_staff' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />}
                </div>
                <p className="text-[10px] text-stone-500 mt-1">নন-রিমুভাল সিল মারা ও প্যাকিং</p>
              </button>

              {/* Role 6: Super Admin */}
              <button
                onClick={() => loginDemo('admin')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'admin'
                    ? 'bg-red-50 border-red-600 text-red-900 ring-2 ring-red-600/20'
                    : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>৬. সুপার অ্যাডমিন</span>
                  {role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-red-700" />}
                </div>
                <p className="text-[10px] text-stone-500 mt-1">বিশেষ অ্যাকাউন্ট অনুমোদন</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
