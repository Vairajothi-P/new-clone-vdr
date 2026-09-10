export default function MergeGovernancePage() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Governance &amp; structure</h1>
          <div className="sub">Combined-entity terms — separate from consideration, negotiated in parallel</div>
        </div>
        <a href="#" className="btn btn-primary">Propose a change</a>
      </div>

      <div className="entity-strip">
        <div className="es-item"><div className="es-label">Combined entity name</div><div className="es-value">Meridian Nova, Inc.</div></div>
        <div className="es-item"><div className="es-label">Headquarters</div><div className="es-value">Under discussion</div></div>
        <div className="es-item"><div className="es-label">Combined CEO</div><div className="es-value">R. Iyer (Meridian)</div></div>
        <div className="es-item"><div className="es-label">Board size</div><div className="es-value">9 seats</div></div>
      </div>

      <div className="grid">

        <div className="panel">
          <div className="panel-head"><h2>Board composition</h2><span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>9 seats total</span></div>
          <div className="board-split"><div style={{ width: '56%' }}></div><div style={{ width: '44%' }}></div></div>
          <div className="board-legend"><span className="a">Meridian nominates 5</span><span className="b">Nova nominates 4</span></div>
          <div className="seat-row"><span className="co-mark a">MT</span>R. Iyer <span className="seat-role">Chair &amp; CEO</span></div>
          <div className="seat-row"><span className="co-mark a">MT</span>A. Ferreira <span className="seat-role">Independent</span></div>
          <div className="seat-row"><span className="co-mark a">MT</span>S. Menon <span className="seat-role">Director</span></div>
          <div className="seat-row"><span className="co-mark a">MT</span>K. Wallace <span className="seat-role">Director</span></div>
          <div className="seat-row"><span className="co-mark a">MT</span>Seat TBD <span className="seat-role">Independent</span></div>
          <div className="seat-row"><span className="co-mark b">NS</span>J. Park <span className="seat-role">Vice Chair</span></div>
          <div className="seat-row"><span className="co-mark b">NS</span>D. Okonjo <span className="seat-role">Director</span></div>
          <div className="seat-row"><span className="co-mark b">NS</span>L. Bianchi <span className="seat-role">Director</span></div>
          <div className="seat-row"><span className="co-mark b">NS</span>Seat TBD <span className="seat-role">Independent</span></div>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Combined leadership</h2></div>
          <table className="mgmt">
            <tbody>
              <tr><td className="role">Chief Executive Officer</td><td className="person"><span className="co-mark a">MT</span>R. Iyer</td></tr>
              <tr><td className="role">Chief Financial Officer</td><td className="person"><span className="co-mark b">NS</span>T. Alvarez</td></tr>
              <tr><td className="role">Chief Operating Officer</td><td className="person"><span className="co-mark a">MT</span>H. Desai</td></tr>
              <tr><td className="role">Chief Technology Officer</td><td className="person"><span className="co-mark b">NS</span>M. Chen</td></tr>
              <tr><td className="role">Chief Revenue Officer</td><td className="person" style={{ color: 'var(--slate-light)', fontWeight: '400' }}>Under discussion</td></tr>
              <tr><td className="role">General Counsel</td><td className="person"><span className="co-mark a">MT</span>P. Nakamura</td></tr>
            </tbody>
          </table>
        </div>

        <div className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-head"><h2>Open structural terms</h2><span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Negotiated alongside the exchange ratio</span></div>
          <div className="field-row">
            <label>Headquarters location <span className="status open">Open</span></label>
            <input type="text" placeholder="e.g. Joint HQ, or Meridian's existing campus" />
          </div>
          <div className="field-row">
            <label>Combined entity name <span className="status agreed">Agreed</span></label>
            <input type="text" value="Meridian Nova, Inc." disabled style={{ color: 'var(--slate-light)' }} />
          </div>
          <div className="field-row">
            <label>Stock ticker (if applicable) <span className="status open">Open</span></label>
            <input type="text" placeholder="e.g. MRDN" />
          </div>
          <div className="field-row">
            <label>Employee retention terms <span className="status open">Open</span></label>
            <input type="text" placeholder="e.g. 90% of leadership retained, 24-month terms" />
          </div>
        </div>

      </div>
    </>
  );
}
