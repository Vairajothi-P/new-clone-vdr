"use client";

import React, { Suspense } from "react";
import MainSidebar from "@/components/MainSidebar";

export default function WorkspacesLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-screen bg-[#F8F9FB]">
          <div className="w-8 h-8 border-4 border-[var(--brand)]/20 border-t-[var(--brand)] rounded-full animate-spin" />
        </div>
      }
    >
      <div className="flex w-full h-screen overflow-hidden bg-[#F8F9FB] font-sans">
        <MainSidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto relative bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </Suspense>
  );
}
