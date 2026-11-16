import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Search, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  FileCheck, 
  Landmark, 
  Users, 
  Cpu, 
  Activity,
  ArrowRightLeft
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import BlockchainBadge from '../components/BlockchainBadge';

export default function LandingPage() {
  const navigate = useNavigate();
  const [quickLandId, setQuickLandId] = useState('');
  const [stats, setStats] = useState({
    totalProperties: 1,
    totalCitizens: 2,
    totalTransactions: 1,
    blockHeight: 2
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLandingData() {
      try {
        const [txRes, landRes] = await Promise.all([
          api.activity.getBlockchainTransactions().catch(() => ({ data: [] })),
          api.land.getAll().catch(() => ({ data: [] }))
        ]);

        if (txRes && txRes.data) {
          setRecentTransactions(txRes.data.slice(0, 5));
        }

        const propCount = landRes?.data?.length || 1;
        const txCount = txRes?.data?.length || 1;

        setStats({
          totalProperties: propCount,
          totalCitizens: 3,
          totalTransactions: txCount,
          blockHeight: txCount + 1
        });
      } catch (e) {
        console.warn('Failed loading landing data:', e.message);
      } finally {
        setLoading(false);
      }
    }
    loadLandingData();
  }, []);

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (quickLandId.trim()) {
      navigate(`/history?landId=${encodeURIComponent(quickLandId.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Official Emblem Banner */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hyperledger Fabric Enterprise Blockchain Enabled</span>
            </div>
          </div>

          {/* Heading & Tagline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Blockchain-Based <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Land Records Management
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-300 font-medium">
              Secure Land Records. Transparent Ownership. Trusted Transactions.
            </p>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Empowering citizens and land registrars with an immutable, cryptographically verifiable national land registry powered by Hyperledger Fabric smart contracts.
            </p>
          </div>

          {/* Instant Land Verification Search Box */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleQuickVerify} className="p-2 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={quickLandId}
                  onChange={(e) => setQuickLandId(e.target.value)}
                  placeholder="Enter Land ID (e.g., LAND-KA-2024-001)"
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2"
              >
                <span>Verify on Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span>Try Demo ID:</span>
              <button
                type="button"
                onClick={() => setQuickLandId('LAND-KA-2024-001')}
                className="text-emerald-400 hover:underline font-mono"
              >
                LAND-KA-2024-001
              </button>
            </div>
          </div>

          {/* Key Metrics Counter */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Landmark className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-white">{stats.totalProperties}</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Properties Registered</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Users className="w-6 h-6 text-teal-400 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-white">{stats.totalCitizens}+</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Registered Citizens</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Layers className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-white">{stats.totalTransactions}</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Committed Transactions</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Cpu className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-white">#{stats.blockHeight}</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Ledger Block Height</div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Advantages */}
      <section className="py-20 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Architectural Foundation</h2>
            <h3 className="text-3xl font-bold text-white">Why Hyperledger Fabric for Land Records?</h3>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
              Traditional land registries suffer from record tampering, duplicate sales, and bureaucratic fraud. LandChain guarantees unforgeable digital titles backed by permissioned blockchain consensus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-100 mb-2">Immutable World State</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Once a title deed is endorsed and committed to the Fabric ledger, previous records can never be erased, modified, or overwritten by bad actors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-100 mb-2">Registrar Legal Endorsement</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Role-based access control ensures only authorized government land registrars can sign chaincode execution for land approvals and transfers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-100 mb-2">Complete Ownership Trail</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every sale, inheritance, or transfer generates an unalterable cryptographic audit trail with exact timestamps and block hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="py-20 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Lifecycle Protocol</h2>
            <h3 className="text-3xl font-bold text-white">How LandChain Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="text-3xl font-extrabold text-emerald-400/30 mb-2">01</div>
              <h4 className="text-base font-bold text-white mb-2">Citizen Registration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Citizens register securely with verified credentials and submit property details with survey and deed references.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="text-3xl font-extrabold text-emerald-400/30 mb-2">02</div>
              <h4 className="text-base font-bold text-white mb-2">Registrar Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Chief Registrar verifies survey documentation and legal validity against revenue records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="text-3xl font-extrabold text-emerald-400/30 mb-2">03</div>
              <h4 className="text-base font-bold text-white mb-2">Smart Contract Commit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upon approval, <code className="text-emerald-400">registerLand()</code> executes on Fabric, committing the immutable title to the ledger.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="text-3xl font-extrabold text-emerald-400/30 mb-2">04</div>
              <h4 className="text-base font-bold text-white mb-2">Instant Transfer & Proof</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Owners can transfer property to registered citizens. Ownership history is publicly verifiable with SHA-256 TxIDs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Blockchain Stream */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="text-xl font-bold text-white">Live Hyperledger Fabric Ledger Stream</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Real-time cryptographic transactions committed to the channel</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
            >
              <span>View Full Block Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Block #</th>
                  <th className="px-5 py-3">Transaction ID</th>
                  <th className="px-5 py-3">Function</th>
                  <th className="px-5 py-3">Land ID</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentTransactions.map((tx, idx) => (
                  <tr key={tx.txId || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-cyan-400 font-bold">#{tx.blockNumber || idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <BlockchainBadge txId={tx.txId} compact />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-800 text-emerald-400 border border-slate-700">
                        {tx.function}()
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">{tx.landId}</td>
                    <td className="px-5 py-3.5 text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {tx.status || 'COMMITTED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Experience Secure Digital Land Governance</h3>
          <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
            Join thousands of citizens securely registering, verifying, and transferring land titles with absolute transparency.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50"
            >
              Register Citizen Account
            </Link>
            <Link
              to="/search"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl border border-slate-700 transition-all"
            >
              Explore Public Registry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

