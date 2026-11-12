import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import PlayerDashboard from './pages/PlayerDashboard.jsx';
import Passport from './pages/Passport.jsx';
import Marketplace from './pages/Marketplace.jsx';
import CoachProfile from './pages/CoachProfile.jsx';
import Assistant from './pages/Assistant.jsx';
import Booking from './pages/Booking.jsx';
import Bookings from './pages/Bookings.jsx';
import Payments from './pages/Payments.jsx';
import Progress from './pages/Progress.jsx';
import Notifications from './pages/Notifications.jsx';
import CoachDashboard from './pages/CoachDashboard.jsx';
import CoachSessions from './pages/CoachSessions.jsx';
import Earnings from './pages/Earnings.jsx';
import TeamDashboard from './pages/TeamDashboard.jsx';
import TeamPlayer from './pages/TeamPlayer.jsx';
import TeamSessions from './pages/TeamSessions.jsx';
import ReviewerDashboard from './pages/ReviewerDashboard.jsx';
import Activity from './pages/Activity.jsx';

const Home = () => {
  const { state } = useStore();
  return { player: <PlayerDashboard />, coach: <CoachDashboard />, team: <TeamDashboard />, reviewer: <ReviewerDashboard /> }[state.role];
};

// Pages that only make sense for one role; anything else bounces to the role's home.
const Only = ({ roles, children }) => {
  const { state } = useStore();
  return roles.includes(state.role) ? children : <Navigate to="/app" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/passport/:id" element={<Passport shared />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="passport" element={<Only roles={['player']}><Passport /></Only>} />
        <Route path="coaches" element={<Only roles={['player']}><Marketplace /></Only>} />
        <Route path="coaches/:id" element={<Only roles={['player']}><CoachProfile /></Only>} />
        <Route path="book/:coachId" element={<Only roles={['player']}><Booking /></Only>} />
        <Route path="payments" element={<Only roles={['player']}><Payments /></Only>} />
        <Route path="progress" element={<Only roles={['player']}><Progress /></Only>} />
        <Route path="bookings" element={<Only roles={['player', 'coach']}><BookingsRouter /></Only>} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Only roles={['coach']}><CoachProfile own /></Only>} />
        <Route path="earnings" element={<Only roles={['coach']}><Earnings /></Only>} />
        <Route path="sessions" element={<Only roles={['team']}><TeamSessions /></Only>} />
        <Route path="player/:id" element={<Only roles={['team']}><TeamPlayer /></Only>} />
        <Route path="activity" element={<Only roles={['reviewer']}><Activity /></Only>} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function BookingsRouter() {
  const { state } = useStore();
  return state.role === 'coach' ? <CoachSessions /> : <Bookings />;
}
