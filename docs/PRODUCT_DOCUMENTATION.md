# Coach2Earn — Product Documentation

> **Hackathon:** BARBAH PlayEconomy Challenge 01 — PayPal AI Hackathon
> **Version:** MVP 0.1.0
> **Status:** Demo / Hackathon submission

---

## Team

| Name | Role |
|---|---|
| **Hope** | Developer |
| **Reberatha** | Developer |
| **Yasmin** | Developer |
| **Brian** | Developer |

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [Who It Is For](#3-who-it-is-for)
4. [Core User Journey](#4-core-user-journey)
5. [Features — Player](#5-features--player)
6. [Features — Coach](#6-features--coach)
7. [Features — Team Admin](#7-features--team-admin)
8. [Features — Platform Reviewer](#8-features--platform-reviewer)
9. [AI Agents](#9-ai-agents)
10. [PayPal Sandbox Integration](#10-paypal-sandbox-integration)
11. [Coaching Points and Bonus Model](#11-coaching-points-and-bonus-model)
12. [Technical Architecture](#12-technical-architecture)
13. [Project Structure](#13-project-structure)
14. [Environment Variables](#14-environment-variables)
15. [Running the App Locally](#15-running-the-app-locally)
16. [Demo Guide](#16-demo-guide)
17. [Built vs. Planned](#17-built-vs-planned)
18. [Trust Principles](#18-trust-principles)

---

## 1. Problem Statement

Talented gamers in Kenya and across Africa consistently lack three things: access to credible coaching, structured development pathways, and professional opportunities that recognise their ability.

Specific pain points this product addresses:

- **No trusted marketplace.** Any player looking for a coach faces unverified profiles, no credentials, no way to distinguish a genuine coach from a self-declared one.
- **No portable proof of ability.** A player's improvement, tournament history and coach assessments are scattered across platforms with no single portable record a team, sponsor or recruiter can review.
- **Cross-border payment friction.** Paying an international coach in USD from Kenya is expensive. Converting KES to USD across many small payments loses money and makes cross-border coaching economically unsustainable at scale for both coach and player.
- **Coaches cannot build a reputation or a business.** There is no lightweight infrastructure for an African esports coach to list their services, get paid reliably, and build a verifiable track record.
- **Teams have no visibility.** A team manager has no way to track whether their players are actually developing, confirm that sessions happened, or tie coaching investment to measurable outcomes.

---

## 2. Solution Overview

Coach2Earn is an esports coaching marketplace that turns gaming into a professional pathway. It connects players with credible, human-verified coaches, enables structured coaching programmes with measurable progress, processes payments through PayPal, and gives every stakeholder — player, coach, team, and reviewer — a dedicated view of what is happening.

The platform has four tightly integrated pillars:

| Pillar | What it does |
|---|---|
| **Skills Passport** | A portable, evidence-based player profile with skill scores, gameplay evidence, development history and a shareable public link |
| **Coach Marketplace** | A searchable directory of verified coaches with full profiles, credentials, reviews, packages and availability |
| **AI Agents** | Rule-based agents that match players to coaches, build personalised training plans, assist coaches with session prep, and help reviewers analyse submissions |
| **Payments** | PayPal Sandbox-integrated booking and checkout with server-side verification, simulated fallback, and a transparent ledger |

All four user roles share a single live state. An action taken by a player (booking a session) immediately appears for the coach (booking request), the team (player activity), and the reviewer (if a new coach was involved). This is a full end-to-end demo.

---

## 3. Who It Is For

### Players
Competitive gamers who want to find a credible, affordable coach for their game — someone with verified credentials, not just self-reported claims. They want to track their improvement with real measurements, not just feelings.

### Coaches
Skilled esports players who want to coach professionally. They need a platform that verifies their credentials, handles their bookings and payments, and lets them build a reputation and a transparent income.

### Team Admins
Team managers who invest in their players' development and need visibility. They want to confirm sessions actually happened, track player progress, and understand what development looks like for each roster member.

### Platform Reviewers
The people responsible for the integrity of the marketplace. They review coach credential submissions, decide who gets verified, and maintain an audit trail of every decision.

---

## 4. Core User Journey

```
Player
  └─> Signs up, creates Skills Passport (skills, goals, evidence)
        └─> Runs AI coach matching agent
              └─> Browses coach profiles, reviews credentials
                    └─> Selects package (single session or five-session programme)
                          └─> Chooses available time slot
                                └─> Pays via PayPal (or simulated fallback)
                                      └─> Booking confirmed after server-side capture
                                            └─> Coach receives booking request
                                                  └─> Coach accepts and completes session
                                                        └─> Coach sends feedback and skill assessment
                                                              └─> Team admin confirms the session
                                                                    └─> Player earns coaching points
                                                                          └─> Progress tracked on Skills Passport
```

Every step in this chain is functional in the MVP demo.

---

## 5. Features — Player

### 5.1 Player Dashboard
The player's home screen shows:
- A summary of their Skills Passport completion percentage
- Their current development score
- Active coaching programme name
- Coaching points earned
- Upcoming booking reminder (next confirmed session)
- A recommended next step generated from their skill gaps

### 5.2 Skills Passport
The Skills Passport is the player's portable, verifiable identity on the platform. It contains:

**Profile section**
- Name, location, game, rank, experience level
- Preferred in-game roles (e.g. Striker, Support)
- Team affiliation
- Competitive goal (free text, editable)
- Strengths and development areas

**Skill assessment panel**
Five tracked skill dimensions, each with a baseline score, current score, and target score. The gap between current and target drives AI coach matching. Skills tracked in the demo:
- Aerial control
- Offensive positioning
- Defensive rotations
- Decision-making
- Boost management

A visual progress bar shows current score against target for each skill.

**Gameplay evidence**
Players submit evidence supporting their ability. Each piece of evidence has:
- A type (Gameplay clip, Tournament participation, Match statistics, Performance highlight, Coach assessment, Endorsement)
- A title and optional link
- A status: **Submitted**, **Under review**, **Verified**, or **Needs more information**

Evidence is never auto-verified. A human reviewer on the platform reviews it before it becomes Verified. The app is explicit about what is submitted versus what is verified.

**Development history timeline**
A chronological record of meaningful events: sessions completed, feedback received, skill improvements, milestones reached. Pulled from actual app actions, not manually entered.

**Passport actions**
- **Add evidence** — submit a new piece of gameplay evidence
- **Edit profile** — update location, experience, preferred roles, competitive goal
- **Share Skills Passport** — generates a shareable read-only link

**Stats bar**
- Passport complete % (increases with verified evidence)
- Development score (average of all skill current scores)
- Verified evidence count vs total submitted
- Total sessions completed

### 5.3 Coach Marketplace
A searchable, filterable directory of all coaches on the platform.

**Filters available:**
- Game (Rocket League, EA FC, Valorant)
- Specialisation (e.g. Defensive rotations, Aerial mechanics)
- Price range
- Rating
- Experience (years)
- Verification status
- Language
- Time zone

**Coach card shows:**
- Name, game, location, time zone
- Rating and review count
- Specialisations
- Verification badge (Verified, Pending, etc.)
- Single session and five-session prices
- Languages spoken

### 5.4 Coach Profile
A full individual coach page showing:
- Bio and coaching philosophy
- Credentials (each labelled with source — self-reported vs submitted for review)
- Star rating and written reviews (anonymous)
- Skill strength radar / breakdown (which areas they specialise in)
- Available time slots (next 7 days)
- Package pricing with transparent fee breakdown (coach price + 8% platform fee = total in USD, with illustrative KES estimate)
- Endorsement count and verification status label
- Direct booking button for single session or five-session programme

### 5.5 Booking Flow
A step-by-step booking process:

1. **Select package** — single session (60 min) or five-session programme
2. **Select time slot** — only genuinely available slots are shown (slots already booked by others are locked)
3. **Review order** — shows coach price, platform fee (8%), USD total, and illustrative KES equivalent
4. **Payment** — PayPal Sandbox checkout or simulated payment fallback
5. **Confirmation** — booking status moves to Confirmed only after a successful server-side payment capture

A booking remains in **pending_payment** state until payment is captured. It cannot be confirmed by any other means. The slot is locked as soon as a booking is created to prevent double-booking.

### 5.6 Bookings
A list of all the player's bookings showing:
- Booking reference (e.g. C2E-SEED1)
- Coach name
- Package type
- Date and time
- Status (Pending payment, Confirmed, In progress, Completed, Cancelled)
- Payment source (PayPal Sandbox, Simulated, or Seeded demo)
- Sessions completed vs total

### 5.7 Payments
A full payment history table:
- Booking reference
- Payment source with clear label (PayPal Sandbox, Simulated, Seeded demo)
- PayPal Order ID and Transaction ID (when applicable)
- Amount in USD
- Status (Pending, Approved, Captured, Failed, Cancelled)
- Timestamp

Simulated payments are visually flagged as "NOT PAYPAL" so there is no confusion during the demo.

### 5.8 Progress
A detailed development tracking page showing:
- Full development history timeline with all milestones and events
- Coaching points total and projected bonus percentage
- Sessions completed count
- Development score chart (score at each measurement point)
- Upcoming session details
- Saved development plans (from the AI agent)

### 5.9 AI Assistant (Player view)
See [Section 9 — AI Agents](#9-ai-agents).

### 5.10 Notifications
A notification feed showing all in-app events relevant to the player:
- Payment captured
- Booking confirmed
- Session completed
- Feedback received
- Skills Passport updated
- Session reminder
- Team confirmation received

Notifications can be marked as read individually or all at once.

---

## 6. Features — Coach

### 6.1 Coach Dashboard
A summary view for the coach showing:
- Upcoming bookings count
- Active students count
- Total sessions delivered
- Star rating
- Pending booking requests (require acceptance)
- Upcoming confirmed sessions

### 6.2 Booking Requests (Coach Sessions)
A list of all bookings associated with the coach:
- Player name, package and session details
- Pending requests with an **Accept** action
- In-progress programmes with a **Complete session** action
- Completed sessions

**Completing a session** opens a form for:
- Session notes (internal)
- Player feedback (sent to the player, visible on their passport)
- Skill assessment — coach can choose one skill to assess and record an improvement delta (e.g. +3 points on defensive rotations)

When a session is completed:
- A session record is created
- The player receives a notification with the feedback
- The player's skill score is updated (if a skill assessment was provided)
- A development history entry is added to the player's passport
- The team is notified that a session awaits confirmation

### 6.3 Coach Profile (own view)
The coach can view their own profile as it appears to players, showing all credentials, reviews, packages and verification status.

### 6.4 Earnings Ledger
A simulated earnings ledger (no real payouts are processed in the MVP) showing:
- Total ledger balance (seeded base + new bookings)
- Earnings from new bookings made in this demo
- A line-by-line table of each captured booking with booking ref, player, package, earned amount, payment source and date

### 6.5 AI Assistant (Coach view)
See [Section 9 — AI Agents](#9-ai-agents).

### 6.6 Notifications
- New booking requests
- Session confirmed by team
- Verification status updates

---

## 7. Features — Team Admin

### 7.1 Team Dashboard
An overview of the team (Nairobi Drift in the demo) showing:
- Total coaching points accumulated across the roster
- Projected team bonus percentage
- Per-player summary: name, game, rank, development score, sessions, points

### 7.2 Roster and Player Profiles
- Full roster list with development score and coaching points per player
- Clicking a player shows their development progress, sessions and coaching history

### 7.3 Session Confirmation
The most important action available to the team admin. When a coach marks a session as complete, it appears in the team's session list as **awaiting confirmation**.

The team admin reviews the session details (player, coach, notes, feedback) and clicks **Confirm**. This:
- Marks the session as team-confirmed
- Awards the player 10 coaching points per hour
- Sends a notification to the player and coach
- Adds a milestone to the player's development history

Only team-confirmed sessions count toward coaching points and bonus calculations. This prevents any inflation of session counts.

### 7.4 Team Sessions
A full list of all sessions across the roster, with filters by player, coach, and confirmation status.

### 7.5 Notifications
- Player completed a coaching session (awaiting confirmation)
- New coaching booking made by a player

---

## 8. Features — Platform Reviewer

### 8.1 Verification Queue Dashboard
A summary of the verification workload:
- Pending reviews count
- Decided submissions count
- Open reports and disputes (none in the demo)

### 8.2 Submission Review
Each verification submission shows:
- Coach name, game, submission date
- Submitted evidence: years of experience claimed, specialisation, competition history, number of endorsements claimed vs attached, and all individual credential entries (each with a note indicating whether it is self-reported or independently sourced)
- AI-assisted analysis (see Trust Agent in Section 9) — flags and gaps identified automatically, labelled as a suggestion only
- Decision actions: **Approve**, **Request more information**, or **Reject** — each with a free-text note field
- Full audit trail: every action taken on this submission, by whom and when

### 8.3 Verification Outcomes
When a decision is made:
- The coach's verification status is updated on their profile (Verified, Pending, Info requested, Rejected)
- The coach receives a notification
- The activity feed is updated
- The audit trail is appended

A human reviewer makes every verification decision. The AI assistant is explicitly described as a suggestion tool, not a decision-maker.

### 8.4 AI Assistant (Reviewer view)
See [Section 9 — AI Agents](#9-ai-agents).

---

## 9. AI Agents

All four agents are **deterministic, rule-based functions** that read the application's real state. No external LLM or API is called. The assistant page states this explicitly. Every agent run shows a step-by-step execution trace of the exact functions that ran and the data they operated on.

### Agent 1 — Coach Matching Agent
**Triggered by:** Player asking for a coach recommendation

**What it does:**
1. Reads the player's Skills Passport (name, game, rank, development score)
2. Identifies the player's largest skill gap (target − current for each of the 5 skills)
3. Parses the player's query for game preference, budget, and skill focus
4. Scores every coach on the platform using a transparent weighted formula

**Matching formula (weights sum to 100):**

| Factor | Weight | How it is calculated |
|---|---|---|
| Game match | 30 | Full score if coach's game matches the player's game |
| Gap match | 25 | Coach's recorded strength in the player's biggest gap area |
| Coaching experience | 15 | Years of experience, capped at 6 years for full score |
| Rating | 15 | Star rating above 4.0, scaled to 5.0 |
| Price suitability | 10 | How well the five-session price fits the player's budget |
| Availability | 5 | Number of open slots in the next 7 days |

5. Returns the top 3 coaches with: match percentage, score breakdown per factor, why the coach was selected, strengths, limitations, and full package cost (coach price + 8% platform fee = USD total + illustrative KES figure)
6. Logs the match event to the player's development timeline

**Example result (Alex Mwangi, Rocket League, defensive rotations, $150 budget):**
- Dani K. — 91% match
- Marcus T. — 71% match
- Sofia R. — 51% match

### Agent 2 — Player Development Agent
**Triggered by:** Player asking for a development plan

**What it does:**
1. Reads the player's Skills Passport
2. Identifies the biggest skill gap
3. Builds a 4-week training plan with:
   - Weekly focus areas and measurable objectives
   - Score checkpoints (target scores at the end of each week — clearly labelled as targets, not guarantees)
4. Calls the Coach Matching Agent internally to recommend a coaching package
5. Defines three milestones for the programme
6. Returns a saveable plan

Saved plans appear on the player's Progress page.

### Agent 3 — Coach Operations Agent
**Triggered by:** Coach asking for a session or bookings summary

**What it does:**
1. Lists all the coach's current bookings (upcoming, pending acceptance)
2. Counts pending requests and upcoming sessions
3. Generates a personalised session outline for the next player by reading that player's Skills Passport (current skill levels, goals, biggest gap)
4. Provides a structured feedback template
5. Summarises the simulated earnings ledger

### Agent 4 — Trust and Verification Agent
**Triggered by:** Reviewer selecting a coach submission for analysis

**What it does:**
1. Loads the coach's verification submission
2. Identifies missing required information (e.g. no competition history, no credentials)
3. Checks for inconsistencies (e.g. years claimed vs years implied by credential dates, endorsements claimed vs attached, self-reported claims with no evidence link)
4. Suggests an action (Approve or Request more information) based on the number of flags

**Critical design principle:** The agent's output is explicitly labelled "suggestion only." The human reviewer reads the analysis and makes the final decision. The agent cannot approve, reject, or update any coach record on its own.

---

## 10. PayPal Sandbox Integration

The payment system uses PayPal's Orders API v2 with a Node.js/Express backend that holds the credentials securely server-side.

### Payment Flow

| Step | Where it happens |
|---|---|
| 1. Player selects package and confirms booking | Browser → `/api/paypal/create-order` |
| 2. Server looks up the authoritative package price (never trusts the client's amount) | `server/index.js` |
| 3. Server creates a PayPal order via the Orders API v2 | Server → PayPal API |
| 4. Player sees the PayPal checkout popup and pays with their Sandbox buyer account | PayPal JS SDK in browser |
| 5. Browser sends the approved order ID to the server | Browser → `/api/paypal/capture-order` |
| 6. Server captures the order via PayPal and verifies: status = COMPLETED, currency = USD, amount matches the server's own record | Server → PayPal API |
| 7. Only a fully verified capture updates the booking to Confirmed and the payment to Captured | `src/store.jsx` |

### Package Pricing (server-side, authoritative)

| Package | Coach | Price | Platform fee (8%) | Total |
|---|---|---|---|---|
| Single assessment | Dani K. | $30 | $2.40 | $32.40 |
| Five-session programme | Dani K. | $150 | $12.00 | $162.00 |
| Single session | Marcus T. | $25 | $2.00 | $27.00 |
| Five-session programme | Marcus T. | $120 | $9.60 | $129.60 |
| Single session | Sofia R. | $35 | $2.80 | $37.80 |
| Five-session programme | Sofia R. | $165 | $13.20 | $178.20 |
| Single session | Kai N. | $28 | $2.24 | $30.24 |
| Five-session programme | Kai N. | $130 | $10.40 | $140.40 |

All charges are in USD. KES figures shown in the UI use a fixed illustrative rate of 129 KES/USD and are estimates only — no KES transaction is processed.

### Simulated Payment Fallback
If PayPal credentials are not configured, the booking flow offers a **"Use simulated payment"** button. Simulated payments are:
- Recorded in the payment ledger with provider = `simulated`
- Visually labelled "NOT PAYPAL" in all payment tables
- Never presented as real PayPal transactions
- Available as a reliable demo fallback

### Payment States
`Pending` → `Approved` → `Captured` (success path)
`Pending` → `Failed` or `Cancelled` (failure path)

Only `Captured` confirms a booking. Clicking "Approve" in PayPal alone does not confirm it — the server-side capture and verification step is required.

---

## 11. Coaching Points and Bonus Model

This is a demonstration of how a team bonus could work in a real deployment. No real payments are made.

| Rule | Detail |
|---|---|
| Points awarded | 10 points per team-confirmed coaching hour |
| Confirmation required | A team admin must explicitly confirm each session for points to count |
| Bonus formula | `bonus % = min(10, points × 0.025)` |
| Cap | 10% (requires 400 points = 40 confirmed coaching hours) |
| Example | 280 points = 7% projected bonus |

Points are not withdrawable cash. In a real deployment, a team bonus would only be paid after the team's prize money is actually received. The UI labels all bonus figures as "projected."

---

## 12. Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express |
| State management | React Context + localStorage (no database) |
| Payment processing | PayPal Orders API v2 (Sandbox) |
| Build tool | Vite |

### Architecture Overview

```
Browser (React SPA)
  │
  ├── localStorage  ← all app state (players, coaches, bookings, sessions, etc.)
  │
  └── Express API (server/index.js)
        │
        ├── GET  /api/config            → PayPal configuration check
        ├── GET  /api/quote/:packageId  → Server-side pricing lookup
        ├── POST /api/paypal/create-order  → Creates PayPal order
        └── POST /api/paypal/capture-order → Captures + verifies PayPal order
```

### State Model
All application state is held in browser `localStorage` and managed through a single React Context (`StoreProvider`). The state is seeded with demo data on first load and persists across refreshes. A "Reset demo" button in the top bar wipes localStorage and reloads fresh seed data.

State includes: `coaches`, `players`, `slots`, `bookings`, `payments`, `sessions`, `evidence`, `timeline`, `notifications`, `verifications`, `activity`, `plans`, `team`.

### Role Switching
The app supports four roles that share the same state. Switching roles from the top bar (or landing page) changes which dashboard and navigation items are shown. All four roles can be active in the same browser session simultaneously (one at a time), allowing a demo to show the full journey without multiple accounts.

---

## 13. Project Structure

```
Coach2EarnMVP/
│
├── server/
│   └── index.js              Express API: PayPal order create/capture, server-side pricing
│
├── src/
│   ├── main.jsx              App entry point
│   ├── App.jsx               Routes and role-based navigation
│   ├── store.jsx             Shared state, actions, selectors (localStorage)
│   ├── agents.js             Four rule-based AI agents and matching formula
│   ├── styles.css            Global styles
│   │
│   ├── data/
│   │   └── seed.js           All seeded demo data (coaches, players, slots, bookings, etc.)
│   │
│   ├── components/
│   │   ├── Layout.jsx        App shell, top bar, role switcher, navigation
│   │   ├── CoachCard.jsx     Reusable coach listing card
│   │   └── ui.jsx            Shared UI components (Badge, Card, Modal, Progress, etc.)
│   │
│   └── pages/
│       ├── Landing.jsx       Public landing page
│       ├── PlayerDashboard.jsx
│       ├── Passport.jsx      Skills Passport (player + shared read-only view)
│       ├── Marketplace.jsx   Coach directory with filters
│       ├── CoachProfile.jsx  Individual coach profile
│       ├── Booking.jsx       Booking flow + PayPal checkout
│       ├── Bookings.jsx      Player bookings list
│       ├── Payments.jsx      Payment history table
│       ├── Progress.jsx      Player progress and development history
│       ├── Assistant.jsx     AI agent interface (all roles)
│       ├── Notifications.jsx
│       ├── CoachDashboard.jsx
│       ├── CoachSessions.jsx Coach booking management + session completion
│       ├── Earnings.jsx      Coach earnings ledger
│       ├── TeamDashboard.jsx
│       ├── TeamPlayer.jsx    Individual player view for team admin
│       ├── TeamSessions.jsx  Session confirmation queue
│       ├── ReviewerDashboard.jsx Verification queue
│       └── Activity.jsx      Platform activity feed for reviewer
│
├── docs/
│   ├── PRODUCT_DOCUMENTATION.md  (this file)
│   └── VIDEO_SCRIPT.md
│
├── .env.example              Environment variable template
├── package.json
├── vite.config.js
└── README.md
```

---

## 14. Environment Variables

All variables are server-side only. The `.env` file is git-ignored and never sent to the browser.

| Variable | Required | Description |
|---|---|---|
| `PAYPAL_CLIENT_ID` | For live PayPal | From developer.paypal.com → Apps & Credentials → Sandbox → your app |
| `PAYPAL_CLIENT_SECRET` | For live PayPal | Same page. Never exposed to the browser. |
| `PAYPAL_BASE_URL` | Optional | Default: `https://api-m.sandbox.paypal.com` |
| `PORT` | Optional | Default: `3001` |

If `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are not set, the app runs in simulated fallback mode. Everything works except real PayPal checkout.

---

## 15. Running the App Locally

Requires Node.js 18 or later.

```bash
# Install dependencies
npm install

# Copy the environment template
cp .env.example .env    # macOS / Linux
copy .env.example .env  # Windows

# Fill in your PayPal Sandbox credentials in .env (optional)

# Start development server (frontend on :5173, API on :3001)
npm run dev

# OR: build and serve everything from one port
npm start               # serves at http://localhost:3001
```

Verify PayPal is configured: open `http://localhost:5173/api/config` and check for `"paypalConfigured": true`.

For PayPal checkout, log in at the checkout popup with your **Sandbox buyer** account. The payment will appear in the Sandbox business account at sandbox.paypal.com.

---

## 16. Demo Guide

A full 5-minute demo covering the entire platform end-to-end.

### Step 1 — Landing page
Open the app. The landing page shows the product value proposition, featured coaches, and the demo role panel.

### Step 2 — Player: Skills Passport
Click **Enter demo** or **Build Your Skills Passport**. You are Alex Mwangi, a Rocket League Champion in Nairobi. Open the Skills Passport and point out:
- The defensive rotations gap (current 61, target 80 — the biggest gap)
- The gameplay evidence with different statuses (Submitted vs Verified)
- The development history timeline

### Step 3 — AI Coach Matching
Open the **AI Assistant**. The demo prompt is pre-filled: *"Find me a Rocket League coach who can help improve my defensive rotations and prepare me for competitive tournaments. My budget is $150."*

Click **Run** and show:
- The execution trace (what functions ran and what data they used)
- The top 3 results with match percentages
- The score breakdown for Dani K. (91% match)
- Strengths and limitations for each recommendation

### Step 4 — Coach Profile
Click **View profile** for Dani K. Show:
- Credentials (labelled self-reported vs submitted for review)
- Reviews and rating
- Packages with transparent pricing ($150 + $12 fee = $162 total, ~KES 20,898 illustrative)
- Available time slots

### Step 5 — Booking and Payment
Click **Book five-session programme**. Walk through:
- Package selection
- Time slot selection
- Price review ($162.00 USD)
- PayPal checkout (log in with Sandbox buyer account) OR use Simulated Payment

After payment: booking status becomes Confirmed, a notification arrives.

### Step 6 — Switch to Coach
Use the role switcher in the top bar. Switch to **Coach (Dani K.)**. Show:
- The new booking from Alex in the sessions list
- Click **Accept** on the booking request
- Click **Complete session**, enter notes, feedback, and a skill assessment (+3 on defensive rotations)

### Step 7 — Switch to Team Admin
Switch to **Team (Nairobi Drift)**. Show:
- Alex's session appears as awaiting confirmation
- Click **Confirm session** → Alex earns 10 coaching points
- Team bonus percentage updates

### Step 8 — Back to Player: Progress
Switch back to **Player**. Open **Progress**:
- New session appears in the timeline with Dani's feedback
- Development score updated
- Coaching points increased
- Skill assessment visible (+3 on defensive rotations)
- Milestone: "First coaching session completed"

### Step 9 — Reviewer (optional)
Switch to **Reviewer**. Show:
- Verification queue with Dani K. and Kai N. submissions
- AI-assisted analysis flags (suggestion only)
- Click **Approve** for Dani K. with a decision note
- Audit trail records the decision
- Dani's profile now shows a Verified badge

### Reset
Use the **Reset demo** button in the top bar at any time to return all data to the original seeded state.

---

## 17. Built vs. Planned

This is a hackathon MVP. The table below is honest about what is functional versus what is planned for a full product.

| Area | In this MVP | Planned / not built |
|---|---|---|
| **Payments** | PayPal Sandbox Orders API (create + capture + server verification), simulated fallback | PayPal Payouts API for coach disbursements, webhooks (`PAYMENT.CAPTURE.COMPLETED`), M-Pesa and card options |
| **Coach earnings** | Simulated ledger (no real disbursements) | Real payouts and escrow management |
| **FX / cross-border** | Illustrative KES estimate at a fixed demo rate | Live rate lookup, bulk conversion, measured FX savings |
| **AI** | Deterministic rule-based agents over real app data | LLM-generated match reasoning with deterministic fallback |
| **Scheduling** | Seeded availability slots | Calendly embed, calendar invites, timezone-aware booking |
| **Evidence verification** | Seeded evidence with statuses, human reviewer workflow | Ballchasing.com replay stat integration for automated evidence |
| **Data persistence** | localStorage (browser only) | Hosted backend, database, user accounts, authentication |
| **Compliance** | Not claimed | Under-18 consent flow, KRA eTIMS integration through a certified provider |
| **Coach onboarding** | Pre-seeded coaches only | Self-registration, credential upload, onboarding flow |
| **Mobile** | Responsive web | Native mobile apps |

---

## 18. Trust Principles

These principles guided every design decision in the platform:

1. **A human reviews every coach before they are verified.** The AI trust agent organises evidence and flags inconsistencies, but the approve/reject decision belongs to the human reviewer alone. The system enforces this — the agent has no authority to change a verification status.

2. **Submitted is not the same as verified.** Evidence submitted by players and coaches is clearly labelled by status at every point in the UI. Nothing is described as verified unless a human has reviewed it.

3. **Nothing is described as AI-analysed unless it was.** Evidence on the Skills Passport is not run through any AI analysis. The label on gameplay evidence states this explicitly.

4. **Seeded data is labelled as seeded.** Demo profiles, scores, results and credentials are marked as demo data throughout the app. No seeded figure is presented as a real achievement.

5. **Simulated payments are always labelled.** A simulated payment is never shown as a PayPal transaction. It carries a "NOT PAYPAL" label in every table where it appears.

6. **One session is never presented as proof of large improvement.** Score improvements are coach-assessed deltas applied incrementally, not inflated demonstration figures.

7. **The platform never takes custody of a player's progress story.** The Skills Passport has a shareable public link so players can take their development history with them regardless of what happens to the platform.

---

*Coach2Earn — Built at the PayPal AI Hackathon, BARBAH Games, Challenge 01.*
*Team: Hope, Reberatha, Yasmin, Brian.*
