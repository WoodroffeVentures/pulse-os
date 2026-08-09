'use client';
import { useState, useEffect } from 'react';
import { listTasks } from '@/lib/queries/tasks';
import { listProperties } from '@/lib/queries/properties';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Wrench, Home, Star, DollarSign, CheckCircle, Search } from 'lucide-react';

const ORG_ID = 'a1b2c3d4-0001-0001-0001-000000000001';

const categoryIcons: Record<string, React.ReactNode> = {
  housekeeping: <Home className="w-3 h-3" />,
  maintenance: <Wrench className="w-3 h-3" />,
  guest_services: <Star className="w-3 h-3" />,
  finance: <DollarSign className="w-3 h-3" />,
  compliance: <CheckCircle className="w-3 h-3" />,
  inspection: <Search className="w-3 h-3" />,
  operations: <Wrench className="w-3 h-3" />,
};

const columns: { key: string; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
];

function formatDue(due?: string) {
  if (!due) return null;
  const d = new Date(due);
  const now = new Date();
  const diff = Math.round((d.getTime() - now.getTime()) / 3600000);
  if (diff < 0) return `${Math.abs(diff)}h overdue`;
  if (diff < 24) return `Due in ${diff}h`;
  return `Due ${d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`;
}

export default function TasksPage() {
  const [propertyFilter, setPropertyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    Promise.all([listTasks(ORG_ID), listProperties(ORG_ID)])
      .then(([t, p]) => { setAllTasks(t.rows); setProperties(p.rows); setSource(t.source); })
      .catch(console.error);
  }, []);

  const filtered = allTasks.filter((t: any) => {
    if (propertyFilter !== 'All' && t.property_id !== propertyFilter) return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    return true;
  });

  const byStatus = (status: string) =>
    filtered.filter((t: any) => t.status === status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f1f5f9]">Task Engine</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            {allTasks.filter((t: any) => t.status !== 'completed').length} active tasks across all properties
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#3b82f6] text-white text-xs font-medium px-3 py-2 rounded hover:bg-[#2563eb] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-1.5 outline-none focus:border-[#3b82f6]"
        >
          <option value="All">All Properties</option>
          {properties.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-1.5 outline-none focus:border-[#3b82f6]"
        >
          <option value="All">All Categories</option>
          {['housekeeping', 'maintenance', 'guest_services', 'finance', 'compliance', 'inspection'].map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col: any) => {
          const tasks = byStatus(col.key);
          return (
            <div key={col.key} className="flex flex-col gap-3">
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                col.key === 'overdue' ? 'bg-red-500/5 border-red-500/20' :
                col.key === 'in_progress' ? 'bg-amber-500/5 border-amber-500/20' :
                col.key === 'completed' ? 'bg-green-500/5 border-green-500/20' :
                'bg-[#111318] border-[#1e2028]'
              }`}>
                <span className={`text-xs font-semibold tracking-widest uppercase ${
                  col.key === 'overdue' ? 'text-red-400' :
                  col.key === 'in_progress' ? 'text-amber-400' :
                  col.key === 'completed' ? 'text-green-400' :
                  'text-[#64748b]'
                }`}>
                  {col.label}
                </span>
                <span className="text-xs font-mono text-[#64748b]">{tasks.length}</span>
              </div>

              {/* Task Cards */}
              {tasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`bg-[#111318] border rounded-lg p-3 cursor-pointer hover:border-[#2d3142] transition-colors ${
                    task.status === 'overdue' ? 'border-red-500/20' : 'border-[#1e2028]'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`mt-0.5 flex-shrink-0 ${
                      task.status === 'overdue' ? 'text-red-400' :
                      task.category === 'maintenance' ? 'text-orange-400' :
                      task.category === 'housekeeping' ? 'text-teal-400' :
                      task.category === 'guest_services' ? 'text-blue-400' :
                      'text-[#64748b]'
                    }`}>
                      {categoryIcons[task.category] ?? <Wrench className="w-3 h-3" />}
                    </span>
                    <p className="text-xs font-medium text-[#f1f5f9] leading-relaxed">{task.title}</p>
                  </div>
                  <div className="text-[10px] text-[#64748b] mb-2">
                    {properties.find((p: any) => p.id === task.property_id)?.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={task.priority} />
                    {task.due_at && (
                      <span className={`text-[10px] font-mono ${
                        task.status === 'overdue' ? 'text-red-400' : 'text-[#64748b]'
                      }`}>
                        {formatDue(task.due_at)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={task.category} />
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-6 text-xs text-[#374151]">No tasks</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
