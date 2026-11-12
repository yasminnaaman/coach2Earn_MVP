import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { playerAssistant, coachOpsAgent, trustAgent, WEIGHTS } from '../agents.js';
import { Avatar, Badge, Card, Empty, Progress, Spinner, useToast } from '../components/ui.jsx';

const DEMO_PROMPT = 'Find me a Rocket League coach who can help improve my defensive rotations and prepare me for competitive tournaments. My budget is $150.';
const PROMPTS = {
  player: [DEMO_PROMPT, 'Build me a development plan to improve my weakest skill.', 'Find a Valorant coach under $130.'],
  coach: ['Summarise my upcoming bookings and pending requests.', 'Generate a session outline for my next player.', 'Prepare a feedback template and summarise my earnings.'],
};
const LABEL = { player: ['Coach Matching and Development Agent', 'Reads your Skills Passport, scores coaches with a transparent formula and builds training plans.'], coach: ['Coach Operations Agent', 'Summarises bookings, drafts session outlines and feedback templates, and totals your simulated earnings.'], reviewer: ['Trust and Verification Assistant', 'Organises submitted evidence and flags gaps. It never approves or rejects: the human reviewer decides.'] };

function Trace({ steps, shown }) {
  return (
    <ol className="trace">{steps.slice(0, shown).map((s, i) => <li key={i}><code>{s.fn}</code><div className="small muted">{s.detail}</div></li>)}
      {shown < steps.length && <li><Spinner label="Running..." /></li>}</ol>
  );
}

function MatchResult({ r }) {
  const nav = useNavigate();
  const { actions } = useStore();
  const names = { game: 'Game match', gap: 'Gap match', experience: 'Experience', rating: 'Rating', price: 'Price fit', availability: 'Availability' };
  return (
    <div className="col">
      <div className="notice notice-ok"><b>Summary.</b> {r.summary}</div>
      {r.results.map((m, i) => (
        <div key={m.coach.id} className={`rec ${i === 0 ? 'lead' : ''}`}>
          <div className="row"><Avatar name={m.coach.name} size={46} /><div className="grow"><h3>{i + 1}. {m.coach.name}</h3><div className="small muted">{m.coach.game} · {m.coach.rating}/5 · {m.coach.years}+ yrs</div></div><span className="match-pill">{m.total}% match</span></div>
          <p className="small mt-s"><b>Why:</b> {m.why.join(' ')}</p>
          <p className="small"><b>Strengths:</b> {m.strengths.join(', ')}</p>
          <p className="small"><b>Limitations:</b> {m.limits.join(' ')}</p>
          <p className="small"><b>Estimated package cost:</b> ${m.quote.price} + ${m.quote.fee.toFixed(2)} fee = ${m.quote.total.toFixed(2)} (five sessions)</p>
          <details className="small"><summary>Score breakdown</summary>
            {Object.entries(m.breakdown).map(([k, v]) => <div key={k} className="bar-row mt-s"><span>{names[k]}</span><Progress value={(v / WEIGHTS[k]) * 100} /><b>{v.toFixed(1)}/{WEIGHTS[k]}</b></div>)}
          </details>
          <div className="row mt"><button className="btn btn-sm" onClick={() => { actions.logMatch(m.coach.id); nav(`/app/coaches/${m.coach.id}`); }}>View profile</button>
            <button className="btn btn-primary btn-sm" onClick={() => { actions.logMatch(m.coach.id); nav(`/app/book/${m.coach.id}?pkg=five`); }}>Book five-session programme</button></div>
        </div>))}
    </div>
  );
}

function PlanResult({ r }) {
  const { actions } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [saved, setSaved] = useState(false);
  const p = r.plan;
  return (
    <div className="col">
      <div className="notice notice-ok">{r.summary}</div>
      <h3>{p.title}</h3>
      {p.weeks.map((w) => <div key={w.week} className="sum-line"><div><b>Week {w.week}: {w.focus}</b><div className="small muted">Objective: {w.objective}</div></div><Badge tone="info">Score checkpoint {w.checkpoint}</Badge></div>)}
      <div className="small muted">Checkpoints are targets, not guaranteed outcomes.</div>
      <div><b>Milestones</b><ul className="small">{p.milestones.map((m) => <li key={m}>{m}</li>)}</ul></div>
      <div className="small"><b>Recommended package:</b> {p.packageText}</div>
      <div className="row"><button className="btn btn-primary" disabled={saved} onClick={() => { actions.savePlan(p); setSaved(true); toast('Development plan saved'); }}>{saved ? 'Plan saved' : 'Save plan'}</button>
        <button className="btn" onClick={() => nav(`/app/coaches/${p.coachId}`)}>View {p.coachName}</button></div>
    </div>
  );
}

