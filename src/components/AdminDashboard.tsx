import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Store as StoreIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Truck,
  MapPin,
  Factory,
  UserCheck,
} from 'lucide-react';
import { RoleApplication, AuditLog, Campus, UserRole } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: Campus[];
  onDataChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  campuses,
  onDataChanged,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'audit'>('applications');
  const [metrics, setMetrics] = useState<any>(null);
  const [roleApplications, setRoleApplications] = useState<RoleApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

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
        onDataChanged();
      }
    } catch (err) {
      console.error('Failed to update application decision:', err);
    }
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-red-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-900 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                ক্যাম্পাসশপ কেন্দ্রীয় সুপার অ্যাডমিন ড্যাশবোর্ড
              </h2>
              <p className="text-[11px] text-red-200">
                বিশেষ একাউন্ট অনুমোদন (সেলার, পিকআপ কর্মী, ডেলিভারি ম্যান, ফ্যাক্টরি কর্মী) ও নজরদারি
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-red-900"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-red-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Metric KPIs */}
        <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-1">মোট শিক্ষার্থী ইউজার</span>
            <span className="text-xl font-extrabold text-stone-900 font-mono">
              {metrics?.totalUsers || 0}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-1">মোট বিক্রয় লেনদেন</span>
            <span className="text-xl font-extrabold text-[#0D5C3A] font-mono">
              ৳ {(metrics?.totalSalesAmount || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-1">অপেক্ষমান একাউন্ট আবেদন</span>
            <span className="text-xl font-bold text-amber-700 font-mono">
              {pendingApps.length}টি
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 block mb-1">ক্যাম্পাস কাভারেজ</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">
              ৭টি ক্যাম্পাস
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-stone-200 bg-white flex items-center gap-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'applications'
                ? 'bg-red-950 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            অ্যাকাউন্ট অনুমোদন আবেদন ({pendingApps.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'audit'
                ? 'bg-red-950 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            সিস্টেম অডিট লগ
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'applications' ? (
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

                        {/* Actions for Pending Applications */}
                        {app.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApplicationDecision(app.id, 'approved')}
                              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#0D5C3A] hover:bg-[#09432a] text-white flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>অনুমোদন দিন</span>
                            </button>

                            <button
                              onClick={() => handleApplicationDecision(app.id, 'rejected')}
                              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
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
          ) : (
            /* Audit Log Tab */
            <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden text-xs divide-y divide-stone-200">
              {auditLogs.map((log) => (
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
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
