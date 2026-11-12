import React from 'react';
import { Link } from 'react-router-dom';
import { useStore, isVerified, VERIF_LABEL, openSlots } from '../store.jsx';
import { Avatar, Badge, Stars, fmtDate, fmtTime } from './ui.jsx';

export function VerifBadge({ coach }) {
  return <Badge tone={isVerified(coach) ? 'success' : coach.verification === 'rejected' ? 'error' : 'warning'}>{isVerified(coach) ? '✓ ' : ''}{VERIF_LABEL[coach.verification]}</Badge>;
}

export default function CoachCard({ coach, match, linkBase = '/app/coaches', actions }) {
  const { state } = useStore();
  const slots = openSlots(state, coach.id);
  const next = slots[0];
  return (
    <div className="card coach-card">
      <div className="coach-top">
        <Avatar name={coach.name} size={52} />
        <div className="grow">
          <h3>{coach.name}</h3>
          <div className="muted small">{coach.game} · {coach.location}</div>
        </div>
        {match != null && <span className="match-pill">{match}% match</span>}
      </div>
      <div className="row between"><Stars rating={coach.rating} count={coach.reviewCount} /><span className="small muted">{coach.years}+ yrs experience</span></div>
      <VerifBadge coach={coach} />
      <div className="tags">{coach.specialisations.map((s) => <span key={s} className="tag">{s}</span>)}</div>
      <p className="small muted" style={{ margin: 0 }}>{coach.bio}</p>
      <div className="small"><b>${coach.singlePrice}</b> single · <b>${coach.fivePrice}</b> five sessions</div>
      <div className="small muted">{next ? `Next available: ${fmtDate(next.date)}, ${fmtTime(next.time)} (${slots.length} open slots)` : 'No open slots right now'}</div>
      {actions || <Link className="btn btn-primary" to={`${linkBase}/${coach.id}`}>View profile</Link>}
    </div>
  );
}
