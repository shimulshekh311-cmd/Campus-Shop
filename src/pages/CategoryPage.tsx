import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  PenTool,
  Shirt,
  ShoppingBag,
  Cpu,
  Home as HomeIcon,
  Download,
  LayoutGrid,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Package,
  Search,
  Check
} from 'lucide-react';
import { Product, ProductCategory, Campus } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface CategoryPageProps {
  onGoHome: () => void;
  products: Product[];
  campuses: Campus[];
  onOpenDetails: (product: Product) => void;
}

interface CategoryCardMeta {
  id: ProductCategory;
  titleBn: string;
  titleEn: string;
  tagline: string;
  icon: React.ReactNode;
  cardStyle: string;
  iconContainerStyle: string;
  countBadgeStyle: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  onGoHome,
  products,
  campuses,
  onOpenDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryMetas: CategoryCardMeta[] = [
    {
      id: 'books',
      titleBn: 'বই ও গাইড',
      titleEn: 'Books & Guides',
      tagline: 'পাঠ্যবই ও প্রশ্নব্যাংক',
      icon: <BookOpen className="w-5 h-5" />,
      cardStyle: 'bg-emerald-50/90 border-emerald-200/90 hover:border-emerald-500 hover:bg-emerald-100/70',
      iconContainerStyle: 'bg-[#0D5C3A] text-white shadow-xs',
      countBadgeStyle: 'bg-emerald-700/10 text-[#0D5C3A] border-emerald-300',
    },
    {
      id: 'notes',
      titleBn: 'হ্যান্ডনোট ও শিট',
      titleEn: 'Notes & Sheets',
      tagline: 'লেকচার শিট ও সাজেশন',
      icon: <FileText className="w-5 h-5" />,
      cardStyle: 'bg-indigo-50/90 border-indigo-200/90 hover:border-indigo-500 hover:bg-indigo-100/70',
      iconContainerStyle: 'bg-indigo-600 text-white shadow-xs',
      countBadgeStyle: 'bg-indigo-700/10 text-indigo-700 border-indigo-300',
    },
    {
      id: 'clothing',
      titleBn: 'পোশাক ও হুডি',
      titleEn: 'Hoodies & Tees',
      tagline: 'ক্যাম্পাস হুডি ও টি-শার্ট',
      icon: <Shirt className="w-5 h-5" />,
      cardStyle: 'bg-amber-50/90 border-amber-200/90 hover:border-amber-500 hover:bg-amber-100/70',
      iconContainerStyle: 'bg-amber-600 text-white shadow-xs',
      countBadgeStyle: 'bg-amber-700/10 text-amber-800 border-amber-300',
    },
    {
      id: 'bags',
      titleBn: 'ব্যাগ ও ব্যাকপ্যাক',
      titleEn: 'Bags & Packs',
      tagline: 'ল্যাপটপ ও সাইড ব্যাগ',
      icon: <ShoppingBag className="w-5 h-5" />,
      cardStyle: 'bg-rose-50/90 border-rose-200/90 hover:border-rose-500 hover:bg-rose-100/70',
      iconContainerStyle: 'bg-rose-600 text-white shadow-xs',
      countBadgeStyle: 'bg-rose-700/10 text-rose-700 border-rose-300',
    },
    {
      id: 'stationery',
      titleBn: 'স্টেশনারি ও টুলস',
      titleEn: 'Calculators & Tools',
      tagline: 'ক্যালকুলেটর ও স্কেল',
      icon: <PenTool className="w-5 h-5" />,
      cardStyle: 'bg-teal-50/90 border-teal-200/90 hover:border-teal-500 hover:bg-teal-100/70',
      iconContainerStyle: 'bg-teal-700 text-white shadow-xs',
      countBadgeStyle: 'bg-teal-700/10 text-teal-800 border-teal-300',
    },
    {
      id: 'electronics',
      titleBn: 'ইলেকট্রনিক্স',
      titleEn: 'Gadgets & Power',
      tagline: 'পাওয়ারব্যাংক ও হেডফোন',
      icon: <Cpu className="w-5 h-5" />,
      cardStyle: 'bg-cyan-50/90 border-cyan-200/90 hover:border-cyan-500 hover:bg-cyan-100/70',
      iconContainerStyle: 'bg-cyan-700 text-white shadow-xs',
      countBadgeStyle: 'bg-cyan-700/10 text-cyan-800 border-cyan-300',
    },
    {
      id: 'hostel',
      titleBn: 'হোস্টেল সামগ্রী',
      titleEn: 'Hostel Essentials',
      tagline: 'টেবিল ল্যাম্প ও ফ্যান',
      icon: <HomeIcon className="w-5 h-5" />,
      cardStyle: 'bg-orange-50/90 border-orange-200/90 hover:border-orange-500 hover:bg-orange-100/70',
      iconContainerStyle: 'bg-orange-600 text-white shadow-xs',
      countBadgeStyle: 'bg-orange-700/10 text-orange-800 border-orange-300',
    },
    {
      id: 'digital',
      titleBn: 'ডিজিটাল নোটস',
      titleEn: 'Digital PDF',
      tagline: 'ইনস্ট্যান্ট প্রিভিউ ও ডাউনলোড',
      icon: <Download className="w-5 h-5" />,
      cardStyle: 'bg-purple-50/90 border-purple-200/90 hover:border-purple-500 hover:bg-purple-100/70',
      iconContainerStyle: 'bg-purple-600 text-white shadow-xs',
      countBadgeStyle: 'bg-purple-700/10 text-purple-800 border-purple-300',
    },
  ];

