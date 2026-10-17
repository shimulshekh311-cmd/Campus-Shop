import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, { bn: string; en: string }> = {
  appName: { bn: 'CampusShop', en: 'CampusShop' },
  appTagline: {
    bn: 'ঢাকা সেন্ট্রাল ইউনিভার্সিটির ৭ ক্যাম্পাস মার্কেটপ্লেস',
    en: 'Dhaka Central University 7 Campuses Marketplace',
  },
  allCampuses: { bn: 'সকল ৭টি ক্যাম্পাস', en: 'All 7 Campuses' },
  searchPlaceholder: {
    bn: 'বই, নোট, হুডি, ক্যালকুলেটর বা ডিপার্টমেন্ট খুঁজুন...',
    en: 'Search textbooks, notes, hoodies, calculators...',
  },
  allCategories: { bn: 'সকল ক্যাটাগরি', en: 'All Categories' },
  books: { bn: 'একাডেমিক বই', en: 'Academic Books' },
  notes: { bn: 'নোট ও সাজেশন', en: 'Notes & Sheets' },
  stationery: { bn: 'স্টেশনারি', en: 'Stationery' },
  clothing: { bn: 'পোশাক ও হুডি', en: 'Apparel & Hoodies' },
  electronics: { bn: 'ইলেকট্রনিকস ও ক্যালকুলেটর', en: 'Electronics' },
  hostel: { bn: 'হোস্টেল প্রয়োজনীয়', en: 'Hostel Needs' },
  digital: { bn: 'ডিজিタル রিসোর্স', en: 'Digital Resources' },

  conditionNew: { bn: 'একদম নতুন', en: 'Brand New' },
  conditionLikeNew: { bn: 'নতুনের মতো ফ্রেশ', en: 'Like New' },
  conditionUsedGood: { bn: 'ব্যবহৃত (ভালো অবস্থা)', en: 'Used - Good' },
  conditionUsedFair: { bn: 'ব্যবহৃত (চলনসই)', en: 'Used - Fair' },

  addToCart: { bn: 'কার্টে যোগ করুন', en: 'Add to Cart' },
  orderPickup: { bn: 'ক্যাম্পাসে পিকআপ নিন', en: 'Campus Pickup' },
  buyNow: { bn: 'সরাসরি কিনুন', en: 'Buy Now' },
  stock: { bn: 'মজুত', en: 'Stock' },
  taka: { bn: '৳', en: 'BDT ' },
  negotiable: { bn: 'আলোচনা সাপেক্ষ', en: 'Negotiable' },
  fixedPrice: { bn: 'একদাম', en: 'Fixed Price' },
  freePickup: { bn: 'ক্যাম্পাস পিকআপে কোনো ডেলিভারি ফি নেই', en: 'Zero delivery fee on campus pickup' },

  myOrders: { bn: 'আমার অর্ডার', en: 'My Orders' },
  myCart: { bn: 'শপিং ব্যাগ', en: 'Shopping Bag' },
  favorites: { bn: 'সংরক্ষিত', en: 'Saved' },
  sellerHub: { bn: 'সেলার হাব', en: 'Seller Hub' },
  adminPanel: { bn: 'অ্যাডমিন প্যানেল', en: 'Admin Panel' },
  becomeSeller: { bn: 'বিক্রেতা হোন', en: 'Become a Seller' },
  login: { bn: 'লগইন', en: 'Login' },
  logout: { bn: 'লগআউট', en: 'Logout' },
  demoSwitch: { bn: 'রোল পরিবর্তন করুন', en: 'Switch Demo Role' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('campusshop_lang') as Language) || 'bn';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('campusshop_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang] || translations[key].bn;
    }
    return key;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
