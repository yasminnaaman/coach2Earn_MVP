# Coach2Earn

**An esports coaching marketplace that turns gaming into a professional pathway.**
Part of BARBAH PlayEconomy. Built for the BARBAH PlayEconomy Challenge 01 (PayPal AI Hackathon).

Players prove their ability with a Skills Passport, get AI-powered coach recommendations, book and pay through PayPal, train with verified coaches, and track measurable improvement. Teams confirm completed sessions, and coaches build a credible reputation and income.

> **Demo status:** this is a hackathon MVP. All people, ratings, credentials and results in it are **seeded demo data**. Where something is simulated, the app says so on screen.

---

## The problem

Talented gamers in Kenya and across Africa often lack access to credible coaching, structured development and professional opportunities. Paying an experienced international coach is also expensive: converting KES to USD loses money, especially across many small payments, which makes cross-border coaching unsustainable at scale.

## Who it is for

| Persona | Need |
|---|---|
| **Player** | Find a credible, affordable coach for their game. See evidence, not just self-reported claims. Track improvement. |
| **Coach** | Get a verified reputation, bookings and fair, transparent earnings. |
| **Team admin** | Back players' development, confirm sessions took place, and track progress and bonus terms transparently. |
| **Reviewer** | Assess coach evidence quickly, with a human making every verification decision. |

## The core journey

```
Player -> Skills Passport -> AI matching -> Coach -> Booking -> PayPal -> Coaching -> Team confirmation -> Player development
```

The whole chain works end to end in the demo, with all four roles sharing one live state.

---

## What is in this MVP

### Roles (switch from the top bar)

| Role | Demo identity | What they do |
|---|---|---|
| Player | Alex Mwangi, Rocket League, Champion | Dashboard, Skills Passport, coach discovery, AI assistant, booking, payments, progress |
| Coach | Dani K. | Booking requests, accept and complete sessions, feedback and skill assessment, earnings ledger |
| Team admin | Nairobi Drift | Roster, player progress, confirm completed sessions |
| Reviewer | Platform reviewer | Verification queue, evidence review, audit trail, approve / reject / request more info |

Actions in one role update the others: a booking made by Alex appears for Dani, a session completed by Dani appears for the team, and a team confirmation updates Alex's progress and points.

### Features

- **Skills Passport:** identity, goals, skill scores with targets, gameplay evidence with explicit statuses (Submitted, Under review, Verified, Needs more information), development history, and add-evidence, edit and share actions.
- **Coach marketplace:** four seeded coaches, with filters for game, specialisation, price, rating, experience, availability, verification, language and time zone. Full coach profiles with packages, credentials, reviews and availability.
- **AI agents (rule-based, see below):** coach matching, development planning, coach operations and verification assistance.
- **Booking:** package, date, time, review, payment. Slots are locked so the same slot cannot be booked twice. A booking stays *pending payment* until payment is captured.
- **PayPal Sandbox checkout:** server-side order creation, capture and verification (see below).
- **Coaching points and bonus (demo):** 10 points per team-confirmed hour, shown as a *projected* bonus.
- **Notifications:** created by real actions (payment captured, booking confirmed, session completed, feedback received, verification updated).
- **Demo mode:** instant role switching from the landing page and top bar, plus a **Reset demo** button.

### AI agents

The agents are **deterministic, rule-based functions** that read the app's real data. **No external LLM is called**, and the assistant page states this. Each run shows an execution trace of the functions that actually ran.

| Agent | What it does |
|---|---|
| Coach Matching | Reads the player's passport, finds the largest skill gap, scores every coach, explains the top three with strengths, limitations and package cost |
| Player Development | Builds a 4-week plan with measurable weekly objectives and score checkpoints, milestones and a recommended package. The plan can be saved. |
| Coach Operations | Summarises bookings and pending requests, drafts a session outline from the player's passport, a feedback template and an earnings summary |
| Trust and Verification | Finds missing information, flags inconsistencies and suggests an action. **It never approves or rejects. A human reviewer decides.** |

**Matching formula** (weights add to 100, computed from the seeded records):

