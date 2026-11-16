import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FilePlus, 
  MapPin, 
  Compass, 
  Layers, 
  FileText, 
  User, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function LandRegistrationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    land_id: '',
    survey_number: '',
    owner_name: user?.name || '',
    location: '',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: '',
    area_unit: 'Sq Ft',
    land_type: 'Residential',
    document_reference: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const generateRandomLandId = () => {
    const stateCodes = { Karnataka: 'KA', Maharashtra: 'MH', 'Tamil Nadu': 'TN', Telangana: 'TS', Delhi: 'DL' };
    const code = stateCodes[formData.state] || 'IN';
    const randNum = Math.floor(100 + Math.random() * 900);
    const newId = `LAND-${code}-${new Date().getFullYear()}-${randNum}`;
    setFormData(prev => ({ ...prev, land_id: newId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.land_id.trim() || !formData.survey_number.trim() || !formData.owner_name.trim() || !formData.location.trim() || !formData.area || !formData.document_reference.trim()) {
      showError('All fields marked with an asterisk (*) are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.land.submitRequest({
        ...formData,
        land_id: formData.land_id.trim().toUpperCase()
      });

      showSuccess(`Land registration request for ${res.landId} submitted! Awaiting Registrar endorsement.`);
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Failed to submit land registration request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FilePlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">National Revenue Portal</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Digital Land Registration Application</h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit official property deed specifications for Registrar review and Hyperledger Fabric blockchain ledger commit.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
        
        {/* Section 1: Identification */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Property Identification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Land ID (Unique Identifier) *</label>
                <button
                  type="button"
                  onClick={generateRandomLandId}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate ID</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.land_id}
                onChange={(e) => setFormData({ ...formData, land_id: e.target.value.toUpperCase() })}
                placeholder="e.g., LAND-KA-2024-501"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Survey Number / Revenue Cadastre *</label>
              <input
                type="text"
                required
                value={formData.survey_number}
                onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                placeholder="e.g., SY-104/2B or CTS-884"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Ownership & Location */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Owner & Geographic Location</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Name (Title Holder) *</label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                placeholder="Citizen Full Name"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Property Street / Village / Locality *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Whitefield Main Road, Sector 5"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State *</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">District *</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g., Bengaluru Urban"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Land Specification & Document */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Land Specifications & Legal Title Deed</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Land Area *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g., 2400"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Area Unit *</label>
              <select
                value={formData.area_unit}
                onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Sq Ft">Sq Ft (Square Feet)</option>
                <option value="Acres">Acres</option>
                <option value="Hectares">Hectares</option>
                <option value="Cents">Cents</option>
                <option value="Gunthas">Gunthas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Land Type *</label>
              <select
                value={formData.land_type}
                onChange={(e) => setFormData({ ...formData, land_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Residential">Residential</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Supporting Document Reference *</label>
            <input
              type="text"
              required
              value={formData.document_reference}
              onChange={(e) => setFormData({ ...formData, document_reference: e.target.value })}
              placeholder="e.g., Title Deed No. DOC-2024-8849 / Khata No. 442"
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Enter registered Title Deed, Patta, or Sale Agreement number for registrar verification.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Upon submission, the request is routed to the Chief Land Registrar desk for ledger endorsement.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {submitting ? 'Submitting to Registrar...' : 'Submit Application'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
}

