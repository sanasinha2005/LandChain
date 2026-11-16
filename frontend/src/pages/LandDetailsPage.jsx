import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  MapPin, 
  Layers, 
  User, 
  Calendar, 
  FileText, 
  ArrowRightLeft, 
  History, 
  Printer, 
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Building2
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import BlockchainBadge from '../components/BlockchainBadge';

export default function LandDetailsPage() {
  const { landId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadLand() {
      try {
        setLoading(true);
        const res = await api.land.getDetails(landId);
        if (res.success && res.data) {
          setLand(res.data);
        } else {
          setError('Property title not found on the blockchain ledger.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load land details.');
      } finally {
        setLoading(false);
      }
    }
    loadLand();
  }, [landId]);

  const copyTxId = () => {
    if (land?.txId) {
      navigator.clipboard.writeText(land.txId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintDeed = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text={`Verifying cryptographic state for ${landId} on Fabric...`} />;
  }

  if (error || !land) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Land ID does not exist on the ledger.'}</p>
        <Link
          to="/search"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Land Search
        </Link>
      </div>
    );
  }

  const isCurrentOwner = user && land.currentOwner?.email && user.email.toLowerCase() === land.currentOwner.email.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Records</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintDeed}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Deed Certificate</span>
          </button>
          <Link
            to={`/history?landId=${encodeURIComponent(land.landId)}`}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-xs font-semibold text-teal-400 transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </Link>
        </div>
      </div>

      {/* Official Certificate Deed Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border-2 border-emerald-500/30 shadow-2xl space-y-8 relative overflow-hidden backdrop-blur-md">
        
        {/* Official Background Seal */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>

        {/* Certificate Header */}
        <div className="text-center border-b border-slate-800 pb-6 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-950/50">
            <ShieldCheck className="w-8 h-8 text-slate-950" />
          </div>
          <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            NATIONAL LAND RECORD CERTIFICATE OF TITLE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Digital Land Title Deed</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            <span>Land ID: {land.landId}</span>
          </div>
        </div>

        {/* Blockchain Cryptographic Verification Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Hyperledger Fabric Consensus Seal</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
              BLOCK #{land.blockNumber || 1} • VALID
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
            <div className="font-mono text-xs text-slate-300 truncate">
              <span className="text-slate-400 mr-2">TxID:</span>
              <span>{land.txId}</span>
            </div>
            <button
              onClick={copyTxId}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
              title="Copy Transaction Hash"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Core Deed Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400">Current Registered Owner</span>
            <div className="text-base font-bold text-white">{land.currentOwner?.name}</div>
            <div className="text-xs text-emerald-400 font-mono">{land.currentOwner?.email}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400">Survey Cadastre / Plot No.</span>
            <div className="text-base font-bold text-white">{land.surveyNumber}</div>
            <div className="text-xs text-slate-400">Revenue Reference: Verified</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400">Property Location</span>
            <div className="text-sm font-semibold text-white">{land.location}</div>
            <div className="text-xs text-slate-400">{land.district}, {land.state}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400">Land Area & Classification</span>
            <div className="text-base font-bold text-white">{land.area} {land.areaUnit}</div>
            <div className="text-xs text-slate-400">Zoned: {land.landType}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400">Supporting Document Reference</span>
            <div className="text-sm font-mono text-slate-300 font-semibold">{land.documentRef}</div>
            <div className="text-xs text-slate-400">Verified by Revenue Registrar</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400">Registration Timestamp</span>
            <div className="text-sm font-semibold text-white">{new Date(land.registeredAt).toLocaleString()}</div>
            <div className="text-xs text-slate-400">Last Ledger Update: {new Date(land.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Previous Owner if applicable */}
        {land.previousOwner && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
            <span className="text-xs font-bold uppercase text-indigo-400">Previous Owner Record</span>
            <div className="text-sm text-slate-300 font-semibold">
              {land.previousOwner.name} ({land.previousOwner.email})
            </div>
            <p className="text-xs text-slate-400">
              Legally transferred and committed through Hyperledger Fabric smart contract consensus.
            </p>
          </div>
        )}

        {/* Owner Action: Initiate Transfer */}
        {isCurrentOwner && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white">You own this registered property.</div>
              <div className="text-xs text-slate-300">Ready to initiate an ownership transfer deed to another citizen?</div>
            </div>
            <Link
              to={`/transfer?landId=${encodeURIComponent(land.landId)}`}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Initiate Transfer</span>
            </Link>
          </div>
        )}

        {/* Official Digital Signature Footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Endorsed by: <span className="font-semibold text-slate-300">Office of the Chief Land Registrar (Org1MSP)</span>
          </div>
          <div className="font-mono text-[11px] text-emerald-400">
            AUTHENTICATED VIA FABRIC GATEWAY SDK
          </div>
        </div>

      </div>
    </div>
  );
}

