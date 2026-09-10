"use client";

import React from 'react';
import Link from 'next/link';

export default function DataRoomPage() {
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
        .data-room-container { background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans', sans-serif; font-size:14px; line-height:1.5; min-height: 100vh; }
        .data-room-container a{ color:inherit; text-decoration:none; }
        .data-room-container h1, .data-room-container h2, .data-room-container h3{ font-family:'Source Serif 4', serif; font-weight:500; margin:0; }

        .data-room-container .topbar{ display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--line); background:var(--ink); color:#EDE9DA; }
        .data-room-container .topbar-left{ display:flex; align-items:center; gap:18px; }
        .data-room-container .brand{ display:flex; align-items:center; gap:9px; font-family:'Source Serif 4',serif; font-size:16px; }
        .data-room-container .brand-mark{ width:20px; height:20px; border:1.4px solid #C9A24C; border-radius:2px; position:relative; flex:none;}
        .data-room-container .brand-mark::after{ content:""; position:absolute; inset:4px; border:1.4px solid #C9A24C; opacity:.55; }
        .data-room-container .crumbs{ color:#9AA0BE; font-size:12.5px; }
        .data-room-container .crumbs b{ color:#EDE9DA; font-weight:500; }
        .data-room-container .topbar-right{ display:flex; align-items:center; gap:16px; font-size:12.5px; color:#B7BBD2; }
        .data-room-container .avatar{ width:26px;height:26px;border-radius:50%; background:#3A3F63; color:#EDE9DA; display:flex;align-items:center;justify-content:center; font-size:11px; font-family:'IBM Plex Mono',monospace; }

        .data-room-container .subnav{ display:flex; gap:2px; padding:0 28px; border-bottom:1px solid var(--line); background:var(--panel); }
        .data-room-container .subnav a{ padding:13px 16px; font-size:13px; color:var(--slate); border-bottom:2px solid transparent; }
        .data-room-container .subnav a.active{ color:var(--ink); border-bottom-color:var(--brass); font-weight:500; }

        .data-room-container .toolbar{ display:flex; align-items:center; justify-content:space-between; padding:16px 28px; gap:16px; flex-wrap:wrap; }
        .data-room-container .search{ flex:1; max-width:340px; }
        .data-room-container .search input{ width:100%; font-family:'IBM Plex Sans',sans-serif; font-size:13px; padding:9px 12px; border:1px solid var(--line); border-radius:var(--radius); background:var(--panel); color:var(--ink); }
        .data-room-container .search input:focus{ outline:none; border-color:var(--slate); }
        .data-room-container .access-badge{ font-size:11.5px; color:var(--green); background:var(--green-soft); padding:5px 10px; border-radius:20px; }

        .data-room-container .layout{ display:grid; grid-template-columns:220px 1fr 320px; gap:0; margin:0 28px 40px 28px; border:1px solid var(--line); border-radius:var(--radius); background:var(--panel); overflow:hidden; align-items:stretch; }

        .data-room-container .tree{ border-right:1px solid var(--line-soft); padding:14px 0; }
        .data-room-container .tree-item{ padding:9px 20px; font-size:13px; color:var(--slate); cursor:pointer; display:flex; justify-content:space-between; }
        .data-room-container .tree-item.active{ background:var(--brass-soft); color:var(--ink); font-weight:500; border-right:2px solid var(--brass); }
        .data-room-container .tree-item .count{ font-size:11px; color:var(--slate-light); font-family:'IBM Plex Mono',monospace; }
        .data-room-container .tree-heading{ padding:8px 20px 4px 20px; font-size:10.5px; letter-spacing:.4px; color:var(--slate-light); text-transform:uppercase; }

        .data-room-container .file-panel-head{ display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--line-soft); }
        .data-room-container table.files{ width:100%; border-collapse:collapse; }
        .data-room-container table.files thead th{ text-align:left; font-size:11px; color:var(--slate); font-weight:500; padding:9px 20px; border-bottom:1px solid var(--line); background:#FBFAF5; }
        .data-room-container table.files td{ padding:12px 20px; border-bottom:1px solid var(--line-soft); font-size:13px; }
        .data-room-container table.files tbody tr{ cursor:pointer; }
        .data-room-container table.files tbody tr:hover{ background:#FBFAF5; }
        .data-room-container table.files tbody tr.selected{ background:var(--brass-soft); }
        .data-room-container .fname{ display:flex; align-items:center; gap:9px; }
        .data-room-container .ficon{ width:26px; height:26px; border-radius:4px; background:var(--blue-soft); color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:10px; font-family:'IBM Plex Mono',monospace; flex:none; }
        .data-room-container .fname b{ font-weight:500; color:var(--ink); font-size:13px; }
        .data-room-container .fmeta{ color:var(--slate-light); font-size:11px; }
        .data-room-container .viewed{ font-size:11px; color:var(--green); }
        .data-room-container .unviewed{ font-size:11px; color:var(--amber); }

        .data-room-container .detail{ border-left:1px solid var(--line-soft); padding:20px; }
        .data-room-container .detail h3{ font-size:15px; margin-bottom:4px; }
        .data-room-container .detail .dsub{ font-size:12px; color:var(--slate-light); margin-bottom:16px; }
        .data-room-container .detail .btn{ width:100%; text-align:center; display:block; font-family:'IBM Plex Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 16px; border-radius:var(--radius); cursor:pointer; border:1px solid var(--ink); background:var(--ink); color:var(--paper); margin-bottom:8px; }
        .data-room-container .detail .btn-ghost{ background:transparent; color:var(--ink); border-color:var(--line); }
        .data-room-container .detail-kv{ display:flex; justify-content:space-between; padding:6px 0; font-size:12.5px; border-bottom:1px solid var(--line-soft); }
        .data-room-container .detail-kv .k{ color:var(--slate); } .data-room-container .detail-kv .v{ color:var(--ink); font-family:'IBM Plex Mono',monospace; }
        .data-room-container .ask-box{ margin-top:16px; }
        .data-room-container .ask-box textarea{ width:100%; font-family:'IBM Plex Sans',sans-serif; font-size:12.5px; padding:10px; border:1px solid var(--line); border-radius:var(--radius); resize:none; background:var(--paper); color:var(--ink); }
        .data-room-container .ask-box textarea:focus{ outline:none; border-color:var(--slate); }
      `}</style>
      <div className="data-room-container">
        <div className="subnav">
          <Link href="/bidding/buyer-side">Overview</Link>
          <Link href="/bidding/buyer-side/data-room" className="active">Data room</Link>
          <Link href="/bidding/buyer-side/my-bid">My bid</Link>
          <Link href="/bidding/buyer-side/bid-history">Bid history</Link>
          <Link href="/bidding/buyer-side/messages">Messages</Link>
          <Link href="/bidding/buyer-side/term-sheet">Term sheet</Link>
        </div>

        <div className="toolbar">
          <div className="search"><input type="text" placeholder="Search documents, folders, Q&A..." /></div>
          <span className="access-badge">NDA-gated · Bidder access</span>
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
            <div className="tree-item"><span>Q&amp;A thread</span><span className="count">12</span></div>
          </div>

          <div>
            <div className="file-panel-head">
              <h2 style={{ fontSize: '16px' }}>Financials <span style={{ color: 'var(--slate-light)', fontWeight: 400, fontSize: '13px' }}>· 9 files</span></h2>
              <span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Sort: Recently added</span>
            </div>
            <table className="files">
              <thead><tr><th>Name</th><th>Size</th><th>Added</th><th>Status</th></tr></thead>
              <tbody>
                <tr className="selected">
                  <td><div className="fname"><div className="ficon">XLS</div><div><b>Revenue &amp; cohort breakdown.xlsx</b><div className="fmeta">Financials</div></div></div></td>
                  <td className="fmeta">2.1 MB</td><td className="fmeta">2 Sep</td>
                  <td><span className="viewed">Viewed</span></td>
                </tr>
                <tr>
                  <td><div className="fname"><div className="ficon">PDF</div><div><b>Audited financials FY25.pdf</b><div className="fmeta">Financials</div></div></div></td>
                  <td className="fmeta">4.8 MB</td><td className="fmeta">18 Aug</td>
                  <td><span className="viewed">Viewed</span></td>
                </tr>
                <tr>
                  <td><div className="fname"><div className="ficon">XLS</div><div><b>Updated cap table v3.xlsx</b><div className="fmeta">Financials</div></div></div></td>
                  <td className="fmeta">640 KB</td><td className="fmeta">4 Sep</td>
                  <td><span className="unviewed">New</span></td>
                </tr>
                <tr>
                  <td><div className="fname"><div className="ficon">PDF</div><div><b>Debt schedule.pdf</b><div className="fmeta">Financials</div></div></div></td>
                  <td className="fmeta">310 KB</td><td className="fmeta">16 Aug</td>
                  <td><span className="viewed">Viewed</span></td>
                </tr>
                <tr>
                  <td><div className="fname"><div className="ficon">XLS</div><div><b>Monthly ARR trend.xlsx</b><div className="fmeta">Financials</div></div></div></td>
                  <td className="fmeta">1.2 MB</td><td className="fmeta">15 Aug</td>
                  <td><span className="viewed">Viewed</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="detail">
            <h3>Revenue &amp; cohort breakdown.xlsx</h3>
            <div className="dsub">Uploaded by ABC Technologies · 2 Sep 2026</div>
            <a href="#" className="btn">Open in viewer</a>
            <a href="#" className="btn btn-ghost">Download</a>

            <div style={{ marginTop: '16px' }}>
              <div className="detail-kv"><span className="k">Folder</span><span className="v">Financials</span></div>
              <div className="detail-kv"><span className="k">Size</span><span className="v">2.1 MB</span></div>
              <div className="detail-kv"><span className="k">Your views</span><span className="v">3</span></div>
              <div className="detail-kv"><span className="k">Last viewed</span><span className="v">Today</span></div>
            </div>

            <div className="ask-box">
              <label style={{ fontSize: '11.5px', color: 'var(--slate)', fontWeight: 500 }}>Ask a question about this document</label>
              <textarea rows="3" placeholder="e.g. Can you break down enterprise vs. SMB revenue?" style={{ marginTop: '6px' }}></textarea>
              <a href="#" className="btn" style={{ marginTop: '8px' }}>Submit to seller</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
