import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Landmark, 
  Search, 
  ArrowRightLeft, 
  History, 
  ExternalLink, 
  FilePlus, 
  ShieldCheck, 
  Clock,
  Layers,
  MapPin
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import BlockchainBadge from '../components/BlockchainBadge';

export default function MyPropertiesPage() {
  const [activeTab, setActiveTab] = useState('registered'); // 'registered' | 'requests'
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [propsRes, reqsRes] = await Promise.all([
          api.land.getMyProperties().catch(() => ({ data: [] })),
          api.land.getMyRequests().catch(() => ({ data: [] }))
        ]);

        if (propsRes.success) setProperties(propsRes.data || []);
        if (reqsRes.success) setRequests(reqsRes.data || []);
      } catch (err) {
        console.error('Failed loading properties:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving registered titles from Hyperledger Fabric World State..." />;
  }

  const filteredProperties = properties.filter(p =>
    (p.landId && p.landId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.surveyNumber && p.surveyNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRequests = requests.filter(r =>
    (r.land_id && r.land_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.survey_number && r.survey_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Digital Land Registry Holdings</span>
          </div>
          <h1 className="text-2xl font-bold text-white">My Property Portfolio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official immutable property holdings recorded on Hyperledger Fabric.
          </p>
        </div>

        <Link
          to="/register-land"
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
        >
          <FilePlus className="w-4 h-4" />
          <span>Register New Property</span>
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'registered'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registered on Blockchain ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registration Requests ({requests.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Land ID, Survey #..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tab 1: Registered Properties */}
      {activeTab === 'registered' && (
        <>
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.landId}
                  className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono text-emerald-400 font-bold">{prop.landId}</span>
                        <h3 className="text-base font-bold text-white mt-0.5">{prop.location}</h3>
                      </div>
                      <StatusBadge status="REGISTERED" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-slate-400 block text-[10px] uppercase">Survey Cadastre</span>
                        <span className="font-semibold text-slate-200">{prop.surveyNumber}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-slate-400 block text-[10px] uppercase">Area & Type</span>
                        <span className="font-semibold text-slate-200">{prop.area} {prop.areaUnit} ({prop.landType})</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{prop.district}, {prop.state}</span>
                    </div>

                    <BlockchainBadge txId={prop.txId} />
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      to={`/history?landId=${encodeURIComponent(prop.landId)}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5 text-teal-400" />
                      <span>History</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/transfer?landId=${encodeURIComponent(prop.landId)}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Transfer</span>
                      </Link>
                      <Link
                        to={`/land/${encodeURIComponent(prop.landId)}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                      >
                        Deed View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Landmark}
              title="No Registered Properties Found"
              description="You have no registered properties matching your search filter."
              actionText="Submit Land Registration"
              actionLink="/register-land"
            />
          )}
        </>
      )}

      {/* Tab 2: Registration Requests */}
      {activeTab === 'requests' && (
        <>
          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Land ID</th>
                    <th className="px-5 py-3">Survey #</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Area / Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Blockchain Tx</th>
                    <th className="px-5 py-3">Submitted On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white font-mono">{req.land_id}</td>
                      <td className="px-5 py-3.5 text-slate-300">{req.survey_number}</td>
                      <td className="px-5 py-3.5 text-slate-300">{req.location}, {req.district}</td>
                      <td className="px-5 py-3.5 text-slate-300">{req.area} {req.area_unit} ({req.land_type})</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {req.blockchain_tx_id ? (
                          <BlockchainBadge txId={req.blockchain_tx_id} compact />
                        ) : (
                          <span className="text-slate-500 italic">Pending commit</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{new Date(req.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No Pending Registration Requests"
              description="You have not submitted any registration requests recently."
              actionText="Register a Land"
              actionLink="/register-land"
            />
          )}
        </>
      )}
    </div>
  );
}