| Factor | Weight |
|---|---|
| Game / specialisation match | 30 |
| Development-gap match (coach strength for the player's biggest gap) | 25 |
| Coaching experience | 15 |
| Rating / reputation | 15 |
| Price suitability against budget | 10 |
| Availability (open slots) | 5 |

For Alex's demo prompt (Rocket League, defensive rotations, $150 budget) the result is Dani K. 91%, Marcus T. 71%, Sofia R. 51%. Each result includes a score breakdown.

### PayPal Sandbox integration

| Step | Where |
|---|---|
| 1. Browser asks the server to create an order, sending only a **package id** and booking reference | `POST /api/paypal/create-order` |
| 2. Server looks up the price itself ($150 + 8% fee = **$162.00 USD**) and creates the PayPal order | `server/index.js` |
| 3. Player approves in the PayPal popup (Sandbox buyer account) | PayPal JS SDK |
| 4. Server captures the order and **verifies** status, currency and amount against its own record | `POST /api/paypal/capture-order` |
| 5. Only a verified capture changes the payment to *Captured* and the booking to *Confirmed* | `src/store.jsx` |

Payment states recorded: Pending, Approved, Captured, Failed, Cancelled, with order ID, transaction ID, amount, currency, timestamp and booking reference.

Notes:

- Clicking *Approve* alone does **not** confirm a booking. Only a successful server-side capture does.
- The client secret stays on the server and is never sent to the browser.
- The charge is in **USD**. The KES figure (1 USD = 129 KES, so about KES 20,898 for $162) is an **illustrative estimate**. No KES transaction is processed.
- If PayPal is not configured, checkout offers a **"Use simulated payment"** button. Simulated payments are recorded as `simulated` and labelled in the receipt, payments table and coach ledger. They are never shown as PayPal transactions. The button stays available as a backup during the demo.

### Bonus model (demo)

- 1 team-confirmed coaching hour = 10 points
- `bonusPct = min(10, points x 0.025)`, for example 280 points = 7% and 400 points = 10% (cap)
- Only team-confirmed sessions count. Points are **not** withdrawable cash.
- Any bonus is shown as **projected**. In a real deployment it would be paid only after the team's prize money is actually received.

---

## Quick start

Requires Node.js 18+.

```
npm install
copy .env.example .env     # macOS/Linux: cp .env.example .env
npm run dev                # web: http://localhost:5173  (API: :3001)
```

Single-process alternative: `npm start` builds the frontend and serves everything from http://localhost:3001.

### Environment variables

Set these in `.env` (server-side only; `.env` is git-ignored):

| Variable | Notes |
|---|---|
| `PAYPAL_CLIENT_ID` | From developer.paypal.com > Apps & Credentials > **Sandbox** > your app |
| `PAYPAL_CLIENT_SECRET` | Same page. Keep it private. |
| `PAYPAL_BASE_URL` | `https://api-m.sandbox.paypal.com` |
| `PORT` | Optional, default 3001 |

Restart the server after editing `.env`. Check http://localhost:5173/api/config: it should show `"paypalConfigured":true`. Log in at checkout with your **Sandbox buyer** account. The payment shows up in the Sandbox **business** account's activity at sandbox.paypal.com.

---

## Suggested demo script (about 5 minutes)

1. **Player:** landing page, Enter demo as Alex. Show the dashboard and Skills Passport, especially the defensive rotations gap.
2. **AI:** open AI assistant and run the pre-filled prompt. Show the ranking, the explanation and the execution trace.
3. **Coach profile:** open Dani K. from the recommendation (credentials, reviews, packages).
4. **Booking and PayPal:** choose the five-session programme and a time. Review $150 + $12 = $162 (about KES 20,898, illustrative). Pay with the Sandbox buyer account.
5. **Coach:** switch to Dani K. The new booking is there. Complete a session and send feedback.
6. **Team:** switch to Nairobi Drift and confirm the session (+10 points).
7. **Player:** open Progress to see the completed session, feedback, new milestone, points and next recommended step.
8. **Reviewer (optional):** approve Dani's verification to show the human decision and audit trail.

Use **Reset demo** in the top bar to return to the original data.

---

## Project structure

```
server/index.js          Express API: PayPal order create/capture, server-side pricing
src/data/seed.js         All seeded demo data (players, coaches, slots, bookings, etc.)
src/store.jsx            Shared state (localStorage), actions, and derived selectors
src/agents.js            The four rule-based agents and the matching formula
src/components/          Layout, role switcher, coach card, shared UI
src/pages/               Landing, dashboards, passport, marketplace, booking, etc.
docs/TEAM_VISION.md      The team's original product and architecture write-up
```

Stack: React 18, Vite, React Router, Express. State is held in browser localStorage, so there is no database to set up.

---

## Honest scope: built vs. planned

| Area | In this MVP | Planned / not built |
|---|---|---|
| Payments | PayPal Sandbox Orders (create + capture + server verification), simulated fallback | Payouts API for coaches, webhooks (`PAYMENT.CAPTURE.COMPLETED`, payouts events), M-Pesa and card options |
| Coach earnings | Simulated ledger | Real payouts and escrow. **No coach disbursement happens.** |
| FX | Illustrative KES estimate at a fixed demo rate | Rate lock, bulk conversion, measured FX savings |
| AI | Rule-based agents over real app data | LLM-generated match reasons with deterministic fallback |
| Scheduling | Local seeded availability slots | Calendly embed and calendar invites |
| Evidence | Seeded evidence with statuses | Ballchasing replay-stat integration |
| Data | localStorage, seeded | Hosted backend and database, authentication, deployment on Render |
| Compliance | Not claimed | Under-18 consent flow, KRA eTIMS integration through a certified provider. **No eTIMS compliance is claimed.** |

See [docs/TEAM_VISION.md](docs/TEAM_VISION.md) for the full product thinking: business model, FX strategy, trust and compliance approach, and scale story.

---

## Trust principles

- **A person reviews every coach before they are verified.** AI organises evidence and flags gaps, but never makes the decision.
- Submitted evidence is clearly separated from verified evidence, and nothing is described as AI-analysed unless it was.
- Seeded progress figures are labelled as demo data, and one session is never presented as proof of a large improvement.
- Simulated features are labelled as simulated everywhere they appear.

*Built at the PayPal AI Hackathon, BARBAH Games, Challenge 01.*
