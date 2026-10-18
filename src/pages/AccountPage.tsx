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
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Heart,
  Settings,
  LogIn,
} from 'lucide-react';
import { UserRole, Campus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface AccountPageProps {
  onGoHome: () => void;
  onGoOrders: () => void;
  onGoTracking: (orderId?: string) => void;
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
    switchAccount,
    createLinkedBuyerAccount,
    openAuthModal,
    openApplyRole,
  } = useAuth();
  const { lang, t } = useLanguage();

  const getRoleDisplayName = (r: UserRole | 'guest') => {
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
      case 'buyer':
        return 'বায়ার (ক্রেতা শিক্ষার্থী)';
      default:
        return 'অতিথি (লগইন করা নেই)';
    }
  };

  const getRoleBadgeStyle = (r: UserRole | 'guest') => {
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
      case 'buyer':
        return 'bg-[#0D5C3A]/10 text-[#0D5C3A] border-[#0D5C3A]/20';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const userCampus = campuses.find((c) => c.id === user?.campusId);

  // If user is not logged in, show production sign-in prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 w-full overflow-x-clip">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-6">
          <button
            onClick={onGoHome}
            className="flex items-center gap-1 hover:text-[#0D5C3A] transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>হোম</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-semibold">অ্যাকাউন্ট (Account)</span>
        </nav>

        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            ক্যাম্পাসশপ প্রোডাকশন অ্যাকাউন্টে প্রবেশ করুন
          </h2>
          <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto">
            ঢাকা সেন্ট্রাল ইউনিভার্সিটির শিক্ষার্থী, বিক্রেতা বা কর্মীদের জন্য। সকল ধরনের অ্যাকাউন্ট প্রথমে রেজিস্ট্রেশন করে তারপর লগইন করতে হবে।
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-1/2 h-11 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>লগইন করুন</span>
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-1/2 h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#0D5C3A] text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন রেজিস্ট্রেশন</span>
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
              <p className="text-xs font-bold text-stone-900">ক্রেতা শিক্ষার্থী (Buyer)</p>
              <p className="text-[11px] text-stone-500 mt-1">
                বই, ক্যালকুলেটর ও হোস্টেল গ্যাজেট কিনুন এবং পিকআপ পয়েন্টে ক্যাশ বা বিকাশে নিন।
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
              <p className="text-xs font-bold text-stone-900">বিক্রেতা শিক্ষার্থী (Seller)</p>
              <p className="text-[11px] text-stone-500 mt-1">
                নিজের বই, হ্যান্ডনোট ও গ্যাজেট সহজেই নিজের ক্যাম্পাসের বন্ধুদের মাঝে বিক্রি করুন।
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
              <p className="text-xs font-bold text-stone-900">কেন্দ্রীয় অ্যাডমিন (Admin)</p>
              <p className="text-[11px] text-stone-500 mt-1">
                সিস্টেমে সর্বোচ্চ ১টি কেন্দ্রীয় অ্যাডমিন অ্যাকাউন্ট অনুমোদিত।
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 w-full overflow-x-clip">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 hover:text-[#0D5C3A] transition-colors cursor-pointer"
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
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {user.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getRoleBadgeStyle(role)}`}>
                {getRoleDisplayName(role)}
              </span>
              {user.approvalStatus === 'approved' && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  অনুমোদিত
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {user.email} · {userCampus?.nameBn || 'ঢাকা সেন্ট্রাল ইউনিভার্সিটি'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
          >
            অন্য অ্যাকাউন্টে লগইন
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
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
                আইডি: {user.studentId || 'N/A'}
              </span>
            </h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">নাম:</span>
                <span className="font-semibold text-stone-800">{user.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">মোবাইল:</span>
                <span className="font-mono text-stone-800">{user.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">ইমেইল:</span>
                <span className="font-medium text-stone-800">{user.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">ক্যাম্পাস:</span>
                <span className="font-semibold text-emerald-800">{userCampus?.nameBn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">বিভাগ / পদবি:</span>
                <span className="text-stone-800">{user.department || 'সাধারণ শিক্ষার্থী'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">নিবন্ধন তারিখ:</span>
                <span className="font-mono text-stone-700">
                  {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Role Accounts */}
          {linkedAccounts.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-[#0D5C3A]" />
                <span>সংযুক্ত অ্যাকাউন্টসমূহ (Linked Accounts)</span>
              </h3>
              <div className="space-y-2">
                {linkedAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => switchAccount(acc.id)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 hover:border-[#0D5C3A] bg-stone-50/50 hover:bg-stone-50 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-stone-800">{acc.name}</p>
                      <p className="text-[10px] text-stone-500">{getRoleDisplayName(acc.role)}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#0D5C3A]">সুইচ করুন &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Apply for additional Role */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-stone-800 mb-1">অন্যান্য ভূমিকা আবেদন</h4>
            <p className="text-[11px] text-stone-500 mb-3">
              আপনি কি ক্যাম্পাসে বই বিক্রি করতে চান নাকি ডেলিভারি রানার হতে চান?
            </p>
            <button
              type="button"
              onClick={() => openApplyRole('seller')}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white border border-stone-300 hover:border-[#0D5C3A] text-[#0D5C3A] transition-colors cursor-pointer"
            >
              বিশেষ ভূমিকার জন্য আবেদন করুন
            </button>
          </div>
        </div>

        {/* Right Column: Dashboards & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Role Management Hub */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>সক্রিয় ভূমিকা: {getRoleDisplayName(role)}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  আপনার নির্বাচিত ভূমিকা অনুযায়ী সংশ্লিষ্ট ড্যাশবোর্ড ও অপশন পরিচালনা করুন।
                </p>
              </div>

              {/* Action button for active dashboard */}
              <div>
                {role === 'seller' && (
                  <button
                    type="button"
                    onClick={onOpenSellerHub}
                    className="px-5 py-2.5 rounded-xl bg-[#0D5C3A] text-white hover:bg-[#09432a] text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-amber-300" />
                    <span>সেলার ড্যাশবোর্ড খুলুন</span>
                  </button>
                )}

                {role === 'pickup_staff' && (
                  <button
                    type="button"
                    onClick={onOpenPickupStaffDashboard}
                    className="px-5 py-2.5 rounded-xl bg-teal-800 text-white hover:bg-teal-900 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-amber-300" />
                    <span>পিকআপ বুথ ড্যাশবোর্ড</span>
                  </button>
                )}

                {role === 'delivery_man' && (
                  <button
                    type="button"
                    onClick={onOpenDeliveryRunnerDashboard}
                    className="px-5 py-2.5 rounded-xl bg-blue-800 text-white hover:bg-blue-900 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-amber-300" />
                    <span>রানার ডেলিভারি ড্যাশবোর্ড</span>
                  </button>
                )}

                {role === 'factory_staff' && (
                  <button
                    type="button"
                    onClick={onOpenFactoryDashboard}
                    className="px-5 py-2.5 rounded-xl bg-amber-700 text-white hover:bg-amber-800 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Factory className="w-4 h-4 text-amber-200" />
                    <span>ফ্যাক্টরি ইনচার্জ ড্যাশবোর্ড</span>
                  </button>
                )}

                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={onOpenAdminPanel}
                    className="px-5 py-2.5 rounded-xl bg-red-700 text-white hover:bg-red-800 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>সুপার অ্যাডমিন ড্যাশবোর্ড খুলুন</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={onGoOrders}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-[#0D5C3A] text-left transition-all hover:shadow-xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0D5C3A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">আমার অর্ডার পেজ</h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  সিক্রেট ওটিপি ও ডেলিভারি স্ট্যাটাস দেখুন
                </p>
              </button>

              <button
                type="button"
                onClick={() => onGoTracking()}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-blue-500 text-left transition-all hover:shadow-xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">পার্সেল ট্র্যাকিং পেজ</h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  পাবলিক বাস রুট ও পিকআপ পয়েন্ট অবস্থান
                </p>
              </button>

              <button
                type="button"
                onClick={onGoFavorites}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-rose-500 text-left transition-all hover:shadow-xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">পছন্দের তালিকা</h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  সংরক্ষিত পণ্য ও বইয়ের তালিকা
                </p>
              </button>
            </div>
          </div>

          {/* Seller / Student Quick Product Addition Guide */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 text-stone-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D5C3A] text-white flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#0D5C3A]">
                  ক্যাম্পাসে বই বা পণ্য বিক্রি করতে চান?
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  আপনার কাছে থাকা পুরাতন শিক্ষাবর্ষের বই, ক্যালকুলেটর বা হ্যান্ডনোট বিক্রি করতে সেলার অ্যাকাউন্ট দিয়ে লগইন করুন এবং সেলার ড্যাশবোর্ডে গিয়ে নতুন পণ্য লিস্টিং করুন।
                </p>
                <div className="mt-3">
                  {role === 'seller' ? (
                    <button
                      type="button"
                      onClick={onOpenSellerHub}
                      className="px-4 py-1.5 rounded-lg bg-[#0D5C3A] text-white text-xs font-bold hover:bg-[#09432a] transition-colors cursor-pointer"
                    >
                      সেলার ড্যাশবোর্ডে নতুন পণ্য যোগ করুন &rarr;
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openApplyRole('seller')}
                      className="px-4 py-1.5 rounded-lg bg-[#0D5C3A] text-white text-xs font-bold hover:bg-[#09432a] transition-colors cursor-pointer"
                    >
                      সেলার হিসেবে সক্রিয় হোন &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
