export default function MergeAgreementPage() {
  return (
    <>
      <div className="status-strip">
        <span>Terms from Proposal Round 4 carried into this draft — both boards must approve before it moves to shareholder vote.</span>
        <span>Stage 3 of 6</span>
      </div>

      <div className="page-head">
        <div>
          <h1>Definitive Merger Agreement</h1>
          <div className="sub">Draft v3 · last updated by Meridian counsel, 8 Sep 2026</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="#" className="btn btn-ghost">Download PDF</a>
          <a href="#" className="btn btn-primary">Submit for board approval</a>
        </div>
      </div>

      <div className="body-grid">

        <div className="panel">
          <div className="panel-head"><h2>Key terms</h2><span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Carried from proposal round 4</span></div>
          <table className="terms">
            <tbody>
              <tr><td className="tk">Exchange ratio</td><td className="tv">1.00 Meridian : 0.82 Nova <span className="changed">confirmed</span></td></tr>
              <tr><td className="tk">Cash top-up</td><td className="tv">None</td></tr>
              <tr><td className="tk">Implied ownership</td><td className="tv">54% Meridian / 46% Nova</td></tr>
              <tr><td className="tk">Combined entity name</td><td className="tv">Meridian Nova, Inc.</td></tr>
              <tr><td className="tk">Headquarters</td><td className="tv">Under discussion <span className="changed">open</span></td></tr>
              <tr><td className="tk">Board composition</td><td className="tv">9 seats — 5 Meridian / 4 Nova</td></tr>
              <tr><td className="tk">Combined CEO</td><td className="tv">R. Iyer (Meridian)</td></tr>
              <tr><td className="tk">Termination fee</td><td className="tv">$8.0M, payable by either party if the deal fails to close for cause</td></tr>
              <tr><td className="tk">Regulatory conditions</td><td className="tv">Subject to antitrust clearance in US, EU</td></tr>
              <tr><td className="tk">Governing law</td><td className="tv">Delaware, USA</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <div className="panel" style={{ marginBottom: '22px' }}>
            <div className="panel-head"><h2>Counsel comments</h2></div>
            <div className="comment-thread">
              <div className="comment">
                <div className="c-avatar a">PN</div>
                <div className="c-body"><b>P. Nakamura (Meridian counsel)</b><div className="c-text">Termination fee language finalized at $8.0M per both boards' guidance.</div><div className="c-meta">8 Sep, 9:40 AM</div></div>
              </div>
              <div className="comment">
                <div className="c-avatar b">TA</div>
                <div className="c-body"><b>T. Alvarez (Nova counsel)</b><div className="c-text">Headquarters clause still needs resolution before this can go to our board.</div><div className="c-meta">8 Sep, 11:15 AM</div></div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="side-section">
              <h3>Board approval status</h3>
              <div className="sig-row"><span>Meridian Technologies board</span><span className="sig-status"><span className="sig-dot pending"></span>Pending</span></div>
              <div className="sig-row"><span>Nova Systems board</span><span className="sig-status"><span className="sig-dot pending"></span>Pending</span></div>
            </div>
            <div className="side-section">
              <h3>Shareholder vote status</h3>
              <div className="sig-row locked"><span>Meridian shareholders</span><span className="sig-status"><span className="sig-dot locked"></span>Locked until signed</span></div>
              <div className="sig-row locked"><span>Nova shareholders</span><span className="sig-status"><span className="sig-dot locked"></span>Locked until signed</span></div>
            </div>
            <div className="side-section">
              <h3>Next steps</h3>
              <div style={{ fontSize: '12.5px', color: 'var(--slate)' }}>Once both boards approve, this agreement is signed and joint proxy materials are prepared for each company's shareholder vote.</div>
            </div>
            <div className="side-actions">
              <a href="#" className="btn btn-primary">Submit for board approval</a>
              <a href="#" className="btn btn-ghost">Attach redlined document</a>
              <a href="/bidding/merge/messages" className="btn btn-ghost">Message Nova counsel</a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
