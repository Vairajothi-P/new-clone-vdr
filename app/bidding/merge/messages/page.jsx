export default function MergeMessagesPage() {
  return (
    <div className="messages-layout">
      <div className="thread-list">
        <div className="thread-list-head">Joint conversation — Nova Systems</div>
        <div className="thread-item active">
          <div className="tt">General</div>
          <div className="tp">T. Alvarez: HQ clause still needs resolution...</div>
          <div className="tm">8 Sep</div>
        </div>
        <div className="thread-item">
          <div className="tt">Financials Q&amp;A <span className="unread-dot"></span></div>
          <div className="tp">Nova: Synergy timeline assumptions attached</div>
          <div className="tm">3 Sep</div>
        </div>
        <div className="thread-item">
          <div className="tt">Legal / governance</div>
          <div className="tp">You: Termination fee language finalized</div>
          <div className="tm">8 Sep</div>
        </div>
        <div className="thread-item">
          <div className="tt">Operations Q&amp;A</div>
          <div className="tp">Nova: Uploaded combined org chart draft</div>
          <div className="tm">1 Sep</div>
        </div>
      </div>

      <div className="conv">
        <div className="conv-head">
          <div>
            <h2>General — Nova Systems</h2>
            <div className="cs">Nova team: J. Park (CEO), T. Alvarez (CFO/Counsel)</div>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--slate-light)' }}>Jointly visible to both boards</span>
        </div>

        <div className="conv-body">
          <div className="msg them">
            <div className="bubble">Our board is comfortable with the 1.00:0.82 ratio. The open item now is really just the HQ decision before we can move to signing.</div>
            <div className="meta">J. Park · 5 Sep, 10:02 AM</div>
          </div>
          <div className="msg me">
            <div className="bubble">Agreed — we're proposing to keep the Meridian campus as primary HQ with a Nova regional office retained. Sending the governance page update now.</div>
            <div className="meta">You · 5 Sep, 2:30 PM</div>
          </div>
          <div className="msg them">
            <div className="bubble">Termination fee language still needs a final look from our side, but no objection in principle to $8.0M.</div>
            <div className="meta">T. Alvarez · 8 Sep, 9:15 AM</div>
          </div>
          <div className="msg them">
            <div className="bubble">HQ clause still needs resolution before this can go to our board for approval.</div>
            <div className="meta">T. Alvarez · 8 Sep, 11:15 AM</div>
          </div>
        </div>

        <div className="composer">
          <textarea rows="3" placeholder="Write a message to the Nova team..."></textarea>
          <div className="composer-actions">
            <div className="composer-tags">
              <span className="cf-tag active">General</span>
              <span className="cf-tag">Financials</span>
              <span className="cf-tag">Legal / governance</span>
              <span className="cf-tag">Operations</span>
            </div>
            <button className="btn">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
