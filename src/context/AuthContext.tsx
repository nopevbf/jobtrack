import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isOwner: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verifikasi apakah user id ada di tabel app_owner
  const verifyOwnerStatus = async (userId: string): Promise<boolean> => {
    try {
      // 1. Coba verifikasi lewat RPC check_is_owner jika ada
      const { data: rpcData, error: rpcError } = await supabase.rpc('check_is_owner' as any);
      if (!rpcError && typeof rpcData === 'boolean') {
        return rpcData;
      }

      // 2. Fallback query langsung ke tabel app_owner
      const { data, error } = await supabase
        .from('app_owner')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[JobTrack Auth] Verifikasi owner gagal:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('[JobTrack Auth] Exception verifikasi owner:', err);
      return false;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const ownerVerified = await verifyOwnerStatus(session.user.id);
        setIsOwner(ownerVerified);
        if (!ownerVerified) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const ownerVerified = await verifyOwnerStatus(currentSession.user.id);
        setIsOwner(ownerVerified);
        if (!ownerVerified) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Beri sedikit jeda mikro agar auth state tersinkron ke client
        await new Promise((resolve) => setTimeout(resolve, 300));
        const ownerVerified = await verifyOwnerStatus(data.user.id);
        if (!ownerVerified) {
          await supabase.auth.signOut();
          return {
            error: new Error(
              `Akses Ditolak: Akun ${email} tidak terdaftar di tabel app_owner. Pastikan query INSERT telah dijalankan di Supabase.`
            ),
          };
        }
        setIsOwner(true);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsOwner(false);
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isOwner,
        isLoading,
        signIn,
        signOut,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
