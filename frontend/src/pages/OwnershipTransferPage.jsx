import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ArrowRightLeft, 
  ShieldCheck, 
  UserCheck, 
  Landmark, 
  ArrowRight, 
  AlertCircle,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OwnershipTransferPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [myProperties, setMyProperties] = useState([]);
  const [selectedLandId, setSelectedLandId] = useState(searchParams.get('landId') || '');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [recipientName, setRecipientName] = useState(null);
  const [checkingRecipient, setCheckingRecipient] = useState(false);
  const [reason, setReason] = useState('');
  const [agreeDeclaration, setAgreeDeclaration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProps, setLoadingProps] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await api.land.getMyProperties();
        if (res.success && res.data) {
          setMyProperties(res.data);
          if (!selectedLandId && res.data.length > 0) {
            setSelectedLandId(res.data[0].landId);
          }
        }
      } catch (err) {
        console.error('Failed loading properties:', err.message);
      } finally {
        setLoadingProps(false);
      }
    }
    loadProperties();
  }, []);

  const handleVerifyRecipient = async () => {
    if (!newOwnerEmail.trim()) {
      showError('Please enter the recipient email address first.');
      return;
    }

    if (newOwnerEmail.trim().toLowerCase() === user?.email.toLowerCase()) {
      showError('You cannot transfer ownership to yourself.');
      setRecipientName(null);
      return;
    }

    try {
      setCheckingRecipient(true);
      const res = await api.auth.lookupUser(newOwnerEmail.trim());
      if (res.success && res.user) {
        setRecipientName(res.user.name);
        showSuccess(`Recipient verified: ${res.user.name}`);
      }
    } catch (err) {
      setRecipientName(null);
      showError('No registered citizen found with this email. Recipient must register on LandChain first.');
    } finally {
      setCheckingRecipient(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLandId) {
      showError('Please select a registered property to transfer.');
      return;
    }

    if (!newOwnerEmail.trim()) {
      showError('Please provide the new owner email address.');
      return;
    }

    if (!agreeDeclaration) {
      showError('You must confirm the legal transfer declaration.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.transfer.submitRequest({
        land_id: selectedLandId,
        new_owner_email: newOwnerEmail.trim(),
        reason: reason.trim()
      });

      showSuccess(`Ownership transfer request for ${selectedLandId} submitted to Registrar!`);
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Failed to submit transfer request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProps) {
    return <LoadingSpinner text="Retrieving your verified land holdings..." />;
  }

  const selectedProperty = myProperties.find(p => p.landId === selectedLandId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Ownership Transfer Protocol</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Transfer Property Title</h1>
        <p className="text-xs text-slate-400 mt-1">
          Initiate a legally binding title deed transfer to another registered citizen. Requires Registrar endorsement for Hyperledger Fabric chaincode commit.
        </p>
      </div>

      {myProperties.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <Landmark className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Registered Properties Found</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You must be the verified owner of a registered land record on Hyperledger Fabric to initiate an ownership transfer.
          </p>
          <div className="pt-2">
            <Link
              to="/register-land"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
            >
              Register Land Property
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
          
          {/* Step 1: Select Property */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              1. Select Property to Transfer *
            </label>
            <select
              value={selectedLandId}
              onChange={(e) => setSelectedLandId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            >
              {myProperties.map((p) => (
                <option key={p.landId} value={p.landId}>
                  {p.landId} — {p.location} (Survey: {p.surveyNumber}, {p.area} {p.areaUnit})
                </option>
              ))}
            </select>

            {selectedProperty && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Cadastre #</span>
                  <span className="font-semibold text-slate-200">{selectedProperty.surveyNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Area & Type</span>
                  <span className="font-semibold text-slate-200">{selectedProperty.area} {selectedProperty.areaUnit} ({selectedProperty.landType})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">District / State</span>
                  <span className="font-semibold text-slate-200">{selectedProperty.district}, {selectedProperty.state}</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Recipient Details */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              2. New Owner Registered Email Address *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={newOwnerEmail}
                onChange={(e) => {
                  setNewOwnerEmail(e.target.value);
                  setRecipientName(null);
                }}
                placeholder="e.g., buyer@landchain.gov.in"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleVerifyRecipient}
                disabled={checkingRecipient}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>{checkingRecipient ? 'Verifying...' : 'Verify Citizen'}</span>
              </button>
            </div>

            {recipientName && (
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Recipient Title Holder: <strong className="text-white">{recipientName}</strong></span>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              For demo testing, you can use the pre-seeded buyer account: <code className="text-teal-400">buyer@landchain.gov.in</code>
            </p>
          </div>

          {/* Step 3: Transfer Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              3. Consideration / Sale Deed Reference (Optional)
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Execution of registered sale deed no. SD-2024-912, full consideration received."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            ></textarea>
          </div>

          {/* Declaration Checkbox */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400">
              <input
                type="checkbox"
                checked={agreeDeclaration}
                onChange={(e) => setAgreeDeclaration(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
              />
              <span>
                I hereby declare that I am relinquishing all legal title, right, and interest in this property to the designated recipient upon Registrar approval and Fabric block commit.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Ownership update takes effect immediately upon Registrar sign-off.
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-950/50 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {submitting ? 'Submitting to Registrar...' : 'Submit Transfer Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}
    </div>
  );
}

