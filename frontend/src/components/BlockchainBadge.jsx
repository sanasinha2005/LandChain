import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function BlockchainBadge({ txId, compact = false }) {
  if (!txId) return null;

  const displayTx = compact ? `${txId.slice(0, 8)}...${txId.slice(-6)}` : txId;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(txId);
  };

  return (
    <div
      onClick={copyToClipboard}
      title="Click to copy Hyperledger Fabric TxID"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs font-mono cursor-pointer hover:bg-indigo-900/80 hover:border-indigo-400 transition-colors group"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
      <span className="font-semibold text-slate-400">Tx:</span>
      <span>{displayTx}</span>
    </div>
  );
}

