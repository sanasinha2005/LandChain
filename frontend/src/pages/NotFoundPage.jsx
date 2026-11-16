import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="text-4xl font-extrabold text-white">404</div>
      <h1 className="text-xl font-bold text-slate-200 mt-1">Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6">
        The requested digital record or navigation path does not exist on the LandChain Registry.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

