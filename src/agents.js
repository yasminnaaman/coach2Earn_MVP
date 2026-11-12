// Rule-based agents. These are deterministic functions over the app's real state (no LLM is called).
// Each agent returns a `trace` listing the functions it actually executed, in order.
import { SKILLS } from './data/seed.js';
import { devScore, openSlots, quoteFor, isVerified, VERIF_LABEL, getCoach, coachStats, coachEarnings } from './store.jsx';

const skillName = (k) => SKILLS.find((s) => s.key === k).name;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export const WEIGHTS = { game: 30, gap: 25, experience: 15, rating: 15, price: 10, availability: 5 };

// ---------- shared primitives (each is a real function called by the agents) ----------
export function readPassport(state) {
  const p = state.players.alex;
  const gaps = SKILLS.map((k) => ({ key: k.key, name: k.name, ...p.skills[k.key], gap: p.skills[k.key].target - p.skills[k.key].current }))
    .sort((a, b) => b.gap - a.gap);
  const strongest = [...SKILLS.map((k) => ({ key: k.key, name: k.name, current: p.skills[k.key].current }))].sort((a, b) => b.current - a.current)[0];
  return { player: p, gaps, strongest, devScore: devScore(p) };
}

export function developmentInsight(state) {
  const { gaps, strongest, devScore: ds } = readPassport(state);
  const top = gaps[0];
  return `Your strongest area is ${strongest.name.toLowerCase()} (${strongest.current}/100). Your biggest opportunity is ${top.name.toLowerCase()}: ${top.current} now against a target of ${top.target}, a gap of ${top.gap} points. A focused ${top.name.toLowerCase()} programme could help improve consistency in competitive matches. Current development score: ${ds}/100.`;
}

function parseQuery(q, player, gaps) {
  const t = q.toLowerCase();
  const budgetM = q.match(/\$\s?(\d{2,4})|(\d{2,4})\s?(usd|dollars)/i);
  const budget = budgetM ? Number(budgetM[1] || budgetM[2]) : player.budget;
  let game = player.game;
  if (/valorant/.test(t)) game = 'Valorant';
  else if (/ea\s?fc|fifa/.test(t)) game = 'EA FC';
  else if (/rocket/.test(t)) game = 'Rocket League';
  let gapKey = gaps[0].key;
  const kw = [['defense', /defen|rotation/], ['decision', /decision/], ['aerial', /aerial/], ['offense', /offens|attack/], ['boost', /boost/]];
  for (const [k, re] of kw) if (re.test(t)) { gapKey = k; break; }
  return { budget, game, gapKey };
}

export function scoreCoach(state, coach, { game, gapKey, budget }) {
  const slots = openSlots(state, coach.id).length;
  const fivePrice = coach.fivePrice;
  const b = {
    game: coach.game === game ? WEIGHTS.game : 0,
    gap: WEIGHTS.gap * (coach.strengths[gapKey] || 0),
    experience: WEIGHTS.experience * clamp(coach.years / 6, 0, 1),
    rating: WEIGHTS.rating * clamp((coach.rating - 4) / 1, 0, 1),
    price: fivePrice <= budget ? WEIGHTS.price * (0.6 + 0.4 * (1 - fivePrice / budget)) : WEIGHTS.price * 0.2 * clamp(budget / fivePrice, 0, 1),
    availability: WEIGHTS.availability * clamp(slots / 3, 0, 1),
  };
  const total = Object.values(b).reduce((a, x) => a + x, 0);
  return { breakdown: b, total: Math.round(total), slots };
}