  // Calculate count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter products by selected category and optional search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.department?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const activeMeta = categoryMetas.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-5">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 hover:text-[#0D5C3A] transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
          <span>হোম</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <button
          onClick={() => setSelectedCategory('all')}
          className={`hover:text-[#0D5C3A] transition-colors ${
            selectedCategory === 'all' ? 'text-stone-900 font-semibold' : ''
          }`}
        >
          ক্যাটাগরি পেজ (Categories)
        </button>
        {activeMeta && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[#0D5C3A] font-semibold">{activeMeta.titleBn}</span>
          </>
        )}
      </nav>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-[#0D5C3A]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {selectedCategory === 'all'
                ? 'সকল ক্যাটাগরি ও পণ্য বিভাগ'
                : `${activeMeta?.titleBn || ''} (${filteredProducts.length}টি পণ্য)`}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              {selectedCategory === 'all'
                ? 'আপনার প্রয়োজনীয় বিভাগটি বেছে নিন এবং সরাসরি শিক্ষার্থীদের তালিকাভুক্ত সামগ্রী দেখুন'
                : activeMeta?.tagline}
            </p>
          </div>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl border border-stone-300 hover:border-stone-400 text-xs sm:text-sm font-bold text-stone-700 bg-white hover:bg-stone-50 transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল ক্যাটাগরি কার্ড দেখুন</span>
          </button>
        )}
      </div>

      {/* 1. Category Cards Grid: ছোট ছোট কালারফুল কার্ড */}
      {selectedCategory === 'all' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {categoryMetas.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className={`group cursor-pointer rounded-2xl border p-3.5 sm:p-4 shadow-xs transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${cat.cardStyle} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.iconContainerStyle}`}>
                      {cat.icon}
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-2xs ${cat.countBadgeStyle}`}>
                      {count}টি পণ্য
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-stone-950 transition-colors leading-snug">
                    {cat.titleBn}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 block mt-0.5 line-clamp-1">
                    {cat.tagline}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-bold text-stone-700 group-hover:text-stone-900">
                  <span>পণ্য দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. When a specific category is selected: Search Bar & Products Grid */}
      {selectedCategory !== 'all' && (
        <div className="space-y-6">
          {/* Quick Category Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-3.5 py-2 rounded-xl font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors shrink-0"
            >
              সব ক্যাটাগরি
            </button>
            {categoryMetas.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === c.id
                    ? 'bg-[#0D5C3A] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{c.titleBn}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === c.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {categoryCounts[c.id] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search inside selected category */}
          <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-xs">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${activeMeta?.titleBn} এর মধ্যে খুঁজুন...`}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/20 outline-hidden"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">
                এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                অন্য কোনো ক্যাটাগরি নির্বাচন করুন বা সার্চ ফিল্টার পরিবর্তন করুন।
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#0D5C3A] text-white text-xs font-bold hover:bg-[#09432a]"
              >
                সকল ক্যাটাগরি কার্ডে ফিরে যান
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  campuses={campuses}
                  onOpenDetails={(p) => onOpenDetails(p)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
