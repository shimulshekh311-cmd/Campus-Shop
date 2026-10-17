import React from 'react';
import { Campus, CampusId } from '../types/index.ts';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface CampusBarProps {
  campuses: Campus[];
  selectedCampus: CampusId | 'all';
  onSelectCampus: (id: CampusId | 'all') => void;
  productCountsByCampus: Record<string, number>;
}

export const CampusBar: React.FC<CampusBarProps> = ({
  campuses,
  selectedCampus,
  onSelectCampus,
  productCountsByCampus,
}) => {
  const { lang } = useLanguage();

  return (
    <div className="w-full bg-[#F4F1EA] border-b border-stone-200/80 py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-[#0D5C3A]" />
          <span className="text-xs font-semibold text-stone-700">
            {lang === 'bn' ? 'ক্যাম্পাস নির্বাচন করুন:' : 'Select Your Campus:'}
          </span>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            ({lang === 'bn' ? 'সরাসরি ক্যাম্পাসে ফ্রি পিকআপ' : 'Free in-person campus pickup'})
          </span>
        </div>

        {/* Clean, unboxed interactive segmented buttons with zero-pill discipline */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => onSelectCampus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              selectedCampus === 'all'
                ? 'bg-[#0D5C3A] text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            {lang === 'bn' ? 'সকল ৭ ক্যাম্পাস' : 'All 7 Campuses'}
          </button>

          {campuses.map((campus) => {
            const isSelected = selectedCampus === campus.id;
            const count = productCountsByCampus[campus.id] || 0;
            return (
              <button
                key={campus.id}
                onClick={() => onSelectCampus(campus.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0D5C3A] text-white shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
                }`}
              >
                <span>{lang === 'bn' ? campus.nameBn : campus.nameEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
