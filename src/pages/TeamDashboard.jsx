import React from 'react';
import { Link } from 'react-router-dom';
import { useStore, devScore, passportPct, completedCount, teamPoints, bonusPct } from '../store.jsx';
import { Avatar, Badge, Card, Stat, Progress } from '../components/ui.jsx';

export default function TeamDashboard() {
  const { state } = useStore();
  const roster = state.team.roster.map((id) => state.players[id]);
  const pending = state.sessions.filter((s) => !s.teamConfirmed).length;
  const tp = teamPoints(state);
  const avg = Math.round(roster.reduce((a, p) => a + devScore(p), 0) / roster.length);
  const activeProg = state.bookings.filter((b) => state.team.roster.includes(b.playerId) && ['confirmed', 'in_progress'].includes(b.status)).length;
  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="page-head"><h1>{state.team.name}</h1><p className="muted">Team overview, roster development and coaching activity.</p></div>
      <div className="grid g4">
        <Stat label="Roster" value={roster.length} />
        <Stat label="Avg development score" value={`${avg}/100`} />
        <Stat label="Active coaching programmes" value={activeProg} />
        <Stat label="Awaiting confirmation" value={pending} tone={pending ? '' : 'ok'} />
      </div>
      <Card title="Team roster">
        <div className="table-wrap"><table>
          <thead><tr><th>Player</th><th>Game / rank</th><th>Passport</th><th>Dev score</th><th>Sessions</th><th>Programme</th><th /></tr></thead>
          <tbody>{roster.map((p) => (
            <tr key={p.id}>
              <td><div className="row" style={{ gap: 8 }}><Avatar name={p.name} size={32} /><b>{p.name}</b></div></td>
              <td>{p.game}<div className="small muted">{p.rank}</div></td>
              <td style={{ minWidth: 110 }}>{passportPct(state, p)}%<Progress value={passportPct(state, p)} /></td>
              <td><b>{devScore(p)}</b></td><td>{completedCount(state, p)}</td><td className="small">{p.programme}</td>
              <td><Link className="btn btn-sm" to={`/app/player/${p.id}`}>Open</Link></td>
            </tr>))}</tbody>
        </table></div>
        <div className="small muted mt-s">Scores and history are seeded demo data, updated by coach assessments in this demo.</div>
      </Card>
      <div className="grid g2">
        <Card title="Coaching points (demo)">
          <div className="stat-value">{tp} points</div>
          <p className="small muted">10 points per team-confirmed coaching hour. Projected bonus: <b>{bonusPct(tp).toFixed(2)}%</b> (projected, not approved or paid; points are not cash).</p>
        </Card>
        <Card title="Session confirmations">
          <p>{pending} session(s) awaiting your confirmation.</p>
          <Link to="/app/sessions" className="btn btn-primary btn-sm">Review sessions</Link>
        </Card>
      </div>
    </div>
  );
}
