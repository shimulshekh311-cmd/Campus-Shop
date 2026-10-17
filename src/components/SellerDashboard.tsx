import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Check,
  AlertCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { Product, Order, Campus, OrderStatus, ProductCategory, ProductCondition } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface SellerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: Campus[];
  onProductUpdated: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  isOpen,
  onClose,
  campuses,
  onProductUpdated,
}) => {
  const { user } = useAuth();
  const { lang } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('books');
  const [newCondition, setNewCondition] = useState<ProductCondition>('like_new');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newStock, setNewStock] = useState('1');
  const [newDepartment, setNewDepartment] = useState('');
  const [newIsNegotiable, setNewIsNegotiable] = useState(false);
  const [newCampusId, setNewCampusId] = useState<string>(user?.campusId || 'dhaka-college');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSellerData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch products for this seller
      const prodRes = await fetch(`/api/products?sellerId=${user.id}`);
      const prodData = await prodRes.json();
      if (prodData.success) {
        setSellerProducts(prodData.products);
      }

      // Fetch orders for this seller
      const orderRes = await fetch(`/api/orders?userId=${user.id}`, {
        headers: { 'x-user-id': user.id },
      });
      const orderData = await orderRes.json();
      if (orderData.success) {
        // filter orders where user is seller
        const ordersForSeller = orderData.orders.filter(
          (o: Order) => o.sellerId === user.id
        );
        setSellerOrders(ordersForSeller);
      }
    } catch (err) {
      console.error('Failed to load seller data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSellerData();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setSellerOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setSellerOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, paymentStatus: 'verified' } : o
          )
        );
      }
    } catch (err) {
      console.error('Failed to verify payment:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' },
      });
      const data = await res.json();
      if (data.success) {
        setSellerProducts((prev) => prev.filter((p) => p.id !== productId));
        onProductUpdated();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          condition: newCondition,
          price: Number(newPrice),
          originalPrice: newOriginalPrice ? Number(newOriginalPrice) : undefined,
          stockQuantity: Number(newStock) || 1,
          department: newDepartment || user?.department,
          isNegotiable: newIsNegotiable,
          campusId: newCampusId,
          images: [
            newCategory === 'clothing'
              ? '/images/campus_varsity_hoodie_1792159209809.jpg'
              : '/images/academic_textbooks_1792159211354.jpg',
          ],
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        setSellerProducts((prev) => [data.product, ...prev]);
        setIsAddProductOpen(false);
        // Reset form
        setNewTitle('');
        setNewDescription('');
        setNewPrice('');
        setNewOriginalPrice('');
        setNewStock('1');
        onProductUpdated();
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalEarnings = sellerOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = sellerOrders.filter(
    (o) => o.status === 'placed' || o.status === 'confirmed'
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0D5C3A]" />
              <span>ক্যাম্পাস সেলার ড্যাশবোর্ড (বিক্রেতা পোর্টাল)</span>
            </h2>
            <p className="text-xs text-stone-500">
              দোকান: <strong>{user?.name}-এর স্টোর</strong> · ক্যাম্পাস:{' '}
              {campuses.find((c) => c.id === user?.campusId)?.nameBn}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSellerData}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Seller Overview KPI Cards */}
        <div className="p-4 sm:p-6 bg-stone-100/50 border-b border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-1">মোট আয় (বিক্রয়)</span>
            <span className="text-lg font-extrabold text-[#0D5C3A] font-mono tabular-nums">
              ৳ {totalEarnings.toLocaleString()}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-1">সক্রিয় পণ্য তালিকা</span>
            <span className="text-lg font-bold text-stone-900 font-mono tabular-nums">
              {sellerProducts.length}টি
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-1">অপেক্ষমান পিকআপ</span>
            <span className="text-lg font-bold text-amber-700 font-mono tabular-nums">
              {pendingOrders}টি
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-1">সেলার রেটিং</span>
            <span className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
              ★ ৪.৯ / ৫.০
            </span>
          </div>
        </div>

        {/* Tab & Action Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#0D5C3A] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              আগত অর্ডারসমূহ ({sellerOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-[#0D5C3A] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              আমার স্টক ও পণ্য ({sellerProducts.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="h-9 px-3.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'orders' ? (
            <div className="space-y-4">
              {sellerOrders.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-600">
                    এখনো কোনো আগত অর্ডার নেই
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    ক্রেতারা অর্ডার করলে এখানে প্রদর্শিত হবে।
                  </p>
                </div>
              ) : (
                sellerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-2">
                      <div className="text-xs">
                        <span className="font-mono font-bold text-[#0D5C3A]">
                          #{order.id}
                        </span>
                        <span className="mx-1 text-stone-400">·</span>
                        <span className="text-stone-600">
                          ক্রেতা: <strong>{order.buyerName}</strong> ({order.buyerPhone})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-900">
                          ৳ {order.totalAmount.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1 text-xs text-stone-700">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {it.productTitle} × {it.quantity}
                          </span>
                          <span className="font-mono">
                            ৳ {(it.unitPrice * it.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Pickup Location & Time */}
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-stone-500">পিকআপ পয়েন্ট: </span>
                        <strong className="text-stone-900">{order.pickupPointName}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500">সময়: </span>
                        <strong className="text-stone-900">{order.preferredDateTime}</strong>
                      </div>
                    </div>

                    {/* bKash/Nagad TrxID verification */}
                    {(order.paymentMethod === 'bkash' || order.paymentMethod === 'nagad') && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-stone-700">
                            পেমেন্ট: {order.paymentMethod.toUpperCase()} | TrxID:{' '}
                            <strong className="font-mono text-stone-900">
                              {order.transactionId || 'পেন্ডিং'}
                            </strong>
                          </span>
                          <span className="ml-2 font-medium text-emerald-700">
                            ({order.paymentStatus === 'verified' ? 'যাচাইকৃত' : 'পেন্ডিং'})
                          </span>
                        </div>
                        {order.paymentStatus !== 'verified' && (
                          <button
                            onClick={() => handleVerifyPayment(order.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                          >
                            পেমেন্ট ভেরিফাই করুন
                          </button>
                        )}
                      </div>
                    )}

                    {/* Order State Action Workflow Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-stone-200/80">
                      {order.status === 'placed' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          অর্ডার নিশ্চিত করুন (Confirm)
                        </button>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(order.id, 'ready_for_pickup')
                          }
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#0D5C3A] text-white hover:bg-[#09432a] transition-colors"
                        >
                          পিকআপের জন্য প্রস্তুত (Ready for Pickup)
                        </button>
                      )}

                      {order.status === 'ready_for_pickup' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>পণ্য হস্তান্তর সম্পন্ন (Mark Completed)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Inventory Tab */
            <div className="space-y-3">
              {sellerProducts.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-600">
                    কোনো পণ্য যোগ করা হয়নি
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    আপনার ব্যবহৃত বা নতুন বই ও সামগ্রী যুক্ত করুন।
                  </p>
                </div>
              ) : (
                sellerProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-white flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0] || '/images/academic_textbooks_1792159211354.jpg'}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                          {p.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                          <span className="font-mono font-bold text-[#0D5C3A]">
                            ৳ {p.price.toLocaleString()}
                          </span>
                          <span>·</span>
                          <span>মজুত: {p.stockQuantity}টি</span>
                          <span>·</span>
                          <span className="capitalize">{p.condition}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* Add Product Modal Sub-window */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-sm font-bold text-stone-900">নতুন পণ্য যোগ করুন</h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  পণ্যের শিরোনাম (Title) *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: অনার্স ৪র্থ বর্ষের ইকোনমিক্স নোটবুক"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#0D5C3A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className="w-full h-10 px-2.5 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="books">বই ও গাইড</option>
                    <option value="notes">নোট ও সাজেশন</option>
                    <option value="clothing">পোশাক ও হুডি</option>
                    <option value="electronics">ইলেকট্রনিক্স</option>
                    <option value="stationery">স্টেশনারি</option>
                    <option value="hostel">হোস্টেল সামগ্রী</option>
                    <option value="digital">ডিজিটাল রিসোর্স</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    কন্ডিশন (অবস্থা)
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as ProductCondition)}
                    className="w-full h-10 px-2.5 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="new">একদম নতুন</option>
                    <option value="like_new">নতুনের মতো ফ্রেশ</option>
                    <option value="used_good">ব্যবহৃত (ভালো অবস্থা)</option>
                    <option value="used_fair">ব্যবহৃত (চলনসই)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    বিক্রয় মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="350"
                    className="w-full h-10 px-3 text-xs font-mono font-bold rounded-xl border border-stone-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    পূর্বের মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    placeholder="500"
                    className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    মজুত সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-stone-300"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    ক্যাম্পাস
                  </label>
                  <select
                    value={newCampusId}
                    onChange={(e) => setNewCampusId(e.target.value)}
                    className="w-full h-10 px-2.5 text-xs rounded-xl border border-stone-300 bg-white"
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    বিভাগ / ডিপার্টমেন্ট
                  </label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="যেমন: হিসাববিজ্ঞান"
                    className="w-full h-10 px-3 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  বিস্তারিত বিবরণ
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="বইয়ের অবস্থা, পৃষ্ঠা সংখ্যা, কেন বিক্রি করছেন ইত্যাদি..."
                  className="w-full h-20 p-2.5 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="negotiableCheck"
                  checked={newIsNegotiable}
                  onChange={(e) => setNewIsNegotiable(e.target.checked)}
                  className="rounded text-[#0D5C3A] focus:ring-[#0D5C3A]"
                />
                <label htmlFor="negotiableCheck" className="text-xs text-stone-700">
                  মূল্য আলোচনা সাপেক্ষ
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white shadow-sm"
                >
                  {isSubmitting ? 'আপলোড হচ্ছে...' : 'পণ্য যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
