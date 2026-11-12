import React from 'react';
import { useStore } from '../store.jsx';
import { Card, Empty, fmtWhen } from '../components/ui.jsx';

export default function Notifications() {
  const { state, actions } = useStore();
  const list = state.notifications.filter((n) => n.audience === state.role);
  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="row between page-head"><h1>Notifications</h1><button className="btn btn-sm" onClick={() => actions.markAllRead(state.role)}>Mark all as read</button></div>
      <Card>
        {list.length === 0 ? <Empty title="You are all caught up">New events will appear here.</Empty> : list.map((n) => (
          <div key={n.id} className={`notif ${n.read ? '' : 'unread'}`}>
            <div className="grow"><div className="n-title">{n.title}</div><div className="small muted">{n.body}</div><div className="small muted">{fmtWhen(n.ts)}</div></div>
            {!n.read && <button className="btn btn-sm" onClick={() => actions.markRead(n.id)}>Mark read</button>}
          </div>))}
      </Card>
    </div>
  );
}
