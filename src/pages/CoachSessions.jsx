import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { SKILLS } from '../data/seed.js';
import { Avatar, Badge, Card, Empty, Modal, fmtDate, fmtTime, fmtWhen, statusTone, statusLabel, usd, useToast } from '../components/ui.jsx';

function CompleteModal({ booking, onClose }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const pl = state.players[booking.playerId];
  const first = pl.name.split(' ')[0];
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState(`${first} has improved defensive positioning awareness. Continue working on rotation timing and recovery.`);
  const [skillKey, setSkillKey] = useState('defense');
  const [delta, setDelta] = useState(3);
  const hasSkills = Boolean(pl.skills);
  return (
    <Modal title={`Complete session ${booking.sessionsCompleted + 1} of ${booking.sessions}`} onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-ok" disabled={!feedback.trim()} onClick={() => { actions.completeSession(booking.id, { notes, feedback, skillKey: hasSkills ? skillKey : null, delta: hasSkills ? Number(delta) : 0 }); toast('Session completed and feedback sent'); onClose(); }}>Mark completed and send feedback</button></>}>
      <p className="small muted">{pl.name} · {booking.title}</p>
      <div className="field"><label>Session notes (private)</label><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Drills covered, observations..." /></div>
      {hasSkills && <div className="grid g2">
        <div className="field"><label>Skill assessed</label><select value={skillKey} onChange={(e) => setSkillKey(e.target.value)}>{SKILLS.map((k) => <option key={k.key} value={k.key}>{k.name}</option>)}</select></div>
        <div className="field"><label>Score change (0 to 5)</label><input type="number" min="0" max="5" value={delta} onChange={(e) => setDelta(Math.max(0, Math.min(5, Number(e.target.value))))} /></div>
      </div>}
      <div className="field"><label>Feedback for the player</label><textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></div>
    </Modal>
  );
}

export default function CoachSessions() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [active, setActive] = useState(null);
  const mine = state.bookings.filter((b) => b.coachId === 'dani' && !['pending_payment', 'cancelled'].includes(b.status));
  const done = state.sessions.filter((s) => s.coachId === 'dani');
  const activeBooking = state.bookings.find((b) => b.id === active);
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Bookings and sessions</h1><p className="muted">Accept bookings, complete sessions and send feedback.</p></div>
      {mine.length === 0 ? <Empty title="No bookings yet">Paid bookings appear here.</Empty> : mine.map((b) => {
        const pl = state.players[b.playerId];
        const pay = state.payments.find((p) => p.id === b.paymentId);
        return (
          <Card key={b.id}>
            <div className="row between">
              <div className="row"><Avatar name={pl.name} size={44} /><div><h3>{pl.name}</h3><div className="small muted">{pl.game} · {pl.rank} · {pl.location}</div></div></div>
              <Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge>
            </div>
            <div className="small mt-s"><b>{b.title}</b> · {fmtDate(b.date)}, {fmtTime(b.time)} · Ref {b.ref}</div>
            <div className="small muted">Sessions {b.sessionsCompleted}/{b.sessions} · Package {usd(b.price)} · Payment {pay?.status || 'n/a'}{pay?.provider === 'simulated' ? ' (simulated)' : pay?.provider === 'paypal-sandbox' ? ' (PayPal Sandbox)' : ''}</div>
            {b.status !== 'completed' && <div className="row mt">
              {!b.coachAccepted && <button className="btn btn-sm btn-primary" onClick={() => { actions.coachAccept(b.id); toast('Booking accepted'); }}>Accept booking</button>}
              <button className="btn btn-sm btn-ok" onClick={() => setActive(b.id)}>Complete session</button></div>}
          </Card>);
      })}
      <Card title="Completed sessions">
        {done.length === 0 ? <p className="muted small">None yet.</p> : done.map((s) => (
          <div key={s.id} className="sum-line"><div><b className="small">{state.players[s.playerId].name}: {s.title}</b><div className="small muted">{s.feedback} · {fmtWhen(s.completedAt)}</div></div><Badge tone={s.teamConfirmed ? 'success' : 'warning'}>{s.teamConfirmed ? 'Team confirmed' : 'Awaiting team'}</Badge></div>))}
      </Card>
      {activeBooking && <CompleteModal booking={activeBooking} onClose={() => setActive(null)} />}
    </div>
  );
}
