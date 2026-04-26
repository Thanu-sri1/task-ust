import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../api/axios';
import Navbar from '../components/Navbar';

const TYPE_ICON  = { task_created: '✅', task_completed: '🎉', task_overdue: '⚠️', task_updated: '✏️', welcome: '👋' };
const TYPE_COLOR = { task_created: 'bg-blue-50 text-blue-700', task_completed: 'bg-emerald-50 text-emerald-700', task_overdue: 'bg-red-50 text-red-700', task_updated: 'bg-yellow-50 text-yellow-700', welcome: 'bg-purple-50 text-purple-700' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { unread: 'true', limit: 50 } : { limit: 50 };
      const { data } = await notificationAPI.getAll(params);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [filter]);

  const handleMarkRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id) => {
    await notificationAPI.delete(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary text-sm">Mark all read</button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {['all', 'unread'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-gray-500">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`card transition-all ${!n.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${TYPE_COLOR[n.type] || 'bg-gray-100'}`}>
                    {TYPE_ICON[n.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-semibold text-sm ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(n.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n._id)} title="Mark read"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs">
                        ✓
                      </button>
                    )}
                    <button onClick={() => handleDelete(n._id)} title="Delete"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
