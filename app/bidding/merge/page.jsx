export default function MergeOverviewPage() {
  return (
    <>
      <div className="deal-header">
        <div className="deal-header-top">
          <div>
            <div className="deal-id">MERGER OF EQUALS &nbsp;·&nbsp; DEAL-2026-0042</div>
            <div className="deal-title">
              <div className="co-vs">
                <span className="co-chip"><span className="co-mark a">MT</span>Meridian Technologies</span>
                <span className="swap-icon">⇄</span>
                <span className="co-chip"><span className="co-mark b">NS</span>Nova Systems</span>
              </div>
              <span className="stage-pill"><span className="dot"></span> Terms negotiation</span>
            </div>
            <div className="deal-sub">Combined entity: "Meridian Nova, Inc." &nbsp;·&nbsp; Both boards approved intent to merge 10 Aug 2026</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="/bidding/merge/messages" className="btn btn-ghost">Message Nova team</a>
            <a href="/bidding/merge/proposal" className="btn btn-primary">View proposal</a>
          </div>
        </div>
      </div>

      <div className="tracker">
        <div className="tstep done"><div className="n">01</div><div className="l">Mutual due diligence</div></div>
        <div className="tstep current"><div className="n">02</div><div className="l">Proposal exchange</div></div>
        <div className="tstep"><div className="n">03</div><div className="l">Agreement signed</div></div>
        <div className="tstep"><div className="n">04</div><div className="l">Shareholder votes</div></div>
        <div className="tstep"><div className="n">05</div><div className="l">Regulatory clearance</div></div>
        <div className="tstep"><div className="n">06</div><div className="l">Closing</div></div>
      </div>

      <div className="grid-3">
        <div className="panel tile">
          <div className="tile-label">Current exchange ratio</div>
          <div className="tile-value accent">1.00 : 0.82</div>
          <div className="tile-sub">Round 4, proposed by Nova · awaiting your response</div>
          <div className="tile-cta"><a href="/bidding/merge/proposal" className="btn btn-ghost" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Respond to proposal</a></div>
        </div>
        <div className="panel tile">
          <div className="tile-label">Data room activity</div>
          <div className="tile-value">52<span style={{ color: 'var(--slate-light)', fontSize: '16px' }}>&nbsp;views this week</span></div>
          <div className="tile-sub">3 unanswered Q&amp;A items</div>
          <div className="tile-cta"><a href="/bidding/merge/data-room" className="btn btn-ghost" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Open data room</a></div>
        </div>
        <div className="panel tile">
          <div className="tile-label">Target signing date</div>
          <div className="tile-value" style={{ color: 'var(--amber)' }}>3 weeks</div>
          <div className="tile-sub">Definitive agreement due 30 Sep 2026</div>
          <div className="tile-cta"><a href="/bidding/merge/agreement" className="btn btn-ghost" style={{ width: '100%', textAlign: 'center', display: 'block' }}>View draft agreement</a></div>
        </div>
      </div>

      <div className="grid">
        <div className="panel">
          <div className="panel-head"><h2>Recent activity</h2></div>
          <div className="panel-body">
            <div className="activity-item live"><div className="activity-dot"></div><div><div>Nova Systems viewing Combined financial model.xlsx</div><div className="activity-meta">Live now</div></div></div>
            <div className="activity-item"><div className="activity-dot"></div><div><div>Nova Systems proposed Round 4 terms — ratio 1.00:0.82</div><div className="activity-meta">5 Sep, 9:20 AM</div></div></div>
            <div className="activity-item"><div className="activity-dot"></div><div><div>Meridian counsel commented on governance draft</div><div className="activity-meta">4 Sep, 3:10 PM</div></div></div>
            <div className="activity-item"><div className="activity-dot"></div><div><div>Meridian countered Round 3 — ratio 1.00:0.78</div><div className="activity-meta">2 Sep, 11:45 AM</div></div></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Key dates</h2></div>
          <div className="panel-body">
            <div className="kv"><span className="k">Intent to merge approved</span><span className="v">10 Aug</span></div>
            <div className="kv"><span className="k">Current proposal round</span><span className="v">5 Sep</span></div>
            <div className="kv"><span className="k">Target: definitive agreement</span><span className="v" style={{ color: 'var(--amber)' }}>30 Sep</span></div>
            <div className="kv"><span className="k">Target: shareholder votes</span><span className="v" style={{ color: 'var(--slate-light)' }}>Nov 2026</span></div>
            <div className="kv"><span className="k">Target: closing</span><span className="v" style={{ color: 'var(--slate-light)' }}>Q1 2027</span></div>
          </div>
        </div>
      </div>

      <footer>
        <span>All activity on this deal is logged and jointly visible to both companies' deal teams.</span>
        <span>Visible to: Meridian deal team, Nova deal team — 6 roles</span>
      </footer>
    </>
  );
}
