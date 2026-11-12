import React from 'react';
import { Link } from 'react-router-dom';
import { useStore, devScore, confirmedHours, playerPoints, teamPoints, bonusPct } from '../store.jsx';
import { SKILLS } from '../data/seed.js';
import { developmentAgent } from '../agents.js';
import { Card, Stat, Progress as Bar, LineChart, fmtWhen, Badge } from '../components/ui.jsx';

export function PointsCard({ state, playerId }) {
  const p = state.players[playerId];
  const hrs = confirmedHours(state, playerId);
  const pts = playerPoints(state, p);
  const tp = teamPoints(state);
  const pct = bonusPct(tp);
  return (
    <Card title="Coaching points (demo)">
      <div className="grid g2">
        <Stat label="Confirmed hours (new)" value={hrs} sub="team-confirmed in this demo" />
        <Stat label="Player points" value={pts} sub="10 points per confirmed hour; 80 seeded" />
        <Stat label="Team points" value={tp} sub="Nairobi Drift" />
        <Stat label="Projected bonus" value={`${pct.toFixed(2)}%`} sub="projected, not approved or paid" />
      </div>
      <p className="small muted mt-s">Bonus = min(10%, team points x 0.025%). Only team-confirmed sessions count. Points are not withdrawable cash. Bonus eligibility: {pct >= 10 ? 'maximum reached' : `${(10 - pct).toFixed(2)}% below the 10% cap`} (projection only).</p>
    </Card>
  );
}

export default function Progress() {
  const { state } = useStore();
  const p = state.players.alex;
  const plan = developmentAgent(state).plan;
  const next = state.sessions.some((s) => s.playerId === 'alex' && s.bookingId);
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Progress and milestones</h1><p className="muted">Seeded figures are demo data. Improvements after sessions come from coach assessments and should not be read as proof that one session caused a large change.</p></div>
      <div className="grid g2">
        <Card title="Development score"><LineChart data={p.scoreHistory} /><div className="small muted">Now {devScore(p)}/100</div></Card>
        <Card title="Before and after (initial assessment: demo data)">
          {SKILLS.map((k) => { const s = p.skills[k.key]; return (
            <div key={k.key} className="field"><div className="row between small"><b>{k.name}</b><span>{s.baseline} to <b>{s.current}</b> {s.current > s.baseline && <Badge tone="success">+{s.current - s.baseline}</Badge>}</span></div><Bar value={s.current} target={s.target} /></div>); })}
        </Card>
      </div>
      <PointsCard state={state} playerId="alex" />
      <div className="grid g2">
        <Card title="Development timeline"><ul className="timeline">{state.timeline.map((t) => <li key={t.id} className={t.kind}><b>{t.title}</b><div className="small muted">{t.detail} · {fmtWhen(t.ts)}</div></li>)}</ul></Card>
        <div className="col">
          <Card title="Next recommended training step">
            <p className="small">{next ? `Continue the ${plan.gapName.toLowerCase()} work: ${plan.weeks[1].focus}. ${plan.weeks[1].objective}` : `Start with ${plan.weeks[0].focus}. ${plan.weeks[0].objective}`}</p>
            <Link to="/app/assistant" className="btn btn-sm">Open development plan</Link>
          </Card>
          <Card title="Saved plans">{state.plans.length === 0 ? <p className="muted small">No saved plans yet. Generate one in the AI assistant.</p> : state.plans.map((pl) => <div key={pl.id} className="sum-line"><b className="small">{pl.title}</b><span className="small muted">{fmtWhen(pl.savedAt)}</span></div>)}</Card>
        </div>
      </div>
    </div>
  );
}