function OpsResult({ r }) {
  return <div className="col"><div className="notice notice-ok">{r.summary}</div>{r.sections.map((s) => <div key={s.title}><b>{s.title}</b><ul className="small">{s.lines.map((l, i) => <li key={i}>{l}</li>)}</ul></div>)}</div>;
}

function TrustPanel() {
  const { state } = useStore();
  const [vid, setVid] = useState(state.verifications[0].id);
  const [r, setR] = useState(null);
  const [shown, setShown] = useState(0);
  const run = () => { const res = trustAgent(state, vid); setR(res); setShown(0); };
  useEffect(() => { if (r && shown < r.trace.length) { const t = setTimeout(() => setShown(shown + 1), 350); return () => clearTimeout(t); } return undefined; }, [r, shown]);
  return (
    <div className="col">
      <div className="row"><select style={{ maxWidth: 280 }} value={vid} onChange={(e) => setVid(e.target.value)}>{state.verifications.map((v) => <option key={v.id} value={v.id}>{state.coaches.find((c) => c.id === v.coachId).name} ({v.status})</option>)}</select>
        <button className="btn btn-primary" onClick={run}>Analyse submission</button></div>
      {r && <><Trace steps={r.trace} shown={shown} />
        {shown >= r.trace.length && <div className="col">
          <div><b>Missing information</b><ul className="small">{(r.missing.length ? r.missing : ['None']).map((m) => <li key={m}>{m}</li>)}</ul></div>
          <div><b>Flags for human review</b><ul className="small">{(r.flags.length ? r.flags : ['None']).map((m) => <li key={m}>{m}</li>)}</ul></div>
          <div className="notice"><b>Suggestion for human consideration: {r.recommendation}.</b> {r.summary}</div></div>}</>}
    </div>
  );
}

export default function Assistant() {
  const { state } = useStore();
  const role = state.role;
  const [q, setQ] = useState(role === 'player' ? DEMO_PROMPT : PROMPTS[role]?.[0] || '');
  const [res, setRes] = useState(null);
  const [shown, setShown] = useState(0);
  useEffect(() => { if (res && shown < res.trace.length) { const t = setTimeout(() => setShown(shown + 1), 400); return () => clearTimeout(t); } return undefined; }, [res, shown]);
  if (role === 'team') return <Empty title="No assistant for this role">Switch to Player, Coach or Reviewer to use an AI agent.</Empty>;
  const [name, purpose] = LABEL[role];
  const run = (text) => {
    const query = text ?? q;
    if (!query.trim()) return;
    setShown(0);
    setRes(role === 'coach' ? coachOpsAgent(state, query) : playerAssistant(state, query));
  };
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head"><h1>{name}</h1><p className="muted">{purpose}</p><p className="small muted">Rule-based agent: it runs real functions over this app's data. No external LLM is called.</p></div>
      {role === 'reviewer' ? <Card title="Evidence analysis"><TrustPanel /></Card> : (
        <>
          <Card title="Ask the assistant">
            <div className="row" style={{ marginBottom: 12 }}>{PROMPTS[role].map((p) => <button key={p} className="prompt-chip" onClick={() => { setQ(p); run(p); }}>{p.length > 70 ? p.slice(0, 67) + '...' : p}</button>)}</div>
            <textarea rows={3} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Your request" />
            <button className="btn btn-primary mt-s" onClick={() => run()}>Run</button>
          </Card>
          {res ? (
            <div className="grid g-main">
              <Card title="Result">{shown < res.trace.length ? <Spinner label="Working..." /> : res.kind === 'match' ? <MatchResult r={res} /> : res.kind === 'plan' ? <PlanResult r={res} /> : <OpsResult r={res} />}</Card>
              <Card title="Execution trace"><Trace steps={res.trace} shown={shown} /></Card>
            </div>
          ) : <Empty title="Nothing run yet">Pick a suggested prompt or type your own.</Empty>}
        </>
      )}
    </div>
  );
}
