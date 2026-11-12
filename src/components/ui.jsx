import React, { createContext, useContext, useState, useCallback } from 'react';

export const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};
export const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const fmtWhen = (ts) => new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const usd = (n) => `$${Number(n).toFixed(2)}`;

const PALETTE = ['#356AE6', '#16865A', '#8B5CF6', '#D99A24', '#0E9AA7', '#D94C4C'];
export function Avatar({ name, size = 44 }) {
  const i = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length;
  const initials = name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: PALETTE[i] }} aria-hidden>{initials}</div>;
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export const statusTone = (s) => ({
  Verified: 'success', Submitted: 'info', 'Under review': 'warning', 'Needs more information': 'error',
  Captured: 'success', Pending: 'warning', Approved: 'info', Failed: 'error', Cancelled: 'neutral',
  confirmed: 'success', pending_payment: 'warning', in_progress: 'info', completed: 'success', cancelled: 'neutral',
}[s] || 'neutral');
export const statusLabel = (s) => ({ confirmed: 'Confirmed', pending_payment: 'Pending payment', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled' }[s] || s);

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && <div className="card-head"><h3>{title}</h3>{action}</div>}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub, tone }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${tone || ''}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function Progress({ value, target, color }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      {target != null && <div className="progress-target" style={{ left: `${target}%` }} title={`Target ${target}`} />}
    </div>
  );
}

export function Stars({ rating, count }) {
  return <span className="stars"><span className="star">★</span> {rating.toFixed(1)}{count != null && <span className="muted"> ({count})</span>}</span>;
}

export function Empty({ title, children }) {
  return <div className="empty"><div className="empty-title">{title}</div><div className="muted">{children}</div></div>;
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close">×</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Spinner({ label = 'Loading' }) {
  return <div className="spinner-row"><span className="spinner" /> {label}</div>;
}

export function LineChart({ data, height = 120 }) {
  const w = 320;
  const pad = 18;
  const vals = data.map((d) => d.score);
  const min = Math.min(...vals) - 3;
  const max = Math.max(...vals) + 3;
  const x = (i) => pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.score)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="chart" role="img" aria-label="Development score over time">
      <path d={path} fill="none" stroke="#356AE6" strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.score)} r="4" fill="#fff" stroke="#356AE6" strokeWidth="2" />
          <text x={x(i)} y={y(d.score) - 9} textAnchor="middle" fontSize="10" fill="#202B3C" fontWeight="600">{d.score}</text>
        </g>
      ))}
    </svg>
  );
}

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, tone = 'success') => {
    const id = Math.random();
    setItems((x) => [...x, { id, msg, tone }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">{items.map((i) => <div key={i.id} className={`toast toast-${i.tone}`}>{i.msg}</div>)}</div>
    </ToastCtx.Provider>
  );
}
