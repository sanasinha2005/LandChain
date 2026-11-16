import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function PendingTransfersPage() {
  const { showSuccess, showError } = useToast();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await api.registrar.getPendingTransfers();
      if (res.success) {
        setTransfers(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed loading pending transfers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleApprove = async (transferItem) => {
    if (!window.confirm(`Are you sure you want to approve the ownership transfer of ${transferItem.land_id} from ${transferItem.current_owner_name} to ${transferItem.new_owner_name}?`)) {
      return;
    }

    try {
      setActionProcessing(true);
      const res = await api.registrar.approveTransfer(transferItem.id);
      showSuccess(`Ownership transfer for ${res.landId} committed to Fabric! TxID: ${res.blockchainTxId.slice(0, 10)}...`);
      fetchTransfers();
    } catch (err) {
      showError(err.message || 'Ownership transfer execution failed.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTransfer) return;

    try {
      setActionProcessing(true);
      await api.registrar.rejectTransfer(selectedTransfer.id, rejectReason);
      showSuccess(`Transfer request for ${selectedTransfer.land_id} rejected.`);
      setRejectModalOpen(false);
      setRejectReason('');
      fetchTransfers();
    } catch (err) {
      showError(err.message || 'Failed to reject transfer.');
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-cyan-500/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Chief Registrar Transfer Desk</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Pending Ownership Transfer Requests</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review bilateral property conveyance requests, verify recipient citizen eligibility, and endorse smart contract <code className="text-cyan-400">transferLand()</code> on Hyperledger Fabric.
        </p>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving pending transfer deeds from Revenue Database..." />
      ) : transfers.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/50 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Land ID</th>
                <th className="px-5 py-3.5">Current Owner (Transferor)</th>
                <th className="px-5 py-3.5">New Owner (Transferee)</th>
                <th className="px-5 py-3.5">Requested On</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {transfers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-emerald-400">{item.land_id}</td>
                  
                  {/* Current Owner */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{item.current_owner_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.current_owner_email}</div>
                  </td>

                  {/* New Owner */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-cyan-300">{item.new_owner_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.new_owner_email}</div>
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={actionProcessing}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approve Transfer</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTransfer(item);
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
          icon={ArrowRightLeft}
          title="No Pending Ownership Transfers"
          description="There are no pending title deed transfers requiring registrar endorsement."
        />
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Ownership Transfer: ${selectedTransfer?.land_id}`}
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Rejection *</label>
            <textarea
              required
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Transfer documentation incomplete or dispute flagged on property."
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

