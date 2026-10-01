'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Database, UserRole } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  role: UserRole;
  isOrganizer: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  role: 'USER',
  isOrganizer: false,
  isStaff: false,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  setDemoRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoRole, setDemoRoleState] = useState<UserRole | null>(null);

  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        // Fallback default profile if not yet created by trigger
        setProfile({
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario',
          email: user?.email || '',
          avatar_url: null,
          role: 'USER',
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Check saved demo role in localStorage for instant developer workflow
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('eventhub_active_role') as UserRole | null;
      if (savedRole) {
        setDemoRoleState(savedRole);
      }
    }

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn('Supabase session initialization note:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eventhub_active_role');
    }
    setDemoRoleState(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const setDemoRole = (newRole: UserRole) => {
    setDemoRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventhub_active_role', newRole);
    }
    if (profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  const activeRole: UserRole = demoRole || profile?.role || 'USER';

  const value = {
    user,
    profile: profile ? { ...profile, role: activeRole } : null,
    session,
    isLoading,
    role: activeRole,
    isOrganizer: activeRole === 'ORGANIZER' || activeRole === 'ADMIN',
    isStaff: activeRole === 'STAFF' || activeRole === 'ORGANIZER' || activeRole === 'ADMIN',
    isAdmin: activeRole === 'ADMIN',
    signOut,
    refreshProfile,
    setDemoRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
