import React, { useState, useEffect } from 'react';
import { userAPI, analyticsAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Guard — redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [usersRes, statsRes] = await Promise.all([
          userAPI.getAll({ limit: 100 }),
          analyticsAPI.getAdminOverview(),
        ]);
        setUsers(usersRes.data.users);
        setGlobalStats(statsRes.data);
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete profile for "${name}"? This removes their profile data only.`)) return;
    setDeleting(userId);
    try {
      await userAPI.delete(userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading admin panel…</div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🛡️</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Manage users and view global statistics</p>
          </div>
        </div>

        {/* Global stats */}
        {globalStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: users.length, icon: '👥', color: 'text-blue-600' },
              { label: 'Total Tasks', value: globalStats.totalTasks, icon: '📋', color: 'text-gray-900' },
              { label: 'Done', value: globalStats.statusBreakdown.done, icon: '✅', color: 'text-emerald-600' },
              { label: 'In Progress', value: globalStats.statusBreakdown['in-progress'], icon: '🔄', color: 'text-yellow-600' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="card text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* User table */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">All Users ({filtered.length})</h2>
            <input
              className="input max-w-xs text-sm py-1.5"
              placeholder="Search by name, email, department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Department', 'Phone', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
                ) : filtered.map((u) => {
                  const initials = u.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
                  return (
                    <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-gray-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {u.department
                          ? <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{u.department}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{u.phone || <span className="text-gray-300">—</span>}</td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-6 py-3">
                        {u.userId === user?.id ? (
                          <span className="text-xs text-gray-400 italic">You</span>
                        ) : (
                          <button
                            onClick={() => handleDelete(u.userId, u.name)}
                            disabled={deleting === u.userId}
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-40"
                          >
                            {deleting === u.userId ? 'Deleting…' : 'Remove'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
