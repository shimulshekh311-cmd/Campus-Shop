import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Store as StoreIcon,
  CheckCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Truck,
  MapPin,
  Factory,
  UserCheck,
  Database,
  Cloud,
  CloudCheck,
  Download,
  Plus,
  Trash2,
  Edit2,
  Camera,
  Save,
  Check,
  Layers,
  ShoppingBag,
  Clock,
  Settings,
} from 'lucide-react';
import { RoleApplication, AuditLog, Campus, UserRole, PickupPoint, User, Product, Order } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { syncCampusToCloud, syncSettingsToCloud } from '../firebase/cloudService.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: Campus[];
  onDataChanged: () => void;
  logoUrl?: string;
  onUpdateLogo?: (newLogo: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  campuses,
  onDataChanged,
  logoUrl,
  onUpdateLogo,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'database' | 'booths' | 'settings' | 'audit'>('database');
  const [metrics, setMetrics] = useState<any>(null);
  const [roleApplications, setRoleApplications] = useState<RoleApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Database Tab States
  const [dbData, setDbData] = useState<any>(null);
  const [dbSubTab, setDbSubTab] = useState<'users' | 'products' | 'orders' | 'json'>('users');
  const [dbLoading, setDbLoading] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Booth Management States
  const [selectedCampusId, setSelectedCampusId] = useState<string>(campuses[0]?.id || 'dhaka-college');
  const [currentBooths, setCurrentBooths] = useState<PickupPoint[]>([]);
  const [editingBoothId, setEditingBoothId] = useState<string | null>(null);
  const [boothForm, setBoothForm] = useState({
    nameBn: '',
    nameEn: '',
    landmark: '',
    timeAdvice: '',
  });
  const [boothSaveLoading, setBoothSaveLoading] = useState(false);
  const [boothSuccessMsg, setBoothSuccessMsg] = useState('');

  // Site Settings States
  const [customTagline, setCustomTagline] = useState('ক্যাম্পাসের সকল প্রয়োজন এক জায়গায়');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { 'x-user-id': user?.id || '' },
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setRoleApplications(data.roleApplications || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFullDatabase = async () => {
    setDbLoading(true);
    try {
      const res = await fetch('/api/admin/database');
      const data = await res.json();
      if (data.success) {
        setDbData(data.database);
        if (data.database.customTagline) {
          setCustomTagline(data.database.customTagline);
        }
      }
    } catch (err) {
      console.error('Failed to fetch full database:', err);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
      fetchFullDatabase();
    }
  }, [isOpen]);

  // Synchronize active campus booths
  useEffect(() => {
    const activeCamp = campuses.find((c) => c.id === selectedCampusId);
    if (activeCamp) {
      setCurrentBooths(activeCamp.pickupPoints || []);
    }
  }, [selectedCampusId, campuses]);

  if (!isOpen) return null;

  const handleApplicationDecision = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/role-applications/${appId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setRoleApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status } : a))
        );
        fetchAdminData();
        fetchFullDatabase();
        onDataChanged();
      }
    } catch (err) {
      console.error('Failed to update application decision:', err);
    }
  };

  // Booth Management Handlers
  const handleSaveBooth = async () => {
    if (!boothForm.nameBn.trim() || !boothForm.landmark.trim()) {
      alert('বুথের নাম ও সুনির্দিষ্ট অবস্থান আবশ্যক।');
      return;
    }

    setBoothSaveLoading(true);
    setBoothSuccessMsg('');

    let updatedList: PickupPoint[];
    if (editingBoothId) {
      updatedList = currentBooths.map((b) =>
        b.id === editingBoothId
          ? {
              ...b,
              nameBn: boothForm.nameBn.trim(),
              nameEn: boothForm.nameEn.trim() || boothForm.nameBn.trim(),
              landmark: boothForm.landmark.trim(),
              timeAdvice: boothForm.timeAdvice.trim() || 'ক্লাস চলাকালীন সময়',
            }
          : b
      );
    } else {
      const newPoint: PickupPoint = {
        id: `booth-${Date.now()}`,
        campusId: selectedCampusId as any,
        nameBn: boothForm.nameBn.trim(),
        nameEn: boothForm.nameEn.trim() || boothForm.nameBn.trim(),
        landmark: boothForm.landmark.trim(),
        timeAdvice: boothForm.timeAdvice.trim() || 'সকাল ১০টা - বিকাল ৫টা',
      };
      updatedList = [...currentBooths, newPoint];
    }

    try {
      // 1. Save to server backend
      const res = await fetch(`/api/admin/campuses/${selectedCampusId}/booths`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupPoints: updatedList }),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentBooths(updatedList);
        const camp = campuses.find((c) => c.id === selectedCampusId);
        if (camp) {
          camp.pickupPoints = updatedList;
          // 2. Sync to Cloud Firestore
          await syncCampusToCloud(camp);
        }

        setBoothForm({ nameBn: '', nameEn: '', landmark: '', timeAdvice: '' });
        setEditingBoothId(null);
        setBoothSuccessMsg('পিকআপ বুথের তথ্য ক্লাউডে সফলভাবে সংরক্ষিত হয়েছে!');
        onDataChanged();
      }
    } catch (err) {
      console.error('Failed to save booth:', err);
    } finally {
      setBoothSaveLoading(false);
      setTimeout(() => setBoothSuccessMsg(''), 3000);
    }
  };

  const handleDeleteBooth = async (boothId: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই বুথটি মুছে ফেলতে চান?')) return;

    const updatedList = currentBooths.filter((b) => b.id !== boothId);
    try {
      const res = await fetch(`/api/admin/campuses/${selectedCampusId}/booths`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupPoints: updatedList }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentBooths(updatedList);
        const camp = campuses.find((c) => c.id === selectedCampusId);
        if (camp) {
          camp.pickupPoints = updatedList;
          await syncCampusToCloud(camp);
        }
        onDataChanged();
      }
    } catch (err) {
      console.error('Failed to delete booth:', err);
    }
  };

  const handleEditBoothClick = (b: PickupPoint) => {
    setEditingBoothId(b.id);
    setBoothForm({
      nameBn: b.nameBn,
      nameEn: b.nameEn || '',
      landmark: b.landmark,
      timeAdvice: b.timeAdvice,
    });
  };

  // Settings Save Handler
  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagline: customTagline, logoUrl }),
      });
      const data = await res.json();
      if (data.success) {
        await syncSettingsToCloud({ tagline: customTagline, logoUrl });
        setSettingsSuccessMsg('ওয়েবসাইটের মৌলিক তথ্য ক্লাউডে সফলভাবে সেভ হয়েছে!');
        setTimeout(() => setSettingsSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const downloadDatabaseJson = () => {
    if (!dbData) return;
    const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusshop_full_database_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'seller':
        return { label: 'সেলার (Seller)', icon: <StoreIcon className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'pickup_staff':
        return { label: 'পিক-আপ পয়েন্ট কর্মী', icon: <MapPin className="w-3.5 h-3.5" />, color: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'delivery_man':
        return { label: 'ডেলিভারি ম্যান (রানার)', icon: <Truck className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'factory_staff':
        return { label: 'ফ্যাক্টরি দায়িত্বপ্রাপ্ত ব্যক্তি', icon: <Factory className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: role, icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-stone-50 text-stone-800 border-stone-200' };
    }
  };

  const pendingApps = roleApplications.filter((a) => a.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-900 flex items-center justify-center text-amber-300 shadow-xs border border-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  ক্যাম্পাসশপ কেন্দ্রীয় অ্যাডমিন ও ডেটাবেজ কন্ট্রোল
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-emerald-200 border border-emerald-700">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  ক্লাউড প্রটেক্টেড
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200">
                সকল রেজিস্ট্রেশন, পূর্ণাঙ্গ ডেটাবেজ ভিউ, ক্যাম্পাস বুথ ও মৌলিক সাইট কনফিগারেশন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchAdminData();
                fetchFullDatabase();
              }}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900 transition-colors cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cloud Security & Metric KPI Bar */}
        <div className="p-3 sm:p-4 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Firebase Firestore ক্লাউড কানেক্টেড</span>
            <span className="text-emerald-700 font-normal">
              · ওয়েবসাইট আপডেট হলেও ডাটা কখনোই মুছে যাবে না (১০০% সুরক্ষিত)
            </span>
          </div>
          <button
            onClick={downloadDatabaseJson}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-[#0D5C3A] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>সম্পূর্ণ ডেটাবেজ ব্যাকআপ (JSON)</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-3 sm:px-6 py-2.5 border-b border-stone-200 bg-white flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-[#0D5C3A] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>পূর্ণাঙ্গ ডেটাবেজ ভিউ</span>
          </button>

          <button
            onClick={() => setActiveTab('booths')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'booths'
                ? 'bg-[#0D5C3A] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>বুথের জায়গা নির্ধারণ</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#0D5C3A] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>লোগো ও মৌলিক সেটিংস</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'bg-[#0D5C3A] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>রোল আবেদন ({pendingApps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-[#0D5C3A] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>অডিট লগ</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: FULL DATABASE EXPLORER */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              {/* Sub-navigation inside Database */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDbSubTab('users')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      dbSubTab === 'users' ? 'bg-white shadow-xs text-[#0D5C3A]' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    সকল ইউজার ও একাউন্ট ({dbData?.usersCount || 0})
                  </button>
                  <button
                    onClick={() => setDbSubTab('products')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      dbSubTab === 'products' ? 'bg-white shadow-xs text-[#0D5C3A]' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    সকল পণ্য ({dbData?.productsCount || 0})
                  </button>
                  <button
                    onClick={() => setDbSubTab('orders')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      dbSubTab === 'orders' ? 'bg-white shadow-xs text-[#0D5C3A]' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    সকল অর্ডার ও লেনদেন ({dbData?.ordersCount || 0})
                  </button>
                  <button
                    onClick={() => setDbSubTab('json')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      dbSubTab === 'json' ? 'bg-white shadow-xs text-[#0D5C3A]' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    র ডেটাবেজ (JSON)
                  </button>
                </div>

                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                  ডাটাবেজ স্টোরেজ: ক্লাউড ফায়ারস্টোর + অটোমেটিক ব্যাকআপ
                </div>
              </div>

              {/* SubTab 1: USERS TABLE */}
              {dbSubTab === 'users' && (
                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">ইউজার নাম</th>
                          <th className="p-3">যোগাযোগ (ইমেইল / ফোন)</th>
                          <th className="p-3">রোল</th>
                          <th className="p-3">ক্যাম্পাস ও আইডি</th>
                          <th className="p-3">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {dbData?.users && dbData.users.length > 0 ? (
                          dbData.users.map((u: User) => (
                            <tr key={u.id} className="hover:bg-stone-50/70">
                              <td className="p-3 font-bold text-stone-900">
                                {u.name}
                                <span className="block text-[10px] text-stone-400 font-mono font-normal">
                                  ID: {u.id}
                                </span>
                              </td>
                              <td className="p-3 text-stone-600">
                                <span className="block font-medium">{u.email}</span>
                                <span className="text-[11px] text-stone-500">{u.phone}</span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-stone-100 text-stone-800 border border-stone-200 uppercase">
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-3 text-stone-600">
                                <span className="block font-semibold text-[#0D5C3A]">
                                  {campuses.find((c) => c.id === u.campusId)?.nameBn || u.campusId}
                                </span>
                                <span className="text-[10px] text-stone-500">
                                  ID: {u.studentId || 'N/A'} · {u.department || ''}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {u.approvalStatus || 'approved'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-stone-500">
                              এখনও কোনো রেজিস্ট্রেশন ডাটা নেই।
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SubTab 2: PRODUCTS TABLE */}
              {dbSubTab === 'products' && (
                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">পণ্যের নাম</th>
                          <th className="p-3">ক্যাটাগরি ও কন্ডিশন</th>
                          <th className="p-3">বিক্রেতা ও ক্যাম্পাস</th>
                          <th className="p-3">মূল্য</th>
                          <th className="p-3">স্টক ও প্রাপ্যতা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {dbData?.products && dbData.products.length > 0 ? (
                          dbData.products.map((p: Product) => (
                            <tr key={p.id} className="hover:bg-stone-50/70">
                              <td className="p-3 font-bold text-stone-900">
                                {p.title}
                                <span className="block text-[10px] text-stone-400 font-normal">
                                  {p.department || ''}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium text-[10px] border border-emerald-200">
                                  {p.category}
                                </span>
                                <span className="ml-1 text-[10px] text-stone-500">
                                  ({p.condition === 'new' ? 'নতুন' : 'ব্যবহৃত'})
                                </span>
                              </td>
                              <td className="p-3 text-stone-600">
                                <span className="block font-medium">{p.sellerName}</span>
                                <span className="text-[10px] text-stone-500">
                                  {campuses.find((c) => c.id === p.campusId)?.nameBn}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-[#0D5C3A] font-mono">
                                ৳ {p.price.toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  উপলব্ধ ({p.stockQuantity ?? 1})
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-stone-500">
                              কোনো পণ্য তালিকাভুক্ত নেই।
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SubTab 3: ORDERS TABLE */}
              {dbSubTab === 'orders' && (
                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">অর্ডার আইডি</th>
                          <th className="p-3">ক্রেতার বিবরণ</th>
                          <th className="p-3">পিকআপ পয়েন্ট</th>
                          <th className="p-3">মোট মূল্য ও পেমেন্ট</th>
                          <th className="p-3">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {dbData?.orders && dbData.orders.length > 0 ? (
                          dbData.orders.map((o: Order) => (
                            <tr key={o.id} className="hover:bg-stone-50/70">
                              <td className="p-3 font-mono font-bold text-stone-900">
                                {o.id}
                                <span className="block text-[10px] text-stone-400 font-sans">
                                  {new Date(o.createdAt).toLocaleDateString('bn-BD')}
                                </span>
                              </td>
                              <td className="p-3 text-stone-700">
                                <span className="block font-bold">{o.buyerName}</span>
                                <span className="text-[11px] text-stone-500">{o.buyerPhone}</span>
                              </td>
                              <td className="p-3 text-stone-600">
                                <span className="block font-semibold text-[#0D5C3A]">
                                  {o.pickupPointName || 'ক্যাম্পাস বুথ'}
                                </span>
                              </td>
                              <td className="p-3 font-mono">
                                <span className="block font-extrabold text-[#0D5C3A]">
                                  ৳ {o.totalAmount.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-stone-500 font-sans">
                                  {o.paymentMethod === 'cash_on_pickup' ? 'ক্যাশ অন পিকআপ' : 'বিকাশ/নগদ'}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-stone-500">
                              এখনও কোনো অর্ডার রেকর্ড নেই।
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SubTab 4: RAW JSON VIEW */}
              {dbSubTab === 'json' && (
                <div className="bg-stone-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96">
                  <pre>{JSON.stringify(dbData, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CAMPUS & BOOTH CONFIGURATION */}
          {activeTab === 'booths' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    ক্যাম্পাস সিলেক্ট করে সরাসরি ডেলিভারি ও পিকআপ বুথের নাম, অবস্থান ও সময়সূচী নির্ধারণ বা পরিমার্জন করুন।
                  </span>
                </div>
                {boothSuccessMsg && (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                    {boothSuccessMsg}
                  </span>
                )}
              </div>

              {/* Campus Selector Buttons */}
              <div className="flex flex-wrap gap-2">
                {campuses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCampusId(c.id);
                      setEditingBoothId(null);
                      setBoothForm({ nameBn: '', nameEn: '', landmark: '', timeAdvice: '' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCampusId === c.id
                        ? 'bg-[#0D5C3A] text-white shadow-xs scale-105'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {c.nameBn} ({c.pickupPoints?.length || 0} বুথ)
                  </button>
                ))}
              </div>

              {/* Existing Booths for Selected Campus */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0D5C3A]" />
                  <span>
                    {campuses.find((c) => c.id === selectedCampusId)?.nameBn} এর বর্তমান পিকআপ বুথসমূহ:
                  </span>
                </h4>

                {currentBooths.length === 0 ? (
                  <div className="p-5 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                    এই ক্যাম্পাসে এখনও কোনো নির্দিষ্ট বুথ নির্ধারিত হয়নি। নিচে নতুন বুথ যুক্ত করুন।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentBooths.map((booth, idx) => (
                      <div
                        key={booth.id}
                        className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-stone-900 text-sm">
                              {idx + 1}. {booth.nameBn}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                              সক্রিয় বুথ
                            </span>
                          </div>
                          {booth.nameEn && (
                            <p className="text-[11px] text-stone-400 mb-1">{booth.nameEn}</p>
                          )}
                          <p className="text-xs text-stone-600 flex items-start gap-1 mb-1">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                            <span><strong>অবস্থান:</strong> {booth.landmark}</span>
                          </p>
                          <p className="text-xs text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                            <span><strong>সময়সূচী:</strong> {booth.timeAdvice}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-stone-100">
                          <button
                            onClick={() => handleEditBoothClick(booth)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>এডিট</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBooth(booth.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>মুছুন</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add / Edit Booth Form */}
              <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                <h4 className="text-xs font-bold text-[#0D5C3A] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingBoothId ? 'বুথের তথ্য পরিবর্তন / সম্পাদন' : 'নতুন পিকআপ ও ডেলিভারি বুথ যোগ করুন'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      বুথের নাম (বাংলা) *
                    </label>
                    <input
                      type="text"
                      value={boothForm.nameBn}
                      onChange={(e) => setBoothForm({ ...boothForm, nameBn: e.target.value })}
                      placeholder="যেমন: কলেজের প্রধান ফটক বুথ"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      বুথের নাম (English)
                    </label>
                    <input
                      type="text"
                      value={boothForm.nameEn}
                      onChange={(e) => setBoothForm({ ...boothForm, nameEn: e.target.value })}
                      placeholder="e.g. Main Gate Delivery Booth"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      সুনির্দিষ্ট অবস্থান ও ল্যান্ডমার্ক *
                    </label>
                    <input
                      type="text"
                      value={boothForm.landmark}
                      onChange={(e) => setBoothForm({ ...boothForm, landmark: e.target.value })}
                      placeholder="যেমন: সেন্ট্রাল লাইব্রেরির সামনের নিরাপত্তা ফটক"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      উপলব্ধ সময় বা শিডিউল
                    </label>
                    <input
                      type="text"
                      value={boothForm.timeAdvice}
                      onChange={(e) => setBoothForm({ ...boothForm, timeAdvice: e.target.value })}
                      placeholder="যেমন: সকাল ১০টা - বিকাল ৪টা (ক্লাস বিরতি)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {editingBoothId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBoothId(null);
                        setBoothForm({ nameBn: '', nameEn: '', landmark: '', timeAdvice: '' });
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                    >
                      বাতিল
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveBooth}
                    disabled={boothSaveLoading}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D5C3A] hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{boothSaveLoading ? 'সংরক্ষিত হচ্ছে...' : 'বুথ সংরক্ষণ করুন (Save Booth)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGO & SITE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-center justify-between text-xs text-stone-700">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 mb-0.5">
                    ওয়েবসাইটের মৌলিক ব্রান্ডিং ও সেটিংস
                  </h4>
                  <p className="text-stone-500">
                    লোগো ও মূল ট্যাগলাইন ক্লাউড ডেটাবেজে সংরক্ষিত থাকবে যা ওয়েবসাইট রিস্টার্ট হলেও অপরিবর্তিত থাকবে।
                  </p>
                </div>
                {settingsSuccessMsg && (
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                    {settingsSuccessMsg}
                  </span>
                )}
              </div>

              {/* Logo Preview & Upload */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white border border-emerald-900/15 shadow-xs flex items-center justify-center shrink-0">
                    <img
                      src={logoUrl || '/images/campus_shop_logo.jpg'}
                      alt="Current Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      বর্তমান লোগো
                    </span>
                    <h5 className="font-extrabold text-stone-900 text-base">CampusShop</h5>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {customTagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0D5C3A] hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>নতুন লোগো আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          if (dataUrl && onUpdateLogo) {
                            onUpdateLogo(dataUrl);
                            setSettingsSuccessMsg('লোগো সফলভাবে সেট হয়েছে!');
                            setTimeout(() => setSettingsSuccessMsg(''), 3000);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Tagline Configuration */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
                <label className="text-xs font-bold text-stone-700 block">
                  ওয়েবসাইটের মূল ট্যাগলাইন (Tagline):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTagline}
                    onChange={(e) => setCustomTagline(e.target.value)}
                    placeholder="ক্যাম্পাসের সকল প্রয়োজন এক জায়গায়"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={settingsLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D5C3A] hover:bg-emerald-800 text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{settingsLoading ? 'সেভ হচ্ছে...' : 'ট্যাগলাইন সেভ করুন'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROLE APPLICATIONS */}
          {activeTab === 'applications' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-700">
                  সেলার, পিক-আপ পয়েন্ট কর্মী, ডেলিভারি ম্যান ও ফ্যাক্টরি কর্মীদের আবেদন তালিকা
                </h3>
              </div>

              {roleApplications.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center font-medium">
                  কোনো অ্যাকাউন্ট আবেদন জমা নেই।
                </div>
              ) : (
                <div className="space-y-3">
                  {roleApplications.map((app) => {
                    const campus = campuses.find((c) => c.id === app.campusId);
                    const roleInfo = getRoleLabel(app.requestedRole);
                    return (
                      <div
                        key={app.id}
                        className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-wrap items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-stone-900">
                              {app.userName}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 ${roleInfo.color}`}
                            >
                              {roleInfo.icon}
                              <span>{roleInfo.label}</span>
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                app.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {app.status === 'approved'
                                ? 'অনুমোদিত'
                                : app.status === 'rejected'
                                ? 'বাতিলকৃত'
                                : 'পেন্ডিং অনুমোদন'}
                            </span>
                          </div>

                          <p className="text-xs text-stone-600">
                            ইমেইল: <strong>{app.userEmail}</strong> · ফোন: <strong>{app.userPhone}</strong>
                          </p>

                          <p className="text-xs text-stone-500 mt-0.5">
                            ক্যাম্পাস: <strong>{campus?.nameBn}</strong> · আইডি: <strong>{app.studentId || 'N/A'}</strong> · ডিপার্টমেন্ট: {app.department || 'N/A'}
                          </p>

                          {app.details && (
                            <p className="text-[11px] text-stone-500 mt-1 bg-white p-2 rounded-lg border border-stone-200/70 max-w-xl">
                              মন্তব্য: {app.details}
                            </p>
                          )}
                        </div>

                        {app.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApplicationDecision(app.id, 'approved')}
                              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>অনুমোদন দিন</span>
                            </button>

                            <button
                              onClick={() => handleApplicationDecision(app.id, 'rejected')}
                              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                            >
                              বাতিল
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden text-xs divide-y divide-stone-200">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-stone-500">
                  কোনো অডিট লগ রেকর্ড নেই।
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 flex items-start justify-between gap-3 hover:bg-stone-100/50"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900 font-mono">
                          {log.action}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-600">{log.actorName}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
