export default function MergeDataRoomPage() {
  return (
    <>
      <div className="toolbar">
        <div className="search"><input type="text" placeholder="Search documents, folders, Q&A..." /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="mutual-badge">Mutual room · both parties upload</span>
          <a href="#" className="btn">Upload documents</a>
        </div>
      </div>

      <div className="layout">
        <div className="tree">
          <div className="tree-heading">Folders</div>
          <div className="tree-item"><span>Corporate</span><span className="count">7</span></div>
          <div className="tree-item active"><span>Financials</span><span className="count">11</span></div>
          <div className="tree-item"><span>Legal</span><span className="count">6</span></div>
          <div className="tree-item"><span>Operations</span><span className="count">5</span></div>
          <div className="tree-item"><span>Governance drafts</span><span className="count">3</span></div>
          <div className="tree-heading">Discussion</div>
          <div className="tree-item"><span>Joint Q&amp;A</span><span className="count">9</span></div>
        </div>

        <div>
          <div className="file-panel-head">
            <h2 style={{ fontSize: '16px' }}>Financials <span style={{ color: 'var(--slate-light)', fontWeight: '400', fontSize: '13px' }}>· 11 files</span></h2>
            <span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Sort: Recently added</span>
          </div>
          <table className="files">
            <thead><tr><th>Name</th><th>Uploaded by</th><th>Size</th><th>Added</th></tr></thead>
            <tbody>
              <tr className="selected">
                <td><div className="fname"><div className="ficon">XLS</div><div><b>Combined financial model.xlsx</b><div className="fmeta">Pro forma, both entities</div></div></div></td>
                <td><span className="co-tag"><span className="co-mark a">MT</span>Meridian</span></td>
                <td className="fmeta">3.4 MB</td><td className="fmeta">5 Sep</td>
              </tr>
              <tr>
                <td><div className="fname"><div className="ficon">PDF</div><div><b>Nova audited financials FY25.pdf</b><div className="fmeta">Financials</div></div></div></td>
                <td><span className="co-tag"><span className="co-mark b">NS</span>Nova</span></td>
                <td className="fmeta">5.1 MB</td><td className="fmeta">18 Aug</td>
              </tr>
              <tr>
                <td><div className="fname"><div className="ficon">PDF</div><div><b>Meridian audited financials FY25.pdf</b><div className="fmeta">Financials</div></div></div></td>
                <td><span className="co-tag"><span className="co-mark a">MT</span>Meridian</span></td>
                <td className="fmeta">4.6 MB</td><td className="fmeta">18 Aug</td>
              </tr>
              <tr>
                <td><div className="fname"><div className="ficon">XLS</div><div><b>Synergy &amp; cost-savings estimate.xlsx</b><div className="fmeta">Joint analysis</div></div></div></td>
                <td><span className="co-tag"><span className="co-mark b">NS</span>Nova</span></td>
                <td className="fmeta">890 KB</td><td className="fmeta">3 Sep</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="detail">
          <h3>Combined financial model.xlsx</h3>
          <div className="dsub">Uploaded by Meridian Technologies · 5 Sep 2026</div>
          <a href="#" className="btn-block">Open in viewer</a>
          <a href="#" className="btn-block btn-ghost">Download</a>

          <div style={{ marginTop: '16px' }}>
            <div className="detail-kv"><span className="k">Folder</span><span className="v">Financials</span></div>
            <div className="detail-kv"><span className="k">Size</span><span className="v">3.4 MB</span></div>
            <div className="detail-kv"><span className="k">Visible to</span><span className="v">Both parties</span></div>
            <div className="detail-kv"><span className="k">Nova views</span><span className="v">4</span></div>
          </div>

          <div className="ask-box">
            <label style={{ fontSize: '11.5px', color: 'var(--slate)', fontWeight: '500' }}>Ask a joint question about this document</label>
            <textarea rows="3" placeholder="e.g. Can we align on the synergy realization timeline assumptions?" style={{ marginTop: '6px' }}></textarea>
            <a href="/bidding/merge/messages" className="btn-block" style={{ marginTop: '8px' }}>Post to joint Q&amp;A</a>
          </div>
        </div>
      </div>
    </>
  );
}
