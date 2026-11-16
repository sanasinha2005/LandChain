import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  History, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  Layers, 
  ArrowDown, 
  FileCheck,
  ExternalLink,
  Cpu
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import BlockchainBadge from '../components/BlockchainBadge';

export default function OwnershipHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [landIdInput, setLandIdInput] = useState(searchParams.get('landId') || 'LAND-KA-2024-001');
  const [historyData, setHistoryData] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performVerification = async (targetId) => {
    if (!targetId || !targetId.trim()) return;
    const cleanId = targetId.trim().toUpperCase();

    try {
      setLoading(true);
      setError(null);
      setVerificationResult(null);
      setHistoryData(null);

      // 1. Verify existence & get verification proof
      const verifyRes = await api.land.verify(cleanId);
      setVerificationResult(verifyRes);

      // 2. Fetch full historical timeline from blockchain
      const historyRes = await api.land.getHistory(cleanId);
      if (historyRes.success) {
        setHistoryData(historyRes.history || []);
      }
    } catch (err) {
      setError(err.message || `No records found on Hyperledger Fabric for Land ID "${cleanId}".`);
      setVerificationResult({ verified: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('landId');
    if (idFromUrl) {
      setLandIdInput(idFromUrl);
      performVerification(idFromUrl);
    } else {
      performVerification('LAND-KA-2024-001');
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (landIdInput.trim()) {
      setSearchParams({ landId: landIdInput.trim().toUpperCase() });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <History className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Immutable Audit Trail</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Ownership History & Ledger Verification</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically inspect the full provenance of any title deed from genesis registration through all ownership transfers on Hyperledger Fabric.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="p-2 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-xl flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={landIdInput}
            onChange={(e) => setLandIdInput(e.target.value.toUpperCase())}
            placeholder="Enter Land ID (e.g., LAND-KA-2024-001)"
            className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Verify on Blockchain</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <LoadingSpinner text="Traversing Hyperledger Fabric block history for key provenance..." />
      )}

      {/* Verification Error / Not Found */}
      {error && !loading && (
        <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-300">Blockchain Verification Failed</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <div className="text-[11px] text-slate-500">
            Ensure you have entered a valid, registrar-approved Land ID.
          </div>
        </div>
      )}

      {/* Verification Success Box */}
      {verificationResult && verificationResult.verified && !loading && (
        <div className="p-6 rounded-3xl bg-emerald-950/20 border-2 border-emerald-500/40 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Verified On-Chain</div>
                <div className="text-lg font-extrabold text-white">{verificationResult.data.landId}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/land/${encodeURIComponent(verificationResult.data.landId)}`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>View Full Title Deed</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Current Owner</span>
              <span className="font-bold text-white">{verificationResult.data.currentOwner?.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Location</span>
              <span className="font-bold text-white truncate block">{verificationResult.data.location}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Area / Type</span>
              <span className="font-bold text-white">{verificationResult.data.area} ({verificationResult.data.landType})</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Total Transfers</span>
              <span className="font-bold text-emerald-400">{verificationResult.data.totalHistoricalTransfers} updates</span>
            </div>
          </div>
        </div>
      )}

      {/* Ownership History Timeline */}
      {historyData && historyData.length > 0 && !loading && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Fabric Ledger Provenance Timeline ({historyData.length} Commits)</span>
          </h3>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-500/40 space-y-8 py-2">
            {historyData.map((item, index) => {
              const isInitial = index === 0;
              const isLatest = index === historyData.length - 1;
              const rec = item.record || {};

              return (
                <div key={item.txId || index} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 ${
                    isLatest 
                      ? 'bg-emerald-400 border-white ring-4 ring-emerald-500/30' 
                      : 'bg-slate-900 border-emerald-400'
                  }`} />

                  {/* Card */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    isLatest
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isInitial
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                        }`}>
                          {isInitial ? 'Genesis Registration' : `Ownership Transfer #${index}`}
                        </span>

                        {isLatest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Current Title Holder
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Owner Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase">Title Holder Name</span>
                        <span className="text-sm font-bold text-white">{rec.currentOwner?.name || 'N/A'}</span>
                        <span className="text-[11px] text-emerald-400 block font-mono">{rec.currentOwner?.email}</span>
                      </div>

                      {rec.previousOwner && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-slate-400 block text-[10px] uppercase">Transferred From</span>
                          <span className="text-sm font-semibold text-slate-300">{rec.previousOwner.name}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{rec.previousOwner.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                      <BlockchainBadge txId={item.txId} />
                      <span className="text-[10px] font-mono text-slate-500">
                        Channel: mychannel • Status: VALID
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

