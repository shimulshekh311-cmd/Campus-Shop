import React, { useState } from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  Phone,
  ShoppingBag,
  Clock,
  Heart,
  Share2,
  Check,
  Store,
  Info,
} from 'lucide-react';
import { Product, Campus } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  campuses: Campus[];
  onClose: () => void;
  onInstantBuy: (product: Product, quantity: number, selectedDesign?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  campuses,
  onClose,
  onInstantBuy,
}) => {
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { lang, t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Initialize selected design when product changes
  React.useEffect(() => {
    if (product?.designOptions && product.designOptions.length > 0) {
      setSelectedDesign(product.designOptions[0]);
    } else {
      setSelectedDesign('');
    }
    setShowFullPreview(false);
  }, [product]);

  if (!product) return null;

  const campus = campuses.find((c) => c.id === product.campusId);
  const campusName = campus
    ? lang === 'bn'
      ? campus.nameBn
      : campus.nameEn
    : product.campusId;

  // Available pickup points for this campus
  const pickupPoints = campus?.pickupPoints.filter(
    (pt) =>
      product.pickupPointIds?.includes(pt.id) ||
      product.pickupPointIds?.length === 0 ||
      !product.pickupPointIds
  ) || campus?.pickupPoints || [];

  const favorite = isFavorite(product.id);

  const handleCopyPhone = () => {
    if (product.sellerPhone) {
      navigator.clipboard.writeText(product.sellerPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-900/40 hover:bg-stone-900/60 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Left Column: Product Image & Badges (5 cols) */}
          <div className="md:col-span-5 bg-stone-100 relative min-h-[260px] md:min-h-full flex items-center justify-center">
            <img
              src={product.images[0] || '/src/assets/images/academic_textbooks_1792159211354.jpg'}
              alt={product.title}
              className="w-full h-full object-cover max-h-[380px] md:max-h-full"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0D5C3A] text-white shadow-xs">
                {product.condition === 'new'
                  ? 'একদম নতুন'
                  : product.condition === 'like_new'
                  ? 'নতুনের মতো ফ্রেশ'
                  : 'ব্যবহৃত'}
              </span>
              {product.isNegotiable && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-xs">
                  দাম আলোচনা সাপেক্ষ
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module (7 cols) */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between">
            <div>
              {/* Category / Department Tag - No Campus Display on Product */}
              {product.department && (
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                  <span className="text-stone-700 font-semibold bg-stone-100 px-2 py-0.5 rounded">
                    {product.department}
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                {product.title}
              </h2>

              {/* Price Banner */}
              <div className="mt-3 py-3 px-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-[#0D5C3A] font-mono tabular-nums">
                    ৳ {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-2.5 text-xs text-stone-400 line-through font-mono">
                      ৳ {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    {product.stockQuantity > 0
                      ? `${product.stockQuantity}টি মজুত আছে`
                      : 'স্টক শেষ'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-3 text-xs sm:text-sm text-stone-700 leading-relaxed max-h-32 overflow-y-auto pr-1">
                <p>{product.description}</p>
              </div>

              {/* 1. FACTORY DIRECT SPECIAL SECTION */}
              {product.isFactoryManufactured && (
                <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      সরাসরি নির্বাচিত ফ্যাক্টরি পণ্য (Factory Direct)
                    </span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      সর্বনিম্ন ফ্যাক্টরি রেট
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-amber-900 leading-normal">
                    ফ্যাক্টরি: <strong>{product.factoryName || 'সেন্ট্রাল মার্চেন্ডাইজ অ্যান্ড টেক্সটাইল ফ্যাক্টরি'}</strong> · ফ্যাক্টরি থেকে সরাসরি আমাদের সদস্য (রানার) পাবলিক বাসে বহন করে ৭ ক্যাম্পাসের বুথে পৌঁছে দেয়।
                  </p>

                  {/* Available Designs */}
                  {product.designOptions && product.designOptions.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1.5">
                        পছন্দের ডিজাইন / ভ্যারিয়েশন নির্বাচন করুন:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {product.designOptions.map((design) => (
                          <button
                            key={design}
                            type="button"
                            onClick={() => setSelectedDesign(design)}
                            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                              selectedDesign === design
                                ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            {design}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. DIGITAL PRODUCT PREVIEW & EXCERPT SECTION */}
              {product.isDigital && (
                <div className="mt-3 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      ডিজিটাল পণ্য (PDF / লেকচার নোটস / স্লাইডস)
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                      {product.digitalInfo?.pageCount || 45} পৃষ্ঠা · {product.digitalInfo?.fileFormat || 'PDF'}
                    </span>
                  </div>

                  <p className="text-[11px] text-blue-900">
                    বিকাশ বা নগদে পেমেন্ট করার ট্রানজ্যাকশন আইডি দেওয়ার সাথে সাথে ফাইলটির সম্পূর্ণ এক্সেস ও ডাউনলোড লিংক পেয়ে যাবেন।
                  </p>

                  {/* Sample Excerpt Reader */}
                  <div className="bg-white rounded-xl p-3 border border-blue-200 text-[11px] text-stone-700">
                    <div className="flex items-center justify-between mb-1.5 font-semibold text-stone-900">
                      <span>নমুনা পাতা / প্রিভিউ অংশ (Sample Preview):</span>
                      <button
                        type="button"
                        onClick={() => setShowFullPreview(!showFullPreview)}
                        className="text-[#0D5C3A] hover:underline text-[11px]"
                      >
                        {showFullPreview ? 'ছোট করুন' : 'সম্পূর্ণ প্রিভিউ পড়ুন'}
                      </button>
                    </div>
                    <div className={`italic text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/80 ${showFullPreview ? 'max-h-56' : 'max-h-20'} overflow-y-auto font-serif`}>
                      "{product.digitalInfo?.previewExcerptBn || 'ঢাকা সেন্ট্রাল ইউনিভার্সিটি ৭ ক্যাম্পাসের জন্য বিশেষ তৈরি পরীক্ষার পূর্ণাঙ্গ সাজেসন, বিগত ৫ বছরের সমাধান ও গুরুত্বপূর্ণ শর্ট নোটস...'}"
                    </div>
                  </div>
                </div>
              )}

              {/* Campus Pickup Points Information (Physical Only) */}
              {!product.isDigital && (
                <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800">
                  <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0D5C3A]" />
                    <span>ক্যাম্পাস পিকআপ স্পট (ক্যাশ অন পিকআপ):</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-stone-700">
                    {pickupPoints.slice(0, 3).map((pt) => (
                      <li key={pt.id} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0D5C3A] shrink-0" />
                        <span className="font-medium text-stone-900">{pt.nameBn}</span>
                        <span className="text-stone-500">({pt.timeAdvice})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verified Seller Box */}
              <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0D5C3A] text-white flex items-center justify-center font-bold text-xs">
                    {product.sellerName ? product.sellerName.charAt(0) : 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-stone-900">
                        {product.sellerName}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-stone-500">
                      {product.isFactoryManufactured ? 'অফিসিয়াল ফ্যাক্টরি ভেন্ডর' : 'যাচাইকৃত শিক্ষার্থী বিক্রেতা'}
                    </span>
                  </div>
                </div>

                {product.sellerPhone && (
                  <button
                    onClick={handleCopyPhone}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        <span>{product.sellerPhone}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Actions: Quantity + Cart + Buy */}
            <div className="mt-5 pt-3 border-t border-stone-200">
              <div className="flex items-center gap-2.5">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-2.5 text-xs font-bold font-mono tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity || 99, quantity + 1))}
                    className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => {
                    addToCart(product, quantity, selectedDesign || undefined);
                    onClose();
                  }}
                  disabled={!product.isDigital && product.stockQuantity <= 0}
                  className="flex-1 h-11 px-3 text-xs font-bold rounded-xl border border-[#0D5C3A] text-[#0D5C3A] hover:bg-[#0D5C3A]/5 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>কার্টে যোগ করুন</span>
                </button>

                {/* Instant Campus Pickup Checkout */}
                <button
                  onClick={() => {
                    onInstantBuy(product, quantity, selectedDesign || undefined);
                    onClose();
                  }}
                  disabled={!product.isDigital && product.stockQuantity <= 0}
                  className="flex-1 h-11 px-3 text-xs font-bold rounded-xl bg-[#0D5C3A] text-white hover:bg-[#09432a] shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <span>{product.isDigital ? 'ডিজিটাল কপি কিনুন' : 'সরাসরি পিকআপ অর্ডার'}</span>
                </button>

                {/* Favorite Toggle */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`w-11 h-11 rounded-xl border border-stone-200 flex items-center justify-center transition-colors shrink-0 ${
                    favorite ? 'bg-rose-50 text-rose-600' : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${favorite ? 'fill-rose-600' : ''}`} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
