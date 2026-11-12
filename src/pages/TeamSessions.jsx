import React from 'react';
import { useStore, getCoach } from '../store.jsx';
import { Badge, Card, Empty, fmtDate, fmtWhen, useToast } from '../components/ui.jsx';

export function SessionList({ sessions, emptyText }) {
  const { state, actions } = useStore();
  const toast = useToast();
  if (!sessions.length) return <Empty title="No sessions">{emptyText}</Empty>;
  return sessions.map((s) => (
    <div key={s.id} className="sum-line">
      <div>
        <b>{state.players[s.playerId].name}: {s.title}</b>
        <div className="small muted">{getCoach(state, s.coachId).name} · {fmtDate(s.date)} · {s.hours}h</div>
        <div className="small">Feedback: {s.feedback}</div>
        {s.assessment && <div className="small muted">Coach assessment recorded: {s.assessment.from} to {s.assessment.to}</div>}
        {s.teamConfirmed && <div className="small muted">Confirmed {fmtWhen(s.confirmedAt)}</div>}
      </div>
      <div>{s.teamConfirmed ? <Badge tone="success">Confirmed (+{10 * s.hours} pts)</Badge> :
        <button className="btn btn-sm btn-ok" onClick={() => { actions.teamConfirm(s.id); toast('Session confirmed'); }}>Confirm session took place</button>}</div>
    </div>));
}

export default function TeamSessions() {
  const { state } = useStore();
  const list = state.sessions.filter((s) => state.team.roster.includes(s.playerId));
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Session confirmations</h1><p className="muted">Only confirmed sessions count toward coaching points.</p></div>
      <Card><SessionList sessions={list} emptyText="Completed coaching sessions appear here." /></Card>
    </div>
  );
}
