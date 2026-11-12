import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const BASE = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
const configured = Boolean(CLIENT_ID && CLIENT_SECRET);

// Server-side pricing: the client only sends a package id, never an amount.
const PACKAGES = {
  'dani-single': { coach: 'Dani K.', name: 'Single assessment (60 min)', price: 30 },
  'dani-five': { coach: 'Dani K.', name: 'Five-session programme', price: 150 },
  'marcus-single': { coach: 'Marcus T.', name: 'Single session (60 min)', price: 25 },
  'marcus-five': { coach: 'Marcus T.', name: 'Five-session programme', price: 120 },
  'sofia-single': { coach: 'Sofia R.', name: 'Single session (60 min)', price: 35 },
  'sofia-five': { coach: 'Sofia R.', name: 'Five-session programme', price: 165 },
  'kai-single': { coach: 'Kai N.', name: 'Single session (60 min)', price: 28 },
  'kai-five': { coach: 'Kai N.', name: 'Five-session programme', price: 130 },
};
const FEE_RATE = 0.08;
const quote = (packageId) => {
  const p = PACKAGES[packageId];
  if (!p) return null;
  const fee = Math.round(p.price * FEE_RATE * 100) / 100;
  const total = Math.round((p.price + fee) * 100) / 100;
  return { ...p, fee, total, currency: 'USD' };
};

async function accessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const r = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error(`PayPal auth failed (${r.status})`);
  return (await r.json()).access_token;
}

// Orders created by this server, so capture can verify amount and booking ref.
const orders = new Map();

app.get('/api/config', (_req, res) => {
  res.json({
    paypalConfigured: configured,
    clientId: configured ? CLIENT_ID : null,
    env: BASE.includes('sandbox') ? 'sandbox' : 'live',
  });
});

app.get('/api/quote/:packageId', (req, res) => {
  const q = quote(req.params.packageId);
  if (!q) return res.status(404).json({ error: 'Unknown package' });
  res.json(q);
});

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    if (!configured) return res.status(503).json({ error: 'PayPal not configured' });
    const { packageId, bookingRef } = req.body || {};
    const q = quote(packageId);
    if (!q || !bookingRef) return res.status(400).json({ error: 'Invalid package or booking reference' });
    const token = await accessToken();
    const r = await fetch(`${BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: bookingRef,
            custom_id: bookingRef,
            description: `Coach2Earn: ${q.name} with ${q.coach}`,
            amount: { currency_code: 'USD', value: q.total.toFixed(2) },
          },
        ],
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'PayPal order creation failed', details: data.message || data.name });
    orders.set(data.id, { packageId, bookingRef, total: q.total });
    res.json({ id: data.id, status: data.status, amount: q.total, currency: 'USD' });
  } catch (e) {
    console.error('create-order error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    if (!configured) return res.status(503).json({ error: 'PayPal not configured' });
    const { orderId } = req.body || {};
    const known = orders.get(orderId);
    if (!known) return res.status(400).json({ error: 'Unknown order' });
    const token = await accessToken();
    const r = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await r.json();
    const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
    // Server-side verification of the capture response.
    const verified =
      r.ok &&
      data.status === 'COMPLETED' &&
      cap?.status === 'COMPLETED' &&
      cap.amount?.currency_code === 'USD' &&
      Number(cap.amount?.value) === known.total;
    if (!verified) {
      return res.status(402).json({ verified: false, status: cap?.status || data.status || 'FAILED', error: data.message || 'Capture could not be verified' });
    }
    orders.delete(orderId);
    res.json({
      verified: true,
      orderId,
      transactionId: cap.id,
      amount: Number(cap.amount.value),
      currency: cap.amount.currency_code,
      bookingRef: known.bookingRef,
      status: 'CAPTURED',
      timestamp: cap.create_time || new Date().toISOString(),
    });
  } catch (e) {
    console.error('capture-order error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Serve the built frontend when available (npm start).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(dist, 'index.html'), (e) => e && next());
});

const port = process.env.PORT || 3001;
app.listen(port, () =>
  console.log(`Coach2Earn API on :${port}. PayPal ${configured ? 'CONFIGURED (' + BASE + ')' : 'NOT configured -> simulated fallback'}`)
);
