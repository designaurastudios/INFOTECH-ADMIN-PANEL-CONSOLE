import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, Loader2, Server, Building2 } from 'lucide-react';
import { ClinicLicense } from '../types/license';

interface DeleteLicenseModalProps {
  clinic: ClinicLicense;
  onClose: () => void;
  onConfirm: (clinic: ClinicLicense) => Promise<void>;
}

export const DeleteLicenseModal: React.FC<DeleteLicenseModalProps> = ({
  clinic,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm(clinic);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error deleting license.');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="delete-icon-box">
              <Trash2 size={22} color="#ffffff" />
            </div>
            <div>
              <h3 className="modal-title">Delete Clinic License</h3>
              <p className="modal-sub">Remove license from cloud database</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={deleting} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Error message if any */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.80rem',
              fontWeight: 600,
              marginBottom: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Warning Info */}
        <div className="warning-box">
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.80rem', lineHeight: 1.45, color: 'var(--color-heading)' }}>
            <strong>Action Effect:</strong> Deleting this license will remove it from Firestore. The client's Server PC will delete its local license file and immediately show the <strong>"Server Activation Required"</strong> screen.
          </div>
        </div>

        {/* Clinic Summary Box */}
        <div className="clinic-info-box">
          <div className="info-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} color="var(--color-primary)" />
              <span className="info-label">Clinic Name:</span>
            </div>
            <strong className="info-val">{clinic.clinicName}</strong>
          </div>

          <div className="info-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} color="var(--color-primary)" />
              <span className="info-label">Server Machine ID:</span>
            </div>
            <code className="info-val font-mono">{clinic.machineId}</code>
          </div>

          {clinic.doctorName && (
            <div className="info-row">
              <span className="info-label">Doctor Name:</span>
              <span className="info-val">{clinic.doctorName}</span>
            </div>
          )}

          <div className="info-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <span className="info-label">Status:</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: clinic.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
              {clinic.status}
            </span>
          </div>
        </div>

        <p className="footer-notice">
          The client will be able to copy their Machine ID from their screen and send it to you to generate a new license whenever needed.
        </p>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={deleting} className="btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-delete-confirm"
          >
            {deleting ? (
              <>
                <Loader2 size={15} className="spinner" />
                <span>Deleting License...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Yes, Delete License</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(6, 7, 9, 0.85);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .modal-card {
          width: 100%;
          max-width: 480px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .delete-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-heading);
          margin: 0;
        }

        .modal-sub {
          font-size: 0.74rem;
          color: var(--color-text-secondary);
          margin: 2px 0 0 0;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-secondary);
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-close-btn:hover {
          color: var(--color-heading);
        }

        .warning-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .clinic-info-box {
          background-color: var(--color-surface-secondary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--color-border);
          font-size: 0.78rem;
        }

        .info-label {
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .info-val {
          color: var(--color-heading);
        }

        .font-mono {
          font-family: monospace;
          color: #38bdf8;
        }

        .footer-notice {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          line-height: 1.4;
          margin: 0;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 8px;
        }

        .btn-cancel {
          height: 40px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-secondary);
          color: var(--color-text-secondary);
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-cancel:hover:not(:disabled) {
          color: var(--color-heading);
        }

        .btn-delete-confirm {
          height: 40px;
          padding: 0 18px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.35);
        }

        .btn-delete-confirm:hover:not(:disabled) {
          opacity: 0.94;
        }

        .btn-delete-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

