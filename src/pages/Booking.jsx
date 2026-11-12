import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useStore, getCoach, openSlots, quoteFor, slotTaken } from '../store.jsx';
import { KES_RATE } from '../data/seed.js';
import { Card, Spinner, fmtDate, fmtTime, usd, useToast } from '../components/ui.jsx';

const STEPS = ['Package', 'Date & time', 'Review', 'Payment'];

function loadPayPal(clientId) {
  if (window.paypal) return Promise.resolve(window.paypal);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    s.onload = () => (window.paypal ? resolve(window.paypal) : reject(new Error('PayPal SDK unavailable')));
    s.onerror = () => reject(new Error('Could not load the PayPal SDK'));
    document.body.appendChild(s);
  });
}

export default function Booking() {
  const { coachId } = useParams();
  const [sp] = useSearchParams();
  const { state, actions } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const coach = getCoach(state, coachId);
  const resume = state.bookings.find((b) => b.ref === sp.get('resume') && b.status === 'pending_payment');
  const [type, setType] = useState(sp.get('pkg') === 'single' ? 'single' : 'five');
  const [date, setDate] = useState(null);
  const [slotId, setSlotId] = useState(null);
  const [step, setStep] = useState(resume ? 3 : 0);
  const [bookingId, setBookingId] = useState(resume?.id || null);
  const [cfg, setCfg] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const btnRef = useRef(null);
  const bookingRef = useRef(null);

  const booking = state.bookings.find((b) => b.id === bookingId);
  const slots = openSlots(state, coachId);
  const dates = [...new Set(slots.map((s) => s.date))];
  const q = coach ? quoteFor(coach, booking ? booking.type : type) : null;
  const kes = q ? Math.round(q.total * KES_RATE) : 0;
  bookingRef.current = booking;

  useEffect(() => { fetch('/api/config').then((r) => r.json()).then(setCfg).catch(() => setCfg({ paypalConfigured: false, offline: true })); }, []);

  const confirmed = booking && booking.status === 'confirmed';
  // Render PayPal buttons once on the payment step.
  useEffect(() => {
    if (step !== 3 || !cfg?.paypalConfigured || !booking || confirmed) return undefined;
    let cancelled = false;
    loadPayPal(cfg.clientId).then((paypal) => {
      if (cancelled || !btnRef.current) return;
      btnRef.current.innerHTML = '';
      paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' },
        createOrder: async () => {
          setError('');
          const r = await fetch('/api/paypal/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: bookingRef.current.packageId, bookingRef: bookingRef.current.ref }) });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || 'Could not create order');
          actions.recordPayment(bookingRef.current.id, { status: 'Pending', provider: 'paypal-sandbox', orderId: d.id, amount: d.amount, currency: d.currency });
          return d.id;
        },
        onApprove: async (data) => {
          setBusy(true);
          actions.recordPayment(bookingRef.current.id, { status: 'Approved', provider: 'paypal-sandbox', orderId: data.orderID });
          try {
            const r = await fetch('/api/paypal/capture-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: data.orderID }) });
            const d = await r.json();
            if (!r.ok || !d.verified) throw new Error(d.error || 'Capture could not be verified');
            actions.recordPayment(bookingRef.current.id, { status: 'Captured', provider: 'paypal-sandbox', orderId: d.orderId, transactionId: d.transactionId, amount: d.amount, currency: d.currency, timestamp: d.timestamp });
            setReceipt({ provider: 'paypal-sandbox', transactionId: d.transactionId, orderId: d.orderId });
            toast('Payment captured and verified');
          } catch (e) {
            actions.recordPayment(bookingRef.current.id, { status: 'Failed', provider: 'paypal-sandbox', orderId: data.orderID });
            setError(`Payment failed: ${e.message}. Your booking is still pending payment.`);
          } finally { setBusy(false); }
        },
        onCancel: (data) => { actions.recordPayment(bookingRef.current.id, { status: 'Cancelled', provider: 'paypal-sandbox', orderId: data?.orderID }); setError('Payment cancelled. Your booking is still pending payment.'); },
        onError: (e) => { actions.recordPayment(bookingRef.current.id, { status: 'Failed', provider: 'paypal-sandbox' }); setError(`PayPal error: ${e?.message || e}`); },
      }).render(btnRef.current);
    }).catch((e) => setError(e.message));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, cfg, bookingId, confirmed]);

  if (!coach) return <Card>Coach not found. <Link to="/app/coaches">Back</Link></Card>;

  const proceed = () => {
    const b = actions.createBooking({ coachId, type, slotId });
    if (!b) { setError('That slot was just taken. Please choose another.'); setSlotId(null); setStep(1); return; }
    setBookingId(b.id); setStep(3); setError('');
  };
  const simulate = () => {
    actions.recordPayment(booking.id, { status: 'Pending', provider: 'simulated', orderId: 'SIM-' + booking.ref });
    actions.recordPayment(booking.id, { status: 'Captured', provider: 'simulated', orderId: 'SIM-' + booking.ref, transactionId: 'SIMULATED-' + Date.now().toString(36).toUpperCase(), amount: booking.total, currency: 'USD' });
    setReceipt({ provider: 'simulated', transactionId: 'SIMULATED', orderId: 'SIM-' + booking.ref });
    toast('Simulated payment recorded (not a real PayPal transaction)');
  };

  const pay = state.payments.find((p) => booking && p.id === booking.paymentId);
  if (confirmed && pay?.status === 'Captured') {
    const sim = pay.provider === 'simulated';
    return (
      <div className="col" style={{ maxWidth: 640, margin: '0 auto' }}>
        <Card>
          <h1>Booking confirmed</h1>
          <p className="muted">{sim ? <><span className="sim-tag">SIMULATED PAYMENT</span> This was not a real PayPal transaction.</> : 'Payment captured through PayPal Sandbox and verified server-side.'}</p>
          <div className="mt">
            <div className="sum-line"><span>Booking reference</span><b>{booking.ref}</b></div>
            <div className="sum-line"><span>Coach</span><b>{coach.name}</b></div>
            <div className="sum-line"><span>Package</span><b>{booking.title}</b></div>
            <div className="sum-line"><span>First session</span><b>{fmtDate(booking.date)}, {fmtTime(booking.time)}</b></div>
            <div className="sum-line"><span>Transaction ID</span><b>{pay.transactionId}</b></div>
            <div className="sum-line"><span>Order ID</span><b>{pay.orderId}</b></div>
            <div className="sum-line"><span>Amount charged</span><b>{pay.currency} {Number(pay.amount).toFixed(2)}</b></div>
            <div className="sum-line"><span>Time</span><b>{new Date(pay.timestamp).toLocaleString()}</b></div>
          </div>
          <div className="row mt"><button className="btn btn-primary" onClick={() => nav('/app/bookings')}>View bookings</button><button className="btn" onClick={() => nav('/app')}>Back to overview</button></div>
        </Card>
      </div>
    );
  }

  const chosenSlot = state.slots.find((s) => s.id === slotId) || (booking && { date: booking.date, time: booking.time });
  const label = (booking ? booking.type : type) === 'five' ? 'Five-session programme' : 'Single assessment';

  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Book {coach.name}</h1><p className="muted">{coach.game} · {coach.specialisations.join(', ')}</p></div>
      <div className="steps">{STEPS.map((s, i) => <div key={s} className={`step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`}><i>{i < step ? '✓' : i + 1}</i>{s}</div>)}</div>
      {error && <div className="notice notice-err">{error}</div>}

      <div className="checkout">
        <div>
          {step === 0 && (
            <Card title="1. Select a package">
              <div className="col">
                {['five', 'single'].map((t) => { const x = quoteFor(coach, t); return (
                  <button key={t} className={`pkg ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>
                    <div className="row between"><b>{t === 'five' ? 'Five-session programme' : 'Single assessment'}</b><span className="pkg-price">${x.price}</span></div>
                    <ul>{t === 'five' ? <><li>Five sessions</li><li>Personalised development plan</li><li>Progress assessment and feedback after sessions</li></> : <><li>60 minutes</li><li>Skill assessment</li></>}</ul>
                  </button>); })}
              </div>
              <button className="btn btn-primary btn-block mt" onClick={() => setStep(1)}>Continue</button>
            </Card>)}
          {step === 1 && (
            <Card title="2. Choose a date and time">
              {dates.length === 0 ? <p className="muted">No open slots.</p> : <>
                <label>Available dates</label>
                <div className="chips">{dates.map((d) => <button key={d} className={`chip ${date === d ? 'on' : ''}`} onClick={() => { setDate(d); setSlotId(null); }}>{fmtDate(d)}</button>)}</div>
                {date && <><label className="mt">Times</label>
                  <div className="chips">{slots.filter((s) => s.date === date).map((s) => <button key={s.id} className={`chip ${slotId === s.id ? 'on' : ''}`} disabled={slotTaken(state, s.id) && !(booking && booking.slotId === s.id)} onClick={() => setSlotId(s.id)}>{fmtTime(s.time)}</button>)}</div></>}
                {type === 'five' && <p className="small muted mt">This is your first session. Dani schedules the remaining sessions with you after booking.</p>}
              </>}
              <div className="row mt"><button className="btn" onClick={() => setStep(0)}>Back</button><button className="btn btn-primary" disabled={!slotId} onClick={() => setStep(2)}>Continue</button></div>
            </Card>)}
          {step === 2 && (
            <Card title="3. Review your booking">
              <div className="sum-line"><span>Coach</span><b>{coach.name}</b></div>
              <div className="sum-line"><span>Package</span><b>{label}</b></div>
              <div className="sum-line"><span>First session</span><b>{chosenSlot && `${fmtDate(chosenSlot.date)}, ${fmtTime(chosenSlot.time)}`}</b></div>
              <p className="small muted mt">Your booking stays pending until payment is captured.</p>
              <div className="row mt"><button className="btn" onClick={() => setStep(1)}>Back</button><button className="btn btn-primary" onClick={proceed}>Proceed to payment</button></div>
            </Card>)}
          {step === 3 && booking && (
            <Card title="4. Payment">
              <p className="muted small">Booking {booking.ref} is <b>pending payment</b>. It confirms only after a successful server-side capture.</p>
              {busy && <Spinner label="Capturing and verifying payment..." />}
              {cfg === null && <Spinner label="Checking payment configuration..." />}
              {cfg?.paypalConfigured ? (
                <>
                  <div className="notice notice-ok mb">PayPal <b>{cfg.env}</b> checkout. Log in with your Sandbox personal (buyer) account.</div>
                  <div ref={btnRef} className="mt" style={{ minHeight: 120 }} />
                </>
              ) : cfg && (
                <div className="notice">PayPal Sandbox is not configured on the server (set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env). Use the clearly labelled simulated payment below.</div>
              )}
              <div className="mt"><button className="btn btn-block" onClick={simulate}>Use simulated payment <span className="sim-tag">DEMO ONLY</span></button>
                <div className="small muted mt-s">Simulated payments are recorded as simulated and are never presented as PayPal transactions.</div></div>
              <div className="row mt"><button className="btn btn-sm btn-danger" onClick={() => { actions.cancelBooking(booking.id); nav('/app/bookings'); }}>Cancel booking</button></div>
            </Card>)}
        </div>

        <Card title="Order summary">
          <div className="row"><b>{coach.name}</b><span className="muted small">· {label}</span></div>
          <div className="mt">
            <div className="sum-line"><span>Package</span><span>{usd(q.price)}</span></div>
            <div className="sum-line"><span>Platform fee (8%)</span><span>{usd(q.fee)}</span></div>
            <div className="sum-total"><span>Total (USD)</span><span>{usd(q.total)}</span></div>
          </div>
          <div className="notice mt small">Illustrative estimate: about <b>KES {kes.toLocaleString()}</b> at 1 USD = {KES_RATE} KES. The actual charge is in <b>USD</b>; no KES transaction is processed.</div>
          <div className="small muted mt-s">The amount is calculated on the server from the package; it is not taken from the browser.</div>
        </Card>
      </div>
    </div>
  );
}
