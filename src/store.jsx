import React, { createContext, useContext, useRef, useState } from 'react';
import { buildSeed, SKILLS, FEE_RATE } from './data/seed.js';

const KEY = 'c2e-demo-state-v3';
const Ctx = createContext(null);

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.version === 3) return s;
    }
  } catch (e) { /* fall through to a fresh seed */ }
  return buildSeed();
};
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore quota errors */ } };

export const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const newRef = () => 'C2E-' + Math.random().toString(36).slice(2, 8).toUpperCase();
const nowIso = () => new Date().toISOString();

// ---------- Pure selectors (all pages use these, never hardcoded numbers) ----------
export const round2 = (n) => Math.round(n * 100) / 100;
export const quoteFor = (coach, type) => {
  const price = type === 'five' ? coach.fivePrice : coach.singlePrice;
  const fee = round2(price * FEE_RATE);
  return { price, fee, total: round2(price + fee), sessions: type === 'five' ? 5 : 1, packageId: `${coach.id}-${type}` };
};
export const getCoach = (s, id) => s.coaches.find((c) => c.id === id);
export const devScore = (p) => (p.skills ? Math.round(SKILLS.reduce((a, k) => a + p.skills[k.key].current, 0) / SKILLS.length) : p.devScore);
export const slotTaken = (s, slotId) => s.bookings.some((b) => b.slotId === slotId && b.status !== 'cancelled');
export const openSlots = (s, coachId) => s.slots.filter((x) => x.coachId === coachId && !slotTaken(s, x.id));
export const playerSessions = (s, id) => s.sessions.filter((x) => x.playerId === id);
export const completedCount = (s, p) => p.sessionsBase + playerSessions(s, p.id).length;
export const confirmedHours = (s, id) => playerSessions(s, id).filter((x) => x.teamConfirmed).reduce((a, x) => a + x.hours, 0);
export const playerPoints = (s, p) => p.points + 10 * confirmedHours(s, p.id);
export const teamPoints = (s) => s.team.roster.reduce((a, id) => a + playerPoints(s, s.players[id]), 0);
export const bonusPct = (pts) => Math.min(10, pts * 0.025);
export const passportPct = (s, p) => Math.min(100, p.passportBase + 2 * (p.id === 'alex' ? s.evidence.filter((e) => e.added).length : 0));
export const isVerified = (c) => c.verification === 'demo_verified' || c.verification === 'verified';
export const VERIF_LABEL = {
  demo_verified: 'Verified (seeded demo status)',
  verified: 'Verified (human reviewed)',
  pending: 'Verification pending',
  info_requested: 'More information requested',
  rejected: 'Verification rejected',
};
export const coachEarnings = (s, coachId) => {
  const c = getCoach(s, coachId);
  const rows = s.bookings
    .filter((b) => b.coachId === coachId && b.status !== 'cancelled' && b.status !== 'pending_payment')
    .map((b) => ({ b, pay: s.payments.find((p) => p.id === b.paymentId) }))
    .filter((r) => r.pay && r.pay.status === 'Captured');
  const fromBookings = rows.reduce((a, r) => a + r.b.price, 0);
  return { rows, total: round2(c.earningsBase + fromBookings), fromBookings: round2(fromBookings) };
};
export const coachStats = (s, coachId) => {
  const c = getCoach(s, coachId);
  const mine = s.bookings.filter((b) => b.coachId === coachId && b.status !== 'cancelled' && b.status !== 'pending_payment');
  const done = s.sessions.filter((x) => x.coachId === coachId && x.bookingId).length;
  return {
    totalSessions: c.totalSessionsBase + done,
    activeStudents: c.activeStudentsBase + new Set(mine.filter((b) => b.status !== 'completed').map((b) => b.playerId)).size,
    upcoming: mine.filter((b) => b.status === 'confirmed' || b.status === 'in_progress'),
  };
};

