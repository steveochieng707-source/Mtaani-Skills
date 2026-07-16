import { useState, useEffect } from 'react';
import { getAuthUser, AuthUser } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getAuthUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getAuthUser());
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return { user };
}
