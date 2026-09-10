"use client";

import React from 'react';
import Link from 'next/link';

export default function SellerMessagesPage() {
  return (
    <>
      <style>{`
        :root{
          --ink:#0f172a; --ink-soft:#334155; --paper:#f8fafc; --panel:#ffffff;
          --slate:#64748b; --slate-light:#94a3b8;
          --line:#e2e8f0; --line-soft:#f1f5f9;
          --brass:#2563eb; --brass-soft:#dbeafe;
          --green:#16a34a; --green-soft:#dcfce7;
          --red:#dc2626; --red-soft:#fee2e2;
          --amber:#d97706; --amber-soft:#fef3c7;
          --blue:#2563eb; --blue-soft:#dbeafe;
          --purple:#7c3aed; --purple-soft:#ede9fe;
          --coral:#ea580c; --coral-soft:#ffedd5;
          --radius:8px;
        }
        .seller-messages-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; font-size:14px; line-height:1.5; min-height: 100vh; display:flex; flex-direction:column; }
        .seller-messages-container a{ color:inherit; text-decoration:none; }
        .seller-messages-container h1, .seller-messages-container h2, .seller-messages-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }

        .seller-messages-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:var(--paper); }
        .seller-messages-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .seller-messages-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .seller-messages-container .brand-mark{ width:20px; height:20px; border:1.4px solid var(--brass); border-radius:2px; position:relative; flex:none;}
        .seller-messages-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid var(--brass); opacity:.55; }
        .seller-messages-container .crumbs{ color:var(--slate-light); font-size:12.5px; }
        .seller-messages-container .crumbs b{ color:var(--paper); font-weight:500; }
        .seller-messages-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:var(--slate-light); }
        .seller-messages-container .avatar{ width:26px;height:26px;border-radius:50%; background:var(--ink-soft); color:var(--paper); display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .seller-messages-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .seller-messages-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .seller-messages-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }

        .seller-messages-container .layout{ display:grid; grid-template-columns:300px 1fr; margin:28px; border:1px solid var(--line); border-radius:var(--radius); background:var(--panel); overflow:hidden; flex:1; min-height:520px; }

        .seller-messages-container .thread-list{ border-right:1px solid var(--line-soft); overflow-y:auto; display:flex; flex-direction:column; }
        .seller-messages-container .thread-list-head{ padding:16px 18px; border-bottom:1px solid var(--line-soft); font-size:11px; color:var(--slate-light); text-transform:uppercase; letter-spacing:.4px; }
        .seller-messages-container .thread-item{ padding:12px 18px; border-bottom:1px solid var(--line-soft); cursor:pointer; display:flex; gap:10px; }
        .seller-messages-container .thread-item.active{ background:var(--brass-soft); }
        .seller-messages-container .buyer-mark{ width:28px; height:28px; border-radius:50%; background:var(--ink); color:var(--paper); display:flex; align-items:center; justify-content:center; font-size:10px; font-family:'IBM Plex Mono',monospace; flex:none; }
        .seller-messages-container .thread-meta{ flex:1; min-width:0; }
        .seller-messages-container .thread-meta .tt{ font-size:13px; font-weight:500; color:var(--ink); display:flex; justify-content:space-between; }
        .seller-messages-container .thread-meta .tp{ font-size:12px; color:var(--slate); margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .seller-messages-container .thread-meta .tm{ font-size:11px; color:var(--slate-light); margin-top:3px; }
        .seller-messages-container .unread-badge{ background:var(--brass); color:#fff; font-size:10px; border-radius:20px; padding:1px 6px; }

        .seller-messages-container .conv{ display:flex; flex-direction:column; }
        .seller-messages-container .conv-head{ padding:16px 20px; border-bottom:1px solid var(--line-soft); display:flex; justify-content:space-between; align-items:center; }
        .seller-messages-container .conv-head h2{ font-size:15px; }
        .seller-messages-container .conv-head .cs{ font-size:11.5px; color:var(--slate-light); margin-top:2px; }
        .seller-messages-container .badge{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:500; padding:3px 9px; border-radius:20px; background:var(--green-soft); color:var(--green); }
        .seller-messages-container .conv-body{ flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; }

        .seller-messages-container .msg{ max-width:72%; }
        .seller-messages-container .msg .bubble{ padding:10px 14px; border-radius:8px; font-size:13px; line-height:1.5; }
        .seller-messages-container .msg .meta{ font-size:11px; color:var(--slate-light); margin-top:4px; }
        .seller-messages-container .msg.them{ align-self:flex-start; }
        .seller-messages-container .msg.them .bubble{ background:var(--paper); border:1px solid var(--line); color:var(--ink); }
        .seller-messages-container .msg.me{ align-self:flex-end; }
        .seller-messages-container .msg.me .bubble{ background:var(--ink); color:var(--paper); }
        .seller-messages-container .msg.me .meta{ text-align:right; }

        .seller-messages-container .composer{ border-top:1px solid var(--line-soft); padding:14px 20px; }
        .seller-messages-container .composer textarea{ width:100%; font-family:'IBM Plex Sans',sans-serif; font-size:13px; padding:10px 12px; border:1px solid var(--line); border-radius:var(--radius); resize:none; background:var(--paper); box-sizing:border-box;}
        .seller-messages-container .composer-actions{ display:flex; justify-content:space-between; align-items:center; margin-top:8px; }
        .seller-messages-container .composer-tags{ display:flex; gap:6px; }
        .seller-messages-container .cf-tag{ font-size:11px; color:var(--slate); border:1px solid var(--line); padding:4px 9px; border-radius:20px; cursor:pointer; }
        .seller-messages-container .cf-tag.active{ background:var(--ink); color:var(--paper); border-color:var(--ink); }
        .seller-messages-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:var(--ink); color:var(--paper); }
        .seller-messages-container .btn:hover{ opacity:.88; }
      `}</style>

      <div className="seller-messages-container">
        <div className="subnav">
          <Link href="/bidding/seller-side">Bidding</Link>
          <Link href="/bidding/seller-side/data-room">Data room</Link>
          <Link href="/bidding/seller-side/buyers">Buyers</Link>
          <Link href="/bidding/seller-side/term-sheet">Term sheet</Link>
          <Link href="/bidding/seller-side/messages" className="active">Messages</Link>
        </div>

        <div className="layout">
          <div className="thread-list">
            <div className="thread-list-head">Buyer conversations</div>

            <div className="thread-item active">
              <div className="buyer-mark">HG</div>
              <div className="thread-meta">
                <div className="tt">Halcyon Growth</div>
                <div className="tp">You: Escrow holdback period works for us...</div>
                <div className="tm">7 Sep</div>
              </div>
            </div>

            <div className="thread-item">
              <div className="buyer-mark">XC</div>
              <div className="thread-meta">
                <div className="tt">XYZ Capital <span className="unread-badge">2</span></div>
                <div className="tp">Asked: Can we get clarity on IP assignment?</div>
                <div className="tm">Yesterday</div>
              </div>
            </div>

            <div className="thread-item">
              <div className="buyer-mark">CB</div>
              <div className="thread-meta">
                <div className="tt">Cardinal Buyers</div>
                <div className="tp">We're stepping back from the process for now</div>
                <div className="tm">29 Aug</div>
              </div>
            </div>

            <div className="thread-item">
              <div className="buyer-mark">MP</div>
              <div className="thread-meta">
                <div className="tt">Meridian Partners</div>
                <div className="tp">NDA countersigned, requesting VDR access</div>
                <div className="tm">4 Sep</div>
              </div>
            </div>
          </div>

          <div className="conv">
            <div className="conv-head">
              <div>
                <h2>Halcyon Growth</h2>
                <div className="cs">Lead: R. Okafor · Advisor: Linklane LLP · Current offer $100.0M</div>
              </div>
              <span className="badge">Shortlisted</span>
            </div>

            <div className="conv-body">
              <div className="msg them">
                <div className="bubble">Thanks for the revised offer. The board reviewed it this morning — we'd like to discuss the stock component a bit further before responding formally.</div>
                <div className="meta">R. Okafor · 2 Sep, 2:15 PM</div>
              </div>
              <div className="msg me">
                <div className="bubble">Happy to walk through it. We're flexible on the vesting schedule if that helps move things along.</div>
                <div className="meta">You · 2 Sep, 3:40 PM</div>
              </div>
              <div className="msg me">
                <div className="bubble">We've sent over a counter at $100.0M — full details are in the term sheet draft. Let us know your thoughts by the 6th.</div>
                <div className="meta">You · 3 Sep, 9:05 AM</div>
              </div>
              <div className="msg them">
                <div className="bubble">Escrow holdback period works for us — no further changes needed on our side once you confirm the price.</div>
                <div className="meta">R. Okafor · 7 Sep, 11:40 AM</div>
              </div>
            </div>

            <div className="composer">
              <textarea rows="3" placeholder="Write a message to Halcyon Growth..."></textarea>
              <div className="composer-actions">
                <div className="composer-tags">
                  <span className="cf-tag active">General</span>
                  <span className="cf-tag">Financials</span>
                  <span className="cf-tag">Legal</span>
                  <span className="cf-tag">Operations</span>
                </div>
                <button className="btn">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
