"use client";

import React from 'react';
import Link from 'next/link';

export default function SellerTermSheetPage() {
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
        .seller-term-sheet-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; font-size:14px; line-height:1.5; min-height: 100vh; }
        .seller-term-sheet-container a{ color:inherit; text-decoration:none; }
        .seller-term-sheet-container h1, .seller-term-sheet-container h2, .seller-term-sheet-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }

        .seller-term-sheet-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .seller-term-sheet-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .seller-term-sheet-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .seller-term-sheet-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .seller-term-sheet-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .seller-term-sheet-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .seller-term-sheet-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .seller-term-sheet-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .seller-term-sheet-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .seller-term-sheet-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .seller-term-sheet-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .seller-term-sheet-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }

        .seller-term-sheet-container .status-strip{ margin:20px 28px 0 28px; padding:12px 18px; background:var(--green-soft); border:1px solid #C7DFCB; border-radius:var(--radius); font-size:12.5px; color:var(--green); display:flex; justify-content:space-between; align-items:center; }

        .seller-term-sheet-container .page-head{ padding:22px 28px 0 28px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px; }
        .seller-term-sheet-container .page-head h1{ font-size:22px; }
        .seller-term-sheet-container .page-head .sub{ font-size:13px; color:var(--slate); margin-top:5px; }
        .seller-term-sheet-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:transparent; color:var(--ink); }
        .seller-term-sheet-container .btn:hover{ background:var(--ink); color:var(--paper); }
        .seller-term-sheet-container .btn-primary{ background:var(--ink); color:var(--paper); }
        .seller-term-sheet-container .btn-primary:hover{ opacity:.88; background:var(--ink); }
        .seller-term-sheet-container .btn-ghost{ border-color:var(--line); color:var(--slate); }
        .seller-term-sheet-container .btn-ghost:hover{ background:var(--panel); color:var(--ink); border-color:var(--ink); }

        .seller-term-sheet-container .body-grid{ display:grid; grid-template-columns:1fr 340px; gap:22px; margin:22px 28px 40px 28px; align-items:start; }
        .seller-term-sheet-container .panel{ background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); }
        .seller-term-sheet-container .panel-head{ padding:16px 20px; border-bottom:1px solid var(--line-soft); display:flex; justify-content:space-between; align-items:center; }
        .seller-term-sheet-container .panel-head h2{ font-size:15px; }

        .seller-term-sheet-container table.terms{ width:100%; border-collapse:collapse; }
        .seller-term-sheet-container table.terms td{ padding:12px 20px; border-bottom:1px solid var(--line-soft); font-size:13px; vertical-align:top; }
        .seller-term-sheet-container table.terms tr:last-child td{ border-bottom:none; }
        .seller-term-sheet-container table.terms td.tk{ color:var(--slate); width:190px; }
        .seller-term-sheet-container table.terms td.tv input, .seller-term-sheet-container table.terms td.tv select{
          width:100%; font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--ink);
          border:1px solid var(--line); border-radius:var(--radius); padding:7px 10px; background:var(--paper); box-sizing:border-box;
        }
        .seller-term-sheet-container table.terms td.tv input:focus, .seller-term-sheet-container table.terms td.tv select:focus{ outline:none; border-color:var(--ink); background:var(--panel); }

        .seller-term-sheet-container .comment-thread{ padding:16px 20px; }
        .seller-term-sheet-container .comment{ display:flex; gap:10px; padding:10px 0; border-bottom:1px solid var(--line-soft); font-size:12.5px; }
        .seller-term-sheet-container .comment:last-child{ border-bottom:none; }
        .seller-term-sheet-container .c-avatar{ width:26px;height:26px;border-radius:50%; background:var(--brass-soft); color:var(--brass); display:flex;align-items:center;justify-content:center; font-size:10px; font-family:'IBM Plex Mono',monospace; flex:none; }
        .seller-term-sheet-container .c-body b{ color:var(--ink); }
        .seller-term-sheet-container .c-text{ color:var(--slate); margin-top:2px; }
        .seller-term-sheet-container .c-meta{ color:var(--slate-light); font-size:11px; margin-top:2px; }
        .seller-term-sheet-container .comment-input{ padding:14px 20px; border-top:1px solid var(--line-soft); }
        .seller-term-sheet-container .comment-input textarea{ width:100%; font-family:'IBM Plex Sans',sans-serif; font-size:12.5px; padding:9px; border:1px solid var(--line); border-radius:var(--radius); resize:none; background:var(--paper); box-sizing:border-box;}

        .seller-term-sheet-container .side-section{ padding:16px 20px; border-bottom:1px solid var(--line-soft); }
        .seller-term-sheet-container .side-section h3{ font-size:11.5px; font-weight:600; color:var(--slate); letter-spacing:.3px; margin-bottom:12px; }
        .seller-term-sheet-container .sig-row{ display:flex; justify-content:space-between; padding:8px 0; font-size:12.5px; }
        .seller-term-sheet-container .sig-status{ display:flex; align-items:center; gap:6px; }
        .seller-term-sheet-container .sig-dot{ width:7px; height:7px; border-radius:50%; }
        .seller-term-sheet-container .sig-dot.done{ background:var(--green); }
        .seller-term-sheet-container .sig-dot.pending{ background:var(--amber); }
        .seller-term-sheet-container .side-actions{ padding:16px 20px; display:flex; flex-direction:column; gap:8px; }
        .seller-term-sheet-container .side-actions .btn{ width:100%; text-align:center; }
      `}</style>
      <div className="seller-term-sheet-container">
        <div className="subnav">
          <Link href="/bidding/seller-side">Bidding</Link>
          <Link href="/bidding/seller-side/data-room">Data room</Link>
          <Link href="/bidding/seller-side/buyers">Buyers</Link>
          <Link href="/bidding/seller-side/term-sheet" className="active">Term sheet</Link>
          <Link href="/bidding/seller-side/messages">Messages</Link>
        </div>

        <div className="status-strip">
          <span>Bid from Halcyon Growth ($100.0M) accepted on 6 Sep 2026 — draft this term sheet and send for buyer signature.</span>
          <span>Stage 5 of 6</span>
        </div>

        <div className="page-head">
          <div>
            <h1>Term sheet — Halcyon Growth</h1>
            <div className="sub">Draft v2 · editable until sent for signature</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="#" className="btn btn-ghost">Save draft</a>
            <a href="#" className="btn btn-primary">Send to buyer</a>
          </div>
        </div>

        <div className="body-grid">
          <div className="panel">
            <div className="panel-head"><h2>Key terms</h2><span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Editable draft</span></div>
            <table className="terms">
              <tbody>
                <tr><td className="tk">Purchase price</td><td className="tv"><input type="text" defaultValue="$100,000,000" /></td></tr>
                <tr><td className="tk">Structure</td><td className="tv"><input type="text" defaultValue="60% cash at close / 40% acquirer stock, 12-month vest" /></td></tr>
                <tr><td className="tk">Expected close</td><td className="tv"><input type="text" defaultValue="15 December 2026" /></td></tr>
                <tr><td className="tk">Exclusivity period</td><td className="tv"><input type="text" defaultValue="45 days from execution" /></td></tr>
                <tr><td className="tk">Key employee retention</td><td className="tv"><input type="text" defaultValue="90% of leadership team, 24-month terms" /></td></tr>
                <tr><td className="tk">Escrow</td><td className="tv"><input type="text" defaultValue="10% of purchase price, 18-month holdback" /></td></tr>
                <tr><td className="tk">Regulatory conditions</td><td className="tv"><input type="text" defaultValue="Subject to standard antitrust clearance" /></td></tr>
                <tr><td className="tk">Governing law</td><td className="tv"><input type="text" defaultValue="Delaware, USA" /></td></tr>
              </tbody>
            </table>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>Counsel comments</h2></div>
            <div className="comment-thread">
              <div className="comment">
                <div className="c-avatar">LC</div>
                <div className="c-body"><b>Linklane LLP (your counsel)</b><div className="c-text">Updated exclusivity to 45 days per buyer request on the 6 Sep call.</div><div className="c-meta">7 Sep, 10:12 AM</div></div>
              </div>
              <div className="comment">
                <div className="c-avatar">RO</div>
                <div className="c-body"><b>Halcyon Growth</b><div className="c-text">Escrow holdback period works for us — no further changes on our side.</div><div className="c-meta">7 Sep, 11:40 AM</div></div>
              </div>
            </div>
            <div className="comment-input">
              <textarea rows="2" placeholder="Add an internal or buyer-facing comment..."></textarea>
            </div>
          </div>

          <div className="panel" style={{ gridColumn: '2' }}>
            <div className="side-section">
              <h3>Signature status</h3>
              <div className="sig-row"><span>ABC Technologies (you)</span><span className="sig-status"><span className="sig-dot done"></span>Signed</span></div>
              <div className="sig-row"><span>Halcyon Growth</span><span className="sig-status"><span className="sig-dot pending"></span>Pending</span></div>
            </div>
            <div className="side-section">
              <h3>Next steps</h3>
              <div style={{ fontSize: '12.5px', color: 'var(--slate)' }}>Confirmatory due diligence and definitive agreement drafting begin once the buyer countersigns.</div>
            </div>
            <div className="side-actions">
              <a href="#" className="btn btn-primary">Send for buyer signature</a>
              <a href="#" className="btn btn-ghost">Attach redlined document</a>
              <a href="#" className="btn btn-ghost">Message Halcyon Growth</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
