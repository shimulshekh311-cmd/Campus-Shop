import React from 'react';
import {
  BookOpen,
  FileText,
  PenTool,
  Shirt,
  Cpu,
  Home,
  Download,
  LayoutGrid,
} from 'lucide-react';
import { ProductCategory } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface CategoryNavProps {
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  categoryCounts: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const { lang, t } = useLanguage();

  const categories: Array<{
    id: ProductCategory | 'all';
    labelBn: string;
    labelEn: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'all',
      labelBn: 'সব ক্যাটাগরি',
      labelEn: 'All Items',
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      id: 'books',
      labelBn: 'বই ও গাইড',
      labelEn: 'Books',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'notes',
      labelBn: 'নোট ও শিট',
      labelEn: 'Notes & Sheets',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'clothing',
      labelBn: 'পোশাক ও হুডি',
      labelEn: 'Clothing',
      icon: <Shirt className="w-4 h-4" />,
    },
    {
      id: 'electronics',
      labelBn: 'ইলেকট্রনিক্স',
      labelEn: 'Electronics',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'stationery',
      labelBn: 'স্টেশনারি',
      labelEn: 'Stationery',
      icon: <PenTool className="w-4 h-4" />,
    },
    {
      id: 'hostel',
      labelBn: 'হোস্টেল ও মেস',
      labelEn: 'Hostel Needs',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'digital',
      labelBn: 'ডিজিটাল রিসোর্স',
      labelEn: 'Digital',
      icon: <Download className="w-4 h-4" />,
    },
  ];

  return (
    <div className="py-4 border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">
            {lang === 'bn' ? 'ক্যাটাগরি ব্রাউজ করুন' : 'Browse Categories'}
          </h2>
        </div>

        {/* Clean horizontal scrollable category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#0D5C3A] text-white shadow-sm'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <span className={isSelected ? 'text-amber-300' : 'text-stone-500'}>
                  {cat.icon}
                </span>
                <span>{lang === 'bn' ? cat.labelBn : cat.labelEn}</span>
                {cat.id !== 'all' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/70 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
