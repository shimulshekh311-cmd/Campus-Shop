import React, { useState } from 'react';
import {
  Home,
  LayoutGrid,
  Package,
  Truck,
  User as UserIcon,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Store as StoreIcon,
  Globe,
  ChevronDown,
  LogOut,
  Sparkles,
  MapPin,
  Factory,
  ArrowRightLeft,
  UserPlus,
  Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { CampusId, UserRole } from '../types/index.ts';
import { LogoUploadModal } from './LogoUploadModal.tsx';

interface NavbarProps {
  onGoHome: () => void;
  onOpenCategories: () => void;
  onOpenOrders: () => void;
  onOpenTracking: () => void;
  onOpenAccount: () => void;
  onOpenFavorites: () => void;
  onOpenSellerHub: () => void;
  onOpenAdminPanel: () => void;
  onOpenPickupStaffDashboard: () => void;
  onOpenDeliveryRunnerDashboard: () => void;
  onOpenFactoryDashboard: () => void;
  selectedCampus: CampusId | 'all';
  onSelectCampus: (campusId: CampusId | 'all') => void;
  activeTab?: 'home' | 'category' | 'orders' | 'tracking' | 'account';
  logoUrl?: string;
  onUpdateLogo?: (newLogo: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  onOpenCategories,
  onOpenOrders,
  onOpenTracking,
  onOpenAccount,
  onOpenFavorites,
  onOpenSellerHub,
  onOpenAdminPanel,
  onOpenPickupStaffDashboard,
  onOpenDeliveryRunnerDashboard,
  onOpenFactoryDashboard,
  selectedCampus,
  onSelectCampus,
  activeTab = 'home',
  logoUrl,
  onUpdateLogo,
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
  const { cartCount, openCart, favorites } = useCart();
  const { lang, toggleLang, t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const getRoleDisplayName = (r: UserRole | 'guest') => {
    switch (r) {
      case 'admin':
        return 'সুপার অ্যাডমিন';
      case 'seller':
        return 'ভেরিফায়েড সেলার';
      case 'pickup_staff':
        return 'পিকআপ কর্মী';
      case 'delivery_man':
        return 'ডেলিভারি রানার';
      case 'factory_staff':
        return 'ফ্যাক্টরি ইনচার্জ';
      case 'buyer':
        return 'বায়ার (ক্রেতা)';
      default:
        return 'অতিথি';
    }
  };

  const openCurrentRoleDashboard = () => {
    setIsUserMenuOpen(false);
    if (role === 'admin') onOpenAdminPanel();
    else if (role === 'seller') onOpenSellerHub();
    else if (role === 'pickup_staff') onOpenPickupStaffDashboard();
    else if (role === 'delivery_man') onOpenDeliveryRunnerDashboard();
    else if (role === 'factory_staff') onOpenFactoryDashboard();
    else onOpenAccount();
  };

  // Prominent distinct active tab styling for crystal clear visual indicator
  const getTabClasses = (tabName: 'home' | 'category' | 'orders' | 'tracking' | 'account') => {
    const isActive = activeTab === tabName;
    if (isActive) {
      return 'bg-[#0D5C3A] text-white font-extrabold shadow-sm ring-2 ring-[#0D5C3A]/30 scale-[1.02]';
    }
    return 'text-stone-700 hover:text-[#0D5C3A] hover:bg-stone-100 font-semibold';
  };

  return (
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 w-full overflow-x-clip">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 md:gap-8 min-w-0">
          
          {/* 1. Brand Logo & University Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink min-w-0">
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-2.5 sm:gap-3 shrink min-w-0 group text-left cursor-pointer select-none"
            >
              {/* Logo Image - slightly larger, clean cropped badge */}
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white shadow-xs border border-emerald-900/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img
                  src={logoUrl || "/images/campus_shop_logo.jpg"}
                  alt="CampusShop Logo"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-[#0D5C3A] truncate">
                    CampusShop
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/70 hidden sm:inline-block shrink-0">
                    ৭ ক্যাম্পাস
                  </span>
                </div>
                {/* Requested small tagline */}
                <span className="text-[10px] sm:text-xs text-stone-600 font-medium leading-tight mt-1 truncate max-w-[170px] sm:max-w-xs">
                  ক্যাম্পাসের সকল প্রয়োজন এক জায়গায়
                </span>
              </div>
            </button>

            {/* Quick Logo Upload Button */}
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              title="আপনার মূল লোগো আপলোড বা পরিবর্তন করুন"
              className="p-1.5 rounded-xl text-stone-400 hover:text-[#0D5C3A] hover:bg-emerald-50 border border-stone-200/80 hover:border-emerald-300 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* 2. Desktop Navigation: The 5 Requested Tabs (হোম, ক্যাটাগরি, অর্ডার, ট্রাকিং, একাউন্ট) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-semibold">
            {/* Tab 1: হোম */}
            <button
              type="button"
              onClick={onGoHome}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#0D5C3A] text-white font-bold shadow-sm ring-2 ring-[#0D5C3A]/30 scale-[1.02]'
                  : 'text-stone-700 hover:text-[#0D5C3A] hover:bg-stone-100'
              }`}
            >
              <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-amber-300' : 'text-[#0D5C3A]'}`} />
              <span>হোম</span>
            </button>

            {/* Tab 2: ক্যাটাগরি */}
            <button
              type="button"
              onClick={onOpenCategories}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'category'
                  ? 'bg-[#0D5C3A] text-white font-bold shadow-sm ring-2 ring-[#0D5C3A]/30 scale-[1.02]'
                  : 'text-stone-700 hover:text-[#0D5C3A] hover:bg-stone-100'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${activeTab === 'category' ? 'text-white' : 'text-[#0D5C3A]'}`} />
              <span>ক্যাটাগরি</span>
            </button>

            {/* Tab 3: অর্ডার */}
            <button
              type="button"
              onClick={onOpenOrders}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#0D5C3A] text-white font-bold shadow-sm ring-2 ring-[#0D5C3A]/30 scale-[1.02]'
                  : 'text-stone-700 hover:text-[#0D5C3A] hover:bg-stone-100'
              }`}
            >
              <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-amber-300' : 'text-[#0D5C3A]'}`} />
              <span>অর্ডার</span>
            </button>

            {/* Tab 4: ট্রাকিং */}
            <button
              type="button"
              onClick={onOpenTracking}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'tracking'
                  ? 'bg-blue-700 text-white font-bold shadow-sm ring-2 ring-blue-500/30 scale-[1.02]'
                  : 'text-stone-700 hover:text-blue-700 hover:bg-stone-100'
              }`}
            >
              <Truck className={`w-4 h-4 ${activeTab === 'tracking' ? 'text-amber-300' : 'text-blue-700'}`} />
              <span>ট্রাকিং</span>
            </button>

            {/* Tab 5: একাউন্ট */}
            <button
              type="button"
              onClick={onOpenAccount}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-amber-800 text-white font-bold shadow-sm ring-2 ring-amber-600/30 scale-[1.02]'
                  : 'text-stone-700 hover:text-amber-800 hover:bg-stone-100'
              }`}
            >
              <UserIcon className={`w-4 h-4 ${activeTab === 'account' ? 'text-amber-200' : 'text-[#0D5C3A]'}`} />
              <span>একাউন্ট</span>
            </button>
          </nav>

          {/* 3. Action Badges (Favorites, Cart, Language, User Dropdown) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="h-8 sm:h-9 px-2 sm:px-2.5 text-[11px] sm:text-xs font-semibold rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1"
              title="Language"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Favorites */}
            <button
              onClick={onOpenFavorites}
              className="relative p-1.5 sm:p-2 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title={t('favorites')}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="h-8 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white flex items-center gap-1.5 sm:gap-2 transition-all shadow-xs active:scale-[0.98]"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span className="text-xs font-bold hidden md:inline">ব্যাগ</span>
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-[#0D5C3A] text-[10px] sm:text-xs font-extrabold flex items-center justify-center font-mono">
                {cartCount}
              </span>
            </button>

            {!user ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#0D5C3A] flex items-center gap-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D5C3A]" />
                  <span>লগইন</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-10 px-2 sm:px-2.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white flex items-center gap-2 transition-colors text-stone-800 shadow-2xs cursor-pointer"
                  title="একাউন্ট মেনু"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex flex-col text-left hidden lg:flex">
                    <span className="text-xs font-bold text-stone-900 max-w-[110px] truncate leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#0D5C3A] leading-tight">
                      {getRoleDisplayName(role)}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>

                {/* Account Dropdown Modal */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-stone-200 py-2.5 z-50 text-stone-800">
                      
                      {/* Current Active Account Card */}
                      <div className="px-4 py-2.5 border-b border-stone-100">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {user.email}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#0D5C3A]/10 text-[#0D5C3A] border border-[#0D5C3A]/20">
                            {getRoleDisplayName(role)}
                          </span>
                          {user.approvalStatus === 'approved' && (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              অনুমোদিত
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Open Role-specific Dashboard */}
                      {role !== 'buyer' && (
                        <div className="py-1 px-2 border-b border-stone-100">
                          <button
                            type="button"
                            onClick={openCurrentRoleDashboard}
                            className="w-full px-3 py-2 text-xs font-bold rounded-xl text-left hover:bg-stone-50 text-[#0D5C3A] flex items-center gap-2 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>{getRoleDisplayName(role)} ড্যাশবোর্ডে যান</span>
                          </button>
                        </div>
                      )}

                      {/* Buying Rule Notice if seller or staff */}
                      {role !== 'buyer' && (
                        <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/60 text-[11px] text-amber-950">
                          <p className="font-semibold mb-1">
                            পণ্য কেনার জন্য বায়ার অ্যাকাউন্ট প্রয়োজন:
                          </p>
                          {linkedAccounts.some((a) => a.role === 'buyer') ? (
                            <button
                              type="button"
                              onClick={() => {
                                const buyerAcc = linkedAccounts.find((a) => a.role === 'buyer');
                                if (buyerAcc) switchAccount(buyerAcc.id);
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full py-1 px-2 rounded-lg bg-amber-600 text-white font-bold text-center flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span>বায়ার অ্যাকাউন্টে সুইচ করুন</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                await createLinkedBuyerAccount();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full py-1 px-2 rounded-lg bg-[#0D5C3A] text-white font-bold text-center flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>বায়ার অ্যাকাউন্ট লিংক করুন</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Account Actions */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenAccount();
                          }}
                          className="w-full px-4 py-2 text-xs text-left hover:bg-stone-50 flex items-center gap-2 text-stone-700 cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-stone-500" />
                          আমার অ্যাকাউন্ট প্রোফাইল
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            openApplyRole('seller');
                          }}
                          className="w-full px-4 py-2 text-xs text-left hover:bg-stone-50 flex items-center gap-2 text-amber-800 font-semibold cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          বিশেষ ভূমিকার জন্য আবেদন করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full px-4 py-2 text-xs text-left hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </div>
            )}

          </div>

        </div>
      </header>

      {/* 4. Mobile Fixed Bottom Navigation Bar with the exact 5 Tabs:
          হোম, ক্যাটাগরি, অর্ডার, ট্রাকিং, একাউন্ট */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-1.5 sm:px-2 py-1.5 shadow-lg max-w-full overflow-x-hidden select-none">
        <div className="grid grid-cols-5 items-center justify-around gap-1">
          
          {/* Tab 1: হোম */}
          <button
            type="button"
            onClick={onGoHome}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'bg-emerald-100/90 text-[#0D5C3A] font-black scale-105 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">হোম</span>
          </button>

          {/* Tab 2: ক্যাটাগরি */}
          <button
            type="button"
            onClick={onOpenCategories}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'category'
                ? 'bg-emerald-100/90 text-[#0D5C3A] font-black scale-105 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">ক্যাটাগরি</span>
          </button>

          {/* Tab 3: অর্ডার */}
          <button
            type="button"
            onClick={onOpenOrders}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'orders'
                ? 'bg-emerald-100/90 text-[#0D5C3A] font-black scale-105 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">অর্ডার</span>
          </button>

          {/* Tab 4: ট্রাকিং */}
          <button
            type="button"
            onClick={onOpenTracking}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'tracking'
                ? 'bg-blue-100 text-blue-800 font-black scale-105 shadow-2xs'
                : 'text-stone-500 hover:text-blue-700'
            }`}
          >
            <Truck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">ট্রাকিং</span>
          </button>

          {/* Tab 5: একাউন্ট */}
          <button
            type="button"
            onClick={onOpenAccount}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'account'
                ? 'bg-amber-100 text-amber-900 font-black scale-105 shadow-2xs'
                : 'text-stone-500 hover:text-amber-800'
            }`}
          >
            <UserIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">একাউন্ট</span>
          </button>

        </div>
      </nav>

      {/* Real Logo Upload Modal */}
      <LogoUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentLogoUrl={logoUrl || "/images/campus_shop_logo.jpg"}
        onSaveLogo={(newLogo) => {
          if (onUpdateLogo) {
            onUpdateLogo(newLogo);
          }
        }}
      />
    </>
  );
};
