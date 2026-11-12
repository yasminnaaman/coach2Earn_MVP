// Seeded demo data. Everything here is DEMO DATA, not real people, results or credentials.

export const SKILLS = [
  { key: 'aerial', name: 'Aerial control' },
  { key: 'offense', name: 'Offensive positioning' },
  { key: 'defense', name: 'Defensive rotations' },
  { key: 'decision', name: 'Decision-making' },
  { key: 'boost', name: 'Boost management' },
];

export const FEE_RATE = 0.08;
export const KES_RATE = 129; // illustrative only

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (n) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};
const nextThursday = () => {
  const d = addDays(1);
  while (d.getDay() !== 4) d.setDate(d.getDate() + 1);
  return d;
};

const COACHES = [
  {
    id: 'dani', name: 'Dani K.', game: 'Rocket League', location: 'International', tz: 'Flexible (UTC+0 to UTC+3)',
    languages: ['English'], years: 5, rating: 4.9, reviewCount: 28, endorsements: 6,
    singlePrice: 30, fivePrice: 150, verification: 'demo_verified',
    specialisations: ['Defensive rotations', 'Positioning', 'Competitive preparation'],
    strengths: { aerial: 0.5, offense: 0.6, defense: 0.95, decision: 0.85, boost: 0.6 },
    bio: 'Rocket League coach focused on defensive structure, rotations and match decision-making for players moving into competitive play.',
    philosophy: 'Great defence is a habit, not a highlight. We build repeatable rotation patterns, review your own gameplay together, and set one measurable target for every session.',
    totalSessionsBase: 112, activeStudentsBase: 6, earningsBase: 640,
    credentials: [
      { title: 'Coaching experience: 5+ years', note: 'Self-reported, since 2021', year: 2021 },
      { title: 'Peak rank: Grand Champion (screenshot submitted)', note: 'Submitted for review', year: 2022 },
      { title: 'Led a community team to two online cup finals', note: 'Self-reported competition history', year: 2023 },
    ],
    reviews: [
      { by: 'Player (anon.)', stars: 5, text: 'Finally understood why I kept getting caught out of position. Rotations feel much cleaner.' },
      { by: 'Player (anon.)', stars: 5, text: 'Clear structure, honest feedback and useful replay breakdowns.' },
      { by: 'Team captain (anon.)', stars: 4, text: 'Great for our defenders. Would like more availability on weekends.' },
    ],
  },
  {
    id: 'marcus', name: 'Marcus T.', game: 'Rocket League', location: 'Lagos, Nigeria', tz: 'UTC+1',
    languages: ['English'], years: 4, rating: 4.6, reviewCount: 17, endorsements: 3,
    singlePrice: 25, fivePrice: 120, verification: 'demo_verified',
    specialisations: ['Aerial mechanics', 'Freestyle', 'Offensive play'],
    strengths: { aerial: 0.95, offense: 0.85, defense: 0.4, decision: 0.5, boost: 0.7 },
    bio: 'Mechanics-first coach who helps players refine aerials, air dribbles and offensive pressure.',
    philosophy: 'Mechanics unlock options. We drill fundamentals in short, focused blocks, then apply them in live matches.',
    totalSessionsBase: 64, activeStudentsBase: 4, earningsBase: 320,
    credentials: [
      { title: 'Coaching experience: 4 years', note: 'Self-reported', year: 2022 },
      { title: 'Peak rank: Supersonic Legend (demo data)', note: 'Seeded demo data', year: 2023 },
    ],
    reviews: [
      { by: 'Player (anon.)', stars: 5, text: 'My air dribbles went from sloppy to consistent.' },
      { by: 'Player (anon.)', stars: 4, text: 'Very patient. Focus is mostly on offence.' },
    ],
  },
  {
    id: 'sofia', name: 'Sofia R.', game: 'EA FC', location: 'Madrid, Spain', tz: 'UTC+1',
    languages: ['English', 'Spanish'], years: 6, rating: 4.8, reviewCount: 41, endorsements: 8,
    singlePrice: 35, fivePrice: 165, verification: 'demo_verified',
    specialisations: ['Build-up play', 'Tactics', 'Pro Clubs'],
    strengths: { aerial: 0.1, offense: 0.7, defense: 0.7, decision: 0.9, boost: 0.1 },
    bio: 'EA FC tactician specialising in build-up patterns, set pieces and Pro Clubs team structure.',
    philosophy: 'Tactical clarity beats raw reflexes. We simplify decisions so you can execute under pressure.',
    totalSessionsBase: 190, activeStudentsBase: 9, earningsBase: 1120,
    credentials: [
      { title: 'Coaching experience: 6 years', note: 'Self-reported', year: 2020 },
      { title: 'Pro Clubs league coach (demo data)', note: 'Seeded demo data', year: 2021 },
    ],
    reviews: [
      { by: 'Player (anon.)', stars: 5, text: 'Clear tactical frameworks I could use immediately.' },
      { by: 'Player (anon.)', stars: 5, text: 'Excellent communicator.' },
    ],
  },
  {
    id: 'kai', name: 'Kai N.', game: 'Valorant', location: 'Nairobi, Kenya', tz: 'UTC+3',
    languages: ['English', 'Swahili'], years: 3, rating: 4.7, reviewCount: 23, endorsements: 4,
    singlePrice: 28, fivePrice: 130, verification: 'pending',
    specialisations: ['Entry fragging', 'Team communication', 'Aim routines'],
    strengths: { aerial: 0, offense: 0.7, defense: 0.4, decision: 0.7, boost: 0 },
    bio: 'Valorant coach helping duelists and entry players build aim routines and team communication habits.',
    philosophy: 'Practice with intent: warm-up routines, review habits and clear callouts.',
    totalSessionsBase: 48, activeStudentsBase: 3, earningsBase: 210,
    credentials: [{ title: 'Coaching experience: 3 years', note: 'Self-reported', year: 2024 }],
    reviews: [{ by: 'Player (anon.)', stars: 5, text: 'Helped me structure my daily practice.' }],
  },
];

