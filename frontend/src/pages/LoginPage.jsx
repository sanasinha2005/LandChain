import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Mail, Lock, ArrowRight, KeyRound, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showError('Please enter both email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email.trim(), password);
      showSuccess(`Welcome back, ${res.user.name}!`);

      if (res.user.role === 'registrar') {
        navigate('/registrar/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const prefillAccount = (prefillEmail, prefillPass) => {
    setEmail(prefillEmail);
    setPassword(prefillPass);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-6 p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/40">
            <ShieldCheck className="w-7 h-7 text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold text-white">LandChain Portal Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access citizen services or registrar governance dashboard
          </p>
        </div>

        {/* 1-Click Demo Account Quick Fill */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => prefillAccount('citizen@landchain.gov.in', 'Citizen@123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
            >
              <div className="font-semibold text-emerald-400">Citizen Account</div>
              <div className="text-[10px] text-slate-400 truncate">citizen@landchain.gov.in</div>
            </button>
            <button
              type="button"
              onClick={() => prefillAccount('registrar@landchain.gov.in', 'Registrar@123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
            >
              <div className="font-semibold text-amber-400">Registrar Account</div>
              <div className="text-[10px] text-slate-400 truncate">registrar@landchain.gov.in</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@landchain.gov.in"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Authenticating with Ledger...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          New citizen applying for land registration?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}

