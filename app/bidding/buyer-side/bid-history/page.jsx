"use client";

import React from 'react';
import Link from 'next/link';

export default function BidHistoryPage() {
  return (
    <>
      <style>{`
        :root{
          --ink:#161A2B; --paper:#F6F4EC; --panel:#FFFFFF;
          --slate:#63697E; --slate-light:#9CA0B3;
          --line:#DEDACB; --line-soft:#EAE7DC;
          --brass:#9C7226; --brass-soft:#F1E4C8;
          --green:#2E6B4C; --green-soft:#E3EEE5;
          --amber:#95651E; --amber-soft:#F4E9D4;
          --red:#9B3B2E; --red-soft:#F3E4E0;
          --radius:3px;
        }
        .bid-history-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; font-size:14px; line-height:1.5; min-height: 100vh; }
        .bid-history-container a{ color:inherit; text-decoration:none; }
        .bid-history-container h1, .bid-history-container h2, .bid-history-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }

        .bid-history-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .bid-history-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .bid-history-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .bid-history-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .bid-history-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .bid-history-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .bid-history-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .bid-history-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .bid-history-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .bid-history-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .bid-history-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .bid-history-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }

        .bid-history-container .page-head{ padding:24px 28px 0 28px; display:flex; justify-content:space-between; align-items:flex-start; }
        .bid-history-container .page-head h1{ font-size:22px; }
        .bid-history-container .page-head .sub{ font-size:13px; color:var(--slate); margin-top:5px; }

        .bid-history-container .rail{ margin:24px 28px 40px 28px; }
        .bid-history-container .version{ display:flex; gap:18px; padding:20px 0; border-bottom:1px solid var(--line-soft); }
        .bid-history-container .version:last-child{ border-bottom:none; }
        .bid-history-container .version-marker{ display:flex; flex-direction:column; align-items:center; flex:none; width:24px; }
        .bid-history-container .version-dot{ width:14px; height:14px; border-radius:50%; background:var(--panel); border:2px solid var(--line); }
        .bid-history-container .version-dot.current{ border-color:var(--amber); background:var(--amber-soft); }
        .bid-history-container .version-dot.accepted{ border-color:var(--green); background:var(--green-soft); }
        .bid-history-container .version-line{ width:1.5px; flex:1; background:var(--line); margin-top:4px; }

        .bid-history-container .version-card{ flex:1; background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); padding:16px 20px; }
        .bid-history-container .version-top{ display:flex; justify-content:space-between; align-items:center; }
        .bid-history-container .version-title{ font-size:14px; font-weight:500; }
        .bid-history-container .version-date{ font-size:11.5px; color:var(--slate-light); font-family:'IBM Plex Mono',monospace; }
        .bid-history-container .version-amount{ font-size:20px; font-family:'IBM Plex Mono',monospace; margin-top:8px; }
        .bid-history-container .version-terms{ font-size:12.5px; color:var(--slate); margin-top:4px; }
        .bid-history-container .badge{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:500; padding:3px 9px; border-radius:20px; }
        .bid-history-container .badge.amber{ background:var(--amber-soft); color:var(--amber); }
        .bid-history-container .badge.green{ background:var(--green-soft); color:var(--green); }
        .bid-history-container .badge.gray{ background:var(--line-soft); color:var(--slate); }
        .bid-history-container .version-actions{ margin-top:12px; display:flex; gap:8px; }
        .bid-history-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:12px; font-weight:500; padding:7px 12px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--line); background:transparent; color:var(--slate); }
        .bid-history-container .btn:hover{ border-color:var(--ink); color:var(--ink); }
        .bid-history-container .diff{ margin-top:12px; font-size:12px; color:var(--slate); background:var(--paper); border:1px dashed var(--line); border-radius:var(--radius); padding:10px 12px; }
        .bid-history-container .diff b{ color:var(--ink); }
        .bid-history-container .diff .up{ color:var(--green); } .bid-history-container .diff .down{ color:var(--red); }
      `}</style>

      <div className="bid-history-container">
        <div className="subnav">
          <Link href="/bidding/buyer-side">Overview</Link>
          <Link href="/bidding/buyer-side/data-room">Data room</Link>
          <Link href="/bidding/buyer-side/my-bid">My bid</Link>
          <Link href="/bidding/buyer-side/bid-history" className="active">Bid history</Link>
          <Link href="/bidding/buyer-side/messages">Messages</Link>
          <Link href="/bidding/buyer-side/term-sheet">Term sheet</Link>
        </div>

        <div className="page-head">
          <div>
            <h1>Bid history</h1>
            <div className="sub">Every version you've submitted on Project Alpha, in order</div>
          </div>
        </div>

        <div className="rail">
          <div className="version">
            <div className="version-marker"><div className="version-dot current"></div><div className="version-line"></div></div>
            <div className="version-card">
              <div className="version-top">
                <span className="version-title">Version 3 — awaiting your response</span>
                <span className="version-date">3 Sep, 9:05 AM</span>
              </div>
              <div className="version-amount">$100.0M <span className="badge amber" style={{ marginLeft: '8px' }}>Seller counter</span></div>
              <div className="version-terms">Seller countered your $95.0M offer, asking for full asking price</div>
              <div className="diff">Change from v2: offer <span className="up">+$5.0M</span> requested by seller</div>
              <div className="version-actions">
                <a href="#" className="btn">Match counter</a>
                <a href="#" className="btn">Send new offer</a>
              </div>
            </div>
          </div>

          <div className="version">
            <div className="version-marker"><div className="version-dot"></div><div className="version-line"></div></div>
            <div className="version-card">
              <div className="version-top">
                <span className="version-title">Version 2 — your bid</span>
                <span className="version-date">1 Sep, 3:40 PM</span>
              </div>
              <div className="version-amount">$95.0M <span className="badge gray" style={{ marginLeft: '8px' }}>Submitted</span></div>
              <div className="version-terms">70% cash / 30% stock · expected close Dec 2026</div>
              <div className="diff">Change from v1: offer <span className="up">+$3.0M</span>, cash component <span className="down">-10%</span></div>
              <div className="version-actions"><a href="#" className="btn">View full terms</a></div>
            </div>
          </div>

          <div className="version">
            <div className="version-marker"><div className="version-dot"></div></div>
            <div className="version-card">
              <div className="version-top">
                <span className="version-title">Version 1 — initial bid</span>
                <span className="version-date">22 Aug, 11:15 AM</span>
              </div>
              <div className="version-amount">$92.0M <span className="badge gray" style={{ marginLeft: '8px' }}>Submitted</span></div>
              <div className="version-terms">80% cash / 20% stock · expected close Jan 2027</div>
              <div className="version-actions"><a href="#" className="btn">View full terms</a></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
