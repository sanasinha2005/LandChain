import React from 'react';
import { Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  const s = (status || '').toUpperCase();

  if (s === 'APPROVED' || s === 'REGISTERED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        {s === 'REGISTERED' ? 'REGISTERED ON FABRIC' : 'APPROVED'}
      </span>
    );
  }

  if (s === 'REJECTED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 ${className}`}>
        <XCircle className="w-3.5 h-3.5" />
        REJECTED
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}>
      <Clock className="w-3.5 h-3.5" />
      PENDING VERIFICATION
    </span>
  );
}

