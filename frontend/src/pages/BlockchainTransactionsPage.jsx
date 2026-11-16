import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Layers, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BlockchainBadge from '../components/BlockchainBadge';
import Modal from '../components/Modal';

export default function BlockchainTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const [selectedTx, setSelectedTx] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.activity.getBlockchainTransactions();
      if (res.success) {
        setTransactions(res.data || []);
        setNetworkStatus(res.networkStatus || null);
      }
    } catch (err) {
      console.error('Failed loading transactions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      (tx.txId && tx.txId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.landId && tx.landId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || tx.function === actionFilter;

    return matchesSearch && matchesAction;
  });

  const copyTx = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Hyperledger Fabric Block Explorer</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Blockchain Transaction Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time immutable cryptographic transactions committed to channel <code className="text-emerald-400 font-mono">mychannel</code>.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Network Diagnostics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Channel</span>
          <span className="font-mono text-emerald-400 font-bold">{networkStatus?.channel || 'mychannel'}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Smart Contract</span>
          <span className="font-mono text-teal-400 font-bold">{networkStatus?.chaincode || 'land-contract'}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Endorsing MSP</span>
          <span className="font-mono text-indigo-400 font-bold">{networkStatus?.mspId || 'Org1MSP'}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Current Block Height</span>
          <span className="font-mono text-white font-bold">#{networkStatus?.blockHeight || transactions.length + 1}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Action Filters */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActionFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              actionFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActionFilter('registerLand')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              actionFilter === 'registerLand' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            registerLand()
          </button>
          <button
            onClick={() => setActionFilter('transferLand')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              actionFilter === 'transferLand' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            transferLand()
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by TxID, Land ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Querying Fabric block transaction indexes..." />
      ) : filteredTransactions.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/50 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Block #</th>
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">Smart Contract Function</th>
                <th className="px-5 py-3.5">Target Land ID</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.map((tx, idx) => (
                <tr key={tx.txId || idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-cyan-400">
                    #{tx.blockNumber || idx + 1}
                  </td>
                  <td className="px-5 py-4">
                    <BlockchainBadge txId={tx.txId} compact />
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold bg-slate-800 text-emerald-400 border border-slate-700">
                      {tx.function}()
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-white font-mono">
                    {tx.landId}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {tx.status || 'VALID'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No Transactions Found"
          description="No blockchain transactions matching your filter criteria."
        />
      )}

      {/* Transaction Inspection Modal */}
      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Transaction Block Commit Details"
        maxWidth="max-w-2xl"
      >
        {selectedTx && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Transaction Hash (TxID)</span>
                <div className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 mt-1 font-mono text-[11px] text-emerald-400">
                  <span className="break-all">{selectedTx.txId}</span>
                  <button
                    onClick={() => copyTx(selectedTx.txId)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Function Invoked</span>
                  <span className="font-mono text-white font-semibold">{selectedTx.function}()</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Target Land ID</span>
                  <span className="font-mono text-cyan-400 font-semibold">{selectedTx.landId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Block Height</span>
                  <span className="font-mono text-white font-semibold">#{selectedTx.blockNumber || 1}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Validation Code</span>
                  <span className="text-emerald-400 font-semibold">{selectedTx.status || 'VALID (TxValidationCode: 0)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Endorser MSP</span>
                  <span className="font-mono text-slate-300 font-semibold">{selectedTx.endorserMsp || 'Org1MSP'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Committed At</span>
                  <span className="text-slate-300">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

