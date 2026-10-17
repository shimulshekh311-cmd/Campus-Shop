import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CampusId } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  linkedAccounts: User[];
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isApplyRoleOpen: boolean;
  targetApplyRole: UserRole;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openApplyRole: (role?: UserRole) => void;
  closeApplyRole: () => void;
  loginDemo: (role: UserRole) => Promise<void>;
  switchAccount: (targetUserId: string) => Promise<boolean>;
  createLinkedBuyerAccount: () => Promise<boolean>;
  login: (credential: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    campusId: CampusId;
    department: string;
    studentId?: string;
    role?: UserRole;
    pickupPointId?: string;
    factoryName?: string;
    details?: string;
  }) => Promise<{ success: boolean; isPendingApproval?: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApplyRoleOpen, setIsApplyRoleOpen] = useState(false);
  const [targetApplyRole, setTargetApplyRole] = useState<UserRole>('seller');

  const fetchCurrentUser = async (userId?: string) => {
    try {
      const activeId = userId || localStorage.getItem('campusshop_user_id') || 'user-buyer-1';
      const res = await fetch('/api/auth/me', {
        headers: { 'x-user-id': activeId },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setLinkedAccounts(data.linkedAccounts || []);
        localStorage.setItem('campusshop_user_id', data.user.id);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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

  const loginDemo = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('campusshop_user_id', data.user.id);
        await fetchCurrentUser(data.user.id);
        setIsAuthModalOpen(false);
      }
    } catch (err) {
      console.error('Demo login failed:', err);
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

  const login = async (credential: string) => {
    setIsLoading(true);
    try {
      const isEmail = credential.includes('@');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: credential } : { phone: credential }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('campusshop_user_id', data.user.id);
        await fetchCurrentUser(data.user.id);
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    campusId: CampusId;
    department: string;
    studentId?: string;
    role?: UserRole;
    pickupPointId?: string;
    factoryName?: string;
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
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: 'সার্ভার সংযোগে ত্রুটি হয়েছে' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campusshop_user_id');
    loginDemo('buyer');
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchCurrentUser(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'buyer',
        linkedAccounts,
        isLoading,
        isAuthModalOpen,
        isApplyRoleOpen,
        targetApplyRole,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        openApplyRole: (roleToApply?: UserRole) => {
          if (roleToApply) setTargetApplyRole(roleToApply);
          setIsApplyRoleOpen(true);
        },
        closeApplyRole: () => setIsApplyRoleOpen(false),
        loginDemo,
        switchAccount,
        createLinkedBuyerAccount,
        login,
        register,
        logout,
        refreshUser,
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
