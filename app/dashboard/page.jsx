"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workspaces");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[var(--brand)]/20 border-t-[var(--brand)] rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading Workspaces…</p>
      </div>
    </div>
  );
}
