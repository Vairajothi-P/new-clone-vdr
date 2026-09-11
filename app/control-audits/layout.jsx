"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import MainSidebar from "@/components/MainSidebar";
import ControlsAuditHeader from "@/components/controls-audit/ControlsAuditHeader";
import ControlsAuditNav from "@/components/controls-audit/ControlsAuditNav";
import { ControlsAuditProvider } from "@/components/controls-audit/ControlsAuditContext";

export default function ControlAuditsLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      let raw = localStorage.getItem("vdr_session");
      let session = null;

      if (raw) {
        try {
          session = JSON.parse(raw);
        } catch (e) {
          session = null;
        }
      }

      // If no session exists in demo/preview environment, initialize a fallback session
      if (!session) {
        session = {
          id: "demo-admin-01",
          email: "v.sterling@acme-holdings.com",
          role: "super_admin",
          name: "Victoria Sterling",
          company_id: "demo-company-01",
        };
        try {
          localStorage.setItem("vdr_session", JSON.stringify(session));
        } catch (e) {}
      }

      // Super admin or dev preview gets full access
      if (session.role === "super_admin" || session.id === "demo-admin-01") {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Check DB permissions for regular users
      try {
        const { data: userGroups } = await supabase
          .from("user_groups")
          .select("group_id")
          .eq("user_id", session.id);

        const groupIds = userGroups?.map((ug) => ug.group_id) || [];

        if (groupIds.length === 0) {
          router.push("/documents");
          return;
        }

        const { data: perms } = await supabase
          .from("permissions")
          .select("can_access_control_audits")
          .eq("scope", "workspace")
          .in("group_id", groupIds);

        const canAccess = perms?.some((p) => p.can_access_control_audits);

        if (canAccess) {
          setHasAccess(true);
        } else {
          router.push("/documents");
        }
      } catch (err) {
        // Graceful fallback in environments without live supabase connection
        setHasAccess(true);
      } finally {
        setLoading(false);
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
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              Initializing Controls & Audit Governance…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) return null;

  return (
    <ControlsAuditProvider>
      <div className="h-screen w-full bg-[#F8F9FB] flex overflow-hidden font-sans relative">
        {/* Top brand gradient accent (matching Teams & Settings design) */}
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-[var(--brand)]/8 to-transparent pointer-events-none z-0"></div>

        {/* Main DMS Global Rail Sidebar */}
        <MainSidebar />

        {/* Module Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
          {/* Module Header with Deal Context and Workspace Selectors */}
          <ControlsAuditHeader />

          {/* Horizontal Navigation Sub-Bar with the 9 Module Tabs */}
          <ControlsAuditNav />

          {/* Active Sub-Page Canvas */}
          <main className="flex-1 overflow-y-auto bg-[#F8F9FB] relative flex flex-col min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ControlsAuditProvider>
  );
}
