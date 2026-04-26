import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { analyticsAPI } from '../api/axios';
import Navbar from '../components/Navbar';

const STATUS_COLORS = { todo: '#94a3b8', 'in-progress': '#3b82f6', done: '#10b981' };
const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function StatCard({ label, value, sub, color = 'text-gray-900', icon }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [tags, setTags] = useState([]);
  const [trendDays, setTrendDays] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ov, tr, tg] = await Promise.all([
          analyticsAPI.getOverview(),
          analyticsAPI.getTrends(trendDays),
          analyticsAPI.getTags(),
        ]);
        setOverview(ov.data);
        setTrends(tr.data.trends);
        setTags(tg.data.tags);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [trendDays]);

  const statusPieData = overview
    ? Object.entries(overview.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];
  const priorityBarData = overview
    ? Object.entries(overview.priorityBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
          Loading analytics...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Your productivity at a glance</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Total Tasks" value={overview?.totalTasks ?? 0} />
          <StatCard icon="✅" label="Completion Rate" value={`${overview?.completionRate ?? 0}%`} color="text-emerald-600" sub="of all tasks done" />
          <StatCard icon="⚠️" label="Overdue" value={overview?.overdueTasks ?? 0} color="text-red-500" sub="need attention" />
          <StatCard icon="🚀" label="Done (30 days)" value={overview?.recentlyCompleted ?? 0} color="text-blue-600" sub="recently completed" />
        </div>

        {/* Trend Chart + Status Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Area Trend */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Task Activity</h2>
              <div className="flex gap-1">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setTrendDays(d)}
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${trendDays === d ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="created" name="Created" stroke="#3b82f6" fill="url(#gradCreated)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#gradCompleted)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Donut */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {statusPieData.map(({ name }) => (
                    <Cell key={name} fill={STATUS_COLORS[name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {statusPieData.map(({ name, value }) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: STATUS_COLORS[name] }} />
                    <span className="text-gray-600 capitalize">{name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Bar + Tag Cloud */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Bar */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Tasks by Priority</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={priorityBarData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tasks" radius={[4, 4, 0, 0]}>
                  {priorityBarData.map(({ name }) => (
                    <Cell key={name} fill={PRIORITY_COLORS[name] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Tags */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Top Tags</h2>
            {tags.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No tags yet</p>
            ) : (
              <div className="space-y-2">
                {tags.map(({ tag, count }, i) => {
                  const max = tags[0]?.count || 1;
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={tag}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">#{tag}</span>
                        <span className="text-gray-500">{count} tasks</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
