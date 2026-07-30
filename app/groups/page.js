"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { FaUsers } from "react-icons/fa";

export default function GroupsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const rawSession = localStorage.getItem("vdr_session");
        if (!rawSession) {
          router.push("/login");
          return;
        }

        const session = JSON.parse(rawSession);
        const userRole = session?.role;
        const userId = session?.id;
        const companyId = session?.company_id;

        let groups = [];

        if (userRole === "external_user") {
          const { data: ugRows } = await supabase
            .from("user_groups")
            .select("group_id")
            .eq("user_id", userId);

          const groupIds = ugRows?.map((r) => r.group_id) || [];
          if (groupIds.length > 0) {
            let query = supabase
              .from("groups")
              .select("id")
              .in("id", groupIds)
              .eq("company_id", companyId);
              
            if (session?.active_workspace_id) query = query.eq('workspace_id', session.active_workspace_id);
            else query = query.is('workspace_id', null);
            
            const { data } = await query;
            groups = data || [];
          }
        } else {
          let query = supabase
            .from("groups")
            .select("id")
            .eq("company_id", companyId)
            .order("created_at", { ascending: false });

          if (session?.active_workspace_id) query = query.eq('workspace_id', session.active_workspace_id);
          else query = query.is('workspace_id', null);
          
          const { data } = await query;

          groups = data || [];

          if (userRole === "admin") {
            const { data: targetUsers } = await supabase
              .from("users")
              .select("id")
              .eq("company_id", companyId)
              .in("role", ["sub_admin", "external_user"]);

            const targetUserIds = (targetUsers || []).map((u) => u.id);
            if (targetUserIds.length > 0) {
              const { data: ugRows } = await supabase
                .from("user_groups")
                .select("group_id")
                .in("user_id", targetUserIds);

              const validGroupIds = new Set((ugRows || []).map((r) => r.group_id));
              groups = groups.filter((g) => validGroupIds.has(g.id));
            } else {
              groups = [];
            }
          } else if (userRole === "sub_admin") {
            const { data: extUsers } = await supabase
              .from("users")
              .select("id")
              .eq("company_id", companyId)
              .eq("role", "external_user");

            const extUserIds = (extUsers || []).map((u) => u.id);
            if (extUserIds.length > 0) {
              const { data: ugExt } = await supabase
                .from("user_groups")
                .select("group_id")
                .in("user_id", extUserIds);

              const validGroupIds = new Set((ugExt || []).map((r) => r.group_id));
              groups = groups.filter((g) => validGroupIds.has(g.id));
            } else {
              groups = [];
            }
          }
        }

        if (groups && groups.length > 0) {
          router.replace(`/groups/${groups[0].id}`);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Redirect error:", err);
        setLoading(false);
      }
    };

    checkAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[70vh] font-sans">
        <div className="w-9 h-9 border-4 border-slate-200 border-t-[var(--brand)] rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading workspace groups...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[70vh] p-8 font-sans text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--brand-50)] text-[var(--brand)] flex items-center justify-center mb-5 shadow-xs">
        <FaUsers size={30} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">No Groups Found</h2>
      <p className="text-slate-500 text-sm max-w-md">
        There are currently no active groups available. You can add a new group using the "+ Add Groups" button on the left sidebar.
      </p>
    </div>
  );
}