// ---------- Agent 1: Coach Matching ----------
export function coachMatchingAgent(state, query) {
  const trace = [];
  const pass = readPassport(state);
  trace.push({ fn: 'readPassport(alex)', detail: `${pass.player.name}, ${pass.player.game} ${pass.player.rank}, development score ${pass.devScore}/100.` });
  const parsed = parseQuery(query, pass.player, pass.gaps);
  const gapObj = pass.gaps.find((g) => g.key === parsed.gapKey);
  trace.push({ fn: 'identifyGaps(skills)', detail: `Largest gap: ${gapObj.name} (${gapObj.current} vs target ${gapObj.target}, gap ${gapObj.gap}). Focus for this search: ${skillName(parsed.gapKey)}.` });
  const pool = state.coaches.filter((c) => c.game === parsed.game);
  trace.push({ fn: `searchCoaches(game="${parsed.game}")`, detail: `${pool.length} coach(es) in this game; ${state.coaches.length - pool.length} other-game coach(es) scored for comparison.` });
  const scored = state.coaches.map((coach) => ({ coach, ...scoreCoach(state, coach, parsed) }));
  trace.push({ fn: 'scoreCoach() x' + scored.length, detail: `Weights: game ${WEIGHTS.game}, gap ${WEIGHTS.gap}, experience ${WEIGHTS.experience}, rating ${WEIGHTS.rating}, price ${WEIGHTS.price}, availability ${WEIGHTS.availability}.` });
  trace.push({ fn: 'openSlots(coach)', detail: scored.map((s) => `${s.coach.name}: ${s.slots} open slots`).join('; ') });
  const top = scored.sort((a, b) => b.total - a.total).slice(0, 3).map((s) => {
    const q = quoteFor(s.coach, 'five');
    const why = [];
    if (s.breakdown.game > 0) why.push(`Specialises in ${s.coach.game}, your main game.`);
    if ((s.coach.strengths[parsed.gapKey] || 0) >= 0.8) why.push(`Strong fit for your biggest gap, ${skillName(parsed.gapKey).toLowerCase()} (specialisations: ${s.coach.specialisations.join(', ')}).`);
    why.push(`Rated ${s.coach.rating}/5 across ${s.coach.reviewCount} reviews, ${s.coach.years} years coaching.`);
    const strengths = [`${s.coach.specialisations[0]} focus`, `${s.coach.rating}/5 rating`, `${s.slots} open slot(s)`];
    const limits = [];
    if (s.coach.game !== parsed.game) limits.push(`Coaches ${s.coach.game}, not ${parsed.game}.`);
    if ((s.coach.strengths[parsed.gapKey] || 0) < 0.6) limits.push(`Less focused on ${skillName(parsed.gapKey).toLowerCase()}.`);
    if (s.coach.fivePrice >= parsed.budget) limits.push(`Five-session package uses ${Math.round((s.coach.fivePrice / parsed.budget) * 100)}% of your $${parsed.budget} budget before the 8% platform fee ($${q.fee.toFixed(2)}), total $${q.total.toFixed(2)}.`);
    if (!isVerified(s.coach)) limits.push(`${VERIF_LABEL[s.coach.verification]}.`);
    if (s.coach.reviewCount < 20) limits.push(`Fewer reviews (${s.coach.reviewCount}).`);
    if (!limits.length) limits.push('No major limitations found in the data.');
    return { ...s, parsed, quote: q, why, strengths, limits };
  });
  trace.push({ fn: 'quoteFor(coach, "five")', detail: top.map((t) => `${t.coach.name}: $${t.quote.price} + $${t.quote.fee.toFixed(2)} fee = $${t.quote.total.toFixed(2)}`).join('; ') });
  trace.push({ fn: 'rankRecommendations()', detail: `Top 3: ${top.map((t) => `${t.coach.name} ${t.total}%`).join(', ')}.` });
  const lead = top[0];
  const summary = `Your main development gap is ${gapObj.name.toLowerCase()} (${gapObj.current}, target ${gapObj.target}). ${lead.coach.name} is the best match at ${lead.total}%: ${lead.why.join(' ')} I recommend the five-session programme ($${lead.quote.price} package, $${lead.quote.total.toFixed(2)} with the platform fee, about KES ${Math.round(lead.quote.total * 129).toLocaleString()} illustrative).`;
  return { kind: 'match', trace, parsed, gap: gapObj, results: top, summary };
}

