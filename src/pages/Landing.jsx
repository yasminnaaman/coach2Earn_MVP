import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import CoachCard from '../components/CoachCard.jsx';
import { ROLES } from '../components/Layout.jsx';

export default function Landing() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const enter = (role, to = '/app') => { actions.setRole(role); nav(to); };
  const featured = state.coaches.filter((c) => ['dani', 'sofia', 'marcus'].includes(c.id));
  return (
    <div>
      <nav className="land-nav">
        <div className="brand" style={{ color: 'var(--navy)', padding: 0 }}><span className="brand-mark"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 13L8 2l6 11h-4l-2-4-2 4z" fill="#fff" /></svg></span>Coach2Earn</div>
        <button className="btn btn-primary" onClick={() => enter('player')}>Enter demo</button>
      </nav>
      <header className="hero">
        <div>
          <span className="badge badge-info">BARBAH PlayEconomy Challenge</span>
          <h1 style={{ marginTop: 14 }}>Your gaming potential deserves a professional pathway.</h1>
          <p className="lead">Discover credible esports coaches, prove your ability, improve your competitive performance and unlock opportunities beyond the game.</p>
          <div className="row">
            <button className="btn btn-primary" onClick={() => enter('player', '/app/coaches')}>Explore Coaches</button>
            <button className="btn" onClick={() => enter('player', '/app/passport')}>Build Your Skills Passport</button>
          </div>
        </div>
        <div className="hero-card">
          <div className="row between"><b>Alex Mwangi</b><span className="badge badge-success">Demo profile</span></div>
          <div className="muted small">Rocket League · Champion · Nairobi</div>
          <div className="mt">
            {state.players.alex && Object.entries(state.players.alex.skills).slice(0, 4).map(([k, v]) => (
              <div key={k} className="bar-row" style={{ marginBottom: 8 }}>
                <span>{{ aerial: 'Aerial control', offense: 'Offence', defense: 'Defence', decision: 'Decisions', boost: 'Boost' }[k]}</span>
                <div className="progress"><div className="progress-fill" style={{ width: `${v.current}%` }} /></div><b>{v.current}</b>
              </div>
            ))}
          </div>
          <div className="notice mt">AI match: Dani K. · defensive rotations specialist</div>
        </div>
      </header>

      <section className="section">
        <h2>How it works</h2>
        <div className="grid g3 mt">
          {[['1', 'PROVE YOUR SKILLS', 'Build a Skills Passport with gameplay evidence, achievements and development history.'],
            ['2', 'FIND YOUR COACH', 'Discover credible coaches through AI-powered matching.'],
            ['3', 'GROW YOUR CAREER', 'Train, track progress and access competitive opportunities.']].map(([n, t, d]) => (
            <div key={n} className="card step-card"><div className="num">{n}</div><h3>{t}</h3><p className="muted mt-s">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid g2">
          <div className="card"><h3>For players</h3><ul className="muted"><li>A portable Skills Passport that separates submitted from verified evidence</li><li>AI recommendations built from your actual skill gaps</li><li>Bookable programmes with measurable milestones</li></ul></div>
          <div className="card"><h3>For coaches</h3><ul className="muted"><li>A credible, human-verified professional profile</li><li>Bookings, session notes and feedback in one place</li><li>A transparent earnings ledger and reputation record</li></ul></div>
        </div>
      </section>

      <section className="section">
        <h2>Featured coaches</h2>
        <div className="grid g3 mt">{featured.map((c) => <CoachCard key={c.id} coach={c} linkBase="/app/coaches" actions={<button className="btn btn-primary" onClick={() => enter('player', `/app/coaches/${c.id}`)}>View profile</button>} />)}</div>
      </section>

      <section className="section">
        <div className="card"><h3>Trust and verification</h3>
          <p className="muted mt-s">AI helps reviewers organise evidence, but a human reviewer makes every verification decision. Evidence is labelled Submitted, Under review, Verified or Needs more information, and seeded profiles are marked as demo data.</p></div>
      </section>

      <section className="section">
        <div className="demo-panel">
          <h2>Judge demo: enter as any role</h2>
          <p style={{ color: '#b9c3da' }}>No sign-up needed. Data is preloaded; you can reset it at any time from the top bar.</p>
          <div className="demo-roles">
            {Object.entries(ROLES).map(([k, v]) => (
              <button key={k} className="demo-role" onClick={() => enter(k)}><b>{v.who}</b><span>{v.label}</span></button>
            ))}
          </div>
        </div>
      </section>
      <footer className="section muted small">Coach2Earn demo. <Link to="/app">Open app</Link></footer>
    </div>
  );
}
