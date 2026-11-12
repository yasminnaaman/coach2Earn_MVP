import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, VERIF_LABEL } from '../store.jsx';
import { trustAgent } from '../agents.js';
import { Avatar, Badge, Card, Stat, fmtWhen, useToast } from '../components/ui.jsx';

function Submission({ v }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [note, setNote] = useState('');
  const coach = state.coaches.find((c) => c.id === v.coachId);
  const analysis = trustAgent(state, v.id);
  const open = v.status === 'pending' || v.status === 'info_requested';
  const decide = (d) => { actions.verificationDecision(v.id, d, note); setNote(''); toast('Decision recorded'); };
  return (
    <Card>
      <div className="row between">
        <div className="row"><Avatar name={coach.name} size={46} /><div><h3>{coach.name}</h3><div className="small muted">{coach.game} · submitted {fmtWhen(v.submittedAt)}</div></div></div>
        <Badge tone={v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'error' : 'warning'}>{v.status === 'pending' ? 'Pending review' : VERIF_LABEL[coach.verification] || v.status}</Badge>
      </div>
      <div className="grid g2 mt">
        <div>
          <b>Submitted evidence</b>
          <ul className="small">
            <li>Experience claimed: {v.claim.years} years</li><li>Specialisation: {v.claim.game}</li>
            <li>Competition history: {v.claim.competition || <i>not provided</i>}</li>
            <li>Endorsements: {v.claim.endorsementsAttached} attached of {v.claim.endorsementsClaimed} claimed</li>
            {v.credentials.map((c) => <li key={c.title}>{c.title} <span className="muted">({c.note})</span></li>)}
          </ul>
        </div>
        <div>
          <b>AI-assisted analysis (suggestion only)</b>
          <ul className="small">{[...analysis.missing, ...analysis.flags].map((m) => <li key={m}>{m}</li>)}{!analysis.missing.length && !analysis.flags.length && <li>No flags.</li>}</ul>
          <div className="notice small">Suggestion: <b>{analysis.recommendation}</b>. The decision belongs to the human reviewer.</div>
        </div>
      </div>
      {open && <div className="mt">
        <label>Decision note</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for your decision" />
        <div className="row mt-s"><button className="btn btn-ok btn-sm" onClick={() => decide('approve')}>Approve</button><button className="btn btn-sm" onClick={() => decide('info')}>Request more information</button><button className="btn btn-sm btn-danger" onClick={() => decide('reject')}>Reject</button></div>
      </div>}
      <div className="mt"><b className="small">Audit trail</b>{v.audit.map((a, i) => <div key={i} className="small muted">{fmtWhen(a.ts)} · {a.actor}: {a.action}</div>)}</div>
    </Card>
  );
}

export default function ReviewerDashboard() {
  const { state } = useStore();
  const pending = state.verifications.filter((v) => v.status === 'pending').length;
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Coach verification queue</h1><p className="muted">A human reviewer makes every verification decision. <Link to="/app/assistant">Open the trust assistant</Link></p></div>
      <div className="grid g3">
        <Stat label="Pending" value={pending} /><Stat label="Decided" value={state.verifications.length - pending} /><Stat label="Reports and disputes" value={0} sub="none open (demo)" />
      </div>
      {state.verifications.map((v) => <Submission key={v.id} v={v} />)}
    </div>
  );
}
