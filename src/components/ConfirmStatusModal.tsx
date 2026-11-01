import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, ShieldCheck, Loader2, Building2, Server } from 'lucide-react';
import { ClinicLicense, LicenseStatus } from '../types/license';

interface ConfirmStatusModalProps {
  clinic: ClinicLicense;
  targetStatus: LicenseStatus;
  onClose: () => void;
  onConfirm: (clinic: ClinicLicense, status: LicenseStatus) => Promise<void>;
}

export const ConfirmStatusModal: React.FC<ConfirmStatusModalProps> = ({
  clinic,
  targetStatus,
  onClose,
  onConfirm,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const isSuspending = targetStatus === 'SUSPENDED';

  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleAction = async () => {
    setSubmitting(true);
    try {
      await onConfirm(clinic, targetStatus);
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="csm-overlay">
      <div className="csm-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="csm-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="csm-badge-icon"
              style={{
                backgroundColor: isSuspending ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: isSuspending ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              {isSuspending ? (
                <ShieldAlert size={20} color="#ef4444" />
              ) : (
                <ShieldCheck size={20} color="#10b981" />
              )}
            </div>
            <div>
              <h3 className="csm-title">
                {isSuspending ? 'Suspend Clinic License' : 'Reactivate Clinic License'}
              </h3>
              <p className="csm-sub">
                {isSuspending ? 'Temporarily freeze software access' : 'Restore full software access'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="csm-close-btn" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Warning / Advisory Notice */}
        <div
          className="csm-notice"
          style={{
            backgroundColor: isSuspending ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            border: isSuspending ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          {isSuspending ? (
            <span>
              <strong>Effect:</strong> The Server PC and all connected LAN laptops will immediately lock. The screen will display <strong>"Clinic License Suspended"</strong> and their Machine ID with a status check button. The key input will be hidden.
            </span>
          ) : (
            <span>
              <strong>Effect:</strong> The Server PC and all connected LAN laptops will unlock immediately, restoring normal clinic operations.
            </span>
          )}
        </div>

        {/* Clinic info box */}
        <div className="csm-info-box">
          <div className="csm-info-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} color="#3b82f6" />
              <span className="csm-info-label">Clinic Name:</span>
            </div>
            <strong className="csm-info-val">{clinic.clinicName}</strong>
          </div>

          <div className="csm-info-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} color="#3b82f6" />
              <span className="csm-info-label">Server Machine ID:</span>
            </div>
            <code className="csm-machine-code">{clinic.machineId}</code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="csm-actions">
          <button type="button" onClick={onClose} disabled={submitting} className="csm-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAction}
            disabled={submitting}
            className={`csm-btn-confirm ${isSuspending ? 'csm-btn-suspend' : 'csm-btn-reactivate'}`}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="csm-spin" />
                <span>Updating...</span>
              </>
            ) : isSuspending ? (
              <>
                <ShieldAlert size={14} />
                <span>Yes, Suspend License</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Yes, Reactivate License</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .csm-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 16px;
        }

        .csm-card {
          width: 100%;
          max-width: 480px;
          background-color: #0e1017;
          border: 1px solid #202433;
          border-radius: 14px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
          box-sizing: border-box;
        }

        .csm-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .csm-badge-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .csm-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f0f6fc;
          margin: 0;
        }

        .csm-sub {
          font-size: 0.72rem;
          color: #8b949e;
          margin: 2px 0 0 0;
        }

        .csm-close-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #30363d;
          background-color: transparent;
          color: #8b949e;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .csm-close-btn:hover {
          color: #f0f6fc;
          background-color: #21262d;
        }

        .csm-notice {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          line-height: 1.45;
          color: #c9d1d9;
        }

        .csm-info-box {
          background-color: #141722;
          border: 1px solid #202433;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .csm-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid #202433;
          font-size: 0.78rem;
          gap: 8px;
        }

        .csm-info-label {
          color: #8b949e;
          font-weight: 600;
        }

        .csm-info-val {
          color: #f0f6fc;
          font-weight: 700;
        }

        .csm-machine-code {
          font-family: monospace;
          background-color: rgba(56, 189, 248, 0.12);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.74rem;
          font-weight: 700;
        }

        .csm-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
        }

        .csm-btn-cancel {
          height: 36px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid #30363d;
          background-color: #161b22;
          color: #c9d1d9;
          font-size: 0.80rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          box-sizing: border-box;
          white-space: nowrap;
        }

        .csm-btn-cancel:hover:not(:disabled) {
          background-color: #21262d;
          color: #ffffff;
        }

        .csm-btn-confirm {
          height: 36px;
          padding: 0 18px;
          border-radius: 8px;
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #ffffff;
          box-sizing: border-box;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .csm-btn-suspend {
          background-color: #ef4444;
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.35);
        }

        .csm-btn-suspend:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .csm-btn-reactivate {
          background-color: #10b981;
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
        }

        .csm-btn-reactivate:hover:not(:disabled) {
          background-color: #059669;
        }

        .csm-btn-confirm:disabled, .csm-btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .csm-spin {
          animation: csm-spin 1s linear infinite;
        }

        @keyframes csm-spin {
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .csm-actions {
            flex-direction: column-reverse;
            gap: 8px;
          }
          .csm-btn-cancel, .csm-btn-confirm {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
