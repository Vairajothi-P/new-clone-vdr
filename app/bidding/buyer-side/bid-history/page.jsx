"use client";

import React from 'react';
import Link from 'next/link';

export default function BidHistoryPage() {
  return (
    <div className="bg-[#F8F9FB] text-slate-900 font-sans text-[14px] leading-relaxed min-h-screen antialiased">
      <div className="flex gap-[2px] px-7 border-b border-slate-200 bg-white">
        <Link href="/bidding/buyer-side" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">Overview</Link>
        {/* <Link href="/bidding/buyer-side/data-room" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">Data room</Link> */}
        <Link href="/bidding/buyer-side/my-bid" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">My bid</Link>
        <Link href="/bidding/buyer-side/bid-history" className="px-4 py-[13px] text-[13px] text-slate-900 border-b-2 border-blue-600 font-medium">Bid history</Link>
        <Link href="/bidding/buyer-side/messages" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">Messages</Link>
        <Link href="/bidding/buyer-side/term-sheet" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">Term sheet</Link>
      </div>

      <div className="max-w-[1280px] mx-auto pb-8">
        <div className="pt-6 px-7 flex justify-between items-start">
          <div>
            <h1 className="text-[22px] font-serif font-medium m-0 text-slate-900">Bid history</h1>
            <div className="text-[13px] text-slate-500 mt-1.5">Every version you've submitted on Project Alpha, in order</div>
          </div>
        </div>

        <div className="mt-6 mx-7">
          <div className="flex gap-4.5 py-5 border-b border-slate-100 last:border-b-0">
            <div className="flex flex-col items-center shrink-0 w-6">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-50 border-2 border-amber-500"></div>
              <div className="w-[1.5px] flex-1 bg-slate-200 mt-1.5 mb-[-20px]"></div>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-medium text-slate-900">Version 3 — awaiting your response</span>
                <span className="text-[11.5px] text-slate-400 font-mono">3 Sep, 9:05 AM</span>
              </div>
              <div className="text-[20px] font-mono mt-2 text-slate-900 flex items-center">
                $100.0M 
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 ml-2 border border-amber-100">Seller counter</span>
              </div>
              <div className="text-[12.5px] text-slate-500 mt-1">Seller countered your $95.0M offer, asking for full asking price</div>
              <div className="mt-3.5 text-[12px] text-slate-600 bg-[#FAFAFA] border border-dashed border-slate-200 rounded-lg px-3 py-2.5">
                Change from v2: offer <span className="text-green-600 font-medium">+$5.0M</span> requested by seller
              </div>
              <div className="mt-3.5 flex gap-2">
                <a href="#" className="font-sans text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg cursor-pointer border border-slate-200 bg-transparent text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors shadow-sm">Match counter</a>
                <a href="#" className="font-sans text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg cursor-pointer border border-slate-200 bg-transparent text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors shadow-sm">Send new offer</a>
              </div>
            </div>
          </div>

          <div className="flex gap-4.5 py-5 border-b border-slate-100 last:border-b-0">
            <div className="flex flex-col items-center shrink-0 w-6">
              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-300 mt-1"></div>
              <div className="w-[1.5px] flex-1 bg-slate-200 mt-1.5 mb-[-20px]"></div>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-medium text-slate-900">Version 2 — your bid</span>
                <span className="text-[11.5px] text-slate-400 font-mono">1 Sep, 3:40 PM</span>
              </div>
              <div className="text-[20px] font-mono mt-2 text-slate-900 flex items-center">
                $95.0M 
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 ml-2">Submitted</span>
              </div>
              <div className="text-[12.5px] text-slate-500 mt-1">70% cash / 30% stock · expected close Dec 2026</div>
              <div className="mt-3.5 text-[12px] text-slate-600 bg-[#FAFAFA] border border-dashed border-slate-200 rounded-lg px-3 py-2.5">
                Change from v1: offer <span className="text-green-600 font-medium">+$3.0M</span>, cash component <span className="text-red-600 font-medium">-10%</span>
              </div>
              <div className="mt-3.5 flex gap-2">
                <a href="#" className="font-sans text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg cursor-pointer border border-slate-200 bg-transparent text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors shadow-sm">View full terms</a>
              </div>
            </div>
          </div>

          <div className="flex gap-4.5 py-5 border-b border-slate-100 last:border-b-0">
            <div className="flex flex-col items-center shrink-0 w-6">
              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-300 mt-1"></div>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-medium text-slate-900">Version 1 — initial bid</span>
                <span className="text-[11.5px] text-slate-400 font-mono">22 Aug, 11:15 AM</span>
              </div>
              <div className="text-[20px] font-mono mt-2 text-slate-900 flex items-center">
                $92.0M 
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 ml-2">Submitted</span>
              </div>
              <div className="text-[12.5px] text-slate-500 mt-1">80% cash / 20% stock · expected close Jan 2027</div>
              <div className="mt-3.5 flex gap-2">
                <a href="#" className="font-sans text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg cursor-pointer border border-slate-200 bg-transparent text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors shadow-sm">View full terms</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
