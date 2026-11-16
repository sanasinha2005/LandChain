import React from 'react';
import { Shield } from 'lucide-react';

export default function LoadingSpinner({ text = 'Querying Hyperledger Fabric Ledger...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        <Shield className="w-6 h-6 text-emerald-400 absolute animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-400 animate-pulse">{text}</p>
    </div>
  );
}

