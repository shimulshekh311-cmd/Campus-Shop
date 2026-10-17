import React from 'react';
import { Heart, ShoppingBag, MapPin, Eye } from 'lucide-react';
import { Product, Campus } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ProductCardProps {
  product: Product;
  campuses: Campus[];
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
}) => {
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { lang, t } = useLanguage();

  const favorite = isFavorite(product.id);

  const getConditionLabel = () => {
    switch (product.condition) {
      case 'new':
        return t('conditionNew');
      case 'like_new':
        return t('conditionLikeNew');
      case 'used_good':
        return t('conditionUsedGood');
      case 'used_fair':
        return t('conditionUsedFair');
      default:
        return product.condition;
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between">
      
      {/* Top Image Container */}
      <div
        className="relative aspect-[4/3] bg-stone-100 cursor-pointer overflow-hidden"
        onClick={() => onOpenDetails(product)}
      >
        <img
          src={product.images[0] || '/images/academic_textbooks_1792159211354.jpg'}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/academic_textbooks_1792159211354.jpg';
          }}
        />

        {/* Floating Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-xs ${
            favorite
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-stone-500 hover:text-rose-600 hover:bg-white'
          }`}
          title={favorite ? 'Remove Favorite' : 'Save Item'}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Condition & Type Text Badges */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-900/80 text-white backdrop-blur-xs">
            {getConditionLabel()}
          </span>
          {product.isFactoryManufactured && (
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-xs">
              সরাসরি ফ্যাক্টরি
            </span>
          )}
          {product.isDigital && (
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-xs">
              ডিজিটাল কপি
            </span>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Department or Category Tag - No Campus Display on Product */}
          {product.department ? (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1">
              <span className="truncate max-w-[180px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                {product.department}
              </span>
            </div>
          ) : (
            <div className="h-2"></div>
          )}

          {/* Product Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 hover:text-[#0D5C3A] cursor-pointer transition-colors leading-snug"
          >
            {product.title}
          </h3>
        </div>

        {/* Price & Actions Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-stone-900 font-mono tabular-nums">
                ৳ {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] text-stone-400 line-through font-mono tabular-nums hidden xs:inline">
                  ৳ {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.isNegotiable && (
              <span className="text-[10px] text-amber-700 font-medium">
                {lang === 'bn' ? 'আলোচনা সাপেক্ষ' : 'Negotiable'}
              </span>
            )}
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stockQuantity <= 0}
            className={`h-8 sm:h-9 px-2 sm:px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.97] shrink-0 ${
              product.stockQuantity > 0
                ? 'bg-[#0D5C3A] text-white hover:bg-[#09432a]'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
            title={product.stockQuantity > 0 ? t('addToCart') : 'Out of Stock'}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">
              {product.stockQuantity > 0 ? t('addToCart') : 'স্টক শেষ'}
            </span>
          </button>
        </div>

      </div>

    </div>
  );
};
