import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Search, 
  Filter, 
  MapPin, 
  Landmark, 
  ShieldCheck, 
  History, 
  ExternalLink,
  RefreshCw,
  Layers
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import BlockchainBadge from '../components/BlockchainBadge';

export default function SearchLandRecordsPage() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [landTypeFilter, setLandTypeFilter] = useState('');

  const fetchLands = async () => {
    try {
      setLoading(true);
      const res = await api.land.getAll({
        search: searchTerm,
        district: districtFilter,
        landType: landTypeFilter
      });
      if (res.success) {
        setLands(res.data || []);
      }
    } catch (err) {
      console.error('Failed querying land records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [districtFilter, landTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLands();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDistrictFilter('');
    setLandTypeFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Public Land Registry</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Search Official Land Records</h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct cryptographic query across all registered properties on the Hyperledger Fabric ledger.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search Term */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Land ID, Survey #, or Owner Name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Districts</option>
              <option value="Bengaluru Urban">Bengaluru Urban</option>
              <option value="Bengaluru Rural">Bengaluru Rural</option>
              <option value="Mumbai Suburban">Mumbai Suburban</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          {/* Land Type Filter */}
          <div>
            <select
              value={landTypeFilter}
              onChange={(e) => setLandTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Land Types</option>
              <option value="Residential">Residential</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLands}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Ledger Results"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-950/40"
            >
              Search Ledger
            </button>
          </div>
        </div>
      </form>

      {/* Results Section */}
      {loading ? (
        <LoadingSpinner text="Executing Hyperledger Fabric state range query..." />
      ) : lands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lands.map((land) => (
            <div
              key={land.landId}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{land.landId}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{land.location}</h3>
                  </div>
                  <StatusBadge status="REGISTERED" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase">Registered Owner</span>
                    <span className="font-semibold text-slate-200">{land.currentOwner?.name || 'N/A'}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{land.currentOwner?.email}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase">Cadastre & Area</span>
                    <span className="font-semibold text-slate-200">{land.surveyNumber}</span>
                    <span className="text-[10px] text-slate-400 block">{land.area} {land.areaUnit} ({land.landType})</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{land.district}, {land.state}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(land.registeredAt).toLocaleDateString()}
                  </span>
                </div>

                <BlockchainBadge txId={land.txId} />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  to={`/history?landId=${encodeURIComponent(land.landId)}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Ownership History</span>
                </Link>

                <Link
                  to={`/land/${encodeURIComponent(land.landId)}`}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <span>Official Deed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No Land Records Found"
          description="No registered properties matched your query on the blockchain ledger."
          actionText="Clear Search"
          actionLink="/search"
        />
      )}
    </div>
  );
}

