import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Landmark, 
  Clock, 
  ArrowRightLeft, 
  CheckCircle2, 
  FilePlus, 
  Search, 
  History, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import BlockchainBadge from '../components/BlockchainBadge';
import StatusBadge from '../components/StatusBadge';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.stats.getCitizenStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed loading citizen stats:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving verified land titles from Hyperledger Fabric..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Citizen Digital Identity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome, {user?.name}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your land titles, track pending registrar endorsements, and execute secure transfers.
          </p>
        </div>
        <Link
          to="/register-land"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-2 shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          <span>Register New Land</span>
        </Link>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Properties</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats?.totalProperties ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Verified on Fabric Ledger</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Registrations</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-3">{stats?.pendingRegistrations ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Under Registrar Review</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Transfers</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-3">{stats?.pendingTransfers ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Awaiting Registrar Verification</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Transfers</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 mt-3">{stats?.completedTransfers ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Immutable Ownership Updates</div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/register-land"
          className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-emerald-500/40 transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FilePlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-200">Register Land</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Submit new title deed</span>
        </Link>

        <Link
          to="/transfer"
          className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-teal-500/40 transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-200">Transfer Property</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Send title to another citizen</span>
        </Link>

        <Link
          to="/search"
          className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-indigo-500/40 transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-200">Search Records</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Search public ledger</span>
        </Link>

        <Link
          to="/history"
          className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-200">Verify History</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Blockchain audit timeline</span>
        </Link>
      </div>

      {/* Main Content Split: My Verified Properties + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: My Properties */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">My Registered Properties</h2>
              <p className="text-xs text-slate-400">Authoritative land holdings verified by Hyperledger Fabric</p>
            </div>
            <Link to="/my-properties" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentProperties && stats.recentProperties.length > 0 ? (
            <div className="space-y-3">
              {stats.recentProperties.map((prop) => (
                <div
                  key={prop.landId}
                  className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">{prop.landId}</span>
                      <StatusBadge status="REGISTERED" />
                    </div>
                    <div className="text-xs text-slate-400">
                      Survey No: <span className="font-semibold text-slate-300">{prop.surveyNumber}</span> • {prop.area} {prop.areaUnit} ({prop.landType})
                    </div>
                    <div className="text-xs text-slate-400">
                      Location: <span className="text-slate-300">{prop.location}, {prop.district}, {prop.state}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 shrink-0">
                    <BlockchainBadge txId={prop.txId} compact />
                    <Link
                      to={`/land/${encodeURIComponent(prop.landId)}`}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-emerald-400 transition-colors"
                    >
                      View Title Deed
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <Landmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No properties registered under your account yet.</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Submit a land registration request to commit your first title deed to the blockchain.</p>
              <Link
                to="/register-land"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all"
              >
                Register First Property
              </Link>
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Activities */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Activity Log</h2>
            <p className="text-xs text-slate-400">Your recent governance events</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div key={act.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-emerald-400">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleDateString()}</span>
                  </div>
                  {act.land_id && (
                    <div className="text-slate-400">
                      Land ID: <span className="font-mono text-slate-300">{act.land_id}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No recent activity recorded.</p>
            )}
            <Link
              to="/activity-logs"
              className="block text-center text-xs font-semibold text-emerald-400 hover:underline pt-2 border-t border-slate-800"
            >
              View Full Audit Log
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

