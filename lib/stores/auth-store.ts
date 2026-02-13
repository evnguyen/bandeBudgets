import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  siteAccessGranted: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  grantSiteAccess: () => void;
  checkSiteAccess: () => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  siteAccessGranted: false,
  
  setUser: (user) => set({ user }),
  
  setLoading: (loading) => set({ loading }),
  
  grantSiteAccess: () => {
    set({ siteAccessGranted: true });
    // Store long-lived token in localStorage
    if (typeof window !== 'undefined') {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year expiry
      localStorage.setItem('siteAccessToken', JSON.stringify({
        granted: true,
        expiry: expiryDate.getTime(),
      }));
    }
  },
  
  checkSiteAccess: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const token = localStorage.getItem('siteAccessToken');
      if (!token) return false;
      
      const parsed = JSON.parse(token);
      if (parsed.granted && parsed.expiry > Date.now()) {
        set({ siteAccessGranted: true });
        return true;
      }
      
      // Token expired
      localStorage.removeItem('siteAccessToken');
      return false;
    } catch {
      return false;
    }
  },
  
  logout: () => {
    set({ user: null, siteAccessGranted: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('siteAccessToken');
    }
  },
}));
