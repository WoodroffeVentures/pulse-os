'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface OrgMembership {
  organization_id: string;
  role: string;
  organizations: {
    id: string;
    name: string;
    subscription_plan: string;
  };
}

interface OrgContextValue {
  user: User | null;
  orgId: string | null;
  orgName: string | null;
  orgPlan: string | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue>({
  user: null,
  orgId: null,
  orgName: null,
  orgPlan: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function OrgProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<OrgMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function loadMembership(userId: string) {
    const { data } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(id, name, subscription_plan)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    if (data) setMembership(data as unknown as OrgMembership);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) loadMembership(user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadMembership(session.user.id);
      else { setMembership(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const org = membership?.organizations;
  return (
    <OrgContext.Provider value={{
      user,
      orgId: org?.id ?? null,
      orgName: org?.name ?? null,
      orgPlan: org?.subscription_plan ?? null,
      role: membership?.role ?? null,
      loading,
      signOut,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}
