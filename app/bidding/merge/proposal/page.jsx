"use client";

import { useState } from 'react';

export default function MergeProposalPage() {
  const [selectedRound, setSelectedRound] = useState('r4');

  return (
    <div className="shell">
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
            <a href="/bidding/merge/agreement" className="btn btn-ghost">Export term sheet</a>
            <a href="#" className="btn btn-primary">Propose revision</a>
          </div>
        </div>
        <div className="deadline-note"><span className="tick"></span> Target date to sign definitive agreement: <b>30 Sep 2026</b> — 3 weeks remaining</div>
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Current exchange ratio</div>
          <div className="metric-value accent">1.00 : 0.82</div>
          <div className="metric-sub">1 MT share = 0.82 NS shares</div>
        </div>
        <div className="metric">
          <div className="metric-label">Implied ownership split</div>
          <div className="metric-value">54 / 46</div>
          <div className="metric-split"><div style={{ width: '54%' }}></div><div style={{ width: '46%' }}></div></div>
          <div className="metric-legend"><span className="a">Meridian 54%</span><span className="b">Nova 46%</span></div>
        </div>
        <div className="metric">
          <div className="metric-label">Combined enterprise value</div>
          <div className="metric-value">$410M</div>
          <div className="metric-sub">MT $220M + NS $190M standalone</div>
        </div>
        <div className="metric">
          <div className="metric-label">Board seats (combined)</div>
          <div className="metric-value">5 / 4</div>
          <div className="metric-sub">Meridian 5 · Nova 4 of 9</div>
        </div>
      </div>

      <div className="body-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Proposal history <span className="count">4 rounds</span></h2>
            <span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Terms are jointly visible to both parties</span>
          </div>

          <table className="ledger">
            <thead>
              <tr><th>Round</th><th>Proposed by</th><th>Exchange ratio</th><th>Cash top-up</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr className={selectedRound === 'r4' ? 'selected' : ''} onClick={() => setSelectedRound('r4')}>
                <td className="tabular">Round 4</td>
                <td><div className="proposer"><span className="co-mark b">NS</span>Nova Systems</div></td>
                <td><div className="ratio">1.00 : 0.82</div><div className="ratio-sub">+2 board seats to Nova</div></td>
                <td className="tabular">—</td>
                <td><span className="badge amber">Awaiting your response</span></td>
                <td className="tabular" style={{ color: 'var(--slate)' }}>5 Sep</td>
              </tr>
              <tr className={selectedRound === 'r3' ? 'selected' : ''} onClick={() => setSelectedRound('r3')}>
                <td className="tabular">Round 3</td>
                <td><div className="proposer"><span className="co-mark a">MT</span>Meridian Technologies</div></td>
                <td><div className="ratio">1.00 : 0.78</div><div className="ratio-sub">HQ: Meridian's campus</div></td>
                <td className="tabular">—</td>
                <td><span className="badge gray">Countered</span></td>
                <td className="tabular" style={{ color: 'var(--slate)' }}>2 Sep</td>
              </tr>
              <tr className={selectedRound === 'r2' ? 'selected' : ''} onClick={() => setSelectedRound('r2')}>
                <td className="tabular">Round 2</td>
                <td><div className="proposer"><span className="co-mark b">NS</span>Nova Systems</div></td>
                <td><div className="ratio">1.00 : 0.85</div><div className="ratio-sub">Joint HQ proposal</div></td>
                <td className="tabular">$10M</td>
                <td><span className="badge gray">Countered</span></td>
                <td className="tabular" style={{ color: 'var(--slate)' }}>27 Aug</td>
              </tr>
              <tr className={selectedRound === 'r1' ? 'selected' : ''} onClick={() => setSelectedRound('r1')}>
                <td className="tabular">Round 1</td>
                <td><div className="proposer"><span className="co-mark a">MT</span>Meridian Technologies</div></td>
                <td><div className="ratio">1.00 : 0.75</div><div className="ratio-sub">Initial indicative proposal</div></td>
                <td className="tabular">—</td>
                <td><span className="badge gray">Countered</span></td>
                <td className="tabular" style={{ color: 'var(--slate)' }}>14 Aug</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel detail" id="detailPanel">
          <div className="detail-head">
            <div className="lbl">Round 4 · proposed by Nova Systems</div>
            <h3>Current terms on the table</h3>
          </div>

          <div className="detail-section">
            <h3>Consideration</h3>
            <div className="kv"><span className="k">Exchange ratio</span><span className="v">1.00 : 0.82</span></div>
            <div className="kv"><span className="k">Cash top-up</span><span className="v">None</span></div>
            <div className="kv"><span className="k">Implied ownership</span><span className="v">54% / 46%</span></div>
            <div className="kv"><span className="k">Structure</span><span className="v">Stock-for-stock</span></div>
          </div>

          <div className="detail-section">
            <h3>Governance terms</h3>
            <div className="kv"><span className="k">Combined board seats</span><span className="v">5 MT / 4 NS</span></div>
            <div className="kv"><span className="k">CEO, combined co.</span><span className="v">MT CEO (R. Iyer)</span></div>
            <div className="kv"><span className="k">Headquarters</span><span className="v">Under discussion</span></div>
            <div className="kv"><span className="k">Combined co. name</span><span className="v">Meridian Nova, Inc.</span></div>
          </div>

          <div className="detail-section">
            <h3>Approval status — this round</h3>
            <div className="approval-row"><span>Meridian Technologies</span><span className="approval-status"><span className="a-dot pending"></span>Reviewing</span></div>
            <div className="approval-row"><span>Nova Systems</span><span className="approval-status"><span className="a-dot done"></span>Proposed</span></div>
          </div>

          <div className="detail-actions">
            <button className="btn btn-approve">Accept these terms</button>
            <button className="btn btn-ghost">Counter-propose</button>
            <button className="btn btn-ghost">Request governance change only</button>
          </div>
        </div>
      </div>

      <footer>
        <span>Every proposal round is written to the joint deal record and visible to both companies' boards.</span>
        <span>Visible to: Both parties' deal teams — 6 roles</span>
      </footer>
    </div>
  );
}
