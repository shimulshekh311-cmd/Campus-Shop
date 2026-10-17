import React, { useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { Order } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface ReviewModalProps {
  order: Order | null;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  order,
  onClose,
  onReviewSubmitted,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          orderId: order.id,
          productId: order.items[0]?.productId || '',
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onReviewSubmitted();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h2 className="text-sm font-bold text-stone-900">
            বিক্রেতা ও পণ্যের রিভিউ দিন
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-stone-900">
              আপনার মতামত সফলভাবে জমা হয়েছে!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="text-xs text-stone-600">
              অর্ডার: <strong>#{order.id}</strong> · বিক্রেতা: <strong>{order.sellerName}</strong>
            </div>

            {/* 5-Star selector */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                রেটিং নির্বাচন করুন:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-700 ml-2">
                  {rating} স্টার
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                আপনার অভিজ্ঞতা বা মন্তব্য
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="পণ্যের মান কেমন ছিল? বিক্রেতা কি সময়মতো পিকআপ পয়েন্টে এসেছিলেন?"
                className="w-full h-24 p-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#0D5C3A]"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white shadow-sm"
              >
                {isSubmitting ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
