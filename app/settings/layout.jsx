"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import MainSidebar from '@/components/MainSidebar';

export default function SettingsLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [perms, setPerms] = useState({ settings: false, branding: false, watermark: false });

  useEffect(() => {
    const verifyAccess = async () => {
      const raw = localStorage.getItem("vdr_session");
      if (!raw) { router.push('/login'); return; }
      const session = JSON.parse(raw);

      // ONLY Super Admin gets automatic access to all settings
      if (session.role === 'super_admin') {
        setPerms({ settings: true, branding: true, watermark: true });
        setLoading(false);
        return;
      }

      const { data: ugRows } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
      const groupIds = ugRows?.map(r => r.group_id) || [];

      if (groupIds.length > 0) {
        const { data: dbPerms } = await supabase
          .from('permissions')
          .select('can_access_settings, can_access_branding, can_access_watermarks')
          .eq('scope', 'workspace')
          .in('group_id', groupIds);

        const hasSettings = dbPerms?.some(p => p.can_access_settings);
        const hasBranding = dbPerms?.some(p => p.can_access_branding);
        const hasWatermark = dbPerms?.some(p => p.can_access_watermarks);

        // If they don't even have basic settings access, kick out completely
        if (!hasSettings) {
          router.push('/documents');
          return;
        }

        // If they try to type a blocked URL, gently push them to the blank settings page
        if (pathname.includes('/branding') && !hasBranding) {
          router.push('/settings');
          return;
        }
        if (pathname.includes('/watermark') && !hasWatermark) {
          router.push('/settings');
          return;
        }

        setPerms({ settings: !!hasSettings, branding: !!hasBranding, watermark: !!hasWatermark });
      } else {
        router.push('/documents');
        return;
      }

      setLoading(false);
    };

    verifyAccess();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-[#F8F9FB]">
        <MainSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!perms.settings) return null;

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex overflow-hidden font-sans">
      <MainSidebar />

      {/* VERTICAL SETTINGS SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Manage workspace config</p>
        </div>

        <div className="flex flex-col p-4 gap-2">
          {/* ONLY SHOW BRANDING IF TOGGLE IS TRUE */}
          {perms.branding && (
            <Link href="/settings/branding"
              className={`px-4 py-3 rounded-xl text-[13px] font-bold transition-all flex items-center gap-3 ${pathname.includes('/branding')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
              Branding & Identity
            </Link>
          )}

          {/* ONLY SHOW WATERMARK IF TOGGLE IS TRUE */}
          {perms.watermark && (
            <Link href="/settings/watermark"
              className={`px-4 py-3 rounded-xl text-[13px] font-bold transition-all flex items-center gap-3 ${pathname.includes('/watermark')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
              Document Watermarks
            </Link>
          )}

          {/* IF NEITHER IS TRUE, SHOW AN EMPTY PLACEHOLDER SO SIDEBAR ISN'T TOTALLY BLANK */}
          {!perms.branding && !perms.watermark && (
            <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-xl">
              No menu options assigned
            </div>
          )}
        </div>
      </div>

      {/* ACTUAL PAGE CONTENT */}
      <div className="flex-1 overflow-y-auto relative z-0">
        {children}
      </div>
    </div>
  );
}




// import SettingsLayoutWrapper from '@/components/settings/SettingsLayoutWrapper';
// import MainSidebar from '@/components/MainSidebar';

// export const metadata = {
//   title: 'Settings - Virtual Data Room',
//   description: 'Manage your VDR preferences and branding.',
// };

// export default function SettingsLayout({ children }) {
//   return (
//     <div className="h-screen w-full bg-white flex overflow-hidden font-sans">
//       <MainSidebar />
//       <SettingsLayoutWrapper>
//         {children}
//       </SettingsLayoutWrapper>
//     </div>
//   );
// }
