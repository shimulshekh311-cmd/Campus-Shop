import React, { useState, useEffect, useMemo } from 'react';
import {
  LanguageProvider,
  useLanguage,
} from './context/LanguageContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import {
  Campus,
  CampusId,
  Product,
  ProductCategory,
  ProductCondition,
  Order,
} from './types/index.ts';

// Components
import { Navbar } from './components/Navbar.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { MyOrdersModal } from './components/MyOrdersModal.tsx';
import { SellerDashboard } from './components/SellerDashboard.tsx';
import { PickupStaffDashboard } from './components/PickupStaffDashboard.tsx';
import { DeliveryRunnerDashboard } from './components/DeliveryRunnerDashboard.tsx';
import { FactoryStaffDashboard } from './components/FactoryStaffDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ApplyRoleModal } from './components/ApplyRoleModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { FavoritesModal } from './components/FavoritesModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { TrackingModal } from './components/TrackingModal.tsx';

import { OrdersPage } from './pages/OrdersPage.tsx';
import { TrackingPage } from './pages/TrackingPage.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';

import {
  Package,
  Search,
} from 'lucide-react';

function CampusShopApp() {
  const { lang, t } = useLanguage();
  const { user, role, openApplyRole, openAuthModal } = useAuth();
  const { openCheckout, addToCart } = useCart();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab: 'home' | 'category' | 'orders' | 'tracking' | 'account'
  const [activeTab, setActiveTab] = useState<'home' | 'category' | 'orders' | 'tracking' | 'account'>('home');
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  // Filters
  const [selectedCampus, setSelectedCampus] = useState<CampusId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Role Dashboards & Feature Modals
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSellerHubOpen, setIsSellerHubOpen] = useState(false);
  const [isPickupStaffOpen, setIsPickupStaffOpen] = useState(false);
  const [isDeliveryRunnerOpen, setIsDeliveryRunnerOpen] = useState(false);
  const [isFactoryDashboardOpen, setIsFactoryDashboardOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  // Logo management (persistent custom logo)
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('campusshop_custom_logo') || '/images/campus_shop_logo.jpg';
  });

  // Load campuses, products, and logo from backend API
  const fetchAllData = async () => {
    try {
      const [campRes, prodRes, logoRes] = await Promise.all([
        fetch('/api/campuses'),
        fetch('/api/products'),
        fetch('/api/settings/logo').catch(() => null),
      ]);
      const [campData, prodData] = await Promise.all([
        campRes.json(),
        prodRes.json(),
      ]);

      if (campData.success) setCampuses(campData.campuses);
      if (prodData.success) setProducts(prodData.products);

      if (logoRes) {
        const logoData = await logoRes.json();
        if (logoData && logoData.success && logoData.logoUrl) {
          setLogoUrl(logoData.logoUrl);
          localStorage.setItem('campusshop_custom_logo', logoData.logoUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLogo = async (newLogoData: string) => {
    setLogoUrl(newLogoData);
    localStorage.setItem('campusshop_custom_logo', newLogoData);
    try {
      await fetch('/api/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: newLogoData }),
      });
    } catch (err) {
      console.warn('Could not sync logo with server:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute product counts for each campus
  const productCountsByCampus = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.campusId] = (counts[p.campusId] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Client-side filtered products (No campus filter anywhere except in account profile)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCondition !== 'all' && p.condition !== selectedCondition) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesEn = p.titleEn?.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesDept = p.department?.toLowerCase().includes(q);
        const matchesSeller = p.sellerName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesEn && !matchesDesc && !matchesDept && !matchesSeller) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCondition, searchQuery]);

  const handleInstantBuy = (product: Product, quantity: number, selectedDesign?: string) => {
    addToCart(product, quantity, selectedDesign);
    openCheckout();
  };

  const handleGoHome = () => {
    setActiveTab('home');
    setSelectedCondition('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCategories = () => {
    setActiveTab('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOrders = () => {
    setActiveTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTracking = (orderId?: string) => {
    if (orderId) setTrackingOrderId(orderId);
    setActiveTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAccount = () => {
    setActiveTab('account');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-stone-900 pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">
      
      {/* 1. Navbar with the exact 5 Tabs: হোম, ক্যাটাগরি, অর্ডার, ট্রাকিং, একাউন্ট */}
      <Navbar
        onGoHome={handleGoHome}
        onOpenCategories={handleOpenCategories}
        onOpenOrders={handleOpenOrders}
        onOpenTracking={() => handleOpenTracking()}
        onOpenAccount={handleOpenAccount}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenSellerHub={() => setIsSellerHubOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenPickupStaffDashboard={() => setIsPickupStaffOpen(true)}
        onOpenDeliveryRunnerDashboard={() => setIsDeliveryRunnerOpen(true)}
        onOpenFactoryDashboard={() => setIsFactoryDashboardOpen(true)}
        selectedCampus={selectedCampus}
        onSelectCampus={setSelectedCampus}
        activeTab={activeTab}
        logoUrl={logoUrl}
        onUpdateLogo={handleUpdateLogo}
      />

      {/* 2. Standalone Page Routing (আলাদা পেজ) */}
      {activeTab === 'orders' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 overflow-x-clip">
          <OrdersPage
            onGoHome={handleGoHome}
            onGoTracking={(orderId) => handleOpenTracking(orderId)}
            onOpenReview={(order) => setReviewOrder(order)}
          />
        </main>
      )}

      {activeTab === 'tracking' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 overflow-x-clip">
          <TrackingPage
            onGoHome={handleGoHome}
            initialOrderId={trackingOrderId}
            campuses={campuses}
          />
        </main>
      )}

      {activeTab === 'account' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 overflow-x-clip">
          <AccountPage
            onGoHome={handleGoHome}
            onGoOrders={handleOpenOrders}
            onGoTracking={handleOpenTracking}
            onGoFavorites={() => setIsFavoritesOpen(true)}
            campuses={campuses}
            onOpenSellerHub={() => setIsSellerHubOpen(true)}
            onOpenPickupStaffDashboard={() => setIsPickupStaffOpen(true)}
            onOpenDeliveryRunnerDashboard={() => setIsDeliveryRunnerOpen(true)}
            onOpenFactoryDashboard={() => setIsFactoryDashboardOpen(true)}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          />
        </main>
      )}

      {/* 3. Category Tab View (আলাদা পেজ ও ক্যাটাগরি কার্ডসমূহ) */}
      {activeTab === 'category' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 overflow-x-clip">
          <CategoryPage
            onGoHome={handleGoHome}
            products={products}
            campuses={campuses}
            onOpenDetails={(p) => setDetailProduct(p)}
          />
        </main>
      )}

      {/* 4. Home Tab View: সরাসরি সার্চ ফিল্টার ও পণ্যসমূহ */}
      {activeTab === 'home' && (
        <main id="catalog" className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-7 overflow-x-clip">
          
          {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="বই, নোট, হুডি বা ক্যালকুলেটর খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/20 outline-hidden bg-white"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>

              {/* Condition Filter */}
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                <span className="text-stone-500 font-mono">
                  ({filteredProducts.length}টি পণ্য)
                </span>
                <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5">
                  <button
                    onClick={() => setSelectedCondition('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedCondition === 'all'
                        ? 'bg-[#0D5C3A] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    সব
                  </button>
                  <button
                    onClick={() => setSelectedCondition('like_new')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedCondition === 'like_new'
                        ? 'bg-[#0D5C3A] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    নতুনের মতো
                  </button>
                  <button
                    onClick={() => setSelectedCondition('used_good')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedCondition === 'used_good'
                        ? 'bg-[#0D5C3A] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    ব্যবহৃত
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid: STRICT MOBILE 2-COLUMNS RULE */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 py-12">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-stone-200/60 rounded-2xl aspect-[4/5] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center my-6 shadow-xs">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">
                  {searchQuery ? 'কোনো পণ্য পাওয়া যায়নি' : 'এখনো কোনো পণ্য লিস্টিং করা হয়নি'}
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                  {searchQuery
                    ? 'অন্য কোনো কীওয়ার্ড দিয়ে সার্চ করুন অথবা ফিল্টার রিসেট করুন।'
                    : 'ক্যাম্পাসের বন্ধুদের মাঝে বই, হ্যান্ডনোট বা গ্যাজেট বিক্রি করতে প্রথমে রেজিস্ট্রেশন করে সেলার হিসেবে পণ্য যুক্ত করুন।'}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        openAuthModal('register');
                      } else if (role === 'seller') {
                        setIsSellerHubOpen(true);
                      } else {
                        openApplyRole('seller');
                      }
                    }}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0D5C3A] text-white hover:bg-[#09432a] transition-all shadow-xs cursor-pointer"
                  >
                    নতুন পণ্য বিক্রি করুন
                  </button>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSelectedCondition('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      ফিল্টার রিসেট করুন
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    campuses={campuses}
                    onOpenDetails={(p) => setDetailProduct(p)}
                  />
                ))}
              </div>
            )}

          </main>
        )}

      {/* 6. Simplified Footer As Explicitly Requested:
          "ফুটারে এত কিছু দেখানোর দরকার নাই। শুধু দেখাবে লোগো ট্যাগলাইন আর নিচের বাক্যটি
          'ঢাকা সেন্ট্রাল ইউনিভার্সিটির সাধারণ শিক্ষার্থীদের স্বাধীন ও উন্মুক্ত কমিউনিটি মার্কেটপ্লেস।'"
      */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-stone-600 w-full overflow-x-clip">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-emerald-900/10 shadow-2xs shrink-0">
              <img
                src={logoUrl || "/images/campus_shop_logo.jpg"}
                alt="CampusShop Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <span className="text-sm sm:text-base font-black text-[#0D5C3A] leading-none block">
                CampusShop (ক্যাম্পাসশপ)
              </span>
              <span className="text-[11px] sm:text-xs text-stone-600 font-medium block mt-1">
                ক্যাম্পাসের সকল প্রয়োজন এক জায়গায়
              </span>
            </div>
          </div>

          {/* Exact sentence requested by user */}
          <p className="text-xs sm:text-sm font-semibold text-stone-700">
            ঢাকা সেন্ট্রাল ইউনিভার্সিটির সাধারণ শিক্ষার্থীদের স্বাধীন ও উন্মুক্ত কমিউনিটি মার্কেটপ্লেস।
          </p>

        </div>
      </footer>

      {/* Modals & Role-Specific Dashboards */}
      <ProductDetailModal
        product={detailProduct}
        campuses={campuses}
        onClose={() => setDetailProduct(null)}
        onInstantBuy={handleInstantBuy}
      />

      <CartDrawer />

      <CheckoutModal
        campuses={campuses}
        onOrderSuccess={() => {
          fetchAllData();
        }}
      />

      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onOpenReview={(order) => setReviewOrder(order)}
      />

      {/* Parcel Tracking Modal */}
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        campuses={campuses}
      />

      {/* 1. Seller Dashboard */}
      <SellerDashboard
        isOpen={isSellerHubOpen}
        onClose={() => setIsSellerHubOpen(false)}
        campuses={campuses}
        onProductUpdated={fetchAllData}
      />

      {/* 2. Pickup Point Staff Dashboard */}
      <PickupStaffDashboard
        isOpen={isPickupStaffOpen}
        onClose={() => setIsPickupStaffOpen(false)}
        campuses={campuses}
        onOrderUpdated={fetchAllData}
      />

      {/* 3. Delivery Runner Dashboard */}
      <DeliveryRunnerDashboard
        isOpen={isDeliveryRunnerOpen}
        onClose={() => setIsDeliveryRunnerOpen(false)}
        campuses={campuses}
        onOrderUpdated={fetchAllData}
      />

      {/* 4. Factory Staff Dashboard */}
      <FactoryStaffDashboard
        isOpen={isFactoryDashboardOpen}
        onClose={() => setIsFactoryDashboardOpen(false)}
        campuses={campuses}
        onOrderUpdated={fetchAllData}
      />

      {/* 5. Super Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        campuses={campuses}
        onDataChanged={fetchAllData}
        logoUrl={logoUrl}
        onUpdateLogo={handleUpdateLogo}
      />

      {/* Special Role Application Modal (Requires Admin Approval) */}
      <ApplyRoleModal campuses={campuses} />

      {/* Login & Register Modal */}
      <AuthModal campuses={campuses} />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        products={products}
        campuses={campuses}
        onOpenDetails={(p) => setDetailProduct(p)}
      />

      {/* Reviews Modal */}
      <ReviewModal
        order={reviewOrder}
        onClose={() => setReviewOrder(null)}
        onReviewSubmitted={fetchAllData}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <CampusShopApp />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
