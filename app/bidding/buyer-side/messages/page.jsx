"use client";

import React from 'react';
import Link from 'next/link';

export default function MessagesPage() {
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
          --blue:#2E4F8F; --blue-soft:#E4E9F5;
          --radius:3px;
        }
        .messages-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; font-size:14px; line-height:1.5; min-height: 100vh; display:flex; flex-direction:column; }
        .messages-container a{ color:inherit; text-decoration:none; }
        .messages-container h1, .messages-container h2, .messages-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }

        .messages-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .messages-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .messages-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .messages-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .messages-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .messages-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .messages-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .messages-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .messages-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .messages-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .messages-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .messages-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }

        .messages-container .layout{ display:grid; grid-template-columns:280px 1fr; margin:28px; border:1px solid var(--line); border-radius:var(--radius); background:var(--panel); overflow:hidden; flex:1; min-height:520px; }

        .messages-container .thread-list{ border-right:1px solid var(--line-soft); overflow-y:auto; display:flex; flex-direction:column; }
        .messages-container .thread-list-head{ padding:16px 18px; border-bottom:1px solid var(--line-soft); font-size:11px; color:var(--slate-light); text-transform:uppercase; letter-spacing:.4px; }
        .messages-container .thread-item{ padding:12px 18px; border-bottom:1px solid var(--line-soft); cursor:pointer; }
        .messages-container .thread-item.active{ background:var(--brass-soft); }
        .messages-container .thread-item .tt{ font-size:13px; font-weight:500; color:var(--ink); }
        .messages-container .thread-item .tp{ font-size:12px; color:var(--slate); margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .messages-container .thread-item .tm{ font-size:11px; color:var(--slate-light); margin-top:4px; display:flex; justify-content:space-between; }
        .messages-container .unread-dot{ width:7px; height:7px; border-radius:50%; background:var(--brass); display:inline-block; }

        .messages-container .conv{ display:flex; flex-direction:column; }
        .messages-container .conv-head{ padding:16px 20px; border-bottom:1px solid var(--line-soft); display:flex; justify-content:space-between; align-items:center; }
        .messages-container .conv-head h2{ font-size:15px; }
        .messages-container .conv-head .cs{ font-size:11.5px; color:var(--slate-light); margin-top:2px; }
        .messages-container .conv-body{ flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; }

        .messages-container .msg{ max-width:72%; }
        .messages-container .msg .bubble{ padding:10px 14px; border-radius:8px; font-size:13px; line-height:1.5; }
        .messages-container .msg .meta{ font-size:11px; color:var(--slate-light); margin-top:4px; }
        .messages-container .msg.them{ align-self:flex-start; }
        .messages-container .msg.them .bubble{ background:var(--paper); border:1px solid var(--line); color:var(--ink); }
        .messages-container .msg.me{ align-self:flex-end; }
        .messages-container .msg.me .bubble{ background:var(--ink); color:#EDE9DA; }
        .messages-container .msg.me .meta{ text-align:right; }
        .messages-container .tag-chip{ display:inline-block; font-size:10.5px; color:var(--blue); background:var(--blue-soft); padding:2px 8px; border-radius:20px; margin-bottom:6px; }

        .messages-container .composer{ border-top:1px solid var(--line-soft); padding:14px 20px; }
        .messages-container .composer textarea{ width:100%; font-family:'IBM Plex Sans',sans-serif; font-size:13px; padding:10px 12px; border:1px solid var(--line); border-radius:var(--radius); resize:none; background:var(--paper); }
        .messages-container .composer-actions{ display:flex; justify-content:space-between; align-items:center; margin-top:8px; }
        .messages-container .composer-tags{ display:flex; gap:6px; }
        .messages-container .cf-tag{ font-size:11px; color:var(--slate); border:1px solid var(--line); padding:4px 9px; border-radius:20px; cursor:pointer; }
        .messages-container .cf-tag.active{ background:var(--ink); color:var(--paper); border-color:var(--ink); }
        .messages-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:var(--ink); color:var(--paper); }
        .messages-container .btn:hover{ opacity:.88; }
      `}</style>

      <div className="messages-container">
        <div className="subnav">
          <Link href="/bidding/buyer-side">Overview</Link>
          <Link href="/bidding/buyer-side/data-room">Data room</Link>
          <Link href="/bidding/buyer-side/my-bid">My bid</Link>
          <Link href="/bidding/buyer-side/bid-history">Bid history</Link>
          <Link href="/bidding/buyer-side/messages" className="active">Messages</Link>
          <Link href="/bidding/buyer-side/term-sheet">Term sheet</Link>
        </div>

        <div className="layout">
          <div className="thread-list">
            <div className="thread-list-head">Conversation with seller</div>
            <div className="thread-item active">
              <div className="tt">General</div>
              <div className="tp">V. Sharma: Escrow holdback period works for us...</div>
              <div className="tm"><span>7 Sep</span></div>
            </div>
            <div className="thread-item">
              <div className="tt">Financials Q&amp;A <span className="unread-dot" style={{ marginLeft: '6px' }}></span></div>
              <div className="tp">Seller: Customer contracts are auto-renewing, 92%...</div>
              <div className="tm"><span>2 hrs ago</span></div>
            </div>
            <div className="thread-item">
              <div className="tt">Legal DD Q&amp;A</div>
              <div className="tp">You: Can we get clarity on the IP assignment clause?</div>
              <div className="tm"><span>Yesterday</span></div>
            </div>
            <div className="thread-item">
              <div className="tt">Operations Q&amp;A</div>
              <div className="tp">Seller: Uploaded the vendor contract summary</div>
              <div className="tm"><span>3 days ago</span></div>
            </div>
          </div>

          <div className="conv">
            <div className="conv-head">
              <div>
                <h2>General — ABC Technologies</h2>
                <div className="cs">Seller team: V. Sharma (Finance), Linklane LLP (Counsel)</div>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--slate-light)' }}>All messages logged to audit trail</span>
            </div>

            <div className="conv-body">
              <div className="msg them">
                <div className="bubble">Thanks for the revised offer. The board reviewed it this morning — we'd like to discuss the stock component a bit further before responding formally.</div>
                <div className="meta">V. Sharma · 2 Sep, 2:15 PM</div>
              </div>
              <div className="msg me">
                <div className="bubble">Happy to walk through it. We're flexible on the vesting schedule if that helps move things along.</div>
                <div className="meta">You · 2 Sep, 3:40 PM</div>
              </div>
              <div className="msg them">
                <div className="bubble">We've sent over a counter at $100.0M — full details are in the term sheet draft. Let us know your thoughts by the 6th.</div>
                <div className="meta">V. Sharma · 3 Sep, 9:05 AM</div>
              </div>
              <div className="msg them">
                <div className="bubble">Escrow holdback period works for us — no further changes needed on our side once you confirm the price.</div>
                <div className="meta">V. Sharma · 7 Sep, 11:40 AM</div>
              </div>
            </div>

            <div className="composer">
              <textarea rows="3" placeholder="Write a message to the seller..."></textarea>
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
