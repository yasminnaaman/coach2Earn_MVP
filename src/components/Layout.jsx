import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Avatar, Modal, useToast } from './ui.jsx';

export const ROLES = {
  player: { label: 'Player', who: 'Alex Mwangi', sub: 'Rocket League, Champion' },
  coach: { label: 'Coach', who: 'Dani K.', sub: 'Rocket League coach' },
  team: { label: 'Team admin', who: 'Nairobi Drift', sub: 'Team administrator' },
  reviewer: { label: 'Reviewer', who: 'Platform reviewer', sub: 'Verification queue' },
};

const NAV = {
  player: [['/app', 'Overview'], ['/app/passport', 'Skills Passport'], ['/app/coaches', 'Find coaches'], ['/app/assistant', 'AI assistant'], ['/app/bookings', 'Bookings'], ['/app/payments', 'Payments'], ['/app/progress', 'Progress'], ['/app/notifications', 'Notifications']],
  coach: [['/app', 'Dashboard'], ['/app/bookings', 'Bookings & sessions'], ['/app/earnings', 'Earnings'], ['/app/profile', 'Profile & reputation'], ['/app/assistant', 'AI assistant'], ['/app/notifications', 'Notifications']],
  team: [['/app', 'Team overview'], ['/app/sessions', 'Session confirmations'], ['/app/notifications', 'Notifications']],
  reviewer: [['/app', 'Verification queue'], ['/app/assistant', 'AI assistant'], ['/app/activity', 'Platform activity'], ['/app/notifications', 'Notifications']],
};

export function RoleSwitcher() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  return (
    <div className="role-switch" role="tablist" aria-label="Demo role">
      {Object.entries(ROLES).map(([k, v]) => (
        <button key={k} role="tab" aria-selected={state.role === k} className={`role-btn ${state.role === k ? 'on' : ''}`}
          onClick={() => { actions.setRole(k); nav('/app'); }}>{v.label}</button>
      ))}
    </div>
  );
}

export default function Layout() {
  const { state, actions } = useStore();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const unread = state.notifications.filter((n) => n.audience === state.role && !n.read).length;
  const role = ROLES[state.role];
  return (
    <div className="app">
      <aside className={`sidebar ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <Link to="/" className="brand"><span className="brand-mark"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 13L8 2l6 11h-4l-2-4-2 4z" fill="#fff" /></svg></span>Coach2Earn</Link>
        {NAV[state.role].map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/app'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {label}{label === 'Notifications' && unread > 0 && <span className="nav-count">{unread}</span>}
          </NavLink>
        ))}
        <div className="side-foot">Demo environment. All data is seeded or simulated unless labelled otherwise.</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="btn btn-sm menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">Menu</button>
          <input className="search" placeholder="Search coaches, players..." aria-label="Search" onKeyDown={(e) => { if (e.key === 'Enter' && state.role === 'player') nav('/app/coaches'); }} />
          <div className="grow" />
          <RoleSwitcher />
          <button className="bell" onClick={() => nav('/app/notifications')} aria-label="Notifications">🔔{unread > 0 && <span className="dot">{unread}</span>}</button>
          <div className="row" style={{ gap: 8 }}>
            <Avatar name={role.who} size={34} />
            <div className="small who" style={{ lineHeight: 1.2 }}><b>{role.who}</b><div className="muted">{role.sub}</div></div>
          </div>
          <button className="btn btn-sm" onClick={() => setConfirmReset(true)}>Reset demo</button>
        </header>
        <main className="content" key={loc.pathname + state.role}>
          <div className="demo-banner">Demo mode: switch roles above to follow the full journey. Seeded figures are labelled as demo data.</div>
          <Outlet />
        </main>
      </div>
      {confirmReset && (
        <Modal title="Reset demo data?" onClose={() => setConfirmReset(false)}
          footer={<><button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { actions.reset(); setConfirmReset(false); nav('/app'); toast('Demo data reset'); }}>Reset</button></>}>
          This removes bookings, payments and sessions you created and restores the original judge-demo data.
        </Modal>
      )}
    </div>
  );
}
