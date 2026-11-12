import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, getCoach } from '../store.jsx';
import { Badge, Card, Empty, fmtDate, fmtTime, statusTone, statusLabel, usd, useToast } from '../components/ui.jsx';

export default function Bookings() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const mine = state.bookings.filter((b) => b.playerId === 'alex');
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Bookings</h1><p className="muted">Your coaching bookings and their payment status.</p></div>
      {mine.length === 0 ? <Empty title="No bookings yet"><Link to="/app/coaches">Find a coach</Link></Empty> : mine.map((b) => {
        const coach = getCoach(state, b.coachId);
        const pay = state.payments.find((p) => p.id === b.paymentId);
        return (
          <Card key={b.id}>
            <div className="row between">
              <div><h3>{b.title}</h3><div className="small muted">{coach.name} · {fmtDate(b.date)}, {fmtTime(b.time)} · Ref {b.ref}</div></div>
              <Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge>
            </div>
            <div className="row mt-s small">
              <span>Sessions: <b>{b.sessionsCompleted}/{b.sessions}</b></span><span>Total: <b>{usd(b.total)}</b></span>
              {pay && <span>Payment: <b>{pay.status}</b>{pay.provider === 'simulated' && <> <span className="sim-tag">SIMULATED</span></>}</span>}
            </div>
            {b.status === 'pending_payment' && <div className="row mt"><button className="btn btn-primary btn-sm" onClick={() => nav(`/app/book/${b.coachId}?resume=${b.ref}`)}>Resume payment</button><button className="btn btn-sm btn-danger" onClick={() => { actions.cancelBooking(b.id); toast('Booking cancelled'); }}>Cancel</button></div>}
          </Card>);
      })}
    </div>
  );
}
