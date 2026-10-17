import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product, Campus } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  campuses: Campus[];
  onOpenDetails: (product: Product) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  products,
  campuses,
  onOpenDetails,
}) => {
  const { favorites, toggleFavorite, addToCart } = useCart();
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h2 className="text-base font-bold text-stone-900">
              {lang === 'bn' ? 'সংরক্ষিত পণ্য তালিকা' : 'Saved Items'} ({favoriteProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {favoriteProducts.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Heart className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-600">
                {lang === 'bn' ? 'কোনো পণ্য সংরক্ষিত নেই' : 'No saved items'}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                পণ্য কার্ডের হার্ট আইকনে ক্লিক করে পছন্দের বই বা সামগ্রী সংরক্ষণ করুন।
              </p>
            </div>
          ) : (
            favoriteProducts.map((p) => {
              const campus = campuses.find((c) => c.id === p.campusId);
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl border border-stone-200 bg-white flex items-center justify-between gap-3 shadow-xs hover:border-stone-300 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => {
                      onOpenDetails(p);
                      onClose();
                    }}
                  >
                    <img
                      src={p.images[0] || '/images/academic_textbooks_1792159211354.jpg'}
                      alt={p.title}
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] font-semibold text-[#0D5C3A]">
                        {campus ? campus.nameBn : p.campusId}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-xs font-mono font-bold text-stone-900 mt-0.5">
                        ৳ {p.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="h-9 px-3 text-xs font-bold rounded-xl bg-[#0D5C3A] text-white hover:bg-[#09432a] transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t('addToCart')}</span>
                    </button>

                    <button
                      onClick={() => toggleFavorite(p.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
