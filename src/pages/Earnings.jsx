import React from 'react';
import { useStore, coachEarnings, getCoach } from '../store.jsx';
import { Card, Stat, Empty, fmtWhen, usd } from '../components/ui.jsx';

export default function Earnings() {
  const { state } = useStore();
  const coach = getCoach(state, 'dani');
  const e = coachEarnings(state, 'dani');
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Earnings ledger</h1><p className="muted">A simulated ledger for the demo. No escrow, payouts or disbursements are processed.</p></div>
      <div className="grid g3">
        <Stat label="Ledger total" value={usd(e.total)} />
        <Stat label="Seeded base (demo)" value={usd(coach.earningsBase)} />
        <Stat label="From bookings in this demo" value={usd(e.fromBookings)} sub="package price, excluding platform fee" />
      </div>
      <Card title="Ledger entries">
        {e.rows.length === 0 ? <Empty title="No new entries">Paid bookings show here.</Empty> : (
          <div className="table-wrap"><table><thead><tr><th>Booking</th><th>Player</th><th>Package</th><th>Earned</th><th>Payment</th><th>Date</th></tr></thead>
            <tbody>{e.rows.map(({ b, pay }) => <tr key={b.id}><td>{b.ref}</td><td>{state.players[b.playerId].name}</td><td>{b.title}</td><td>{usd(b.price)}</td><td className="small">{pay.provider === 'paypal-sandbox' ? 'PayPal Sandbox' : pay.provider === 'simulated' ? 'Simulated' : 'Seeded'}</td><td className="small">{fmtWhen(pay.timestamp)}</td></tr>)}</tbody></table></div>)}
      </Card>
    </div>
  );
}