// ---------- Provider with synchronous, persisted mutations ----------
export function StoreProvider({ children }) {
  const ref = useRef(null);
  if (!ref.current) ref.current = load();
  const [, force] = useState(0);

  const mutate = (fn) => {
    const d = structuredClone(ref.current);
    const out = fn(d);
    ref.current = d;
    save(d);
    force((n) => n + 1);
    return out;
  };
  const notify = (d, audience, title, body) => d.notifications.unshift({ id: uid('n'), audience, title, body, ts: nowIso(), read: false });
  const tl = (d, kind, title, detail) => d.timeline.unshift({ id: uid('t'), ts: nowIso(), kind, title, detail });

  const actions = {
    setRole: (role) => mutate((d) => { d.role = role; }),
    reset: () => { localStorage.removeItem(KEY); ref.current = buildSeed(); save(ref.current); force((n) => n + 1); },

    addEvidence: ({ type, title, link }) => mutate((d) => {
      d.evidence.unshift({ id: uid('ev'), type, title, link, status: 'Submitted', added: true });
      tl(d, 'event', 'Skills Passport updated', `Evidence added: ${title}`);
      notify(d, 'player', 'Skills Passport updated', `New evidence submitted: ${title}`);
    }),
    updateProfile: (patch) => mutate((d) => {
      Object.assign(d.players.alex, patch);
      tl(d, 'event', 'Profile updated', 'Skills Passport profile details edited.');
      notify(d, 'player', 'Skills Passport updated', 'Your profile details were saved.');
    }),
    savePlan: (plan) => mutate((d) => {
      d.plans.unshift({ ...plan, id: uid('plan'), savedAt: nowIso() });
      tl(d, 'event', 'Saved development plan', plan.title);
      notify(d, 'player', 'Development plan saved', plan.title);
    }),
    logMatch: (coachId) => mutate((d) => {
      const c = getCoach(d, coachId);
      if (!d.timeline.some((t) => t.title === `Matched with ${c.name}`)) tl(d, 'event', `Matched with ${c.name}`, 'Via the AI Coach Matching Agent.');
    }),

    createBooking: ({ coachId, type, slotId }) => mutate((d) => {
      const existing = d.bookings.find((b) => b.playerId === 'alex' && b.slotId === slotId && b.status === 'pending_payment');
      if (existing) return existing;
      if (slotTaken(d, slotId)) return null; // prevents double booking of a slot
      const coach = getCoach(d, coachId);
      const slot = d.slots.find((x) => x.id === slotId);
      const q = quoteFor(coach, type);
      const b = {
        id: uid('b'), ref: newRef(), playerId: 'alex', coachId, packageId: q.packageId, type, sessions: q.sessions,
        slotId, date: slot.date, time: slot.time, status: 'pending_payment', coachAccepted: false, paymentId: null,
        price: q.price, fee: q.fee, total: q.total, sessionsCompleted: 0, createdAt: nowIso(),
        title: type === 'five' ? 'Defensive Mastery programme (5 sessions)' : 'Single assessment',
      };
      d.bookings.unshift(b);
      return b;
    }),
    cancelBooking: (id) => mutate((d) => {
      const b = d.bookings.find((x) => x.id === id);
      if (b && b.status === 'pending_payment') {
        b.status = 'cancelled';
        const p = d.payments.find((x) => x.id === b.paymentId);
        if (p && p.status !== 'Captured') p.status = 'Cancelled';
      }
    }),
    // status: Pending | Approved | Captured | Failed | Cancelled. Only Captured confirms the booking.
    recordPayment: (bookingId, { status, provider, orderId, transactionId, amount, currency, timestamp }) => mutate((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b) return;
      let p = d.payments.find((x) => x.id === b.paymentId);
      if (!p) {
        p = { id: uid('p'), bookingId, bookingRef: b.ref, provider, orderId: orderId || null, transactionId: null, amount: b.total, currency: 'USD', status: 'Pending', timestamp: nowIso() };
        d.payments.unshift(p);
        b.paymentId = p.id;
      }
      if (p.status === 'Captured') return; // never downgrade a captured payment
      Object.assign(p, { status, provider: provider || p.provider, orderId: orderId || p.orderId, timestamp: timestamp || nowIso() });
      if (transactionId) p.transactionId = transactionId;
      if (amount != null) p.amount = amount;
      if (currency) p.currency = currency;
      if (status === 'Captured') {
        b.status = 'confirmed';
        const coach = getCoach(d, b.coachId);
        const sim = p.provider === 'simulated' ? ' (simulated payment)' : '';
        notify(d, 'player', 'Payment captured', `USD ${p.amount.toFixed(2)} for ${b.title}${sim}. Ref ${b.ref}.`);
        notify(d, 'player', 'Booking confirmed', `${b.title} with ${coach.name} on ${b.date} at ${b.time}.`);
        notify(d, 'coach', 'Booking request received', `Alex Mwangi booked ${b.title}${sim}.`);
        tl(d, 'event', `Booked ${b.title}`, `With ${coach.name}. Payment ${p.provider === 'simulated' ? 'simulated' : 'captured via PayPal Sandbox'}.`);
      }
      if (status === 'Failed' || status === 'Cancelled') {
        notify(d, 'player', `Payment ${status.toLowerCase()}`, `Booking ${b.ref} is still pending payment.`);
      }
    }),
    coachAccept: (id) => mutate((d) => {
      const b = d.bookings.find((x) => x.id === id);
      if (!b) return;
      b.coachAccepted = true;
      const p = d.players[b.playerId];
      notify(d, 'player', 'Booking accepted', `${getCoach(d, b.coachId).name} accepted ${b.title}.`);
      if (p) notify(d, 'team', 'Coaching booked', `${p.name} has a confirmed booking: ${b.title}.`);
    }),
    completeSession: (bookingId, { notes, feedback, skillKey, delta }) => mutate((d) => {
      const b = d.bookings.find((x) => x.id === bookingId);
      if (!b || b.status === 'completed' || b.status === 'pending_payment' || b.status === 'cancelled') return null;
      const coach = getCoach(d, b.coachId);
      const player = d.players[b.playerId];
      b.coachAccepted = true;
      b.sessionsCompleted += 1;
      b.status = b.sessionsCompleted >= b.sessions ? 'completed' : 'in_progress';
      let assessment = null;
      if (player.skills && skillKey && delta > 0) {
        const sk = player.skills[skillKey];
        const from = sk.current;
        sk.current = Math.min(100, from + delta);
        assessment = { skillKey, from, to: sk.current };
        player.scoreHistory.push({ label: `After session ${b.sessionsCompleted}`, score: devScore(player) });
      }
      const sess = {
        id: uid('s'), bookingId, playerId: b.playerId, coachId: b.coachId,
        title: `${b.title}: session ${b.sessionsCompleted} of ${b.sessions}`, date: new Date().toISOString().slice(0, 10), hours: 1,
        notes, feedback, assessment, completedAt: nowIso(), teamConfirmed: false,
      };
      d.sessions.unshift(sess);
      tl(d, 'event', `Completed coaching session ${b.sessionsCompleted} of ${b.sessions}`, `With ${coach.name}.`);
      tl(d, 'event', `Received feedback from ${coach.name}`, feedback);
      if (assessment) {
        const name = SKILLS.find((k) => k.key === assessment.skillKey).name;
        tl(d, 'event', `Improved ${name.toLowerCase()} score`, `${assessment.from} to ${assessment.to} (coach-assessed after session ${b.sessionsCompleted}).`);
      }
      if (b.sessionsCompleted === 1) tl(d, 'milestone', `Milestone: first coaching session with ${coach.name} completed`, 'Awaiting team confirmation to count toward coaching points.');
      if (b.status === 'completed') tl(d, 'milestone', `Milestone: ${b.title} finished`, `All ${b.sessions} sessions completed.`);
      notify(d, 'player', 'Session completed', `${coach.name} marked session ${b.sessionsCompleted} of ${b.sessions} complete.`);
      notify(d, 'player', 'Feedback received', feedback);
      notify(d, 'player', 'Skills Passport updated', assessment ? 'A coach skill assessment was added to your development history.' : 'Coach feedback was added to your development history.');
      notify(d, 'team', 'Session awaiting confirmation', `${player.name} completed a session with ${coach.name}. Confirm it to award coaching points.`);
      return sess;
    }),
    teamConfirm: (sessionId) => mutate((d) => {
      const s = d.sessions.find((x) => x.id === sessionId);
      if (!s || s.teamConfirmed) return;
      s.teamConfirmed = true;
      s.confirmedAt = nowIso();
      const p = d.players[s.playerId];
      notify(d, 'player', 'Session confirmed by team', `Nairobi Drift confirmed your session. +${10 * s.hours} coaching points.`);
      notify(d, 'coach', 'Session confirmed by team', `Nairobi Drift confirmed a session with ${p.name}.`);
      if (s.playerId === 'alex') tl(d, 'milestone', 'Milestone: coaching session confirmed by Nairobi Drift', `+${10 * s.hours} coaching points.`);
    }),
    verificationDecision: (id, decision, note) => mutate((d) => {
      const v = d.verifications.find((x) => x.id === id);
      if (!v) return;
      const coach = getCoach(d, v.coachId);
      const map = { approve: ['approved', 'verified', 'Approved'], reject: ['rejected', 'rejected', 'Rejected'], info: ['info_requested', 'info_requested', 'Requested more information'] };
      const [vs, cs, label] = map[decision];
      v.status = vs;
      coach.verification = cs;
      v.audit.push({ ts: nowIso(), actor: 'Platform reviewer (human)', action: `${label}${note ? ': ' + note : ''}` });
      d.activity.unshift({ id: uid('a'), ts: nowIso(), text: `Reviewer ${label.toLowerCase()} ${coach.name}` });
      notify(d, 'coach', 'Verification status updated', `Your verification was: ${label}.`);
      notify(d, 'reviewer', 'Decision recorded', `${coach.name}: ${label}.`);
    }),
    markRead: (id) => mutate((d) => { const n = d.notifications.find((x) => x.id === id); if (n) n.read = true; }),
    markAllRead: (audience) => mutate((d) => { d.notifications.forEach((n) => { if (n.audience === audience) n.read = true; }); }),
  };

  return <Ctx.Provider value={{ state: ref.current, actions, getState: () => ref.current }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
