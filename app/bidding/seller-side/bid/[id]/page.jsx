"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BidDetailsPage() {
  const params = useParams();
  const id = params.id || 'c';

  const bidsData = {
    c: { name: "Halcyon Growth", mark: "HG", type: "PE Firm · Melbourne, AU", offer: "$100.0M", vsAsk: "±0%", cash: "60%", stock: "40%", close: "Dec 2026", status: "Shortlisted", engagement: "18 docs · 92%", vsColor: "var(--green)" },
    b: { name: "XYZ Capital", mark: "XC", type: "Strategic Buyer · Singapore", offer: "$95.0M", vsAsk: "-5%", cash: "70%", stock: "30%", close: "Dec 2026", status: "Under review", engagement: "14 docs · 66%", vsColor: "var(--red)" },
    a: { name: "Cardinal Buyers Inc.", mark: "CB", type: "Corporate Buyer · London, UK", offer: "$90.0M", vsAsk: "-10%", cash: "100%", stock: "0%", close: "Jan 2027", status: "Declined", engagement: "9 docs · 34%", vsColor: "var(--red)" }
  };

  const bid = bidsData[id] || bidsData['c'];

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
          --radius:3px;
        }
        .bid-details-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; min-height: 100vh; padding-bottom: 40px; }
        .bid-details-container a { color:inherit; text-decoration:none; }

        .topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; font-size:14px; }
        .topbar-left { display:flex; align-items:center; gap:18px; }
        .brand { display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .brand-mark { width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none; }
        .brand-mark::after { content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .crumbs { color:#9AA0BE; font-size:12.5px; }
        .crumbs b { color:#EDE9DA; font-weight:500; }
        .topbar-right { display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .avatar { width:26px; height:26px; border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex; align-items:center; justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .subnav { display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); font-size:14px; }
        .subnav a { padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .subnav a.active { color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }

        .page-head { padding:32px 28px 24px 28px; display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--line-soft); background:var(--panel); flex-wrap: wrap; gap:20px; }
        
        .buyer-header { display:flex; gap:20px; align-items:center; }
        .buyer-mark { width:64px; height:64px; border-radius:50%; background:var(--ink); color:#EDE9DA; display:flex; align-items:center; justify-content:center; font-size:24px; font-family:'IBM Plex Mono',monospace; flex:none; }
        .buyer-name { font-size:28px; font-family:'Source Serif 4',serif; margin-bottom:4px; margin-top:0; font-weight: 500; }
        .buyer-type { color:var(--slate); font-size:14.5px; }
        .tags-container { display:flex; gap:8px; margin-top:14px; flex-wrap: wrap; }
        .tag { font-size:12px; color:var(--slate); border:1px solid var(--line); padding:5px 12px; border-radius:20px; }

        .actions-group { display:flex; gap:12px; }
        .btn { font-family:'IBM Plex Sans',sans-serif; font-size:13.5px; font-weight:500; padding:11px 20px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:transparent; color:var(--ink); }
        .btn-approve { background:var(--green); border-color:var(--green); color:#fff; }
        .btn-approve:hover { opacity:.9; }
        .btn-ghost { border-color:var(--line); color:var(--slate); }
        .btn-ghost:hover { background:var(--panel); color:var(--ink); border-color:var(--ink); }
        .btn-decline { border-color:var(--red); color:var(--red); }
        .btn-decline:hover { background:var(--red); color:#fff; }

        .layout-grid { display:grid; grid-template-columns: 1fr 400px; gap:24px; padding:28px; max-width: 1400px; margin:0 auto; align-items: start; }
        @media (max-width: 980px) {
          .layout-grid { grid-template-columns: 1fr; }
        }

        .panel { background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); padding:24px; margin-bottom:24px; }
        .panel-title { font-size:17px; font-family:'IBM Plex Sans',sans-serif; font-weight:600; margin-bottom:20px; color:var(--ink); border-bottom:1px solid var(--line-soft); padding-bottom:12px; }

        .metrics-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:28px; }
        .metric-box { border:1px solid var(--line-soft); border-radius:var(--radius); padding:18px; background:#FAFAFA; }
        .metric-label { font-size:12.5px; color:var(--slate); margin-bottom:10px; font-weight: 500; }
        .metric-value { font-size:24px; font-family:'IBM Plex Mono',monospace; color:var(--ink); }

        .structure-bar { display:flex; height:12px; border-radius:6px; overflow:hidden; margin:16px 0 10px 0;}
        .structure-bar div:first-child { background:var(--ink); }
        .structure-bar div:last-child { background:var(--brass-soft); border-left:1px solid var(--panel); }
        .structure-legend { display:flex; gap:24px; font-size:13.5px; color:var(--slate); }
        .structure-legend span::before { content:"●"; margin-right:6px; font-size:10px; position:relative; top:-1px; }
        .structure-legend span.cash::before { color:var(--ink); }
        .structure-legend span.stock::before { color:var(--brass); }

        .vdr-link { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border:1px solid var(--line); border-radius:var(--radius); font-size:14px; margin-bottom:12px; transition: background 0.15s; cursor: pointer; }
        .vdr-link:hover { background: var(--paper); border-color: var(--slate-light); }
        .vdr-link .fname { color:var(--ink); font-weight:500; }
        .vdr-link .go { color:var(--slate-light); font-family:'IBM Plex Mono',monospace; font-size:12px; }

        .activity-item { display:flex; gap:14px; padding:16px 0; font-size:13.5px; border-bottom:1px solid var(--line-soft); }
        .activity-item:last-child { border-bottom:none; }
        .activity-dot { width:8px; height:8px; border-radius:50%; background:var(--line); margin-top:6px; flex:none; }
        .activity-item.live .activity-dot { background:var(--green); }
        .activity-text { color:var(--ink); font-weight:500; }
        .activity-meta { color:var(--slate-light); font-size:12px; margin-top:5px; }

        .note-box { border:1px dashed var(--slate-light); border-radius:var(--radius); padding:20px; font-size:14.5px; color:var(--slate); background:#FAFAFA; font-style: italic; line-height: 1.6; }
      `}</style>
      <div className="bid-details-container">
        <div className="subnav">
          <Link href="/bidding/seller-side" className="active">Bidding</Link>
          <Link href="/bidding/seller-side/data-room">Data room</Link>
          <Link href="/bidding/seller-side/buyers">Buyers</Link>
          <Link href="/bidding/seller-side/term-sheet">Term sheet</Link>
          <Link href="/bidding/seller-side/messages">Messages</Link>
        </div>

        <div className="page-head">
          <div className="buyer-header">
            <div className="buyer-mark">{bid.mark}</div>
            <div>
              <h1 className="buyer-name">{bid.name}</h1>
              <div className="buyer-type">{bid.type}</div>
              <div className="tags-container">
                <span className="tag">NDA signed</span>
                <span className="tag">Lead: R. Okafor</span>
                <span className="tag">Advisor: Linklane LLP</span>
              </div>
            </div>
          </div>
          <div className="actions-group">
            <button className="btn btn-decline">Decline bid</button>
            <button className="btn btn-ghost">Counter offer</button>
            <Link href="/bidding/seller-side/term-sheet" className="btn btn-approve">Accept &amp; move to term sheet</Link>
          </div>
        </div>

        <div className="layout-grid">
          <div className="col-main">
            <div className="panel">
              <div className="panel-title">Offer Summary</div>
              <div className="metrics-grid">
                <div className="metric-box">
                  <div className="metric-label">Offer</div>
                  <div className="metric-value">{bid.offer}</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">vs. asking price</div>
                  <div className="metric-value" style={{ color: bid.vsColor }}>{bid.vsAsk}</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Expected close</div>
                  <div className="metric-value">{bid.close}</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Status</div>
                  <div className="metric-value" style={{ fontFamily: 'inherit', fontSize: '18px', fontWeight: 500, marginTop: '2px' }}>{bid.status}</div>
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '13.5px', color: 'var(--slate)', fontWeight: 500 }}>Structure</div>
                <div className="structure-bar">
                  <div style={{ width: bid.cash }}></div>
                  <div style={{ width: bid.stock }}></div>
                </div>
                <div className="structure-legend">
                  <span className="cash">Cash {bid.cash}</span>
                  <span className="stock">Stock {bid.stock}</span>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">Submitted Documents</div>
              <div className="vdr-link"><span className="fname">Letter of Intent — signed.pdf</span><span className="go">Open ↗</span></div>
              <div className="vdr-link"><span className="fname">Financing confirmation.pdf</span><span className="go">Open ↗</span></div>
              <div className="vdr-link"><span className="fname">Term sheet draft v2.docx</span><span className="go">Open ↗</span></div>
            </div>
          </div>

          <div className="col-side">
            <div className="panel">
              <div className="panel-title">Internal Notes</div>
              <div className="note-box">
                "Financing letter checks out — board is comfortable with the stock component. Recommend proceeding to term sheet."<br /><br />
                <span style={{ fontStyle: 'normal', fontSize: '12.5px', color: 'var(--slate-light)' }}>— V. Sharma, Finance Advisor</span>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">Recent Activity</div>
              <div className="activity-item live">
                <div className="activity-dot"></div>
                <div><div className="activity-text">Viewing Revenue.xlsx in VDR</div><div className="activity-meta">Live now · 6 min</div></div>
              </div>
              <div className="activity-item">
                <div className="activity-dot"></div>
                <div><div className="activity-text">Asked a question on Legal DD</div><div className="activity-meta">Yesterday, 4:12 PM</div></div>
              </div>
              <div className="activity-item">
                <div className="activity-dot"></div>
                <div><div className="activity-text">Submitted revised offer — $100M</div><div className="activity-meta">2 Sep, 11:02 AM</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