const buildSlots = () => {
  const times = ['10:00', '16:00', '19:00'];
  const slots = [];
  COACHES.forEach((c, ci) => {
    for (let off = 1; off <= 7; off++) {
      times.forEach((t, ti) => {
        if ((off + ci + ti) % 3 === 0) return; // leave gaps so availability looks realistic
        const date = iso(addDays(off));
        slots.push({ id: `${c.id}-${date}-${t}`, coachId: c.id, date, time: t });
      });
    }
  });
  const th = iso(nextThursday());
  if (!slots.find((s) => s.id === `marcus-${th}-16:00`)) slots.push({ id: `marcus-${th}-16:00`, coachId: 'marcus', date: th, time: '16:00' });
  return slots;
};

export function buildSeed() {
  const th = iso(nextThursday());
  const now = Date.now();
  const ago = (h) => new Date(now - h * 3600 * 1000).toISOString();
  const alexSkills = {
    aerial: { baseline: 86, current: 88, target: 92 },
    offense: { baseline: 82, current: 84, target: 90 },
    defense: { baseline: 58, current: 61, target: 80 },
    decision: { baseline: 64, current: 68, target: 82 },
    boost: { baseline: 77, current: 79, target: 85 },
  };
  return {
    version: 3,
    role: 'player',
    coaches: COACHES,
    slots: buildSlots(),
    players: {
      alex: {
        id: 'alex', name: 'Alex Mwangi', location: 'Nairobi, Kenya', game: 'Rocket League', rank: 'Champion',
        experience: '3 years', team: 'Nairobi Drift', roles: ['Striker', 'Support'], budget: 150,
        goal: 'Qualify for higher-level competitive tournaments.',
        strengths: 'Aerial control, offensive positioning and mechanics.',
        development: 'Defensive rotations, decision-making and positioning consistency.',
        passportBase: 78, consistency: 82, sessionsBase: 8, points: 80, programme: 'Defensive Mastery',
        skills: alexSkills,
        scoreHistory: [
          { label: 'Initial assessment', score: 73 },
          { label: 'Month 2', score: 74 },
          { label: 'Month 3', score: 75 },
          { label: 'Now', score: 76 },
        ],
      },
      brian: { id: 'brian', name: 'Brian Otieno', location: 'Nairobi, Kenya', game: 'Rocket League', rank: 'Diamond III', team: 'Nairobi Drift', devScore: 71, passportBase: 64, sessionsBase: 6, points: 70, programme: 'Aerial Fundamentals' },
      wanjiru: { id: 'wanjiru', name: 'Wanjiru Mutua', location: 'Nairobi, Kenya', game: 'EA FC', rank: 'Division 2', team: 'Nairobi Drift', devScore: 74, passportBase: 70, sessionsBase: 5, points: 60, programme: 'Build-up Tactics' },
      kevin: { id: 'kevin', name: 'Kevin Langat', location: 'Nairobi, Kenya', game: 'Valorant', rank: 'Platinum 2', team: 'Nairobi Drift', devScore: 66, passportBase: 52, sessionsBase: 3, points: 30, programme: 'Aim Routines' },
    },
    team: { id: 'drift', name: 'Nairobi Drift', roster: ['alex', 'brian', 'wanjiru', 'kevin'] },
    evidence: [
      { id: 'ev1', type: 'Gameplay clip', title: 'Ceiling shot and double-touch highlights (2:14)', link: 'https://example.com/demo-clip-1', status: 'Submitted', demo: true },
      { id: 'ev2', type: 'Tournament participation', title: 'Nairobi Community Cup Season 3 (self-reported placement)', link: '', status: 'Under review', demo: true },
      { id: 'ev3', type: 'Match statistics', title: 'Ranked 3v3 season stats screenshot', link: '', status: 'Verified', demo: true },
      { id: 'ev4', type: 'Coach assessment', title: 'Initial skills assessment by Marcus T.', link: '', status: 'Verified', demo: true },
      { id: 'ev5', type: 'Endorsement', title: 'Teammate endorsement, awaiting a reference contact', link: '', status: 'Needs more information', demo: true },
    ],
    timeline: [
      { id: 't1', ts: ago(24 * 60), kind: 'event', title: 'Joined Coach2Earn', detail: 'Account created.' },
      { id: 't2', ts: ago(24 * 55), kind: 'event', title: 'Created Skills Passport', detail: 'Profile and goals added.' },
      { id: 't3', ts: ago(24 * 50), kind: 'event', title: 'Completed initial assessment', detail: 'Assessment by Marcus T. (seeded demo data).' },
      { id: 't4', ts: ago(24 * 40), kind: 'milestone', title: 'Milestone: reached Champion rank', detail: 'Seeded demo data.' },
      { id: 't5', ts: ago(24 * 20), kind: 'milestone', title: 'Milestone: aerial control above 85', detail: 'Seeded demo data.' },
    ],
    bookings: [
      {
        id: 'seed-b1', ref: 'C2E-SEED1', playerId: 'alex', coachId: 'marcus', packageId: 'marcus-single', type: 'single', sessions: 1,
        slotId: `marcus-${th}-16:00`, date: th, time: '16:00', status: 'confirmed', coachAccepted: true, paymentId: 'seed-p1',
        price: 25, fee: 2, total: 27, sessionsCompleted: 0, createdAt: ago(48), title: 'Aerial mechanics session',
      },
      {
        id: 'seed-b2', ref: 'C2E-SEED2', playerId: 'brian', coachId: 'dani', packageId: 'dani-single', type: 'single', sessions: 1,
        slotId: null, date: iso(addDays(2)), time: '19:00', status: 'confirmed', coachAccepted: false, paymentId: 'seed-p2',
        price: 30, fee: 2.4, total: 32.4, sessionsCompleted: 0, createdAt: ago(5), title: 'Single assessment',
      },
    ],
    payments: [
      { id: 'seed-p1', bookingId: 'seed-b1', bookingRef: 'C2E-SEED1', provider: 'seeded', orderId: 'SEEDED', transactionId: 'SEEDED-1', amount: 27, currency: 'USD', status: 'Captured', timestamp: ago(48) },
      { id: 'seed-p2', bookingId: 'seed-b2', bookingRef: 'C2E-SEED2', provider: 'seeded', orderId: 'SEEDED', transactionId: 'SEEDED-2', amount: 32.4, currency: 'USD', status: 'Captured', timestamp: ago(5) },
    ],
    sessions: [
      {
        id: 'seed-s1', bookingId: null, playerId: 'wanjiru', coachId: 'sofia', title: 'Build-up play session', date: iso(addDays(-3)), hours: 1,
        notes: 'Seeded demo session.', feedback: 'Good progress on playing through the press.', assessment: null, completedAt: ago(72), teamConfirmed: false,
      },
      {
        id: 'seed-s2', bookingId: null, playerId: 'brian', coachId: 'dani', title: 'Single assessment', date: iso(addDays(-8)), hours: 1,
        notes: 'Seeded demo session.', feedback: 'Solid mechanics; work on recovery routes.', assessment: null, completedAt: ago(190), teamConfirmed: true, confirmedAt: ago(170),
      },
    ],
    plans: [],
    notifications: [
      { id: 'n1', audience: 'player', title: 'Skills Passport updated', body: 'Initial assessment added to your Skills Passport.', ts: ago(30), read: false },
      { id: 'n2', audience: 'player', title: 'Session reminder', body: 'Aerial mechanics session with Marcus T. is coming up on Thursday at 4:00 PM.', ts: ago(6), read: false },
      { id: 'n3', audience: 'coach', title: 'Booking request received', body: 'Brian Otieno booked a single assessment.', ts: ago(5), read: false },
      { id: 'n4', audience: 'team', title: 'Session awaiting confirmation', body: 'Wanjiru Mutua completed a session with Sofia R. Confirm it to award points.', ts: ago(72), read: false },
      { id: 'n5', audience: 'reviewer', title: 'Verification submission', body: 'Dani K. submitted credentials for review.', ts: ago(10), read: false },
      { id: 'n6', audience: 'reviewer', title: 'Verification submission', body: 'Kai N. submitted credentials for review.', ts: ago(20), read: false },
    ],
    verifications: [
      {
        id: 'v1', coachId: 'dani', status: 'pending', submittedAt: ago(10),
        claim: { years: 5, game: 'Rocket League', competition: 'Led a community team to two online cup finals (self-reported, no link)', endorsementsClaimed: 6, endorsementsAttached: 6 },
        credentials: COACHES[0].credentials,
        audit: [{ ts: ago(10), actor: 'Dani K.', action: 'Submitted credentials for verification' }],
      },
      {
        id: 'v2', coachId: 'kai', status: 'pending', submittedAt: ago(20),
        claim: { years: 3, game: 'Valorant', competition: '', endorsementsClaimed: 4, endorsementsAttached: 2 },
        credentials: COACHES[3].credentials,
        audit: [{ ts: ago(20), actor: 'Kai N.', action: 'Submitted credentials for verification' }],
      },
    ],
    activity: [
      { id: 'a1', ts: ago(10), text: 'Dani K. submitted credentials for verification' },
      { id: 'a2', ts: ago(20), text: 'Kai N. submitted credentials for verification' },
    ],
  };
}