// ---------- Agent 2: Player Development ----------
const WEEK_TEMPLATES = {
  defense: [
    ['Defensive positioning fundamentals', 'Hold correct last-man position in 8 of 10 reviewed defensive clips.'],
    ['Rotation timing and recovery', 'Reduce double-commits to 2 or fewer per match across 5 ranked matches.'],
    ['Decision-making under pressure', 'Log and review 10 pressure situations; choose the safe option in 7 of 10.'],
    ['Match application and assessment', 'Play 10 ranked matches applying the plan, then repeat the skill assessment.'],
  ],
  decision: [
    ['Reading the play', 'Annotate 10 replay moments with your decision and a better alternative.'],
    ['Risk and reward', 'Cut forced challenges to 3 or fewer per match across 5 matches.'],
    ['Pressure situations', 'Make the safe play in 7 of 10 logged pressure moments.'],
    ['Match application and assessment', 'Apply the plan in 10 matches, then repeat the assessment.'],
  ],
};
const genericWeeks = (name) => [
  [`${name}: fundamentals`, `Complete 3 focused drills and review 5 clips on ${name.toLowerCase()}.`],
  [`${name}: consistency`, `Hit your drill target in 7 of 10 attempts.`],
  [`${name}: under pressure`, `Apply it in 5 ranked matches and note results.`],
  ['Match application and assessment', 'Play 10 matches applying the plan, then repeat the assessment.'],
];

export function developmentAgent(state) {
  const trace = [];
  const pass = readPassport(state);
  trace.push({ fn: 'readPassport(alex)', detail: `Development score ${pass.devScore}/100; goal: ${pass.player.goal}` });
  const gap = pass.gaps[0];
  trace.push({ fn: 'identifyGaps(skills)', detail: `Gaps ranked: ${pass.gaps.map((g) => `${g.name} (${g.gap})`).join(', ')}.` });
  const tpl = WEEK_TEMPLATES[gap.key] || genericWeeks(gap.name);
  const weeks = tpl.map(([focus, objective], i) => ({
    week: i + 1, focus, objective,
    checkpoint: Math.round(gap.current + gap.gap * [0.2, 0.4, 0.6, 0.75][i]),
  }));
  trace.push({ fn: 'buildWeeklyPlan(gap)', detail: `${weeks.length} weeks, score checkpoints ${weeks.map((w) => w.checkpoint).join(' > ')} (targets, not guarantees).` });
  const match = coachMatchingAgent(state, `${gap.name} coach`);
  const lead = match.results[0];
  trace.push({ fn: 'coachMatchingAgent()', detail: `Recommended package: ${lead.coach.name}, five-session programme, $${lead.quote.total.toFixed(2)} incl. fee.` });
  const plan = {
    title: `${gap.name} 4-week plan`, gapName: gap.name, weeks, coachId: lead.coach.id, coachName: lead.coach.name,
    packageText: `${lead.coach.name} five-session programme ($${lead.quote.price})`,
    milestones: [
      `${gap.name} from ${gap.current} to ${gap.current + Math.ceil(gap.gap * 0.5)} (halfway to target ${gap.target})`,
      'First coaching session completed and confirmed by Nairobi Drift',
      `Development score from ${pass.devScore} to ${pass.devScore + 2}`,
    ],
  };
  trace.push({ fn: 'defineMilestones()', detail: plan.milestones.join(' | ') });
  return { kind: 'plan', trace, plan, summary: developmentInsight(state) };
}

