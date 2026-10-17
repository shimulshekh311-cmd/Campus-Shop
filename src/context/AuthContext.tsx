import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CampusId } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole | 'guest';
  linkedAccounts: User[];
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalInitialTab: 'login' | 'register';
  isApplyRoleOpen: boolean;
  targetApplyRole: UserRole;
  openAuthModal: (initialTab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openApplyRole: (role?: UserRole) => void;
  closeApplyRole: () => void;
  switchAccount: (targetUserId: string) => Promise<boolean>;
  createLinkedBuyerAccount: () => Promise<boolean>;
  login: (credential: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    campusId: CampusId;
    department: string;
    studentId?: string;
    role?: UserRole;
    pickupPointId?: string;
    factoryName?: string;
    storeName?: string;
    details?: string;
  }) => Promise<{ success: boolean; isPendingApproval?: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');
  const [isApplyRoleOpen, setIsApplyRoleOpen] = useState(false);
  const [targetApplyRole, setTargetApplyRole] = useState<UserRole>('seller');

  const fetchCurrentUser = async (userId?: string) => {
    try {
      const activeId = userId || localStorage.getItem('campusshop_user_id');
      if (!activeId) {
        setUser(null);
        setLinkedAccounts([]);
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: { 'x-user-id': activeId },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setLinkedAccounts(data.linkedAccounts || []);
        localStorage.setItem('campusshop_user_id', data.user.id);
      } else {
        localStorage.removeItem('campusshop_user_id');
        setUser(null);
        setLinkedAccounts([]);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/admin-status');
      const data = await res.json();
      return !!data.hasAdmin;
    } catch {
      return false;
    }
  };

  const switchAccount = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('campusshop_user_id', data.user.id);
        await fetchCurrentUser(data.user.id);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createLinkedBuyerAccount = async () => {
    if (!user) return false;
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${user.name} (বায়ার)`,
        email: user.email,
        phone: user.phone,
        campusId: user.campusId,
        department: user.department || 'শিক্ষার্থী',
        studentId: user.studentId,
        role: 'buyer',
      }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('campusshop_user_id', data.user.id);
      await fetchCurrentUser(data.user.id);
      return true;
    }
    return false;
  };

  const login = async (credential: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('campusshop_user_id', data.user.id);
        await fetchCurrentUser(data.user.id);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: data.message || 'লগইন ব্যর্থ হয়েছে' };
    } catch {
      return { success: false, message: 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    campusId: CampusId;
    department: string;
    studentId?: string;
    role?: UserRole;
    pickupPointId?: string;
    factoryName?: string;
    storeName?: string;
    details?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (!data.isPendingApproval) {
          setUser(data.user);
          localStorage.setItem('campusshop_user_id', data.user.id);
          await fetchCurrentUser(data.user.id);
          setIsAuthModalOpen(false);
          setIsApplyRoleOpen(false);
        }
        return {
          success: true,
          isPendingApproval: data.isPendingApproval,
          message: data.message,
        };
      }
      return { success: false, message: data.message || 'নিবন্ধন সম্পন্ন করা যায়নি' };
    } catch {
      return { success: false, message: 'সার্ভার সংযোগে ত্রুটি হয়েছে' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campusshop_user_id');
    setUser(null);
    setLinkedAccounts([]);
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchCurrentUser(user.id);
    } else {
      await fetchCurrentUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'guest',
        linkedAccounts,
        isLoading,
        isAuthModalOpen,
        authModalInitialTab,
        isApplyRoleOpen,
        targetApplyRole,
        openAuthModal: (initialTab: 'login' | 'register' = 'login') => {
          setAuthModalInitialTab(initialTab);
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => setIsAuthModalOpen(false),
        openApplyRole: (roleToApply?: UserRole) => {
          if (roleToApply) setTargetApplyRole(roleToApply);
          setIsApplyRoleOpen(true);
        },
        closeApplyRole: () => setIsApplyRoleOpen(false),
        switchAccount,
        createLinkedBuyerAccount,
        login,
        register,
        logout,
        refreshUser,
        checkAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
