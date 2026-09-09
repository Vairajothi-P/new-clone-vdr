"use client";

import React from 'react';
import MainSidebar from '@/components/MainSidebar';

export default function BiddingLayout({ children }) {
    return (
        <div className="flex w-full h-screen overflow-hidden font-sans bg-[var(--paper)]">
            <MainSidebar />
            <main className="flex-1 min-w-0 h-full overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