// ---------- Agent 3: Coach Operations ----------
export function coachOpsAgent(state, query = '') {
  const trace = [];
  const coach = getCoach(state, 'dani');
  const mine = state.bookings.filter((b) => b.coachId === 'dani' && b.status !== 'cancelled');
  trace.push({ fn: 'listBookings(coach=dani)', detail: `${mine.length} booking record(s).` });
  const pending = mine.filter((b) => b.status === 'confirmed' && !b.coachAccepted);
  const upcoming = mine.filter((b) => b.status === 'confirmed' || b.status === 'in_progress');
  trace.push({ fn: 'filterPending()', detail: `${pending.length} awaiting your acceptance, ${upcoming.length} upcoming.` });
  const stats = coachStats(state, 'dani');
  const earn = coachEarnings(state, 'dani');
  trace.push({ fn: 'coachEarnings(dani)', detail: `Simulated ledger total $${earn.total.toFixed(2)} (no payouts are processed).` });
  const sections = [];
  const nameOf = (b) => state.players[b.playerId].name;
  sections.push({ title: 'Bookings summary', lines: [`${upcoming.length} upcoming, ${pending.length} awaiting acceptance.`, ...upcoming.map((b) => `${nameOf(b)}: ${b.title}, ${b.date} ${b.time} (${b.sessionsCompleted}/${b.sessions} done)`)] });
  const alexBooking = upcoming.find((b) => b.playerId === 'alex');
  {
    const p = state.players.alex;
    const g = readPassport(state).gaps[0];
    sections.push({
      title: 'Session outline (generated from the player Skills Passport)',
      lines: alexBooking ? [
        `Player: ${p.name}, ${p.rank}. Focus: ${g.name} (${g.current}, target ${g.target}).`,
        '10 min: review recent defensive clips together.',
        '20 min: last-man positioning drill.',
        '20 min: rotation timing in 2v2 scenarios.',
        '10 min: set one measurable target for next session.',
      ] : ['No upcoming booking from Alex yet, so no personalised outline was generated.'],
    });
  }
  sections.push({ title: 'Feedback template', lines: ['Strength observed: ...', 'Main focus area: ...', 'Measurable target before next session: ...', 'Drill to repeat: ...'] });
  sections.push({ title: 'Earnings summary (simulated ledger)', lines: [`Total: $${earn.total.toFixed(2)} (includes $${earn.fromBookings.toFixed(2)} from new bookings).`, `${stats.totalSessions} total sessions, ${stats.activeStudents} active students, rating ${coach.rating}/5.`] });
  return { kind: 'ops', trace, sections, summary: `You have ${pending.length} booking request(s) awaiting acceptance and ${upcoming.length} upcoming booking(s).` };
}

// ---------- Agent 4: Trust and Verification (assists a human; never decides) ----------
export function trustAgent(state, verificationId) {
  const v = state.verifications.find((x) => x.id === verificationId);
  const coach = getCoach(state, v.coachId);
  const trace = [{ fn: `loadSubmission(${v.id})`, detail: `${coach.name}, submitted ${new Date(v.submittedAt).toLocaleDateString()}.` }];
  const missing = [];
  if (!v.claim.competition) missing.push('No competition history provided.');
  if (!v.claim.game) missing.push('No game specialisation stated.');
  if (!v.credentials.length) missing.push('No credentials attached.');
  trace.push({ fn: 'findMissingInformation()', detail: missing.length ? missing.join(' ') : 'No missing required fields.' });
  const flags = [];
  const earliest = Math.min(...v.credentials.map((c) => c.year));
  const impliedYears = new Date().getFullYear() - earliest;
  if (v.claim.years - impliedYears > 0) flags.push(`Claims ${v.claim.years} years of experience but the earliest dated credential implies about ${impliedYears}.`);
  if (v.claim.endorsementsClaimed !== v.claim.endorsementsAttached) flags.push(`Claims ${v.claim.endorsementsClaimed} endorsements but only ${v.claim.endorsementsAttached} are attached.`);
  if (/self-reported/i.test(v.claim.competition) || v.credentials.some((c) => /self-reported/i.test(c.note))) flags.push('Some claims are self-reported with no independent link. Request evidence.');
  trace.push({ fn: 'checkConsistency()', detail: flags.length ? `${flags.length} flag(s) raised.` : 'No inconsistencies found.' });
  trace.push({ fn: 'organiseEndorsements()', detail: `${v.claim.endorsementsAttached} attached of ${v.claim.endorsementsClaimed} claimed.` });
  const rec = missing.length || flags.length >= 2 ? 'Request more information' : 'Approve';
  const recText = rec === 'Approve' ? 'Evidence looks consistent. Approval may be reasonable.' : 'Gaps remain. Requesting more information may be appropriate.';
  trace.push({ fn: 'recommendForHuman()', detail: `Suggestion: ${rec}. The decision is made by the human reviewer.` });
  return { kind: 'trust', trace, missing, flags, recommendation: rec, summary: `${recText} This is an assistant suggestion only; the human reviewer makes the verification decision.`, coach };
}

// ---------- Router used by the player assistant ----------
export function playerAssistant(state, query) {
  if (/plan|week|develop|improve my|training/i.test(query) && !/find|coach/i.test(query)) return developmentAgent(state);
  return coachMatchingAgent(state, query);
}
