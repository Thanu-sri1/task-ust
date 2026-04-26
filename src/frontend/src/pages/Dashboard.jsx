import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Navbar from '../components/Navbar';

const FILTERS = ['all', 'todo', 'in-progress', 'done'];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ todo: 0, 'in-progress': 0, done: 0, total: 0 });
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (priority !== 'all') params.priority = priority;
      const [tasksRes, statsRes] = await Promise.all([taskAPI.getAll(params), taskAPI.getStats()]);
      setTasks(tasksRes.data.tasks);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, priority]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (data) => {
    if (editingTask) await taskAPI.update(editingTask._id, data);
    else await taskAPI.create(data);
    setEditingTask(null);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await taskAPI.delete(id);
    fetchTasks();
  };

  const handleStatusChange = async (id, status) => {
    await taskAPI.update(id, { status });
    fetchTasks();
  };

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: 'To Do', value: stats.todo, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: 'In Progress', value: stats['in-progress'], color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Done', value: stats.done, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`card text-center ${bg}`}>
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="card mb-6 py-3">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Overall progress</span>
              <span className="font-semibold text-gray-900">{completionPct}% complete</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            {/* Priority filter */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button onClick={openCreate} className="btn-primary text-sm whitespace-nowrap">
            + New Task
          </button>
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-400 text-sm mt-1">
              <button onClick={openCreate} className="text-blue-600 hover:underline">Create your first task</button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
