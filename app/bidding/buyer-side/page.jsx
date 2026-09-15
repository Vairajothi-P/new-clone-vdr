"use client";

import React from 'react';
import Link from 'next/link';
export default function BuyerOverviewPage() {
  return (
    <div className="bg-[#F8F9FB] text-slate-900 font-sans text-[14px] leading-relaxed min-h-screen antialiased">
      <div className="flex gap-[2px] px-7 border-b border-slate-200 bg-white">
        <Link href="/bidding/buyer-side" className="px-4 py-[13px] text-[13px] text-slate-900 border-b-2 border-blue-600 font-medium">Overview</Link>
        {/* <Link href="/bidding/buyer-side/data-room" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">Data room</Link> */}
        <Link href="/bidding/buyer-side/my-bid" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">My bid</Link>
        <Link href="/bidding/buyer-side/bid-history" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">Bid history</Link>
        <Link href="/bidding/buyer-side/messages" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">Messages</Link>
        <Link href="/bidding/buyer-side/term-sheet" className="px-4 py-[13px] text-[13px] text-slate-500 hover:text-slate-900 border-b-2 border-transparent">Term sheet</Link>
      </div>

      <div className="max-w-[1280px] mx-auto pb-8">

        <div className="pt-6.5 px-7">
          <div className="flex justify-between items-start gap-6 flex-wrap">
            <div>
              <div className="text-[27px] text-slate-900 flex items-baseline gap-3 flex-wrap">
                <span className="font-serif font-medium">Project Alpha</span>
                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-100 font-sans tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Bid evaluation in progress
                </span>
              </div>
              <div className="text-slate-500 text-[13px] mt-1.5">Invited 12 Aug 2026 &nbsp;·&nbsp; Asking price $100M &nbsp;·&nbsp; Seller advisor: Linklane LLP</div>
              <div className="flex flex-wrap gap-2.5 mt-3">
                <span className="text-[11.5px] text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">Enterprise SaaS</span>
                <span className="text-[11.5px] text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">340 employees</span>
                <span className="text-[11.5px] text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">$25M ARR · 38% YoY growth</span>
                <span className="text-[11.5px] text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">EBITDA positive</span>
              </div>
            </div>
            <div className="flex gap-2.5">
              <a href="#" className="font-sans text-[13px] font-medium px-4 py-2.5 rounded-lg cursor-pointer border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 hover:border-slate-300 transition-colors shadow-sm bg-transparent">Message seller</a>
              <a href="#" className="font-sans text-[13px] font-medium px-4 py-2.5 rounded-lg cursor-pointer border border-slate-900 bg-slate-900 text-white hover:opacity-90 transition-opacity shadow-sm">Go to my bid</a>
            </div>
          </div>
        </div>

        <div className="mx-7 mt-6.5 flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="flex-1 p-3.5 border-r border-slate-100 relative bg-green-50">
            <div className="text-[11px] font-mono text-green-600">01</div>
            <div className="text-[13px] mt-1 text-green-600 font-medium">NDA signed</div>
          </div>
          <div className="flex-1 p-3.5 border-r border-slate-100 relative bg-green-50">
            <div className="text-[11px] font-mono text-green-600">02</div>
            <div className="text-[13px] mt-1 text-green-600 font-medium">Data room access</div>
          </div>
          <div className="flex-1 p-3.5 border-r border-slate-100 relative bg-green-50">
            <div className="text-[11px] font-mono text-green-600">03</div>
            <div className="text-[13px] mt-1 text-green-600 font-medium">Bid submitted</div>
          </div>
          <div className="flex-1 p-3.5 border-r border-slate-100 relative bg-amber-50">
            <div className="text-[11px] font-mono text-amber-600">04</div>
            <div className="text-[13px] mt-1 text-amber-600 font-medium">Seller evaluation</div>
          </div>
          <div className="flex-1 p-3.5 border-r border-slate-100 relative">
            <div className="text-[11px] font-mono text-slate-400">05</div>
            <div className="text-[13px] mt-1 text-slate-500">Term sheet</div>
          </div>
          <div className="flex-1 p-3.5 relative">
            <div className="text-[11px] font-mono text-slate-400">06</div>
            <div className="text-[13px] mt-1 text-slate-500">Closing</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mx-7 mt-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5.5 shadow-sm">
            <div className="text-[11.5px] text-slate-500 mb-2">My current offer</div>
            <div className="text-[24px] font-mono text-blue-600">$95.0M</div>
            <div className="text-[12px] text-slate-400 mt-1.5">Seller countered at $100.0M · response due 6 Sep</div>
            <div className="mt-3.5">
              <a href="#" className="block w-full text-center font-sans text-[13px] font-medium px-4 py-2 rounded-lg cursor-pointer border border-slate-200 text-slate-500 hover:bg-[#F8F9FB] hover:text-slate-900 transition-colors">Respond to counter</a>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5.5 shadow-sm">
            <div className="text-[11.5px] text-slate-500 mb-2">Data room activity</div>
            <div className="text-[24px] font-mono text-slate-900">18<span className="text-slate-400 text-[16px]">&nbsp;/ 24 docs</span></div>
            <div className="text-[12px] text-slate-400 mt-1.5">3 new documents added this week</div>
            <div className="mt-3.5">
              <a href="#" className="block w-full text-center font-sans text-[13px] font-medium px-4 py-2 rounded-lg cursor-pointer border border-slate-200 text-slate-500 hover:bg-[#F8F9FB] hover:text-slate-900 transition-colors">Open data room</a>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5.5 shadow-sm">
            <div className="text-[11.5px] text-slate-500 mb-2">Bid deadline</div>
            <div className="text-[24px] font-mono text-red-600">2d 6h</div>
            <div className="text-[12px] text-slate-400 mt-1.5">18:00 IST, 6 Sep 2026</div>
            <div className="mt-3.5">
              <a href="#" className="block w-full text-center font-sans text-[13px] font-medium px-4 py-2 rounded-lg cursor-pointer border border-slate-200 text-slate-500 hover:bg-[#F8F9FB] hover:text-slate-900 transition-colors">View timeline</a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mx-7 mt-5.5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-[15px] font-serif font-medium m-0">Recent Q&amp;A</h2>
              <a href="#" className="text-[12px] text-slate-500 hover:text-slate-900 transition-colors">View data room →</a>
            </div>
            <div className="p-4.5">
              <div className="py-2.5 border-b border-slate-100 text-[12.5px] first:pt-0 last:border-b-0 last:pb-0">
                <div className="text-slate-900">Seller responded — "Customer contracts are auto-renewing, 92% retention"</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Legal DD folder · 2 hrs ago</div>
              </div>
              <div className="py-2.5 border-b border-slate-100 text-[12.5px] last:border-b-0 last:pb-0">
                <div className="text-slate-900">You asked — "Can we get the Q2 cohort revenue breakdown?"</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Financials folder · Yesterday</div>
              </div>
              <div className="py-2.5 border-b border-slate-100 text-[12.5px] last:border-b-0 last:pb-0">
                <div className="text-slate-900">Seller uploaded — Updated cap table v3.xlsx</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Corporate folder · 2 days ago</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-[15px] font-serif font-medium m-0">Deal timeline</h2>
              <a href="#" className="text-[12px] text-slate-500 hover:text-slate-900 transition-colors">Full history →</a>
            </div>
            <div className="p-4.5">
              <div className="flex justify-between py-1.5 text-[13px] border-b border-slate-100 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-slate-500">NDA signed</span>
                <span className="text-slate-900 font-mono">14 Aug</span>
              </div>
              <div className="flex justify-between py-1.5 text-[13px] border-b border-slate-100 last:border-b-0 last:pb-0">
                <span className="text-slate-500">Initial bid submitted</span>
                <span className="text-slate-900 font-mono">1 Sep</span>
              </div>
              <div className="flex justify-between py-1.5 text-[13px] border-b border-slate-100 last:border-b-0 last:pb-0">
                <span className="text-slate-500">Seller countered</span>
                <span className="text-slate-900 font-mono">3 Sep</span>
              </div>
              <div className="flex justify-between py-1.5 text-[13px] border-b border-slate-100 last:border-b-0 last:pb-0">
                <span className="text-slate-500">Your response due</span>
                <span className="text-red-600 font-mono">6 Sep</span>
              </div>
              <div className="flex justify-between py-1.5 text-[13px] border-b border-slate-100 last:border-b-0 last:pb-0">
                <span className="text-slate-500">Expected term sheet</span>
                <span className="text-slate-400 font-mono">Mid Sep</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="px-7 pt-4 pb-8 text-slate-400 text-[11.5px] flex justify-between border-t border-slate-200 mx-7 mt-6.5">
          <span>All activity on this deal is logged to the audit trail and visible to Meridian DMS compliance.</span>
          <span>Access level: Bidder — NDA-gated</span>
        </footer>
      </div>
    </div>
  );
}
