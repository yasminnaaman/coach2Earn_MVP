import React from 'react';
import { useStore } from '../store.jsx';
import { Card, fmtWhen } from '../components/ui.jsx';

export default function Activity() {
  const { state } = useStore();
  const bookingEvents = state.bookings.filter((b) => b.status !== 'pending_payment').map((b) => ({ id: b.id, ts: b.createdAt, text: `Booking ${b.ref}: ${b.title} with ${state.coaches.find((c) => c.id === b.coachId).name} (${b.status})` }));
  const all = [...state.activity, ...bookingEvents].sort((a, b) => b.ts.localeCompare(a.ts));
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Platform activity</h1></div>
      <Card title="Recent activity">{all.map((a) => <div key={a.id} className="sum-line"><span>{a.text}</span><span className="small muted">{fmtWhen(a.ts)}</span></div>)}</Card>
      <Card title="Reports and disputes"><p className="muted small">No open reports or disputes (demo).</p></Card>
    </div>
  );
}
