import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MapPin, 
  ShieldAlert, 
  Layers,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function PendingRegistrationsPage() {
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedReq, setSelectedReq] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.registrar.getPendingRegistrations();
      if (res.success) {
        setRequests(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed loading pending registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (reqItem) => {
    if (!window.confirm(`Are you sure you want to approve Land ID "${reqItem.land_id}" and commit this deed to the Hyperledger Fabric blockchain?`)) {
      return;
    }

    try {
      setActionProcessing(true);
      const res = await api.registrar.approveRegistration(reqItem.id);
      showSuccess(`Land "${res.landId}" successfully approved & committed to Hyperledger Fabric! Tx: ${res.blockchainTxId.slice(0, 10)}...`);
      setDetailsModalOpen(false);
      fetchPending();
    } catch (err) {
      showError(err.message || 'Approval and blockchain commit failed.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      setActionProcessing(true);
      await api.registrar.rejectRegistration(selectedReq.id, rejectReason);
      showSuccess(`Registration request for "${selectedReq.land_id}" rejected.`);
      setRejectModalOpen(false);
      setRejectReason('');
      fetchPending();
    } catch (err) {
      showError(err.message || 'Failed to reject request.');
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Chief Registrar Review Desk</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Pending Land Registration Requests</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review legal title applications, verify survey cadastre references, and endorse smart contract commits to Hyperledger Fabric.
        </p>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving pending applications from Revenue Database..." />
      ) : requests.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/50 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Land ID</th>
                <th className="px-5 py-3.5">Applicant Citizen</th>
                <th className="px-5 py-3.5">Cadastre / Survey #</th>
                <th className="px-5 py-3.5">Location & District</th>
                <th className="px-5 py-3.5">Area & Type</th>
                <th className="px-5 py-3.5">Submitted On</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {requests.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-emerald-400">{item.land_id}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{item.owner_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.citizen_email}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-300 font-semibold">{item.survey_number}</td>
                  <td className="px-5 py-4 text-slate-300">
                    <div>{item.location}</div>
                    <div className="text-[11px] text-slate-400">{item.district}, {item.state}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-300 font-medium">
                    {item.area} {item.area_unit} ({item.land_type})
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedReq(item);
                          setDetailsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors flex items-center gap-1"
                        title="Inspect full application"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => handleApprove(item)}
                        disabled={actionProcessing}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedReq(item);
                          setRejectModalOpen(true);
                        }}
                        disabled={actionProcessing}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="All Registrations Processed"
          description="There are no pending land registration requests awaiting your review at this time."
        />
      )}

      {/* Details & Inspection Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Inspect Land Title Request: ${selectedReq?.land_id}`}
        maxWidth="max-w-2xl"
      >
        {selectedReq && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Land ID</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedReq.land_id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Survey Cadastre</span>
                <span className="font-semibold text-white">{selectedReq.survey_number}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Title Holder / Owner</span>
                <span className="font-semibold text-white">{selectedReq.owner_name} ({selectedReq.citizen_email})</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Location</span>
                <span className="text-white">{selectedReq.location}, {selectedReq.district}, {selectedReq.state}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Area & Land Type</span>
                <span className="text-white">{selectedReq.area} {selectedReq.area_unit} ({selectedReq.land_type})</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Supporting Document Ref</span>
                <span className="font-mono text-cyan-400 font-semibold">{selectedReq.document_reference}</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              By clicking "Approve & Commit to Fabric", you certify that the property credentials match official revenue cadastre records and execute the Smart Contract <code className="text-emerald-400">registerLand()</code>.
            </p>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedReq)}
                disabled={actionProcessing}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionProcessing ? 'Committing to Blockchain...' : 'Approve & Commit to Fabric'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Registration: ${selectedReq?.land_id}`}
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Rejection *</label>
            <textarea
              required
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Supporting revenue title deed reference is invalid or survey number mismatch."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            ></textarea>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionProcessing}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/50"
            >
              <XCircle className="w-4 h-4" />
              <span>Confirm Rejection</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

