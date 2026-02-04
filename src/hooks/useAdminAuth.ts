import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initialCheckDone = useRef(false);

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      return !!roleData;
    } catch (error) {
      console.log('Admin role check failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check current session first
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const adminStatus = await checkAdminRole(currentUser.id);
          if (isMounted) {
            setIsAdmin(adminStatus);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.log('Session check failed:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          initialCheckDone.current = true;
        }
      }
    };

    checkSession();

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Skip if initial check hasn't completed (avoid race condition)
        if (!initialCheckDone.current) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const adminStatus = await checkAdminRole(currentUser.id);
          if (isMounted) {
            setIsAdmin(adminStatus);
          }
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  return { user, isAdmin, isLoading, signOut };
};
