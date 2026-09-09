"use client";

import React from 'react';
import Link from 'next/link';

export default function TermSheetPage() {
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
        .term-sheet-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; font-size:14px; line-height:1.5; min-height: 100vh; }
        .term-sheet-container a{ color:inherit; text-decoration:none; }
        .term-sheet-container h1, .term-sheet-container h2, .term-sheet-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }

        .term-sheet-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .term-sheet-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .term-sheet-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .term-sheet-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .term-sheet-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .term-sheet-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .term-sheet-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .term-sheet-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .term-sheet-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .term-sheet-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .term-sheet-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .term-sheet-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }
        .term-sheet-container .subnav a.locked{ color:var(--slate-light); }

        .term-sheet-container .status-strip{ margin:20px 28px 0 28px; padding:12px 18px; background:var(--green-soft); border:1px solid #C7DFCB; border-radius:var(--radius); font-size:12.5px; color:var(--green); display:flex; justify-content:space-between; align-items:center; }

        .term-sheet-container .page-head{ padding:22px 28px 0 28px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px; }
        .term-sheet-container .page-head h1{ font-size:22px; }
        .term-sheet-container .page-head .sub{ font-size:13px; color:var(--slate); margin-top:5px; }
        .term-sheet-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:transparent; color:var(--ink); }
        .term-sheet-container .btn:hover{ background:var(--ink); color:var(--paper); }
        .term-sheet-container .btn-primary{ background:var(--ink); color:var(--paper); }
        .term-sheet-container .btn-primary:hover{ opacity:.88; }
        .term-sheet-container .btn-ghost{ border-color:var(--line); color:var(--slate); }

        .term-sheet-container .body-grid{ display:grid; grid-template-columns:1fr 340px; gap:22px; margin:22px 28px 40px 28px; align-items:start; }
        .term-sheet-container .panel{ background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); }
        .term-sheet-container .panel-head{ padding:16px 20px; border-bottom:1px solid var(--line-soft); display:flex; justify-content:space-between; align-items:center; }
        .term-sheet-container .panel-head h2{ font-size:15px; }

        .term-sheet-container table.terms{ width:100%; border-collapse:collapse; }
        .term-sheet-container table.terms td{ padding:14px 20px; border-bottom:1px solid var(--line-soft); font-size:13px; vertical-align:top; }
        .term-sheet-container table.terms tr:last-child td{ border-bottom:none; }
        .term-sheet-container table.terms td.tk{ color:var(--slate); width:200px; }
        .term-sheet-container table.terms td.tv{ color:var(--ink); }
        .term-sheet-container table.terms td.tv .changed{ background:var(--brass-soft); padding:1px 5px; border-radius:2px; }

        .term-sheet-container .comment-thread{ padding:16px 20px; }
        .term-sheet-container .comment{ display:flex; gap:10px; padding:10px 0; border-bottom:1px solid var(--line-soft); font-size:12.5px; }
        .term-sheet-container .comment:last-child{ border-bottom:none; }
        .term-sheet-container .c-avatar{ width:26px;height:26px;border-radius:50%; background:var(--brass-soft); color:var(--brass); display:flex;align-items:center;justify-content:center; font-size:10px; font-family:'IBM Plex Mono',monospace; flex:none; }
        .term-sheet-container .c-body b{ color:var(--ink); }
        .term-sheet-container .c-text{ color:var(--slate); margin-top:2px; }
        .term-sheet-container .c-meta{ color:var(--slate-light); font-size:11px; margin-top:2px; }

        .term-sheet-container .side-section{ padding:16px 20px; border-bottom:1px solid var(--line-soft); }
        .term-sheet-container .side-section h3{ font-size:11.5px; font-weight:600; color:var(--slate); letter-spacing:.3px; margin-bottom:12px; }
        .term-sheet-container .sig-row{ display:flex; justify-content:space-between; padding:8px 0; font-size:12.5px; }
        .term-sheet-container .sig-status{ display:flex; align-items:center; gap:6px; }
        .term-sheet-container .sig-dot{ width:7px; height:7px; border-radius:50%; }
        .term-sheet-container .sig-dot.done{ background:var(--green); }
        .term-sheet-container .sig-dot.pending{ background:var(--amber); }
        .term-sheet-container .side-actions{ padding:16px 20px; display:flex; flex-direction:column; gap:8px; }
        .term-sheet-container .side-actions .btn{ width:100%; text-align:center; }
      `}</style>
      <div className="term-sheet-container">
        <div className="topbar">
          <div className="topbar-left">
            <div className="brand"><span className="brand-mark"></span>Meridian DMS</div>
            <div className="crumbs">Deals &nbsp;/&nbsp; Project Alpha &nbsp;/&nbsp; <b>Term sheet</b></div>
          </div>
          <div className="topbar-right"><span>Halcyon Growth</span><span>Buyer</span><div className="avatar">RO</div></div>
        </div>

        <div className="subnav">
          <Link href="/bidding/buyer-side">Overview</Link>
          <Link href="/bidding/buyer-side/data-room">Data room</Link>
          <Link href="/bidding/buyer-side/my-bid">My bid</Link>
          <Link href="/bidding/buyer-side/bid-history">Bid history</Link>
          <Link href="/bidding/buyer-side/messages">Messages</Link>
          <Link href="/bidding/buyer-side/term-sheet" className="active">Term sheet</Link>
        </div>

        <div className="status-strip">
          <span>Your bid of $100.0M was accepted on 6 Sep 2026 — this term sheet reflects the agreed terms.</span>
          <span>Stage 5 of 6</span>
        </div>

        <div className="page-head">
          <div>
            <h1>Term sheet — Project Alpha</h1>
            <div className="sub">Draft v2 · last updated by seller counsel, 7 Sep 2026</div>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            <a href="#" className="btn btn-ghost">Download PDF</a>
            <a href="#" className="btn btn-primary">Send for signature</a>
          </div>
        </div>

        <div className="body-grid">
          <div className="panel">
            <div className="panel-head"><h2>Key terms</h2><span style={{fontSize:'12px', color:'var(--slate-light)'}}>Redlines highlighted</span></div>
            <table className="terms">
              <tbody>
                <tr><td className="tk">Purchase price</td><td className="tv">$100,000,000 <span className="changed">changed</span></td></tr>
                <tr><td className="tk">Structure</td><td className="tv">60% cash at close / 40% acquirer stock, 12-month vest</td></tr>
                <tr><td className="tk">Expected close</td><td className="tv">15 December 2026</td></tr>
                <tr><td className="tk">Exclusivity period</td><td className="tv">45 days from execution <span className="changed">changed</span></td></tr>
                <tr><td className="tk">Key employee retention</td><td className="tv">90% of leadership team, 24-month terms</td></tr>
                <tr><td className="tk">Escrow</td><td className="tv">10% of purchase price, 18-month holdback</td></tr>
                <tr><td className="tk">Regulatory conditions</td><td className="tv">Subject to standard antitrust clearance</td></tr>
                <tr><td className="tk">Governing law</td><td className="tv">Delaware, USA</td></tr>
              </tbody>
            </table>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>Counsel comments</h2></div>
            <div className="comment-thread">
              <div className="comment">
                <div className="c-avatar">LC</div>
                <div className="c-body"><b>Linklane LLP (seller counsel)</b><div className="c-text">Updated exclusivity to 45 days per buyer request on the 6 Sep call.</div><div className="c-meta">7 Sep, 10:12 AM</div></div>
              </div>
              <div className="comment">
                <div className="c-avatar">RO</div>
                <div className="c-body"><b>You</b><div className="c-text">Escrow holdback period works for us — no further changes on our side.</div><div className="c-meta">7 Sep, 11:40 AM</div></div>
              </div>
            </div>
          </div>

          <div className="panel" style={{gridRow:'span 1'}}>
            <div className="side-section">
              <h3>Signature status</h3>
              <div className="sig-row"><span>ABC Technologies (seller)</span><span className="sig-status"><span className="sig-dot done"></span>Signed</span></div>
              <div className="sig-row"><span>Halcyon Growth (you)</span><span className="sig-status"><span className="sig-dot pending"></span>Pending</span></div>
            </div>
            <div className="side-section">
              <h3>Next steps</h3>
              <div style={{fontSize:'12.5px', color:'var(--slate)'}}>Confirmatory due diligence and definitive agreement drafting begin once this term sheet is fully executed.</div>
            </div>
            <div className="side-actions">
              <a href="#" className="btn btn-primary">Sign term sheet</a>
              <a href="#" className="btn btn-ghost">Request a change</a>
              <a href="#" className="btn btn-ghost">Message seller counsel</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
