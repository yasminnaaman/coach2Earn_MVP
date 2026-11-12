import React, { useState } from 'react';
import { useStore, isVerified, openSlots } from '../store.jsx';
import CoachCard from '../components/CoachCard.jsx';
import { Empty } from '../components/ui.jsx';

export default function Marketplace() {
  const { state } = useStore();
  const [f, setF] = useState({ q: '', game: '', maxPrice: '', minRating: '', minYears: '', avail: false, verified: false, lang: '', tz: '' });
  const set = (k, v) => setF({ ...f, [k]: v });
  const langs = [...new Set(state.coaches.flatMap((c) => c.languages))];
  const games = [...new Set(state.coaches.map((c) => c.game))];
  const zones = [...new Set(state.coaches.map((c) => c.tz))];
  const list = state.coaches.filter((c) =>
    (!f.q || (c.name + c.specialisations.join(' ') + c.bio).toLowerCase().includes(f.q.toLowerCase())) &&
    (!f.game || c.game === f.game) &&
    (!f.maxPrice || c.fivePrice <= Number(f.maxPrice)) &&
    (!f.minRating || c.rating >= Number(f.minRating)) &&
    (!f.minYears || c.years >= Number(f.minYears)) &&
    (!f.avail || openSlots(state, c.id).length > 0) &&
    (!f.verified || isVerified(c)) &&
    (!f.lang || c.languages.includes(f.lang)) &&
    (!f.tz || c.tz === f.tz));
  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="page-head"><h1>Find a coach</h1><p className="muted">Filter by game, price, rating and more, or ask the AI assistant for a personalised match.</p></div>
      <div className="card">
        <div className="grid g4">
          <div><label>Search / specialisation</label><input value={f.q} onChange={(e) => set('q', e.target.value)} placeholder="e.g. defensive" /></div>
          <div><label>Game</label><select value={f.game} onChange={(e) => set('game', e.target.value)}><option value="">All games</option>{games.map((g) => <option key={g}>{g}</option>)}</select></div>
          <div><label>Max 5-session price</label><select value={f.maxPrice} onChange={(e) => set('maxPrice', e.target.value)}><option value="">Any</option><option value="125">Up to $125</option><option value="150">Up to $150</option><option value="170">Up to $170</option></select></div>
          <div><label>Min rating</label><select value={f.minRating} onChange={(e) => set('minRating', e.target.value)}><option value="">Any</option><option value="4.5">4.5+</option><option value="4.7">4.7+</option><option value="4.9">4.9+</option></select></div>
          <div><label>Min experience</label><select value={f.minYears} onChange={(e) => set('minYears', e.target.value)}><option value="">Any</option><option value="3">3+ years</option><option value="5">5+ years</option></select></div>
          <div><label>Language</label><select value={f.lang} onChange={(e) => set('lang', e.target.value)}><option value="">Any</option>{langs.map((l) => <option key={l}>{l}</option>)}</select></div>
          <div><label>Time zone</label><select value={f.tz} onChange={(e) => set('tz', e.target.value)}><option value="">Any</option>{zones.map((z) => <option key={z}>{z}</option>)}</select></div>
          <div className="col" style={{ gap: 6, justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}><input type="checkbox" style={{ width: 'auto' }} checked={f.avail} onChange={(e) => set('avail', e.target.checked)} /> Has availability</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}><input type="checkbox" style={{ width: 'auto' }} checked={f.verified} onChange={(e) => set('verified', e.target.checked)} /> Verified only</label>
          </div>
        </div>
      </div>
      <div className="small muted">{list.length} coach(es). Coach profiles are demo data.</div>
      {list.length === 0 ? <Empty title="No coaches match">Try removing a filter.</Empty> : <div className="grid g3">{list.map((c) => <CoachCard key={c.id} coach={c} />)}</div>}
    </div>
  );
}
