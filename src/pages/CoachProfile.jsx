import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore, getCoach, openSlots, quoteFor, coachStats } from '../store.jsx';
import { VerifBadge } from '../components/CoachCard.jsx';
import { Avatar, Card, Stars, Stat, fmtDate, fmtTime } from '../components/ui.jsx';

export default function CoachProfile({ own }) {
  const { id } = useParams();
  const { state } = useStore();
  const nav = useNavigate();
  const coach = getCoach(state, own ? 'dani' : id);
  if (!coach) return <Card><p>Coach not found.</p><Link to="/app/coaches">Back to coaches</Link></Card>;
  const slots = openSlots(state, coach.id);
  const stats = coachStats(state, coach.id);
  const pkgs = [
    { type: 'single', name: 'Single assessment', detail: ['60 minutes', 'Skill assessment', 'Written feedback'] },
    { type: 'five', name: 'Five-session programme', detail: ['Five sessions', 'Personalised development plan', 'Progress assessment', 'Feedback after sessions'], popular: true },
  ];
  return (
    <div className="col" style={{ gap: 20 }}>
      {!own && <Link to="/app/coaches" className="small">← Back to coaches</Link>}
      <Card>
        <div className="row">
          <Avatar name={coach.name} size={84} />
          <div className="grow">
            <h1>{coach.name}</h1>
            <div className="muted">{coach.game} coach · {coach.location} · {coach.languages.join(', ')}</div>
            <div className="row mt-s"><Stars rating={coach.rating} count={coach.reviewCount} /><VerifBadge coach={coach} /></div>
          </div>
          {!own && <button className="btn btn-primary" onClick={() => nav(`/app/book/${coach.id}?pkg=five`)}>Book a session</button>}
        </div>
        <p className="mt">{coach.bio}</p>
        <div className="tags">{coach.specialisations.map((s) => <span key={s} className="tag">{s}</span>)}</div>
        <div className="small muted mt-s">Profile content is demo data.</div>
      </Card>
      <div className="grid g4">
        <Stat label="Experience" value={`${coach.years}+ yrs`} />
        <Stat label="Endorsements" value={coach.endorsements} />
        <Stat label="Sessions on Coach2Earn" value={stats.totalSessions} sub="seeded base + completed here" />
        <Stat label="Open slots" value={slots.length} />
      </div>
      <div className="grid g2">
        <Card title="Coaching philosophy"><p>{coach.philosophy}</p></Card>
        <Card title="Credentials and achievements">
          {coach.credentials.map((c) => <div key={c.title} className="sum-line"><div><b className="small">{c.title}</b><div className="small muted">{c.note}</div></div></div>)}
          <div className="small muted mt-s">Verification: {coach.verification === 'demo_verified' ? 'a seeded demo status, not a real review.' : 'see status above.'}</div>
        </Card>
      </div>
      <Card title="Coaching packages">
        <div className="grid g2">
          {pkgs.map((p) => { const q = quoteFor(coach, p.type); return (
            <div key={p.type} className="pkg" style={{ cursor: 'default' }}>
              <div className="row between"><b>{p.name}</b>{p.popular && <span className="badge badge-info">Recommended for programmes</span>}</div>
              <div className="pkg-price">${q.price}<span className="small muted"> / package</span></div>
              <ul>{p.detail.map((d) => <li key={d}>{d}</li>)}</ul>
              {!own && <button className="btn btn-primary btn-block mt" onClick={() => nav(`/app/book/${coach.id}?pkg=${p.type}`)}>Select</button>}
            </div>); })}
        </div>
      </Card>
      <div className="grid g2">
        <Card title="Reviews">
          {coach.reviews.map((r, i) => <div key={i} className="sum-line"><div><Stars rating={r.stars} /> <span className="small muted">{r.by}</span><div className="small">{r.text}</div></div></div>)}
          <div className="small muted mt-s">Sample reviews (demo data).</div>
        </Card>
        <Card title="Availability">
          {slots.length === 0 ? <p className="muted">No open slots.</p> : slots.slice(0, 8).map((s) => <div key={s.id} className="sum-line"><span>{fmtDate(s.date)}</span><b>{fmtTime(s.time)}</b></div>)}
        </Card>
      </div>
    </div>
  );
}
