"use client";

import React from 'react';
import Link from 'next/link';

export default function MyBidPage() {
  return (
    <>
      <style>{`
        :root{
          --ink:#161A2B; --ink-soft:#2B3050; --paper:#F6F4EC; --panel:#FFFFFF;
          --slate:#63697E; --slate-light:#9CA0B3;
          --line:#DEDACB; --line-soft:#EAE7DC;
          --brass:#9C7226; --brass-soft:#F1E4C8;
          --green:#2E6B4C; --green-soft:#E3EEE5;
          --red:#9B3B2E; --red-soft:#F3E4E0;
          --amber:#95651E; --amber-soft:#F4E9D4;
          --blue:#2E4F8F; --blue-soft:#E4E9F5;
          --radius:3px;
        }
        .my-bid-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; -webkit-font-smoothing:antialiased; font-size:14px; line-height:1.5; min-height:100vh; }
        .my-bid-container .num,.my-bid-container .tabular{ font-family:'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        .my-bid-container h1, .my-bid-container h2, .my-bid-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }
        .my-bid-container .shell{ max-width:1280px; margin:0 auto; }
        .my-bid-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .my-bid-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; text-decoration:none; }
        .my-bid-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }
        .my-bid-container .subnav a:hover{ color:var(--ink); }

        .my-bid-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .my-bid-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .my-bid-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .my-bid-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .my-bid-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .my-bid-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .my-bid-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .my-bid-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .my-bid-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .my-bid-container .deal-header{ padding:26px 28px 0 28px; }
        .my-bid-container .deal-header-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:24px; flex-wrap:wrap; }
        .my-bid-container .deal-id{ color:var(--slate); font-size:12px; font-family:'IBM Plex Mono',monospace; letter-spacing:.3px; margin-bottom:6px;}
        .my-bid-container .deal-title{ font-size:27px; color:var(--ink); display:flex; align-items:baseline; gap:12px; flex-wrap:wrap;}
        .my-bid-container .deal-sub{ color:var(--slate); font-size:13px; margin-top:5px; }
        .my-bid-container .stage-pill{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:500; padding:4px 10px; border-radius:20px; letter-spacing:.2px; background:var(--blue-soft); color:var(--blue); border:1px solid #C7D2EA; }
        .my-bid-container .stage-pill .dot{ width:6px;height:6px;border-radius:50%; background:var(--blue); }
        .my-bid-container .deadline-note{ display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--red); margin-top:14px; }
        .my-bid-container .deadline-note b{ font-family:'IBM Plex Mono',monospace; }
        .my-bid-container .deadline-note .tick{ width:6px; height:6px; border-radius:50%; background:var(--red); }

        .my-bid-container .body-grid{ display:grid; grid-template-columns:1fr 380px; gap:22px; margin:24px 28px 40px 28px; align-items:start; }
        .my-bid-container .panel{ background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); }
        .my-bid-container .panel-head{ padding:16px 20px; border-bottom:1px solid var(--line-soft); display:flex; justify-content:space-between; align-items:center; }
        .my-bid-container .panel-head h2{ font-size:16px; }
        .my-bid-container .panel-head .hint{ font-size:12px; color:var(--slate-light); }

        .my-bid-container .counter-banner{
          margin:0 0 20px 0; padding:16px 20px; background:var(--amber-soft); border:1px solid #E4CB98; border-radius:var(--radius);
          display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap;
        }
        .my-bid-container .counter-banner .ct{ font-size:13px; color:var(--amber); }
        .my-bid-container .counter-banner b{ font-family:'IBM Plex Mono',monospace; }
        .my-bid-container .counter-actions{ display:flex; gap:8px; }

        .my-bid-container .form-body{ padding:22px 24px; }
        .my-bid-container .field-row{ display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px; }
        .my-bid-container .field{ display:flex; flex-direction:column; gap:6px; }
        .my-bid-container .field.full{ grid-column:1 / -1; }
        .my-bid-container label{ font-size:12px; color:var(--slate); font-weight:500; }
        .my-bid-container label .opt{ color:var(--slate-light); font-weight:400; }
        .my-bid-container input[type=text], .my-bid-container input[type=number], .my-bid-container input[type=date], .my-bid-container textarea, .my-bid-container select{
          font-family:'IBM Plex Sans',sans-serif; font-size:14px; color:var(--ink);
          border:1px solid var(--line); border-radius:var(--radius); padding:10px 12px; background:var(--paper);
        }
        .my-bid-container input:focus, .my-bid-container textarea:focus, .my-bid-container select:focus{ outline:none; border-color:var(--ink); background:var(--panel); }
        .my-bid-container .amount-input{ position:relative; }
        .my-bid-container .amount-input span{ position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--slate); font-family:'IBM Plex Mono',monospace; }
        .my-bid-container .amount-input input{ padding-left:26px; font-family:'IBM Plex Mono',monospace; font-size:16px; width:100%; box-sizing:border-box;}

        .my-bid-container .structure-slider{ display:flex; align-items:center; gap:12px; margin-top:6px; }
        .my-bid-container input[type=range]{ flex:1; accent-color:var(--ink); }
        .my-bid-container .structure-readout{ display:flex; justify-content:space-between; font-size:11.5px; color:var(--slate); margin-top:6px; }
        .my-bid-container .structure-readout b{ color:var(--ink); font-family:'IBM Plex Mono',monospace; }

        .my-bid-container .upload-zone{
          border:1.5px dashed var(--line); border-radius:var(--radius); padding:18px; text-align:center;
          color:var(--slate); font-size:12.5px; background:var(--paper);
        }
        .my-bid-container .upload-zone b{ color:var(--ink); }
        .my-bid-container .file-chip{ display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border:1px solid var(--line); border-radius:var(--radius); font-size:12.5px; margin-top:8px; }
        .my-bid-container .file-chip .fname{ color:var(--ink); }
        .my-bid-container .file-chip .rm{ color:var(--red); cursor:pointer; font-size:11px; }

        .my-bid-container .form-footer{ display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-top:1px solid var(--line-soft); }
        .my-bid-container .form-footer .note{ font-size:11.5px; color:var(--slate-light); }
        .my-bid-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:10px 18px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:transparent; color:var(--ink); }
        .my-bid-container .btn:hover{ background:var(--ink); color:var(--paper); }
        .my-bid-container .btn-primary{ background:var(--ink); color:var(--paper); }
        .my-bid-container .btn-primary:hover{ opacity:.88; }
        .my-bid-container .btn-ghost{ border-color:var(--line); color:var(--slate); }
        .my-bid-container .btn-ghost:hover{ background:var(--paper); color:var(--ink); }
        .my-bid-container .btn-approve{ background:var(--green); border-color:var(--green); color:#fff; }
        .my-bid-container .btn-approve:hover{ opacity:.9; background:var(--green); }

        .my-bid-container .status-card{ position:sticky; top:18px; }
        .my-bid-container .status-head{ padding:20px; border-bottom:1px solid var(--line-soft); }
        .my-bid-container .status-badge{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:500; padding:4px 10px; border-radius:20px; background:var(--amber-soft); color:var(--amber); }
        .my-bid-container .status-badge .dot{ width:6px;height:6px;border-radius:50%; background:var(--amber); }
        .my-bid-container .status-amount{ font-size:28px; font-family:'IBM Plex Mono',monospace; margin-top:12px; color:var(--ink); }
        .my-bid-container .status-sub{ font-size:12px; color:var(--slate-light); margin-top:4px; }

        .my-bid-container .status-section{ padding:16px 20px; border-bottom:1px solid var(--line-soft); }
        .my-bid-container .status-section h3{ font-size:11.5px; font-weight:600; color:var(--slate); letter-spacing:.3px; margin-bottom:12px; }
        .my-bid-container .kv{ display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }
        .my-bid-container .kv .k{ color:var(--slate); }
        .my-bid-container .kv .v{ color:var(--ink); font-family:'IBM Plex Mono',monospace; }

        .my-bid-container .timeline-item{ display:flex; gap:10px; padding:8px 0; font-size:12.5px; }
        .my-bid-container .timeline-dot{ width:6px; height:6px; border-radius:50%; background:var(--line); margin-top:5px; flex:none; }
        .my-bid-container .timeline-item.done .timeline-dot{ background:var(--green); }
        .my-bid-container .timeline-item.current .timeline-dot{ background:var(--amber); }
        .my-bid-container .timeline-text{ color:var(--ink); }
        .my-bid-container .timeline-meta{ color:var(--slate-light); font-size:11px; margin-top:1px; }

        .my-bid-container .status-actions{ padding:18px 20px; display:flex; flex-direction:column; gap:8px; }
        .my-bid-container .status-actions .btn{ width:100%; text-align:center; }

        .my-bid-container footer{ padding:16px 28px 34px 28px; color:var(--slate-light); font-size:11.5px; display:flex; justify-content:space-between; border-top:1px solid var(--line-soft); margin:0 28px; }

        @media (max-width: 980px){ .my-bid-container .body-grid{ grid-template-columns:1fr; } .my-bid-container .field-row{ grid-template-columns:1fr; } }
      `}</style>
      <div className="my-bid-container">
        <div className="topbar">
          <div className="topbar-left">
            <div className="brand"><span className="brand-mark"></span>Meridian DMS</div>
            <div className="crumbs">Deals &nbsp;/&nbsp; <b>Project Alpha</b> &nbsp;/&nbsp; My bid</div>
          </div>
          <div className="topbar-right">
            <span>Halcyon Growth</span>
            <span>Buyer</span>
            <div className="avatar">RO</div>
          </div>
        </div>

        <div className="subnav">
          <Link href="/bidding/buyer-side">Overview</Link>
          <Link href="/bidding/buyer-side/data-room">Data room</Link>
          <Link href="/bidding/buyer-side/my-bid" className="active">My bid</Link>
          <Link href="/bidding/buyer-side/bid-history">Bid history</Link>
          <Link href="/bidding/buyer-side/messages">Messages</Link>
          <Link href="/bidding/buyer-side/term-sheet">Term sheet</Link>
        </div>

        <div className="shell">
          <div className="deal-header">
            <div className="deal-header-top">
              <div>
                <div className="deal-id">ABC TECHNOLOGIES &nbsp;·&nbsp; SaaS &nbsp;·&nbsp; ARR $25M</div>
                <div className="deal-title">
                  Project Alpha
                  <span className="stage-pill"><span className="dot"></span> NDA signed · VDR access active</span>
                </div>
                <div className="deal-sub">Invited 12 Aug 2026 &nbsp;·&nbsp; Asking price $100M &nbsp;·&nbsp; Seller: ABC Technologies board</div>
              </div>
            </div>
            <div className="deadline-note"><span className="tick"></span> Bid deadline in <b>2 days 6 hrs</b> — 18:00 IST, 6 Sep 2026</div>
          </div>

          <div className="body-grid">
            <div>
              <div className="counter-banner">
                <div className="ct">The seller has sent a <b>counter-offer</b> on your $95.0M bid — they're asking for <b>$100.0M</b>. Review and respond below.</div>
                <div className="counter-actions">
                  <button className="btn btn-ghost">View seller's note</button>
                  <button className="btn btn-primary">Match counter</button>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>Revise your bid</h2>
                  <span className="hint">Editable until deadline · last saved 2 min ago</span>
                </div>

                <div className="form-body">
                  <div className="field-row">
                    <div className="field">
                      <label>Offer amount</label>
                      <div className="amount-input">
                        <span>$</span>
                        <input type="number" defaultValue="95000000" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Expected close date</label>
                      <input type="date" defaultValue="2026-12-15" />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field full structure-field">
                      <label>Deal structure — cash vs. stock</label>
                      <div className="structure-slider">
                        <input type="range" min="0" max="100" defaultValue="70" />
                      </div>
                      <div className="structure-readout"><span>Cash <b>70%</b></span><span>Stock <b>30%</b></span></div>
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>Financing type</label>
                      <select defaultValue="Committed debt + equity">
                        <option>Committed debt + equity</option>
                        <option>All-equity</option>
                        <option>Subject to financing</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Contingencies <span className="opt">(optional)</span></label>
                      <input type="text" placeholder="e.g. Regulatory approval, key employee retention" />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field full">
                      <label>Note to seller <span className="opt">(optional)</span></label>
                      <textarea rows="3" placeholder="Add context on your offer, timeline, or terms..."></textarea>
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field full">
                      <label>Supporting documents</label>
                      <div className="upload-zone"><b>Drop files</b> or click to upload — LOI, proof of financing, term sheet draft</div>
                      <div className="file-chip"><span className="fname">Letter of Intent — Halcyon.pdf</span><span className="rm">Remove</span></div>
                      <div className="file-chip"><span className="fname">Financing confirmation.pdf</span><span className="rm">Remove</span></div>
                    </div>
                  </div>
                </div>

                <div className="form-footer">
                  <span className="note">Submitting notifies the seller immediately and is logged to the deal audit trail.</span>
                  <div style={{display:'flex', gap:'10px'}}>
                    <button className="btn btn-ghost">Save draft</button>
                    <button className="btn btn-primary">Submit revised bid</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel status-card">
              <div className="status-head">
                <span className="status-badge"><span className="dot"></span> Counter-offer received</span>
                <div className="status-amount">$95.0M</div>
                <div className="status-sub">Your current offer · 70% cash / 30% stock</div>
              </div>

              <div className="status-section">
                <h3>Deal snapshot</h3>
                <div className="kv"><span className="k">Asking price</span><span className="v">$100.0M</span></div>
                <div className="kv"><span className="k">Your offer</span><span className="v">$95.0M</span></div>
                <div className="kv"><span className="k">Seller's counter</span><span className="v" style={{color:'var(--amber)'}}>$100.0M</span></div>
                <div className="kv"><span className="k">Expected close</span><span className="v">Dec 2026</span></div>
              </div>

              <div className="status-section">
                <h3>Bid timeline</h3>
                <div className="timeline-item done">
                  <div className="timeline-dot"></div>
                  <div><div className="timeline-text">NDA signed, VDR access granted</div><div className="timeline-meta">14 Aug, 10:20 AM</div></div>
                </div>
                <div className="timeline-item done">
                  <div className="timeline-dot"></div>
                  <div><div className="timeline-text">Initial bid submitted — $95.0M</div><div className="timeline-meta">1 Sep, 3:40 PM</div></div>
                </div>
                <div className="timeline-item current">
                  <div className="timeline-dot"></div>
                  <div><div className="timeline-text">Seller countered at $100.0M</div><div className="timeline-meta">3 Sep, 9:05 AM</div></div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div><div className="timeline-text">Awaiting your response</div><div className="timeline-meta">Due before 6 Sep, 6:00 PM</div></div>
                </div>
              </div>

              <div className="status-actions">
                <button className="btn btn-approve">Match counter — $100.0M</button>
                <button className="btn btn-ghost">Send a different revised offer</button>
                <button className="btn btn-ghost">Message the seller</button>
              </div>
            </div>
          </div>
          <footer>
            <span>Your bid activity and document views are visible to the deal's seller-side team.</span>
            <span>Access level: Bidder — NDA-gated</span>
          </footer>
        </div>
      </div>
    </>
  );
}
