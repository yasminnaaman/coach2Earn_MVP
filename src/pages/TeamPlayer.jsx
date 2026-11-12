import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore, devScore, passportPct, completedCount, playerSessions, confirmedHours, playerPoints } from '../store.jsx';
import { SKILLS } from '../data/seed.js';
import { SessionList } from './TeamSessions.jsx';
import { Avatar, Card, Stat, Progress, LineChart, fmtWhen } from '../components/ui.jsx';

export default function TeamPlayer() {
  const { id } = useParams();
  const { state } = useStore();
  const p = state.players[id];
  if (!p || !state.team.roster.includes(id)) return <Card>Player not found. <Link to="/app">Back</Link></Card>;
  const sessions = playerSessions(state, id);
  return (
    <div className="col" style={{ gap: 18 }}>
      <Link to="/app" className="small">← Back to team overview</Link>
      <Card><div className="row"><Avatar name={p.name} size={64} /><div><h1>{p.name}</h1><div className="muted">{p.game} · {p.rank} · {p.location}</div></div></div></Card>
      <div className="grid g4">
        <Stat label="Passport" value={`${passportPct(state, p)}%`} />
        <Stat label="Development score" value={`${devScore(p)}/100`} />
        <Stat label="Sessions" value={completedCount(state, p)} />
        <Stat label="Points" value={playerPoints(state, p)} sub={`${confirmedHours(state, id)} new confirmed hour(s)`} />
      </div>
      <div className="grid g2">
        {p.skills ? <Card title="Skill progress">
          {SKILLS.map((k) => { const s = p.skills[k.key]; return <div key={k.key} className="field"><div className="row between small"><b>{k.name}</b><span>{s.baseline} to {s.current} (target {s.target})</span></div><Progress value={s.current} target={s.target} /></div>; })}
          <LineChart data={p.scoreHistory} /></Card> : <Card title="Skill progress"><p className="muted">Detailed skill data is only seeded for Alex Mwangi in this demo.</p></Card>}
        <Card title="Coaching sessions"><SessionList sessions={sessions} emptyText="No recorded sessions for this player yet." /></Card>
      </div>
      {id === 'alex' && <Card title="Development timeline"><ul className="timeline">{state.timeline.slice(0, 8).map((t) => <li key={t.id} className={t.kind}><b>{t.title}</b><div className="small muted">{t.detail} · {fmtWhen(t.ts)}</div></li>)}</ul></Card>}
    </div>
  );
}
