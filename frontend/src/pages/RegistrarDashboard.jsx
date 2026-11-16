import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  ClipboardList, 
  ArrowRightLeft, 
  Landmark, 
  Users, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Cpu,
  Activity,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import BlockchainBadge from '../components/BlockchainBadge';

export default function RegistrarDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.stats.getRegistrarStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed loading registrar stats:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Accessing Chief Registrar Command Console & Fabric Nodes..." />;
  }

  return (
    <div className="space-y-8">
      {/* Official Registrar Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Chief Land Registrar Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Office of the Land Registrar</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative verification authority for digital deed validation, title endorsements, and Hyperledger Fabric chaincode execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/registrar/pending-registrations"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Review Registrations ({stats?.pendingRegistrations || 0})</span>
          </Link>
          <Link
            to="/registrar/pending-transfers"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Review Transfers ({stats?.pendingTransfers || 0})</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Governance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Properties</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats?.totalProperties ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Active on Hyperledger Fabric</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Citizens</span>
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-teal-400 mt-3">{stats?.totalCitizens ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Verified Portal Accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Registrations</span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-3">{stats?.pendingRegistrations ?? 0}</div>
          <div className="text-xs text-amber-300/70 mt-1">Requires Legal Approval</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/30 bg-cyan-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Pending Transfers</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-3">{stats?.pendingTransfers ?? 0}</div>
          <div className="text-xs text-cyan-300/70 mt-1">Awaiting Ownership Deed Sign-off</div>
        </div>
      </div>

      {/* Statistics & Activity Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Blockchain Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Fabric Blockchain Commits</h2>
              <p className="text-xs text-slate-400">Immutable transactions committed to channel mychannel</p>
            </div>
            <Link to="/transactions" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              <span>View Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Block #</th>
                  <th className="px-4 py-3">Tx ID</th>
                  <th className="px-4 py-3">Function</th>
                  <th className="px-4 py-3">Land ID</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((tx, idx) => (
                    <tr key={tx.txId || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-cyan-400 font-bold">#{tx.blockNumber || idx + 1}</td>
                      <td className="px-4 py-3">
                        <BlockchainBadge txId={tx.txId} compact />
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-emerald-400 border border-slate-700">
                          {tx.function}()
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{tx.landId}</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Registrar Ledger Diagnostics & Queue Status */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Consensus Health</h2>
            <p className="text-xs text-slate-400">Fabric Node & Queue Metrics</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 mb-1">Total Approved Titles</div>
              <div className="text-2xl font-extrabold text-emerald-400">{stats?.totalApprovedRegistrations ?? 0}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Endorsed by Chief Registrar</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 mb-1">Total Approved Transfers</div>
              <div className="text-2xl font-extrabold text-cyan-400">{stats?.totalApprovedTransfers ?? 0}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Executed on Fabric Chaincode</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="text-slate-400">Total System Transactions: <span className="font-bold text-white">{stats?.totalTransactions ?? 0}</span></div>
              <div className="text-slate-400">Chaincode: <span className="font-mono text-emerald-400 font-semibold">{stats?.networkStatus?.chaincode || 'land-contract'}</span></div>
              <div className="text-slate-400">Channel: <span className="font-mono text-cyan-400 font-semibold">{stats?.networkStatus?.channel || 'mychannel'}</span></div>
            </div>

            <Link
              to="/activity-logs"
              className="block w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Inspect Registrar Activity Logs
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

