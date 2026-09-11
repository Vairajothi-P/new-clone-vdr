"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerBiddingPage() {
  const [selectedBids, setSelectedBids] = useState(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const router = useRouter();

  const bidsData = {
    c: { name: "Halcyon Growth", type: "PE Firm · Melbourne, AU", offer: "$100.0M", cash: "60%", stock: "40%", close: "Dec 2026", status: "Shortlisted", engagement: "18 docs · 92%" },
    b: { name: "XYZ Capital", type: "Strategic Buyer · Singapore", offer: "$95.0M", cash: "70%", stock: "30%", close: "Dec 2026", status: "Under review", engagement: "14 docs · 66%" },
    a: { name: "Cardinal Buyers Inc.", type: "Corporate Buyer · London, UK", offer: "$90.0M", cash: "100%", stock: "0%", close: "Jan 2027", status: "Declined", engagement: "9 docs · 34%" }
  };

  const toggleCompare = (e, id) => {
    e.stopPropagation();
    const newSelected = new Set(selectedBids);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBids(newSelected);
  };

  const handleRowClick = (id) => {
    router.push(`/bidding/seller-side/bid/${id}`);
  };

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
        .bidding-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; -webkit-font-smoothing:antialiased; font-size:14px; line-height:1.5; min-height: 100vh; }
        .bidding-container .num, .bidding-container .tabular{ font-family:'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        .bidding-container h1, .bidding-container h2, .bidding-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }
        .bidding-container a{ color:inherit; text-decoration:none; }
        .bidding-container .shell{ max-width:1400px; margin:0 auto; }
        .bidding-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .bidding-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; text-decoration:none; }
        .bidding-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }
        .bidding-container .subnav a:hover{ color:var(--ink); }

        .bidding-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:var(--paper); }
        .bidding-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .bidding-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; letter-spacing:.2px;}
        .bidding-container .brand-mark{ width:20px; height:20px; border:1.4px solid var(--brass); border-radius:2px; position:relative; flex:none;}
        .bidding-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid var(--brass); opacity:.55; }
        .bidding-container .crumbs{ color:var(--slate-light); font-size:12.5px; }
        .bidding-container .crumbs b{ color:var(--paper); font-weight:500; }
        .bidding-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:var(--slate-light); }
        .bidding-container .avatar{ width:26px;height:26px;border-radius:50%; background:var(--ink-soft); color:var(--paper); display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .bidding-container .deal-header{ padding:26px 28px 0 28px; }
        .bidding-container .deal-header-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:24px; flex-wrap:wrap; }
        .bidding-container .deal-id{ color:var(--slate); font-size:12px; font-family:'IBM Plex Mono',monospace; letter-spacing:.3px; margin-bottom:6px;}
        .bidding-container .deal-title{ font-size:27px; color:var(--ink); display:flex; align-items:baseline; gap:12px; flex-wrap:wrap;}
        .bidding-container .deal-sub{ color:var(--slate); font-size:13px; margin-top:5px; }
        .bidding-container .stage-pill{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-family:'IBM Plex Sans',sans-serif; font-weight:500; padding:4px 10px; border-radius:20px; letter-spacing:.2px; background:var(--amber-soft); color:var(--amber); border:1px solid var(--amber-soft); }
        .bidding-container .stage-pill .dot{ width:6px;height:6px;border-radius:50%; background:var(--amber); }

        .bidding-container .deal-actions{ display:flex; gap:10px; align-items:flex-start; }
        .bidding-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:transparent; color:var(--ink); }
        .bidding-container .btn:hover{ background:var(--ink); color:var(--paper); }
        .bidding-container .btn-primary{ background:var(--ink); color:var(--paper); }
        .bidding-container .btn-primary:hover{ opacity:.88; background:var(--ink); }
        .bidding-container .btn-ghost{ border-color:var(--line); color:var(--slate); }
        .bidding-container .btn-ghost:hover{ background:var(--panel); color:var(--ink); }

        .bidding-container .deadline-note{ display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--red); margin-top:14px; }
        .bidding-container .deadline-note b{ font-family:'IBM Plex Mono',monospace; }
        .bidding-container .deadline-note .tick{ width:6px; height:6px; border-radius:50%; background:var(--red); }

        .bidding-container .metrics{ margin:22px 28px 0 28px; display:grid; grid-template-columns:repeat(5,1fr); border:1px solid var(--line); border-radius:var(--radius); background:var(--panel); overflow:hidden; }
        .bidding-container .metric{ padding:16px 20px; border-right:1px solid var(--line-soft); }
        .bidding-container .metric:last-child{ border-right:none; }
        .bidding-container .metric-label{ font-size:11px; color:var(--slate); text-transform:none; letter-spacing:.15px; margin-bottom:8px; }
        .bidding-container .metric-value{ font-size:22px; font-family:'IBM Plex Mono',monospace; color:var(--ink); }
        .bidding-container .metric-value.accent{ color:var(--brass); }
        .bidding-container .metric-delta{ font-size:11.5px; color:var(--green); margin-top:5px; }
        .bidding-container .metric-delta.flat{ color:var(--slate-light); }

        .bidding-container .body-grid{ display:grid; grid-template-columns:1fr; gap:22px; margin:22px 28px 40px 28px; align-items:start; }

        .bidding-container .panel{ background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); }
        .bidding-container .panel-head{ display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--line-soft); }
        .bidding-container .panel-head h2{ font-size:16px; }
        .bidding-container .panel-head .count{ color:var(--slate-light); font-weight:400; font-size:14px; margin-left:6px; }

        .bidding-container .toolbar{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 20px; border-bottom:1px solid var(--line-soft); flex-wrap:wrap; }
        .bidding-container .seg{ display:flex; border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; }
        .bidding-container .seg button{ font-family:'IBM Plex Sans',sans-serif; font-size:12.5px; padding:6px 12px; background:var(--panel); border:none; border-right:1px solid var(--line); color:var(--slate); cursor:pointer; }
        .bidding-container .seg button:last-child{ border-right:none; }
        .bidding-container .seg button.active{ background:var(--ink); color:var(--paper); }
        .bidding-container .sort-hint{ font-size:12px; color:var(--slate-light); display:flex; align-items:center; gap:6px;}
        .bidding-container select.sort-select{ font-family:'IBM Plex Sans',sans-serif; font-size:12.5px; color:var(--ink); border:1px solid var(--line); border-radius:var(--radius); padding:5px 8px; background:var(--panel); }

        .bidding-container table.ledger{ width:100%; border-collapse:collapse; }
        .bidding-container table.ledger thead th{ text-align:left; font-weight:500; font-size:11px; color:var(--slate); padding:10px 14px; border-bottom:1px solid var(--line); background:var(--paper); letter-spacing:.2px; }
        .bidding-container table.ledger td{ padding:14px; border-bottom:1px solid var(--line-soft); vertical-align:middle; }
        .bidding-container table.ledger tbody tr{ cursor:pointer; transition:background .12s; }
        .bidding-container table.ledger tbody tr:hover{ background:var(--paper); }
        .bidding-container table.ledger tbody tr:last-child td{ border-bottom:none; }

        .bidding-container .buyer-cell{ display:flex; align-items:center; gap:10px; }
        .bidding-container .buyer-mark{ width:30px; height:30px; border-radius:50%; background:var(--ink-soft); color:var(--paper); display:flex; align-items:center; justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; flex:none; }
        .bidding-container .buyer-name{ font-weight:500; color:var(--ink); font-size:13.5px; }
        .bidding-container .buyer-type{ font-size:11.5px; color:var(--slate-light); }

        .bidding-container .offer-amt{ font-size:15px; color:var(--ink); }
        .bidding-container .offer-amt.top{ color:var(--brass); }
        .bidding-container .offer-sub{ font-size:11px; color:var(--slate-light); margin-top:2px; }

        .bidding-container .badge{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:500; padding:3px 9px; border-radius:20px; }
        .bidding-container .badge.new{ background:var(--amber-soft); color:var(--amber); }
        .bidding-container .badge.review{ background:var(--purple-soft); color:var(--purple); }
        .bidding-container .badge.shortlisted{ background:var(--green-soft); color:var(--green); }
        .bidding-container .badge.declined{ background:var(--red-soft); color:var(--red); }

        .bidding-container .engagement{ display:flex; align-items:center; gap:7px; }
        .bidding-container .meter{ width:56px; height:5px; background:var(--line-soft); border-radius:3px; overflow:hidden; }
        .bidding-container .meter i{ display:block; height:100%; background:var(--brass); }
        .bidding-container .engagement span{ font-size:11px; color:var(--slate); }

        .bidding-container input[type=checkbox]{ width:15px; height:15px; accent-color:var(--ink); }

        .bidding-container .compare-bar{ display:none; align-items:center; justify-content:space-between; padding:11px 20px; background:var(--ink); color:var(--paper); font-size:12.5px; border-radius:var(--radius); margin:0 20px 16px 20px; }
        .bidding-container .compare-bar.show{ display:flex; }
        .bidding-container .compare-bar .btn{ padding:6px 13px; font-size:12px; border-color:var(--paper); color:var(--paper); }
        .bidding-container .compare-bar .btn:hover{ background:var(--paper); color:var(--ink); }

        .bidding-container footer{ padding:16px 28px 34px 28px; color:var(--slate-light); font-size:11.5px; display:flex; justify-content:space-between; border-top:1px solid var(--line-soft); margin:0 28px; }

        .bidding-container .overlay{ position:fixed; inset:0; background:rgba(22,26,43,.55); display:none; align-items:flex-start; justify-content:center; padding:48px 20px; z-index:50; overflow:auto; }
        .bidding-container .overlay.show{ display:flex; }
        .bidding-container .compare-card{ background:var(--panel); border-radius:var(--radius); max-width:980px; width:100%; border:1px solid var(--line); }
        .bidding-container .compare-card-head{ display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--line-soft);}
        .bidding-container .compare-card-head h2{ font-size:18px; }
        .bidding-container .close-x{ cursor:pointer; color:var(--slate); font-size:20px; line-height:1; border:none; background:none; }
        .bidding-container .compare-table{ width:100%; border-collapse:collapse; }
        .bidding-container .compare-table th, .bidding-container .compare-table td{ padding:13px 20px; border-bottom:1px solid var(--line-soft); font-size:13px; text-align:left; }
        .bidding-container .compare-table th{ color:var(--slate); font-weight:500; font-size:11.5px; width:150px; background:var(--paper); }
        .bidding-container .compare-table td.win{ color:var(--brass); font-weight:600; }

        @media (max-width: 980px){
          .bidding-container .metrics{ grid-template-columns:repeat(2,1fr); }
          .bidding-container .metric{ border-bottom:1px solid var(--line-soft); }
        }
      `}</style>
      <div className="bidding-container">
        <div className="subnav">
          <Link href="/bidding/seller-side" className="active">Bidding</Link>
          <Link href="/bidding/seller-side/data-room">Data room</Link>
          <Link href="/bidding/seller-side/buyers">Buyers</Link>
          <Link href="/bidding/seller-side/term-sheet">Term sheet</Link>
          <Link href="/bidding/seller-side/messages">Messages</Link>
        </div>

        <div className="shell">
          <div className="deal-header">
            <div className="deal-header-top">
              <div>
                <div className="deal-title">
                  Project Alpha
                  <span className="stage-pill"><span className="dot"></span> Bid Evaluation</span>
                </div>
                <div className="deal-sub">Round opened 12 Aug 2026 &nbsp;·&nbsp; Ask $100M &nbsp;·&nbsp; 3 of 4 invited buyers have bid</div>
              </div>
              <div className="deal-actions">
                <button className="btn btn-ghost">Export ledger</button>
                <button className="btn btn-ghost">Invite buyer</button>
                <button className="btn btn-primary">Close bidding round</button>
              </div>
            </div>
            <div className="deadline-note"><span className="tick"></span> Bid deadline in <b>2 days 6 hrs</b> — 18:00 IST, 6 Sep 2026 · reminder sent to 1 outstanding buyer</div>
          </div>

          <div className="metrics">
            <div className="metric">
              <div className="metric-label">Bids received</div>
              <div className="metric-value">3<span style={{ color: 'var(--slate-light)' }}>&nbsp;/ 4 invited</span></div>
              <div className="metric-delta flat">1 outstanding — Meridian Partners</div>
            </div>
            <div className="metric">
              <div className="metric-label">Highest offer</div>
              <div className="metric-value accent">$100.0M</div>
              <div className="metric-delta">At asking price</div>
            </div>
            <div className="metric">
              <div className="metric-label">Average offer</div>
              <div className="metric-value">$95.0M</div>
              <div className="metric-delta flat">Spread $10M</div>
            </div>
            <div className="metric">
              <div className="metric-label">Median cash component</div>
              <div className="metric-value">78%</div>
              <div className="metric-delta flat">Across 3 bids</div>
            </div>
            <div className="metric">
              <div className="metric-label">VDR engagement</div>
              <div className="metric-value">41<span style={{ color: 'var(--slate-light)' }}>&nbsp;views</span></div>
              <div className="metric-delta">Highest: Halcyon Growth</div>
            </div>
          </div>

          <div className="body-grid">
            <div className="panel">
              <div className="panel-head">
                <h2>Bid ledger <span className="count">3 offers</span></h2>
                <span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Updated live as buyers submit</span>
              </div>

              <div className="toolbar">
                <div className="seg">
                  <button className="active">All (3)</button>
                  <button>Shortlisted (1)</button>
                  <button>Under review (1)</button>
                  <button>Declined (1)</button>
                </div>
                <div className="sort-hint">Sort by
                  <select className="sort-select" defaultValue="Offer amount — high to low">
                    <option>Offer amount — high to low</option>
                    <option>Submitted — most recent</option>
                    <option>Engagement — most active</option>
                  </select>
                </div>
              </div>

              <div className={`compare-bar ${selectedBids.size >= 2 ? 'show' : ''}`}>
                <span><span>{selectedBids.size}</span> bids selected for side-by-side comparison</span>
                <button className="btn" onClick={() => setShowCompare(true)}>Compare selected →</button>
              </div>

              <table className="ledger">
                <thead>
                  <tr>
                    <th style={{ width: '34px' }}></th>
                    <th>Buyer</th>
                    <th>Offer</th>
                    <th>Structure</th>
                    <th>Engagement</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr data-id="c" onClick={() => handleRowClick('c')}>
                    <td><input type="checkbox" checked={selectedBids.has('c')} onClick={(e) => e.stopPropagation()} onChange={(e) => toggleCompare(e, 'c')} /></td>
                    <td>
                      <div className="buyer-cell">
                        <div className="buyer-mark">HG</div>
                        <div>
                          <div className="buyer-name">Halcyon Growth</div>
                          <div className="buyer-type">PE Firm · NDA signed 14 Aug</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="offer-amt top">$100.0M</div>
                      <div className="offer-sub">Close: Dec 2026</div>
                    </td>
                    <td>
                      <div className="structure-bar" style={{ width: '90px' }}>
                        <div style={{ width: '60%' }}></div><div style={{ width: '40%' }}></div>
                      </div>
                      <div className="offer-sub">60% cash / 40% stock</div>
                    </td>
                    <td>
                      <div className="engagement"><div className="meter"><i style={{ width: '92%' }}></i></div><span>18 docs</span></div>
                    </td>
                    <td><span className="badge shortlisted">Shortlisted</span></td>
                    <td className="tabular" style={{ color: 'var(--slate)' }}>2 Sep</td>
                  </tr>

                  <tr data-id="b" onClick={() => handleRowClick('b')}>
                    <td><input type="checkbox" checked={selectedBids.has('b')} onClick={(e) => e.stopPropagation()} onChange={(e) => toggleCompare(e, 'b')} /></td>
                    <td>
                      <div className="buyer-cell">
                        <div className="buyer-mark">XC</div>
                        <div>
                          <div className="buyer-name">XYZ Capital</div>
                          <div className="buyer-type">Strategic Buyer · NDA signed 11 Aug</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="offer-amt">$95.0M</div>
                      <div className="offer-sub">Close: Dec 2026</div>
                    </td>
                    <td>
                      <div className="structure-bar" style={{ width: '90px' }}>
                        <div style={{ width: '70%' }}></div><div style={{ width: '30%' }}></div>
                      </div>
                      <div className="offer-sub">70% cash / 30% stock</div>
                    </td>
                    <td>
                      <div className="engagement"><div className="meter"><i style={{ width: '66%' }}></i></div><span>14 docs</span></div>
                    </td>
                    <td><span className="badge review">Under review</span></td>
                    <td className="tabular" style={{ color: 'var(--slate)' }}>1 Sep</td>
                  </tr>

                  <tr data-id="a" onClick={() => handleRowClick('a')}>
                    <td><input type="checkbox" checked={selectedBids.has('a')} onClick={(e) => e.stopPropagation()} onChange={(e) => toggleCompare(e, 'a')} /></td>
                    <td>
                      <div className="buyer-cell">
                        <div className="buyer-mark">CB</div>
                        <div>
                          <div className="buyer-name">Cardinal Buyers Inc.</div>
                          <div className="buyer-type">Corporate Buyer · NDA signed 13 Aug</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="offer-amt">$90.0M</div>
                      <div className="offer-sub">Close: Jan 2027</div>
                    </td>
                    <td>
                      <div className="structure-bar" style={{ width: '90px' }}>
                        <div style={{ width: '100%' }}></div><div style={{ width: '0%' }}></div>
                      </div>
                      <div className="offer-sub">100% cash</div>
                    </td>
                    <td>
                      <div className="engagement"><div className="meter"><i style={{ width: '34%' }}></i></div><span>9 docs</span></div>
                    </td>
                    <td><span className="badge declined">Declined</span></td>
                    <td className="tabular" style={{ color: 'var(--slate)' }}>29 Aug</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <footer>
            <span>Every view, download and comparison on this page is written to the deal audit trail.</span>
            <span>Visible to: Seller Admin, Finance Advisor — 2 roles</span>
          </footer>
        </div>

        {showCompare && (
          <div className="overlay show" onClick={(e) => { if (e.target === e.currentTarget) setShowCompare(false); }}>
            <div className="compare-card">
              <div className="compare-card-head">
                <h2>Compare bids</h2>
                <button className="close-x" onClick={() => setShowCompare(false)}>×</button>
              </div>
              <table className="compare-table">
                <tbody>
                  <tr>
                    <th>Buyer</th>
                    {Array.from(selectedBids).map(id => <td key={id}>{bidsData[id].name}</td>)}
                  </tr>
                  <tr>
                    <th>Offer</th>
                    {Array.from(selectedBids).map((id, index) => <td key={id} className={index === 0 ? 'win' : ''}>{bidsData[id].offer}</td>)}
                  </tr>
                  <tr>
                    <th>Cash / Stock</th>
                    {Array.from(selectedBids).map(id => <td key={id}>{bidsData[id].cash} / {bidsData[id].stock}</td>)}
                  </tr>
                  <tr>
                    <th>Expected close</th>
                    {Array.from(selectedBids).map(id => <td key={id}>{bidsData[id].close}</td>)}
                  </tr>
                  <tr>
                    <th>Status</th>
                    {Array.from(selectedBids).map(id => <td key={id}>{bidsData[id].status}</td>)}
                  </tr>
                  <tr>
                    <th>VDR engagement</th>
                    {Array.from(selectedBids).map(id => <td key={id}>{bidsData[id].engagement}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
