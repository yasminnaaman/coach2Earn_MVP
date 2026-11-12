import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, devScore, passportPct, completedCount } from '../store.jsx';
import { SKILLS } from '../data/seed.js';
import { Avatar, Badge, Card, Progress, Modal, Stat, statusTone, fmtWhen, useToast } from '../components/ui.jsx';

const EVIDENCE_TYPES = ['Gameplay clip', 'Tournament participation', 'Match statistics', 'Performance highlight', 'Coach assessment', 'Endorsement'];

export function PassportBody({ readOnly, player: pp, embedded }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const p = pp || state.players.alex;
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ type: EVIDENCE_TYPES[0], title: '', link: '' });
  const [prof, setProf] = useState({ location: p.location, goal: p.goal, roles: p.roles.join(', '), experience: p.experience });
  const shareUrl = `${window.location.origin}/passport/${p.id}`;
  const verified = state.evidence.filter((e) => e.status === 'Verified').length;
  const hist = state.timeline.filter((t) => /feedback|assessment|Improved|Completed coaching|Milestone/i.test(t.title));

  return (
    <div className="col" style={{ gap: 20 }}>
      <Card>
        <div className="row">
          <Avatar name={p.name} size={72} />
          <div className="grow">
            <h1>{p.name}</h1>
            <div className="muted">{p.location} · {p.game} · {p.rank} · {p.experience}</div>
            <div className="tags mt-s">{p.roles.map((r) => <span key={r} className="tag">{r}</span>)}<span className="tag">{p.team}</span></div>
          </div>
          {!readOnly && <div className="row">
            <button className="btn btn-sm" onClick={() => setModal('edit')}>Edit profile</button>
            <button className="btn btn-sm" onClick={() => setModal('share')}>Share Skills Passport</button>
            <button className="btn btn-primary btn-sm" onClick={() => setModal('evidence')}>Add evidence</button>
          </div>}
        </div>
        <p className="mt"><b>Competitive goal:</b> {p.goal}</p>
        <p className="small muted"><b>Strengths:</b> {p.strengths} <b>Development areas:</b> {p.development}</p>
      </Card>
      <div className="grid g4">
        <Stat label="Passport complete" value={`${passportPct(state, p)}%`} />
        <Stat label="Development score" value={`${devScore(p)}/100`} />
        <Stat label="Verified evidence" value={`${verified} of ${state.evidence.length}`} sub="submitted vs verified" />
        <Stat label="Sessions" value={completedCount(state, p)} />
      </div>
      <div className="grid g2">
        <Card title="Skill assessment">
          {SKILLS.map((k) => { const s = p.skills[k.key]; return (
            <div key={k.key} className="field">
              <div className="row between small"><b>{k.name}</b><span>{s.current} / target {s.target} <span className="muted">(initial {s.baseline})</span></span></div>
              <Progress value={s.current} target={s.target} />
            </div>); })}
          <div className="small muted">Initial scores are seeded demo data. Later changes come from coach assessments.</div>
        </Card>
        <Card title="Gameplay evidence">
          {state.evidence.map((e) => (
            <div key={e.id} className="sum-line">
              <div><b className="small">{e.title}</b><div className="small muted">{e.type}{e.demo ? ' · demo data' : ''}{e.link ? <> · <a href={e.link} target="_blank" rel="noreferrer">link</a></> : ''}</div></div>
              <Badge tone={statusTone(e.status)}>{e.status}</Badge>
            </div>))}
          <div className="small muted mt-s">Submitted evidence is not verified. No clip has been analysed by AI.</div>
        </Card>
      </div>
      <Card title="Development history" action={!readOnly && !embedded && <Link to="/app/progress" className="small">View full history</Link>}>
        <ul className="timeline">{hist.slice(0, 8).map((t) => <li key={t.id} className={t.kind}><b>{t.title}</b><div className="small muted">{t.detail} · {fmtWhen(t.ts)}</div></li>)}</ul>
      </Card>

      {modal === 'evidence' && (
        <Modal title="Add evidence" onClose={() => setModal(null)} footer={<><button className="btn" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={!form.title.trim()} onClick={() => { actions.addEvidence(form); setModal(null); setForm({ type: EVIDENCE_TYPES[0], title: '', link: '' }); toast('Evidence submitted (status: Submitted)'); }}>Submit evidence</button></>}>
          <div className="field"><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{EVIDENCE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ranked 3v3 highlights" /></div>
          <div className="field"><label>Link (optional)</label><input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://" /></div>
          <div className="small muted">New evidence starts as Submitted. It only becomes Verified after review.</div>
        </Modal>)}
      {modal === 'edit' && (
        <Modal title="Edit profile" onClose={() => setModal(null)} footer={<><button className="btn" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { actions.updateProfile({ location: prof.location, goal: prof.goal, experience: prof.experience, roles: prof.roles.split(',').map((x) => x.trim()).filter(Boolean) }); setModal(null); toast('Profile saved'); }}>Save</button></>}>
          <div className="field"><label>Location</label><input value={prof.location} onChange={(e) => setProf({ ...prof, location: e.target.value })} /></div>
          <div className="field"><label>Experience</label><input value={prof.experience} onChange={(e) => setProf({ ...prof, experience: e.target.value })} /></div>
          <div className="field"><label>Preferred roles (comma separated)</label><input value={prof.roles} onChange={(e) => setProf({ ...prof, roles: e.target.value })} /></div>
          <div className="field"><label>Competitive goal</label><textarea rows={3} value={prof.goal} onChange={(e) => setProf({ ...prof, goal: e.target.value })} /></div>
        </Modal>)}
      {modal === 'share' && (
        <Modal title="Share Skills Passport" onClose={() => setModal(null)} footer={<button className="btn btn-primary" onClick={() => { navigator.clipboard?.writeText(shareUrl); toast('Link copied'); }}>Copy link</button>}>
          <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
          <p className="small muted mt-s">Demo link: it opens a read-only passport and only works in this browser, since demo data is stored locally.</p>
        </Modal>)}
    </div>
  );
}

export default function Passport({ shared }) {
  if (shared) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
        <div className="demo-banner">Read-only shared Skills Passport (demo). <Link to="/">Coach2Earn</Link></div>
        <PassportBody readOnly />
      </div>
    );
  }
  return <PassportBody />;
}
