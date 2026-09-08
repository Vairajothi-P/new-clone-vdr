"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import MainSidebar from '@/components/MainSidebar';

export default function ControlAuditsLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      const raw = localStorage.getItem("vdr_session");
      if (!raw) { router.push('/login'); return; }
      const session = JSON.parse(raw);

      if (session.role === 'super_admin') {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      const { data: userGroups } = await supabase
        .from('user_groups')
        .select('group_id')
        .eq('user_id', session.id);

      const groupIds = userGroups?.map(ug => ug.group_id) || [];

      if (groupIds.length === 0) {
        router.push('/documents');
        return;
      }

      const { data: perms } = await supabase
        .from('permissions')
        .select('can_access_control_audits')
        .eq('scope', 'workspace')
        .in('group_id', groupIds);

      const canAccess = perms?.some(p => p.can_access_control_audits);
      
      if (canAccess) {
        setHasAccess(true);
        setLoading(false);
      } else {
        router.push('/documents');
      }
    };

    verifyAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-[#F8FAFC]">
        <MainSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[var(--brand)]/20 border-t-[var(--brand)] rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400 font-medium">Verifying access…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) return null;

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex overflow-hidden font-sans relative">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-[var(--brand)]/8 to-transparent pointer-events-none z-0"></div>
      <MainSidebar />
      <div className="flex-1 overflow-y-auto relative z-10">
        {children}
      </div>
    </div>
  );
}
