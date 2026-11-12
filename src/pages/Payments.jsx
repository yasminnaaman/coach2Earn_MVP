import React from 'react';
import { useStore } from '../store.jsx';
import { Badge, Card, Empty, statusTone } from '../components/ui.jsx';

export const providerLabel = (p) => ({ 'paypal-sandbox': 'PayPal Sandbox', simulated: 'Simulated', seeded: 'Seeded demo' }[p] || p);

export default function Payments() {
  const { state } = useStore();
  const mine = state.payments.filter((p) => state.bookings.find((b) => b.id === p.bookingId)?.playerId === 'alex');
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>Payments</h1><p className="muted">All charges are in USD. KES figures shown elsewhere are illustrative only.</p></div>
      <Card>
        {mine.length === 0 ? <Empty title="No payments yet">Book a coach to see payments here.</Empty> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Booking</th><th>Source</th><th>Order ID</th><th>Transaction ID</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>{mine.map((p) => (
              <tr key={p.id}><td>{p.bookingRef}</td><td>{providerLabel(p.provider)}{p.provider === 'simulated' && <> <span className="sim-tag">NOT PAYPAL</span></>}</td><td className="small">{p.orderId || '-'}</td><td className="small">{p.transactionId || '-'}</td><td>{p.currency} {Number(p.amount).toFixed(2)}</td><td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td><td className="small">{new Date(p.timestamp).toLocaleString()}</td></tr>))}</tbody>
          </table></div>)}
      </Card>
    </div>
  );
}
