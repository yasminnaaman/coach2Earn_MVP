import React from 'react';
import { Link } from 'react-router-dom';
import { useStore, devScore, completedCount, passportPct, isVerified, VERIF_LABEL } from '../store.jsx';
import { coachMatchingAgent, developmentInsight } from '../agents.js';
import { SKILLS } from '../data/seed.js';
import { Avatar, Badge, Card, Stat, Progress, Stars, LineChart, Empty, fmtDate, fmtTime, fmtWhen, statusTone, statusLabel } from '../components/ui.jsx';

export default function PlayerDashboard() {
  const { state } = useStore();
  const p = state.players.alex;
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const ds = devScore(p);
  const baseAvg = Math.round(SKILLS.reduce((a, k) => a + p.skills[k.key].baseline, 0) / SKILLS.length);
  const upcoming = state.bookings.filter((b) => b.playerId === 'alex' && ['confirmed', 'in_progress', 'pending_payment'].includes(b.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const next = upcoming.find((b) => b.status !== 'pending_payment');
  const top = coachMatchingAgent(state, `Rocket League coach, budget $${p.budget}`).results[0];
  const c = top.coach;
  const milestones = state.timeline.filter((t) => t.kind === 'milestone').length;
  const rows = SKILLS.map((k) => ({ ...k, ...p.skills[k.key] }));

  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="page-head"><h1>{greet}, Alex.</h1><p className="muted">Your next competitive level starts with consistent development.</p></div>
      <div className="grid g3">
        <Stat label="Current rank" value={p.rank} sub={p.game} />
        <Stat label="Skills Passport" value={`${passportPct(state, p)}%`} sub="complete" />
        <Stat label="Sessions completed" value={completedCount(state, p)} sub="incl. seeded history" />
        <Stat label="Active programme" value={p.programme} sub="self-guided plan" />
        <Stat label="Development score" value={`${ds}/100`} sub="average of skill scores" />
        <Stat label="Next session" value={next ? `${fmtDate(next.date)}, ${fmtTime(next.time)}` : 'None booked'} sub={next ? `${state.coaches.find((x) => x.id === next.coachId).name}` : ''} />
      </div>

      <div className="grid g-main">
        <div className="col">
          <Card title="Development overview" action={<Link to="/app/progress" className="small">Full progress</Link>}>
            <div className="grid g2">
              <div><LineChart data={p.scoreHistory} /><div className="small muted">Score history (seeded demo data, plus updates after coach assessments)</div></div>
              <div className="col" style={{ gap: 8 }}>
                <div className="sum-line"><span>Skill improvement</span><b>{ds - baseAvg >= 0 ? '+' : ''}{ds - baseAvg} since initial assessment</b></div>
                <div className="sum-line"><span>Training consistency</span><b>{p.consistency}% (demo)</b></div>
                <div className="sum-line"><span>Completed milestones</span><b>{milestones}</b></div>
              </div>
            </div>
          </Card>
          <Card title="Your development areas">
            <div className="table-wrap"><table>
              <thead><tr><th>Skill</th><th>Current</th><th>Target</th><th style={{ width: '35%' }}>Progress</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.key}><td>{r.name}</td><td><b>{r.current}</b></td><td>{r.target}</td><td><Progress value={r.current} target={r.target} color={r.target - r.current >= 15 ? 'var(--warn)' : undefined} /></td></tr>
              ))}</tbody>
            </table></div>
          </Card>
          <Card title="Upcoming sessions">
            {upcoming.length === 0 ? <Empty title="No upcoming sessions">Book a coach to get started.</Empty> : upcoming.map((b) => (
              <div key={b.id} className="sum-line"><div><b>{b.title}</b><div className="small muted">{state.coaches.find((x) => x.id === b.coachId).name} · {fmtDate(b.date)}, {fmtTime(b.time)}</div></div><Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge></div>
            ))}
          </Card>
        </div>
        <div className="col">
          <Card title="Recommended coach" className="">
            <div className="row" style={{ marginBottom: 8 }}><Avatar name={c.name} size={52} /><div className="grow"><h3>{c.name}</h3><div className="small muted">{c.game} specialist</div></div><span className="match-pill">{top.total}%</span></div>
            <div className="row between small"><Stars rating={c.rating} count={c.reviewCount} /><span>{c.years}+ years</span></div>
            <div className="mt-s"><Badge tone={isVerified(c) ? 'success' : 'warning'}>{VERIF_LABEL[c.verification]}</Badge></div>
            <div className="small mt-s">${c.singlePrice} single · ${c.fivePrice} five sessions</div>
            <Link className="btn btn-primary btn-block mt" to={`/app/coaches/${c.id}`}>View profile</Link>
          </Card>
          <Card title="AI development insight">
            <p>{developmentInsight(state)}</p>
            <Link to="/app/assistant" className="btn btn-sm">Ask the assistant</Link>
          </Card>
          <Card title="Recent activity">
            {state.timeline.slice(0, 5).map((t) => <div key={t.id} className="sum-line"><div><b className="small">{t.title}</b></div><span className="small muted">{fmtWhen(t.ts)}</span></div>)}
          </Card>
        </div>
      </div>
    </div>
  );
}
