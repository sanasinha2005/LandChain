import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-slate-200">LandChain Portal</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Secure Land Records. Transparent Ownership. Trusted Transactions. Powered by Hyperledger Fabric Enterprise Blockchain.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Quick Navigation</h4>
            <ul className="space-y-1.5">
              <li><Link to="/search" className="hover:text-emerald-400 transition-colors">Search Land Records</Link></li>
              <li><Link to="/history" className="hover:text-emerald-400 transition-colors">Verify Ownership History</Link></li>
              <li><Link to="/transactions" className="hover:text-emerald-400 transition-colors">Hyperledger Block Explorer</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Official Portal Sign In</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Smart Contracts & Nodes</h4>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-500">
              <li>Chaincode: land-contract v1.0</li>
              <li>Channel: mychannel</li>
              <li>Peer: peer0.org1.example.com</li>
              <li>Orderer: Raft Consensus 7050</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Citizen Helpline</h4>
            <p className="text-slate-400">National Revenue Service Center: 1800-425-LAND</p>
            <p className="text-slate-500 text-[11px]">Working Hours: 09:30 AM to 06:00 PM IST (Mon - Sat)</p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit Cryptographic Security</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} LandChain - Department of Land Revenue & Registry. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Official Government Digital Public Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

