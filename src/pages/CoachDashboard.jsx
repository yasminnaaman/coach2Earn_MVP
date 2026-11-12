import React from 'react';
import { Link } from 'react-router-dom';
import { useStore, getCoach, coachStats, coachEarnings, openSlots } from '../store.jsx';
import { Avatar, Badge, Card, Stat, Stars, Empty, fmtDate, fmtTime, statusTone, statusLabel, useToast } from '../components/ui.jsx';

export default function CoachDashboard() {
  const { state, actions } = useStore();
  const toast = useToast();
  const coach = getCoach(state, 'dani');
  const st = coachStats(state, 'dani');
  const earn = coachEarnings(state, 'dani');
  const requests = state.bookings.filter((b) => b.coachId === 'dani' && b.status === 'confirmed' && !b.coachAccepted);
  const slots = openSlots(state, 'dani');
  const h = new Date().getHours();
  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="page-head"><h1>{h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}, Dani.</h1><p className="muted">Manage bookings, sessions and your reputation.</p></div>
      <div className="grid g4">
        <Stat label="Total sessions" value={st.totalSessions} sub="seeded base + completed here" />
        <Stat label="Upcoming bookings" value={st.upcoming.length} />
        <Stat label="Active students" value={st.activeStudents} />
        <Stat label="Average rating" value={`${coach.rating}/5`} sub={`${coach.reviewCount} reviews`} />
      </div>
      <div className="grid g-main">
        <div className="col">
          <Card title={`Booking requests (${requests.length})`} action={<Link to="/app/bookings" className="small">Manage all</Link>}>
            {requests.length === 0 ? <Empty title="No pending requests">New paid bookings appear here.</Empty> : requests.map((b) => {
              const pl = state.players[b.playerId];
              return (
                <div key={b.id} className="sum-line">
                  <div className="row"><Avatar name={pl.name} size={38} /><div><b>{pl.name}</b><div className="small muted">{b.title} · {fmtDate(b.date)}, {fmtTime(b.time)} · {b.ref}</div></div></div>
                  <div className="row"><Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge>
                    <button className="btn btn-sm btn-primary" onClick={() => { actions.coachAccept(b.id); toast('Booking accepted'); }}>Accept</button>
                    <Link className="btn btn-sm" to="/app/bookings">Open</Link></div>
                </div>);
            })}
          </Card>
          <Card title="Recent reviews">{coach.reviews.map((r, i) => <div key={i} className="sum-line"><div><Stars rating={r.stars} /> <span className="small muted">{r.by}</span><div className="small">{r.text}</div></div></div>)}<div className="small muted mt-s">Sample reviews (demo data).</div></Card>
        </div>
        <div className="col">
          <Card title="Earnings (simulated ledger)">
            <div className="stat-value">${earn.total.toFixed(2)}</div>
            <div className="small muted">Includes ${earn.fromBookings.toFixed(2)} from bookings made in this demo. No payouts are processed.</div>
            <Link to="/app/earnings" className="btn btn-sm mt-s">View ledger</Link>
          </Card>
          <Card title="Availability">{slots.slice(0, 6).map((s) => <div key={s.id} className="sum-line"><span>{fmtDate(s.date)}</span><b>{fmtTime(s.time)}</b></div>)}<div className="small muted mt-s">{slots.length} open slots</div></Card>
        </div>
      </div>
    </div>
  );
}
