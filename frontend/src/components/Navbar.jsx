import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Layers, 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Activity, 
  CheckCircle2, 
  Building2,
  FileText,
  History
} from 'lucide-react';
import Modal from './Modal';

export default function Navbar() {
  const { user, isAuthenticated, isRegistrar, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await api.activity.getBlockchainStatus();
        if (res.success) {
          setNetworkStatus(res.data);
        }
      } catch (e) {
        console.warn('Network status fetch error:', e.message);
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Top Official Government Banner */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-8 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-semibold text-slate-300">NATIONAL DIGITAL REVENUE & LAND GOVERNANCE</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">Hyperledger Fabric Enterprise Ledger Infrastructure</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStatusModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-mono font-medium">Fabric: {networkStatus?.isLiveNetwork ? 'Live Peer' : 'Dev Ledger'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">Land</span>
                <span className="text-xl font-extrabold tracking-tight text-emerald-400">Chain</span>
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">GOV</span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium">Hyperledger Fabric Land Records Portal</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/search"
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              Search Records
            </Link>

            <Link
              to="/history"
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <History className="w-4 h-4 text-teal-400" />
              Verify Ledger
            </Link>

            <Link
              to="/transactions"
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              Blockchain Explorer
            </Link>

            {isAuthenticated && (
              <Link
                to={isRegistrar ? '/registrar/dashboard' : '/dashboard'}
                className="ml-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                {isRegistrar ? 'Registrar Portal' : 'Citizen Dashboard'}
              </Link>
            )}
          </nav>

          {/* User Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-emerald-400 uppercase font-medium">{user?.role}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-950/40 transition-all"
                >
                  Register Citizen
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Search Land Records
          </Link>
          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Verify Ledger & History
          </Link>
          <Link
            to="/transactions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Blockchain Transactions
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={isRegistrar ? '/registrar/dashboard' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30"
              >
                {isRegistrar ? 'Registrar Portal' : 'Citizen Dashboard'}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Profile ({user?.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-slate-200 bg-slate-900 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 rounded-lg"
              >
                Register Citizen
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Network Diagnostics Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Hyperledger Fabric Network Status"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-white uppercase tracking-wide">
                {networkStatus?.networkType || 'Hyperledger Fabric v2.5'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Channel ID</span>
                <span className="font-mono text-emerald-400 font-semibold">{networkStatus?.channel || 'mychannel'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Smart Contract</span>
                <span className="font-mono text-emerald-400 font-semibold">{networkStatus?.chaincode || 'land-contract'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Endorsing Org</span>
                <span className="font-mono text-slate-300 font-semibold">{networkStatus?.mspId || 'Org1MSP'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Ledger Block Height</span>
                <span className="font-mono text-slate-300 font-semibold">#{networkStatus?.blockHeight || 2}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All land title deeds and ownership transfers are cryptographically validated by the Hyperledger Fabric state machine. State queries evaluate against the immutable world state ledger.
          </p>
        </div>
      </Modal>
    </header>
  );
}

