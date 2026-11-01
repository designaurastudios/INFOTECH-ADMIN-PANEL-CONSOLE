import React, { useState, useEffect } from 'react';
import { X, KeyRound, ShieldAlert, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ClinicLicense } from '../types/license';
import { licenseService } from '../services/licenseService';

interface RemoteDirectorResetModalProps {
  clinic: ClinicLicense;
  onClose: () => void;
  onSuccess: () => void;
}

export const RemoteDirectorResetModal: React.FC<RemoteDirectorResetModalProps> = ({
  clinic,
  onClose,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4 || newPassword.length > 16) {
      alert('Password must be between 4 and 16 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await licenseService.triggerDirectorPasswordReset(clinic.licenseKey, newPassword);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Error triggering password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rdm-overlay">
      <div className="rdm-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="rdm-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="rdm-icon-badge">
              <KeyRound size={20} color="#ffffff" />
            </div>
            <div>
              <h3 className="rdm-heading">Reset Director Password</h3>
              <p className="rdm-sub">Primary Director Account for {clinic.clinicName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rdm-close-btn" title="Close">
            <X size={16} />
          </button>
        </div>

        {!success ? (
          <form onSubmit={handleReset} className="rdm-form">
            <div className="rdm-warning-banner">
              <ShieldAlert size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.74rem', color: '#f0f6fc', margin: 0, lineHeight: 1.45 }}>
                This will remotely update the master password for the <strong>Primary Director</strong> (Clinic Owner). The new password will take effect when {clinic.category || 'the software'} connects.
              </p>
            </div>

            <div className="rdm-field">
              <label className="rdm-label">New Director Password (4-16 chars)</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  maxLength={16}
                  placeholder="Enter new master password"
                  className="rdm-input"
                  style={{ paddingRight: '40px' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rdm-eye-btn"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="rdm-field">
              <label className="rdm-label">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={4}
                maxLength={16}
                placeholder="Re-enter password"
                className="rdm-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="rdm-actions">
              <button type="button" onClick={onClose} disabled={submitting} className="rdm-btn-cancel">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !newPassword || newPassword !== confirmPassword}
                className="rdm-btn-submit"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="rdm-spin" />
                    <span>Sending Reset Command...</span>
                  </>
                ) : (
                  <span>Confirm & Apply Reset</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="rdm-success-view">
            <div className="rdm-success-banner">
              <Check size={20} color="#10b981" />
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
                  Reset Command Queued!
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#8b949e', margin: '2px 0 0 0' }}>
                  The new password has been pushed to the cloud. When {clinic.category || 'the software'} connects, the Primary Director can log in using:
                </p>
                <div className="rdm-pw-display">
                  Password: {newPassword}
                </div>
              </div>
            </div>

            <button type="button" onClick={onClose} className="rdm-btn-done">
              Done
            </button>
          </div>
        )}
      </div>

      <style>{`
        .rdm-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2200;
          padding: 16px;
        }

        .rdm-card {
          width: 100%;
          max-width: 480px;
          background-color: #0e1017;
          border: 1px solid #202433;
          border-radius: 14px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
          box-sizing: border-box;
        }

        .rdm-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .rdm-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .rdm-heading {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f0f6fc;
          margin: 0;
        }

        .rdm-sub {
          font-size: 0.72rem;
          color: #8b949e;
          margin: 2px 0 0 0;
        }

        .rdm-close-btn {
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

        .rdm-close-btn:hover {
          color: #f0f6fc;
          background-color: #21262d;
        }

        .rdm-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rdm-warning-banner {
          display: flex;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background-color: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .rdm-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .rdm-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #f0f6fc;
        }

        .rdm-input {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          background-color: #141722;
          border: 1px solid #202433;
          border-radius: 8px;
          color: #f0f6fc;
          font-size: 0.82rem;
          outline: none;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
        }

        .rdm-input:focus {
          border-color: #f59e0b;
        }

        .rdm-eye-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #8b949e;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .rdm-eye-btn:hover {
          color: #f0f6fc;
        }

        .rdm-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
        }

        .rdm-btn-cancel {
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

        .rdm-btn-cancel:hover:not(:disabled) {
          background-color: #21262d;
          color: #ffffff;
        }

        .rdm-btn-submit {
          height: 36px;
          padding: 0 18px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.35);
          transition: all 0.15s ease;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .rdm-btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        }

        .rdm-btn-submit:disabled, .rdm-btn-cancel:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .rdm-success-view {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .rdm-success-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 8px;
        }

        .rdm-pw-display {
          margin-top: 8px;
          padding: 6px 10px;
          background-color: #141722;
          border: 1px solid #202433;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.84rem;
          font-weight: 800;
          color: #f0f6fc;
        }

        .rdm-btn-done {
          height: 36px;
          width: 100%;
          background-color: #161b22;
          border: 1px solid #30363d;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.82rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .rdm-btn-done:hover {
          background-color: #21262d;
        }

        .rdm-spin {
          animation: rdm-spin 1s linear infinite;
        }

        @keyframes rdm-spin {
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .rdm-actions {
            flex-direction: column-reverse;
            gap: 8px;
          }
          .rdm-btn-cancel, .rdm-btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
