import React from 'react';
import { Search, Shield, Zap, RefreshCw, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Campus, CampusId } from '../types/index.ts';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCampus: CampusId | 'all';
  onSelectCampus: (campusId: CampusId | 'all') => void;
  campuses: Campus[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCampus,
  onSelectCampus,
  campuses,
}) => {
  const { lang } = useLanguage();

  return (
    <div className="bg-gradient-to-b from-[#FBF9F4] to-[#F5F2EA] border-b border-stone-200/80 pt-6 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Direct Search & Quick Discovery (7 cols) */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#0D5C3A] uppercase tracking-wider">
              <span>{lang === 'bn' ? 'ঢাকা সেন্ট্রাল ইউনিভার্সিটি' : 'Dhaka Central University'}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'bn' ? 'স্টুডেন্ট মার্কেটপ্লেস' : 'Student Marketplace'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
              {lang === 'bn' ? (
                <>
                  ক্যাম্পাসের বন্ধুদের মাঝে বই ও শিক্ষা সামগ্রী{' '}
                  <span className="text-[#0D5C3A] underline decoration-amber-400 decoration-4">
                    সহজে লেনদেন
                  </span>
                </>
              ) : (
                <>
                  Exchange Textbooks & Gear with Fellow Students{' '}
                  <span className="text-[#0D5C3A] underline decoration-amber-400 decoration-4">
                    Safely On Campus
                  </span>
                </>
              )}
            </h1>

            <p className="mt-2 text-sm text-stone-600 max-w-xl">
              {lang === 'bn'
                ? '৭টি ক্যাম্পাসের শিক্ষার্থীদের ব্যবহৃত ও নতুন বই, হ্যান্ডনোট, হুডি, ক্যালকুলেটর ও হোস্টেল গ্যাজেট কিনুন এবং সরাসরি ক্যাম্পাসের পিকআপ পয়েন্টে দেখা করে ক্যাশ বা বিকাশে নিন।'
                : 'Buy and sell textbooks, notes, hoodies, and electronics across 7 colleges. Zero delivery fee with verified campus pickup spots.'}
            </p>

            {/* Quick Search Box */}
            <div className="mt-4">
              <div className="relative flex items-center shadow-sm rounded-2xl bg-white border border-stone-300 focus-within:border-[#0D5C3A] focus-within:ring-2 focus-within:ring-[#0D5C3A]/10 transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'কী খুঁজছেন? যেমন: অর্থনীতি বই, ক্যাসিও ক্যালকুলেটর, হুডি...'
                      : 'Search books, Casio calculator, notes, hoodies...'
                  }
                  className="w-full py-3.5 pl-3 pr-10 text-sm bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-1.5 mr-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Campus Select Quick Filter in Hero */}
            <div className="mt-3 flex items-center gap-2 text-xs text-stone-600">
              <span className="shrink-0 font-medium text-stone-500">
                {lang === 'bn' ? 'ক্যাম্পাস ড্রপডাউন:' : 'Campus:'}
              </span>
              <select
                value={selectedCampus}
                onChange={(e) => onSelectCampus(e.target.value as CampusId | 'all')}
                className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#0D5C3A]"
              >
                <option value="all">
                  {lang === 'bn' ? 'সকল ৭টি ক্যাম্পাস' : 'All 7 Campuses'}
                </option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === 'bn' ? c.nameBn : c.nameEn} ({c.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Value Props Row */}
            <div className="mt-4 pt-3 border-t border-stone-200/60 grid grid-cols-3 gap-2 text-stone-700">
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="w-4 h-4 text-[#0D5C3A] shrink-0" />
                <span className="font-medium text-stone-800">
                  {lang === 'bn' ? 'যাচাইকৃত শিক্ষার্থী' : 'Verified Students'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium text-stone-800">
                  {lang === 'bn' ? 'জিরো ডেলিভারি ফি' : 'Zero Delivery Fee'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <RefreshCw className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium text-stone-800">
                  {lang === 'bn' ? 'হাতে হাতে লেনদেন' : 'In-Person Handover'}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Compact authentic campus photo (5 cols) */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-100 group">
              <img
                src="/images/campus_hero_banner_1792159209821.jpg"
                alt="Dhaka Central University Students"
                className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[11px] font-semibold text-amber-300">
                  ক্যাম্পাস পিয়ার-টু-পিয়ার নেটওয়ার্ক
                </span>
                <p className="text-xs font-medium text-stone-100">
                  ঢাকা কলেজ, ইডেন, তিতুমীর, কবি নজরুল, সোহরাওয়ার্দী, বদরুন্নেসা ও বাঙলা কলেজ
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
