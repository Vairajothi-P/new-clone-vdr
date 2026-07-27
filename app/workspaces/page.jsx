"use client";

import React, { Suspense } from "react";
import WorkspacesContainer from "@/components/workspaces/WorkspacesContainer";

export default function WorkspacesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen w-full">
          <div className="w-8 h-8 border-4 border-[var(--brand)]/20 border-t-[var(--brand)] rounded-full animate-spin" />
        </div>
      }
    >
      <WorkspacesContainer />
    </Suspense>
  );
}
