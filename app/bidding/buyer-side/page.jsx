"use client";

import React from 'react';
import Link from 'next/link';
export default function BuyerOverviewPage() {
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
          --purple:#5A4B8F; --purple-soft:#E9E4F5;
          --coral:#A24A34; --coral-soft:#F4E1DA;
          --radius:3px;
        }
        .buyer-overview-container {
          background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; -webkit-font-smoothing:antialiased; font-size:14px; line-height:1.5;
          min-height: 100vh;
        }
        .buyer-overview-container .tabular{ font-family:'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        .buyer-overview-container h1, .buyer-overview-container h2, .buyer-overview-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }
        .buyer-overview-container a{ color:inherit; text-decoration:none; }
        .buyer-overview-container .shell{ max-width:1280px; margin:0 auto; padding-bottom: 34px; }

        .buyer-overview-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .buyer-overview-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .buyer-overview-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .buyer-overview-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .buyer-overview-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .buyer-overview-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .buyer-overview-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .buyer-overview-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .buyer-overview-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        /* secondary nav */
        .buyer-overview-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .buyer-overview-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .buyer-overview-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }
        .buyer-overview-container .subnav a:hover{ color:var(--ink); }

        .buyer-overview-container .deal-header{ padding:26px 28px 0 28px; }
        .buyer-overview-container .deal-header-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:24px; flex-wrap:wrap; }
        .buyer-overview-container .deal-id{ color:var(--slate); font-size:12px; font-family:'IBM Plex Mono',monospace; letter-spacing:.3px; margin-bottom:6px;}
        .buyer-overview-container .deal-title{ font-size:27px; color:var(--ink); display:flex; align-items:baseline; gap:12px; flex-wrap:wrap;}
        .buyer-overview-container .deal-sub{ color:var(--slate); font-size:13px; margin-top:5px; }
        .buyer-overview-container .stage-pill{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:500; padding:4px 10px; border-radius:20px; letter-spacing:.2px; background:var(--blue-soft); color:var(--blue); border:1px solid #C7D2EA; }
        .buyer-overview-container .stage-pill .dot{ width:6px;height:6px;border-radius:50%; background:var(--blue); }

        .buyer-overview-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:transparent; color:var(--ink); display:inline-block; }
        .buyer-overview-container .btn:hover{ background:var(--ink); color:var(--paper); }
        .buyer-overview-container .btn-primary{ background:var(--ink); color:var(--paper); }
        .buyer-overview-container .btn-primary:hover{ opacity:.88; }
        .buyer-overview-container .btn-ghost{ border-color:var(--line); color:var(--slate); }
        .buyer-overview-container .btn-ghost:hover{ background:var(--panel); color:var(--ink); }

        /* progress tracker */
        .buyer-overview-container .tracker{ margin:26px 28px 0 28px; display:flex; background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; }
        .buyer-overview-container .tstep{ flex:1; padding:14px 18px; border-right:1px solid var(--line-soft); position:relative; }
        .buyer-overview-container .tstep:last-child{ border-right:none; }
        .buyer-overview-container .tstep .n{ font-size:11px; font-family:'IBM Plex Mono',monospace; color:var(--slate-light); }
        .buyer-overview-container .tstep .l{ font-size:13px; margin-top:4px; color:var(--slate); }
        .buyer-overview-container .tstep.done{ background:var(--green-soft); }
        .buyer-overview-container .tstep.done .n{ color:var(--green); }
        .buyer-overview-container .tstep.done .l{ color:var(--green); font-weight:500; }
        .buyer-overview-container .tstep.current{ background:var(--amber-soft); }
        .buyer-overview-container .tstep.current .n{ color:var(--amber); }
        .buyer-overview-container .tstep.current .l{ color:var(--amber); font-weight:500; }

        .buyer-overview-container .grid{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin:22px 28px 0 28px; }
        .buyer-overview-container .grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin:20px 28px 0 28px; }
        .buyer-overview-container .panel{ background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); }
        .buyer-overview-container .panel-head{ padding:16px 20px; border-bottom:1px solid var(--line-soft); display:flex; justify-content:space-between; align-items:center; }
        .buyer-overview-container .panel-head h2{ font-size:15px; }
        .buyer-overview-container .panel-head a{ font-size:12px; color:var(--slate); }
        .buyer-overview-container .panel-head a:hover{ color:var(--ink); }
        .buyer-overview-container .panel-body{ padding:18px 20px; }

        .buyer-overview-container .kv{ display:flex; justify-content:space-between; padding:7px 0; font-size:13px; border-bottom:1px solid var(--line-soft); }
        .buyer-overview-container .kv:last-child{ border-bottom:none; }
        .buyer-overview-container .kv .k{ color:var(--slate); }
        .buyer-overview-container .kv .v{ color:var(--ink); font-family:'IBM Plex Mono',monospace; }

        .buyer-overview-container .tile{ padding:22px 20px; }
        .buyer-overview-container .tile-label{ font-size:11.5px; color:var(--slate); margin-bottom:8px; }
        .buyer-overview-container .tile-value{ font-size:24px; font-family:'IBM Plex Mono',monospace; color:var(--ink); }
        .buyer-overview-container .tile-value.accent{ color:var(--brass); }
        .buyer-overview-container .tile-sub{ font-size:12px; color:var(--slate-light); margin-top:6px; }
        .buyer-overview-container .tile-cta{ margin-top:14px; }

        .buyer-overview-container .company-facts{ display:flex; flex-wrap:wrap; gap:10px; }
        .buyer-overview-container .fact{ font-size:11.5px; color:var(--slate); border:1px solid var(--line); padding:5px 10px; border-radius:20px; }

        .buyer-overview-container .badge{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:500; padding:3px 9px; border-radius:20px; }
        .buyer-overview-container .badge.amber{ background:var(--amber-soft); color:var(--amber); }
        .buyer-overview-container .badge.teal{ background:var(--green-soft); color:var(--green); }
        .buyer-overview-container .badge.purple{ background:var(--purple-soft); color:var(--purple); }
        .buyer-overview-container .badge.coral{ background:var(--coral-soft); color:var(--coral); }

        .buyer-overview-container .qa-item{ padding:9px 0; border-bottom:1px solid var(--line-soft); font-size:12.5px; }
        .buyer-overview-container .qa-item:last-child{ border-bottom:none; }
        .buyer-overview-container .qa-item .q{ color:var(--ink); }
        .buyer-overview-container .qa-item .meta{ color:var(--slate-light); font-size:11px; margin-top:2px; }

        .buyer-overview-container footer{ padding:16px 28px 34px 28px; color:var(--slate-light); font-size:11.5px; display:flex; justify-content:space-between; border-top:1px solid var(--line-soft); margin:26px 28px 0 28px; }
      `}</style>

      <div className="buyer-overview-container">
        <div className="subnav">
          <Link href="/bidding/buyer-side" className="active">Overview</Link>
          <Link href="/bidding/buyer-side/data-room">Data room</Link>
          <Link href="/bidding/buyer-side/my-bid">My bid</Link>
          <Link href="/bidding/buyer-side/bid-history">Bid history</Link>
          <Link href="/bidding/buyer-side/messages">Messages</Link>
          <Link href="/bidding/buyer-side/term-sheet">Term sheet</Link>
        </div>

        <div className="shell">

          <div className="deal-header">
            <div className="deal-header-top">
              <div>
                <div className="deal-id">ABC TECHNOLOGIES &nbsp;·&nbsp; SaaS &nbsp;·&nbsp; ARR $25M &nbsp;·&nbsp; Bengaluru, IN</div>
                <div className="deal-title">
                  Project Alpha
                  <span className="stage-pill"><span className="dot"></span> Bid evaluation in progress</span>
                </div>
                <div className="deal-sub">Invited 12 Aug 2026 &nbsp;·&nbsp; Asking price $100M &nbsp;·&nbsp; Seller advisor: Linklane LLP</div>
                <div className="company-facts" style={{ marginTop: '12px' }}>
                  <span className="fact">Enterprise SaaS</span>
                  <span className="fact">340 employees</span>
                  <span className="fact">$25M ARR · 38% YoY growth</span>
                  <span className="fact">EBITDA positive</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="#" className="btn btn-ghost">Message seller</a>
                <a href="#" className="btn btn-primary">Go to my bid</a>
              </div>
            </div>
          </div>

          <div className="tracker">
            <div className="tstep done"><div className="n">01</div><div className="l">NDA signed</div></div>
            <div className="tstep done"><div className="n">02</div><div className="l">Data room access</div></div>
            <div className="tstep done"><div className="n">03</div><div className="l">Bid submitted</div></div>
            <div className="tstep current"><div className="n">04</div><div className="l">Seller evaluation</div></div>
            <div className="tstep"><div className="n">05</div><div className="l">Term sheet</div></div>
            <div className="tstep"><div className="n">06</div><div className="l">Closing</div></div>
          </div>

          <div className="grid-3">
            <div className="panel tile">
              <div className="tile-label">My current offer</div>
              <div className="tile-value accent">$95.0M</div>
              <div className="tile-sub">Seller countered at $100.0M · response due 6 Sep</div>
              <div className="tile-cta"><a href="#" className="btn btn-ghost" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Respond to counter</a></div>
            </div>
            <div className="panel tile">
              <div className="tile-label">Data room activity</div>
              <div className="tile-value">18<span style={{ color: 'var(--slate-light)', fontSize: '16px' }}>&nbsp;/ 24 docs</span></div>
              <div className="tile-sub">3 new documents added this week</div>
              <div className="tile-cta"><a href="#" className="btn btn-ghost" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Open data room</a></div>
            </div>
            <div className="panel tile">
              <div className="tile-label">Bid deadline</div>
              <div className="tile-value" style={{ color: 'var(--red)' }}>2d 6h</div>
              <div className="tile-sub">18:00 IST, 6 Sep 2026</div>
              <div className="tile-cta"><a href="#" className="btn btn-ghost" style={{ width: '100%', textAlign: 'center', display: 'block' }}>View timeline</a></div>
            </div>
          </div>

          <div className="grid">
            <div className="panel">
              <div className="panel-head"><h2>Recent Q&amp;A</h2><a href="#">View data room →</a></div>
              <div className="panel-body">
                <div className="qa-item"><div className="q">Seller responded — "Customer contracts are auto-renewing, 92% retention"</div><div className="meta">Legal DD folder · 2 hrs ago</div></div>
                <div className="qa-item"><div className="q">You asked — "Can we get the Q2 cohort revenue breakdown?"</div><div className="meta">Financials folder · Yesterday</div></div>
                <div className="qa-item"><div className="q">Seller uploaded — Updated cap table v3.xlsx</div><div className="meta">Corporate folder · 2 days ago</div></div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head"><h2>Deal timeline</h2><a href="#">Full history →</a></div>
              <div className="panel-body">
                <div className="kv"><span className="k">NDA signed</span><span className="v">14 Aug</span></div>
                <div className="kv"><span className="k">Initial bid submitted</span><span className="v">1 Sep</span></div>
                <div className="kv"><span className="k">Seller countered</span><span className="v">3 Sep</span></div>
                <div className="kv"><span className="k">Your response due</span><span className="v" style={{ color: 'var(--red)' }}>6 Sep</span></div>
                <div className="kv"><span className="k">Expected term sheet</span><span className="v" style={{ color: 'var(--slate-light)' }}>Mid Sep</span></div>
              </div>
            </div>
          </div>

          <footer>
            <span>All activity on this deal is logged to the audit trail and visible to Meridian DMS compliance.</span>
            <span>Access level: Bidder — NDA-gated</span>
          </footer>

        </div>
      </div>
    </>
  );
}
