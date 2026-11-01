import React, { useState, useEffect } from 'react';
import { X, Sliders, Server, Mail, ShieldAlert, KeyRound, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { ClinicLicense, LicenseStatus } from '../types/license';
import { licenseService } from '../services/licenseService';

interface EditClinicModalProps {
  clinic: ClinicLicense;
  onClose: () => void;
  onUpdated: () => void;
  onOpenDirectorReset: (clinic: ClinicLicense) => void;
}

export const EditClinicModal: React.FC<EditClinicModalProps> = ({
  clinic,
  onClose,
  onUpdated,
  onOpenDirectorReset,
}) => {
  const [status, setStatus] = useState<LicenseStatus>(clinic.status);
  const [staffManagementEnabled, setStaffManagementEnabled] = useState(
    Boolean(clinic.developerSettings?.staffManagementEnabled)
  );
  const [directorEmail, setDirectorEmail] = useState(
    clinic.developerSettings?.directorEmail || ''
  );

  const [saving, setSaving] = useState(false);
  const [resettingDevice, setResettingDevice] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (status !== clinic.status) {
        await licenseService.updateStatus(clinic.licenseKey, status);
      }
      await licenseService.updateDeveloperSettings(clinic.licenseKey, {
        staffManagementEnabled,
        directorEmail: directorEmail.trim(),
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error updating clinic.');
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteResetDevice = async () => {
    setResettingDevice(true);
    try {
      await licenseService.resetHardwareBinding(clinic.licenseKey);
      setConfirmingReset(false);
      onUpdated();
      onClose();
    } catch {
      setResettingDevice(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <Sliders size={20} color="#ffffff" />
            </div>
            <div>
              <h3 className="modal-heading">{clinic.clinicName}</h3>
              <p className="modal-sub">Remote Developer Controls & License Status</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="modal-form">
          {/* Section 1: License Status Switch */}
          <div className="setting-block">
            <label className="setting-label">License Operational Status</label>
            <div className="status-selector-row">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`status-btn btn-active ${status === 'ACTIVE' ? 'selected' : ''}`}
              >
                <span className="dot dot-green" />
                <span>ACTIVE</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('SUSPENDED')}
                className={`status-btn btn-suspended ${status === 'SUSPENDED' ? 'selected' : ''}`}
              >
                <span className="dot dot-red" />
                <span>SUSPENDED</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('REVOKED')}
                className={`status-btn btn-revoked ${status === 'REVOKED' ? 'selected' : ''}`}
              >
                <span className="dot dot-black" />
                <span>REVOKED</span>
              </button>
            </div>
            <p className="setting-hint">
              {status === 'ACTIVE'
                ? 'Clinic server and all LAN terminals have 100% full access.'
                : 'Suspended clinics will be immediately locked out on their next check-in.'}
            </p>
          </div>

          {/* Section 2: Remote Developer Page Controls */}
          <div className="setting-block">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="setting-label" style={{ margin: 0 }}>Staff Management for Admins</span>
                <p className="setting-hint" style={{ margin: 0 }}>
                  Allow administrators in this clinic to create and manage staff
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={staffManagementEnabled}
                  onChange={(e) => setStaffManagementEnabled(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="setting-block">
            <label className="setting-label">Director Authorization & OTP Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="director@clinic.com"
                className="form-input"
                value={directorEmail}
                onChange={(e) => setDirectorEmail(e.target.value)}
              />
            </div>
            <p className="setting-hint">
              OTPs for high-security actions (database purge, chat clear) are sent to this address.
            </p>
          </div>

          {/* Section 3: Hardware Transfer */}
          <div className="setting-block">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="setting-label" style={{ margin: 0 }}>Registered Machine ID</span>
                <code className="mid-code">{clinic.machineId}</code>
              </div>
              {!confirmingReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmingReset(true)}
                  disabled={resettingDevice}
                  className="btn-reset-device"
                >
                  <RefreshCw size={13} />
                  <span>Transfer to New PC</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleExecuteResetDevice}
                    disabled={resettingDevice}
                    style={{
                      height: '30px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {resettingDevice ? 'Unbinding...' : 'Confirm Unbind'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingReset(false)}
                    disabled={resettingDevice}
                    style={{
                      height: '30px',
                      padding: '0 8px',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {confirmingReset ? (
              <p style={{ marginTop: '8px', fontSize: '0.74rem', color: '#ef4444', fontWeight: 600 }}>
                Unbinding will allow this clinic to reuse this license key on a different Server PC.
              </p>
            ) : (
              <p className="setting-hint" style={{ marginTop: '6px' }}>
                Click Transfer if the clinic purchased a new server computer or replaced their motherboard.
              </p>
            )}
          </div>

          {/* Section 4: Emergency Director Password Reset Shortcut */}
          <div className="setting-block reset-shortcut-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={15} color="#f59e0b" />
                  <span style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--color-heading)' }}>
                    Emergency Director Password Reset
                  </span>
                </div>
                <p className="setting-hint" style={{ margin: 0 }}>
                  Remotely set a new master password if the clinic owner is locked out
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDirectorReset(clinic);
                }}
                className="btn-director-reset"
              >
                Reset Director Password
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving Changes...' : 'Save Cloud Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .setting-block {
          background-color: var(--color-surface-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 12px 14px;
        }

        .setting-label {
          display: block;
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--color-heading);
          margin-bottom: 6px;
        }

        .setting-hint {
          font-size: 0.70rem;
          color: var(--color-text-muted);
          margin-top: 5px;
          line-height: 1.35;
        }

        .status-selector-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .status-btn {
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-text-secondary);
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .dot-green { background-color: #10b981; }
        .dot-red { background-color: #ef4444; }
        .dot-black { background-color: #6b7280; }

        .status-btn.selected.btn-active {
          border-color: #10b981;
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .status-btn.selected.btn-suspended {
          border-color: #ef4444;
          background-color: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .status-btn.selected.btn-revoked {
          border-color: #6b7280;
          background-color: rgba(107, 114, 128, 0.2);
          color: #ffffff;
        }

        .mid-code {
          font-family: var(--font-family-mono);
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--color-primary);
          background-color: var(--color-input-background);
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid var(--color-border);
        }

        .btn-reset-device {
          height: 32px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-heading);
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .btn-reset-device:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .reset-shortcut-box {
          border-color: rgba(245, 158, 11, 0.3);
          background-color: rgba(245, 158, 11, 0.05);
        }

        .btn-director-reset {
          height: 32px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid rgba(245, 158, 11, 0.4);
          background-color: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-director-reset:hover {
          background-color: #f59e0b;
          color: #000000;
        }

        /* Toggle switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--color-border);
          transition: 0.2s;
          border-radius: 34px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.2s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: var(--color-primary);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(18px);
        }
      `}</style>
    </div>
  );
};

