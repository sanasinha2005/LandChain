import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  Landmark,
  ArrowRightLeft,
  History,
  Search,
  User,
  ShieldCheck,
  ClipboardList,
  Layers,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const { user, isRegistrar } = useAuth();

  const citizenNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Register Land', path: '/register-land', icon: FilePlus },
    { name: 'My Properties', path: '/my-properties', icon: Landmark },
    { name: 'Ownership Transfer', path: '/transfer', icon: ArrowRightLeft },
    { name: 'Ownership History', path: '/history', icon: History },
    { name: 'Search Records', path: '/search', icon: Search },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const registrarNav = [
    { name: 'Registrar Dashboard', path: '/registrar/dashboard', icon: LayoutDashboard },
    { name: 'Pending Registrations', path: '/registrar/pending-registrations', icon: ClipboardList },
    { name: 'Pending Transfers', path: '/registrar/pending-transfers', icon: ArrowRightLeft },
    { name: 'Registered Lands', path: '/search', icon: Landmark },
    { name: 'Blockchain Ledger', path: '/transactions', icon: Layers },
    { name: 'System Activity Logs', path: '/activity-logs', icon: Activity },
    { name: 'Official Profile', path: '/profile', icon: ShieldCheck },
  ];

  const navItems = isRegistrar ? registrarNav : citizenNav;

  return (
    <aside className="w-64 shrink-0 hidden lg:block bg-slate-900/60 border-r border-slate-800 p-4 min-h-[calc(100vh-5rem)]">
      {/* Role Pill Banner */}
      <div className="mb-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isRegistrar ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {isRegistrar ? 'Registrar Portal' : 'Citizen Portal'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 truncate">{user?.email}</p>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard' || item.path === '/registrar/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Fabric Security Note */}
      <div className="mt-8 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hyperledger Security</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          State modifications trigger PBFT/Raft consensus and cryptographic commit to Fabric blocks.
        </p>
      </div>
    </aside>
  );
}

