import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  Calendar,
  Layers
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function ActivityLogsPage() {
  const { user, isRegistrar } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.activity.getLogs();
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error('Failed loading activity logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    (l.action && l.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.land_id && l.land_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.user_email && l.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>National Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-white">System Activity & Governance Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegistrar 
              ? 'Complete multi-user audit logging across all land submissions, approvals, and chaincode executions.'
              : 'Audit trail of all actions initiated from your citizen identity.'}
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by action, Land ID, user email..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving audit records from SQLite..." />
      ) : filteredLogs.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/50 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Log ID</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action Code</th>
                <th className="px-5 py-3.5">Actor User</th>
                <th className="px-5 py-3.5">Target Land ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                if (log.action.includes('APPROVED')) {
                  badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                } else if (log.action.includes('REJECTED')) {
                  badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                } else if (log.action.includes('TRANSFER')) {
                  badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
                } else if (log.action.includes('SUBMITTED')) {
                  badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                }

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-400">#{log.id}</td>
                    <td className="px-5 py-4 text-slate-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badgeColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{log.user_name || user?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.user_email || user?.email}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                      {log.land_id || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="No Logs Recorded"
          description="There are no audit logs matching your search filter."
        />
      )}
    </div>
  );
}

