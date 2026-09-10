"use client";

import React from 'react';
import Link from 'next/link';

export default function SellerDataRoomPage() {
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
        .seller-data-room-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; font-size:14px; line-height:1.5; min-height: 100vh; }
        .seller-data-room-container a{ color:inherit; text-decoration:none; }
        .seller-data-room-container h1, .seller-data-room-container h2, .seller-data-room-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }

        .seller-data-room-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .seller-data-room-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .seller-data-room-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .seller-data-room-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .seller-data-room-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .seller-data-room-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .seller-data-room-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .seller-data-room-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .seller-data-room-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .seller-data-room-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .seller-data-room-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .seller-data-room-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }

        .seller-data-room-container .toolbar{ display:flex; align-items:center; justify-content:space-between; padding:16px 28px; gap:16px; flex-wrap:wrap; }
        .seller-data-room-container .search{ flex:1; max-width:320px; }
        .seller-data-room-container .search input{ width:100%; font-family:'IBM Plex Sans',sans-serif; font-size:13px; padding:9px 12px; border:1px solid var(--line); border-radius:var(--radius); background:var(--panel); color:var(--ink); }
        .seller-data-room-container .search input:focus{ outline:none; border-color:var(--slate); }
        .seller-data-room-container .btn{ font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:transparent; color:var(--ink); }
        .seller-data-room-container .btn:hover{ background:var(--ink); color:var(--paper); }
        .seller-data-room-container .btn-primary{ background:var(--ink); color:var(--paper); }
        .seller-data-room-container .btn-primary:hover{ opacity:.88; }

        .seller-data-room-container .layout{ display:grid; grid-template-columns:220px 1fr 300px; gap:0; margin:0 28px 40px 28px; border:1px solid var(--line); border-radius:var(--radius); background:var(--panel); overflow:hidden; align-items:stretch; }

        .seller-data-room-container .tree{ border-right:1px solid var(--line-soft); padding:14px 0; }
        .seller-data-room-container .tree-item{ padding:9px 20px; font-size:13px; color:var(--slate); cursor:pointer; display:flex; justify-content:space-between; }
        .seller-data-room-container .tree-item.active{ background:var(--brass-soft); color:var(--ink); font-weight:500; border-right:2px solid var(--brass); }
        .seller-data-room-container .tree-item .count{ font-size:11px; color:var(--slate-light); font-family:'IBM Plex Mono',monospace; }
        .seller-data-room-container .tree-heading{ padding:8px 20px 4px 20px; font-size:10.5px; letter-spacing:.4px; color:var(--slate-light); text-transform:uppercase; }

        .seller-data-room-container .file-panel-head{ display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--line-soft); }
        .seller-data-room-container table.files{ width:100%; border-collapse:collapse; }
        .seller-data-room-container table.files thead th{ text-align:left; font-size:11px; color:var(--slate); font-weight:500; padding:9px 20px; border-bottom:1px solid var(--line); background:#FBFAF5; }
        .seller-data-room-container table.files td{ padding:12px 20px; border-bottom:1px solid var(--line-soft); font-size:13px; }
        .seller-data-room-container table.files tbody tr{ cursor:pointer; }
        .seller-data-room-container table.files tbody tr:hover{ background:#FBFAF5; }
        .seller-data-room-container table.files tbody tr.selected{ background:var(--brass-soft); }
        .seller-data-room-container .fname{ display:flex; align-items:center; gap:9px; }
        .seller-data-room-container .ficon{ width:26px; height:26px; border-radius:4px; background:var(--blue-soft); color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:10px; font-family:'IBM Plex Mono',monospace; flex:none; }
        .seller-data-room-container .fname b{ font-weight:500; color:var(--ink); font-size:13px; }
        .seller-data-room-container .fmeta{ color:var(--slate-light); font-size:11px; }
        .seller-data-room-container .badge{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:500; padding:3px 9px; border-radius:20px; }
        .seller-data-room-container .badge.green{ background:var(--green-soft); color:var(--green); }
        .seller-data-room-container .badge.amber{ background:var(--amber-soft); color:var(--amber); }

        .seller-data-room-container .detail{ border-left:1px solid var(--line-soft); padding:20px; }
        .seller-data-room-container .detail h3{ font-size:15px; margin-bottom:4px; }
        .seller-data-room-container .detail .dsub{ font-size:12px; color:var(--slate-light); margin-bottom:16px; }
        .seller-data-room-container .perm-row{ display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--line-soft); font-size:12.5px; }
        .seller-data-room-container .perm-row:last-child{ border-bottom:none; }
        .seller-data-room-container .toggle{ width:32px; height:18px; border-radius:9px; background:var(--line); position:relative; cursor:pointer; }
        .seller-data-room-container .toggle.on{ background:var(--green); }
        .seller-data-room-container .toggle::after{ content:""; position:absolute; top:2px; left:2px; width:14px; height:14px; border-radius:50%; background:#fff; }
        .seller-data-room-container .toggle.on::after{ left:16px; }
        .seller-data-room-container .detail-actions{ margin-top:16px; display:flex; flex-direction:column; gap:8px; }
        .seller-data-room-container .detail-actions a{ text-align:center; display:block; font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); border:1px solid var(--line); color:var(--slate); }
        .seller-data-room-container .detail-actions a:hover{ border-color:var(--ink); color:var(--ink); }
      `}</style>
      <div className="seller-data-room-container">
        <div className="subnav">
          <Link href="/bidding/seller-side">Bidding</Link>
          <Link href="/bidding/seller-side/data-room" className="active">Data room</Link>
          <Link href="/bidding/seller-side/buyers">Buyers</Link>
          <Link href="/bidding/seller-side/term-sheet">Term sheet</Link>
          <Link href="/bidding/seller-side/messages">Messages</Link>
        </div>

        <div className="toolbar">
          <div className="search"><input type="text" placeholder="Search documents, folders, Q&A..." /></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="#" className="btn">New folder</a>
            <a href="#" className="btn btn-primary">Upload documents</a>
          </div>
        </div>

        <div className="layout">
          <div className="tree">
            <div className="tree-heading">Folders</div>
            <div className="tree-item"><span>Corporate</span><span className="count">6</span></div>
            <div className="tree-item active"><span>Financials</span><span className="count">9</span></div>
            <div className="tree-item"><span>Legal</span><span className="count">5</span></div>
            <div className="tree-item"><span>Operations</span><span className="count">4</span></div>
            <div className="tree-item"><span>HR &amp; Talent</span><span className="count">3</span></div>
            <div className="tree-heading">Discussion</div>
            <div className="tree-item"><span>Q&amp;A inbox</span><span className="count">2</span></div>
          </div>

          <div>
            <div className="file-panel-head">
              <h2 style={{ fontSize: '16px' }}>Financials <span style={{ color: 'var(--slate-light)', fontWeight: 400, fontSize: '13px' }}>· 9 files</span></h2>
              <span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Sort: Recently added</span>
            </div>
            <table className="files">
              <thead><tr><th>Name</th><th>Size</th><th>Added</th><th>Visibility</th></tr></thead>
              <tbody>
                <tr className="selected">
                  <td><div className="fname"><div className="ficon">XLS</div><div><b>Revenue &amp; cohort breakdown.xlsx</b><div className="fmeta">Viewed by 3 of 4 buyers</div></div></div></td>
                  <td className="fmeta">2.1 MB</td><td className="fmeta">2 Sep</td>
                  <td><span className="badge green">All buyers</span></td>
                </tr>
                <tr>
                  <td><div className="fname"><div className="ficon">PDF</div><div><b>Audited financials FY25.pdf</b><div className="fmeta">Viewed by 3 of 4 buyers</div></div></div></td>
                  <td className="fmeta">4.8 MB</td><td className="fmeta">18 Aug</td>
                  <td><span className="badge green">All buyers</span></td>
                </tr>
                <tr>
                  <td><div className="fname"><div className="ficon">XLS</div><div><b>Updated cap table v3.xlsx</b><div className="fmeta">Viewed by 1 of 4 buyers</div></div></div></td>
                  <td className="fmeta">640 KB</td><td className="fmeta">4 Sep</td>
                  <td><span className="badge amber">Shortlisted only</span></td>
                </tr>
                <tr>
                  <td><div className="fname"><div className="ficon">PDF</div><div><b>Debt schedule.pdf</b><div className="fmeta">Viewed by 2 of 4 buyers</div></div></div></td>
                  <td className="fmeta">310 KB</td><td className="fmeta">16 Aug</td>
                  <td><span className="badge green">All buyers</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="detail">
            <h3>Revenue &amp; cohort breakdown.xlsx</h3>
            <div className="dsub">Uploaded 2 Sep 2026 · Financials</div>

            <div style={{ fontSize: '11.5px', color: 'var(--slate)', fontWeight: 500, marginBottom: '6px' }}>Visibility by buyer</div>
            <div className="perm-row"><span>Halcyon Growth</span><div className="toggle on"></div></div>
            <div className="perm-row"><span>XYZ Capital</span><div className="toggle on"></div></div>
            <div className="perm-row"><span>Cardinal Buyers</span><div className="toggle"></div></div>
            <div className="perm-row"><span>Meridian Partners</span><div className="toggle"></div></div>

            <div className="detail-actions">
              <a href="#">Replace file</a>
              <a href="#">View access log</a>
              <a href="#" style={{ color: 'var(--red)', borderColor: 'var(--red-soft)' }}>Remove document</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
