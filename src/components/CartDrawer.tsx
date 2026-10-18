import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
    openCheckout,
  } = useCart();
  const { lang, t } = useLanguage();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0D5C3A]" />
              <h2 className="text-base font-bold text-stone-900">
                {t('myCart')} ({cartItems.length})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <ShoppingBag className="w-12 h-12 text-stone-300 mb-3" />
                <p className="text-sm font-semibold text-stone-600">
                  {lang === 'bn' ? 'আপনার শপিং ব্যাগটি খালি' : 'Your bag is empty'}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {lang === 'bn'
                    ? 'ক্যাম্পাস মার্কেটপ্লেস থেকে পছন্দসই বই ও সামগ্রী যোগ করুন।'
                    : 'Explore products from fellow students across campuses.'}
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 rounded-2xl border border-stone-200/90 bg-stone-50/50"
                >
                  <img
                    src={item.imageUrl || '/images/academic_textbooks_1792159211354.jpg'}
                    alt={item.productTitle}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {item.productTitle}
                      </h4>
                      <p className="text-xs font-bold text-[#0D5C3A] font-mono mt-0.5">
                        ৳ {item.unitPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden text-xs">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>ক্যাম্পাস পিকআপ ডেলিভারি ফি:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  ৳ ০ (ফ্রি)
                </span>
              </div>

              <div className="flex items-center justify-between text-base font-bold text-stone-900 pt-1 border-t border-stone-100">
                <span>মোট প্রদেয় মূল্য:</span>
                <span className="text-xl font-mono text-[#0D5C3A]">
                  ৳ {cartTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D5C3A]" />
                <span>ক্যাশ অন পিকআপ বা বিকাশ/নগদে সুরক্ষিত পেমেন্ট</span>
              </div>

              <button
                onClick={openCheckout}
                className="w-full h-12 rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>ক্যাম্পাস পিকআপ অর্ডার সম্পন্ন করুন</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
