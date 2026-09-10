"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function SellerBuyersPage() {
  const [showInviteForm, setShowInviteForm] = useState(false);

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
          --blue:#2E4F8F; --blue-soft:#E4E9F5;
          --radius:3px;
        }
        .seller-buyers-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; font-size:14px; line-height:1.5; min-height: 100vh; }
        .seller-buyers-container a{ color:inherit; text-decoration:none; }
        .seller-buyers-container h1, .seller-buyers-container h2, .seller-buyers-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }

        .seller-buyers-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .seller-buyers-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .seller-buyers-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .seller-buyers-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .seller-buyers-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .seller-buyers-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .seller-buyers-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .seller-buyers-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .seller-buyers-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .seller-buyers-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .seller-buyers-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .seller-buyers-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }

        .seller-buyers-container .page-head{ padding:22px 28px 0 28px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px; }
        .seller-buyers-container .page-head h1{ font-size:22px; }
        .seller-buyers-container .page-head .sub{ font-size:13px; color:var(--slate); margin-top:5px; }
        .seller-buyers-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:transparent; color:var(--ink); }
        .seller-buyers-container .btn:hover{ background:var(--ink); color:var(--paper); }
        .seller-buyers-container .btn-primary{ background:var(--ink); color:var(--paper); }
        .seller-buyers-container .btn-primary:hover{ opacity:.88; }
        .seller-buyers-container .btn-ghost{ border-color:var(--line); color:var(--slate); font-size:12px; padding:6px 11px; }

        .seller-buyers-container .summary{ display:flex; gap:14px; margin:18px 28px 0 28px; }
        .seller-buyers-container .schip{ font-size:12px; color:var(--slate); border:1px solid var(--line); padding:6px 12px; border-radius:20px; background:var(--panel); }
        .seller-buyers-container .schip b{ color:var(--ink); font-family:'IBM Plex Mono',monospace; }

        .seller-buyers-container .panel{ background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); margin:20px 28px 40px 28px; }
        .seller-buyers-container table.buyers{ width:100%; border-collapse:collapse; }
        .seller-buyers-container table.buyers thead th{ text-align:left; font-size:11px; color:var(--slate); font-weight:500; padding:10px 18px; border-bottom:1px solid var(--line); background:#FBFAF5; }
        .seller-buyers-container table.buyers td{ padding:13px 18px; border-bottom:1px solid var(--line-soft); font-size:13px; vertical-align:middle; }
        .seller-buyers-container table.buyers tr:last-child td{ border-bottom:none; }
        .seller-buyers-container .buyer-cell{ display:flex; align-items:center; gap:10px; }
        .seller-buyers-container .buyer-mark{ width:30px; height:30px; border-radius:50%; background:var(--ink); color:#EDE9DA; display:flex; align-items:center; justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; flex:none; }
        .seller-buyers-container .buyer-name{ font-weight:500; font-size:13.5px; color:var(--ink); }
        .seller-buyers-container .buyer-type{ font-size:11.5px; color:var(--slate-light); }

        .seller-buyers-container .badge{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:500; padding:3px 9px; border-radius:20px; }
        .seller-buyers-container .badge.green{ background:var(--green-soft); color:var(--green); }
        .seller-buyers-container .badge.amber{ background:var(--amber-soft); color:var(--amber); }
        .seller-buyers-container .badge.red{ background:var(--red-soft); color:var(--red); }
        .seller-buyers-container .badge.blue{ background:var(--blue-soft); color:var(--blue); }
        .seller-buyers-container .badge.gray{ background:var(--line-soft); color:var(--slate); }

        .seller-buyers-container .access-select{ font-family:'IBM Plex Sans',sans-serif; font-size:12px; color:var(--ink); border:1px solid var(--line); border-radius:var(--radius); padding:5px 8px; background:var(--paper); }
        .seller-buyers-container .row-actions{ display:flex; gap:6px; }

        .seller-buyers-container .panel-head{ display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid var(--line-soft); }
        .seller-buyers-container .panel-head h2{ font-size:15px; }

        .seller-buyers-container .invite-form{ padding:18px; display:grid; grid-template-columns:1fr 1fr; gap:14px; background:#FBFAF5; border-top:1px solid var(--line-soft); }
        .seller-buyers-container .invite-form .field{ display:flex; flex-direction:column; gap:6px; }
        .seller-buyers-container .invite-form label{ font-size:11.5px; color:var(--slate); font-weight:500; }
        .seller-buyers-container .invite-form input, .seller-buyers-container .invite-form select{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; padding:9px 11px; border:1px solid var(--line); border-radius:var(--radius); background:var(--panel); }
        .seller-buyers-container .invite-form .full{ grid-column:1 / -1; display:flex; justify-content:flex-end; gap:10px; }
      `}</style>
      <div className="seller-buyers-container">
        <div className="subnav">
          <Link href="/bidding/seller-side">Bidding</Link>
          <Link href="/bidding/seller-side/data-room">Data room</Link>
          <Link href="/bidding/seller-side/buyers" className="active">Buyers</Link>
          <Link href="/bidding/seller-side/term-sheet">Term sheet</Link>
          <Link href="/bidding/seller-side/messages">Messages</Link>
        </div>

        <div className="page-head">
          <div>
            <h1>Buyers</h1>
            <div className="sub">Invite, manage access, and track every buyer's progress through the process</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowInviteForm(true)}>Invite buyer</button>
        </div>

        <div className="summary">
          <span className="schip">Invited <b>4</b></span>
          <span className="schip">NDA signed <b>3</b></span>
          <span className="schip">Bids received <b>3</b></span>
          <span className="schip">Declined <b>1</b></span>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>All buyers</h2><span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>4 invited</span></div>

          <table className="buyers">
            <thead>
              <tr><th>Buyer</th><th>Status</th><th>Offer</th><th>Data room access</th><th>Last activity</th><th></th></tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="buyer-cell">
                    <div className="buyer-mark">HG</div>
                    <div><div className="buyer-name">Halcyon Growth</div><div className="buyer-type">PE Firm · Melbourne, AU</div></div>
                  </div>
                </td>
                <td><span className="badge green">Shortlisted</span></td>
                <td className="tabular" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>$100.0M</td>
                <td><select className="access-select"><option>Full access</option><option>Restricted</option><option>No access</option></select></td>
                <td style={{ color: 'var(--slate-light)', fontSize: '12px' }}>Live now</td>
                <td>
                  <div className="row-actions">
                    <Link href="/bidding/seller-side/messages" className="btn btn-ghost">Message</Link>
                    <Link href="/bidding/seller-side/bidding" className="btn btn-ghost">View bid</Link>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="buyer-cell">
                    <div className="buyer-mark">XC</div>
                    <div><div className="buyer-name">XYZ Capital</div><div className="buyer-type">Strategic Buyer · Singapore</div></div>
                  </div>
                </td>
                <td><span className="badge amber">Under review</span></td>
                <td className="tabular" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>$95.0M</td>
                <td><select className="access-select" defaultValue="Restricted"><option>Full access</option><option value="Restricted">Restricted</option><option>No access</option></select></td>
                <td style={{ color: 'var(--slate-light)', fontSize: '12px' }}>Yesterday, 4:12 PM</td>
                <td>
                  <div className="row-actions">
                    <Link href="/bidding/seller-side/messages" className="btn btn-ghost">Message</Link>
                    <Link href="/bidding/seller-side/bidding" className="btn btn-ghost">View bid</Link>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="buyer-cell">
                    <div className="buyer-mark">CB</div>
                    <div><div className="buyer-name">Cardinal Buyers Inc.</div><div className="buyer-type">Corporate Buyer · London, UK</div></div>
                  </div>
                </td>
                <td><span className="badge red">Declined</span></td>
                <td className="tabular" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>$90.0M</td>
                <td><select className="access-select" defaultValue="No access"><option>Full access</option><option>Restricted</option><option value="No access">No access</option></select></td>
                <td style={{ color: 'var(--slate-light)', fontSize: '12px' }}>29 Aug, 5:30 PM</td>
                <td>
                  <div className="row-actions">
                    <Link href="/bidding/seller-side/messages" className="btn btn-ghost">Message</Link>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="buyer-cell">
                    <div className="buyer-mark">MP</div>
                    <div><div className="buyer-name">Meridian Partners</div><div className="buyer-type">PE Firm · New York, US</div></div>
                  </div>
                </td>
                <td><span className="badge blue">NDA pending</span></td>
                <td className="tabular" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>—</td>
                <td><span className="badge gray">No access yet</span></td>
                <td style={{ color: 'var(--slate-light)', fontSize: '12px' }}>Invited 4 Sep</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost">Resend NDA</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {showInviteForm && (
            <div className="invite-form">
              <div className="field"><label>Company name</label><input type="text" placeholder="e.g. Summit Capital Partners" /></div>
              <div className="field"><label>Contact email</label><input type="text" placeholder="lead@summitcapital.com" /></div>
              <div className="field"><label>Buyer type</label>
                <select><option>PE Firm</option><option>Strategic Buyer</option><option>Corporate Buyer</option><option>Individual / Family Office</option></select>
              </div>
              <div className="field"><label>Initial data room access</label>
                <select><option>Restricted (Corporate + Financials only)</option><option>Full access</option><option>NDA required first</option></select>
              </div>
              <div className="full">
                <button className="btn btn-ghost" onClick={() => setShowInviteForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => setShowInviteForm(false)}>Send invitation &amp; NDA</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
