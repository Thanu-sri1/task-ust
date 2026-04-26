import React, { useState, useEffect } from 'react';
import { userAPI, taskAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const DEPARTMENTS = [
  '', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Finance', 'HR', 'Operations', 'DevOps', 'QA', 'Data Science', 'Customer Success',
];

export default function Profile() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', phone: '', department: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([userAPI.getProfile(), taskAPI.getStats()]);
        const p = profileRes.data;
        setProfile(p);
        setStats(statsRes.data);
        setForm({ name: p.name || '', bio: p.bio || '', phone: p.phone || '', department: p.department || '' });
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      setProfile(data.profile);
      // Update auth context name so navbar reflects it
      login({ ...user, name: form.name }, localStorage.getItem('token'));
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading profile...</div>
    </>
  );

  const initials = (profile?.name || user?.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — avatar + stats */}
          <div className="space-y-4">
            {/* Avatar card */}
            <div className="card text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {initials}
              </div>
              <h2 className="font-bold text-gray-900">{profile?.name}</h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              {profile?.department && (
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {profile.department}
                </span>
              )}
              {user?.role === 'admin' && (
                <span className="inline-block mt-2 ml-1 px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Admin
                </span>
              )}
              {profile?.bio && (
                <p className="text-sm text-gray-500 mt-3 text-left">{profile.bio}</p>
              )}
            </div>

            {/* Task stats */}
            {stats && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">My Tasks</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Total', value: stats.total, color: 'text-gray-900' },
                    { label: 'To Do', value: stats.todo, color: 'text-gray-500' },
                    { label: 'In Progress', value: stats['in-progress'], color: 'text-blue-600' },
                    { label: 'Done', value: stats.done, color: 'text-emerald-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className={`font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
                {stats.total > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Completion</span>
                      <span>{Math.round((stats.done / stats.total) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.round((stats.done / stats.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — edit form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-5">Edit Profile</h2>
              <form onSubmit={handleSave} className="space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input className="input bg-gray-50 cursor-not-allowed" value={profile?.email || ''} disabled />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input className="input" placeholder="+1 234 567 8900" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d || 'Select department…'}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    className="input resize-none"
                    rows={4}
                    placeholder="Tell us a little about yourself…"
                    maxLength={500}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/500</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="btn-secondary" onClick={() => setForm({ name: profile?.name || '', bio: profile?.bio || '', phone: profile?.phone || '', department: profile?.department || '' })}>
                    Reset
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
