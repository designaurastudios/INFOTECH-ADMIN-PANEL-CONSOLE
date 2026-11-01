import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Sliders,
  Users,
  Database,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { ClinicLicense } from '../types/license';
import { licenseService } from '../services/licenseService';
import { RemoteDirectorResetModal } from './RemoteDirectorResetModal';

interface DevSettingsModalProps {
  clinic: ClinicLicense;
  onClose: () => void;
  onUpdated: () => void;
}

export const DevSettingsModal: React.FC<DevSettingsModalProps> = ({
  clinic,
  onClose,
  onUpdated,
}) => {
  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const currentDev = clinic.developerSettings || {
    staffManagementEnabled: true,
    visitLimitEnabled: false,
    visitLimit: 100,
    directorEmail: '',
    lifetimeAccess: true,
  };

  // 1. Manage Plan Details State
  const [lifetimeAccess, setLifetimeAccess] = useState<boolean>(
    currentDev.lifetimeAccess !== undefined ? currentDev.lifetimeAccess : true
  );
  const [planStartDate, setPlanStartDate] = useState<string>(
    currentDev.planStartDate || clinic.issuedAt || new Date().toISOString().split('T')[0]
  );
  const [planEndDate, setPlanEndDate] = useState<string>(
    currentDev.planEndDate || '2099-12-31'
  );

  // 2. Visit Limit Scope State
  const [visitLimitEnabled, setVisitLimitEnabled] = useState<boolean>(
    Boolean(currentDev.visitLimitEnabled)
  );
  const [visitLimit, setVisitLimit] = useState<number>(
    currentDev.visitLimit || 10
  );

  // 3. Staff Management Scope State
  const [staffManagementEnabled, setStaffManagementEnabled] = useState<boolean>(
    currentDev.staffManagementEnabled !== undefined ? currentDev.staffManagementEnabled : true
  );

  // 4. Database Deletion Security Email State
  const [adminEmail, setAdminEmail] = useState<string>(
    currentDev.directorEmail || ''
  );

  // Universal Save State
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Single Universal Save: Updates all 4 containers in one atomic cloud call
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await licenseService.updateDeveloperSettings(clinic.licenseKey, {
        lifetimeAccess: Boolean(lifetimeAccess),
        planStartDate: !lifetimeAccess ? (planStartDate || '') : '',
        planEndDate: !lifetimeAccess ? (planEndDate || '') : '',
        visitLimitEnabled: Boolean(visitLimitEnabled),
        visitLimit: Number(visitLimit) || 0,
        staffManagementEnabled: Boolean(staffManagementEnabled),
        directorEmail: adminEmail.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      onUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save developer settings to cloud');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dev-modal-overlay">
      <div className="dev-modal-fixed-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="dev-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="dev-header-icon-box">
              <Sliders size={18} color="var(--color-primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="dev-modal-title">{clinic.clinicName}</h3>
                <span className="dev-header-badge">Remote Developer Controls</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Doctor: <strong style={{ color: 'var(--color-heading)' }}>{clinic.doctorName}</strong>
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Machine ID: <code className="dev-mid-code">{clinic.machineId}</code>
                </span>
              </div>
            </div>
          </div>

          <button type="button" onClick={onClose} className="dev-modal-close-btn" title="Close Developer Settings">
            <X size={18} />
          </button>
        </div>

        {/* Global Error Banner if any */}
        {errorMsg && (
          <div className="dev-error-banner">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* The 4 Containers Grid (Compact, strictly NO scrolling) */}
        <div className="dev-containers-grid">
          {/* CONTAINER 1: Manage Plan Details */}
          <div className="dev-box">
            <div className="box-header">
              <div className="box-title-wrap">
                <Calendar size={16} color="#f97316" />
                <h4 className="box-title">Manage Plan Details</h4>
              </div>
              <span className="box-tag">Subscription Control</span>
            </div>

            <p className="box-desc">
              Define software access validity. Turn on <strong>Lifetime Access</strong> for perpetual plan activation, or set specific dates.
            </p>

            <div className="box-body">
              <div className="slider-row">
                <div className="slider-info">
                  <span className="slider-title">Lifetime Access Plan</span>
                  <span className="slider-subtitle">
                    {lifetimeAccess ? 'Perpetual license active — never expires' : 'Custom validity period active'}
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={lifetimeAccess}
                    onChange={(e) => setLifetimeAccess(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {lifetimeAccess ? (
                <div className="lifetime-active-banner">
                  <Sparkles size={14} color="#10b981" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#10b981', display: 'block', fontSize: '0.72rem' }}>
                      Lifetime Access Plan Active
                    </strong>
                    <span>{clinic.category || 'Software'} operates perpetually without license expiration.</span>
                  </div>
                </div>
              ) : (
                <div className="dates-row">
                  <div className="date-field">
                    <label className="date-label">Start Date</label>
                    <input
                      type="date"
                      className="dev-input"
                      value={planStartDate}
                      onChange={(e) => setPlanStartDate(e.target.value)}
                    />
                  </div>
                  <div className="date-field">
                    <label className="date-label">End Date</label>
                    <input
                      type="date"
                      className="dev-input"
                      value={planEndDate}
                      onChange={(e) => setPlanEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTAINER 2: Visit Limit Scope */}
          <div className="dev-box">
            <div className="box-header">
              <div className="box-title-wrap">
                <Sliders size={16} color="#3b82f6" />
                <h4 className="box-title">Visit Limit Scope</h4>
              </div>
              <span className="box-tag">Visit Capacity</span>
            </div>

            <p className="box-desc">
              Toggle clinical visit restriction. When active, specify maximum visits allowed across all patients.
            </p>

            <div className="box-body">
              <div className="slider-row">
                <div className="slider-info">
                  <span className="slider-title">Enforce Visit Limit</span>
                  <span className="slider-subtitle">
                    {visitLimitEnabled
                      ? 'New registrations & check-in visits blocked once reached'
                      : 'Unlimited patient registrations and check-ins'}
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={visitLimitEnabled}
                    onChange={(e) => setVisitLimitEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="field-group">
                <label className="field-label">Maximum Number of Visits Allowed</label>
                <input
                  type="number"
                  min="1"
                  className="dev-input"
                  value={visitLimit}
                  onChange={(e) => setVisitLimit(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  disabled={!visitLimitEnabled}
                  placeholder="e.g. 100"
                />
              </div>
            </div>
          </div>

          {/* CONTAINER 3: Staff Management Scope */}
          <div className="dev-box">
            <div className="box-header">
              <div className="box-title-wrap">
                <Users size={16} color="#10b981" />
                <h4 className="box-title">Staff Management Scope</h4>
              </div>
              <span className="box-tag">Access Privilege</span>
            </div>

            <p className="box-desc">
              Control Administrator access to <strong>Manage Staff</strong>. When turned OFF, staff creation is restricted.
            </p>

            <div className="box-body">
              <div className="slider-row">
                <div className="slider-info">
                  <span className="slider-title">Staff Management Feature</span>
                  <span className="slider-subtitle">
                    {staffManagementEnabled
                      ? 'Administrators are permitted to add/modify staff'
                      : 'Staff management disabled for clinic administrators'}
                  </span>
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

              <div className="status-pill-box">
                {staffManagementEnabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                    <CheckCircle2 size={13} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Current Status: ACTIVE (Accessible)</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                    <AlertCircle size={13} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Current Status: DISABLED (Restricted)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTAINER 4: Database Deletion Security Email */}
          <div className="dev-box">
            <div className="box-header">
              <div className="box-title-wrap">
                <Database size={16} color="#a855f7" />
                <h4 className="box-title">Database Deletion Security Email</h4>
              </div>
              <span className="box-tag">Security OTP</span>
            </div>

            <p className="box-desc">
              Save the Director security email. A 6-digit OTP is sent to this address before database purges or chat clears.
            </p>

            <div className="box-body">
              <div className="field-group">
                <label className="field-label">Director Notification & Authorization Email</label>
                <div className="input-with-icon">
                  <Mail size={15} className="field-icon" />
                  <input
                    type="email"
                    className="dev-input pl-icon"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="director@dentalhms.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar with Reset Director Password & Single Universal Save Button */}
        <div className="dev-modal-footer">
          <button
            type="button"
            onClick={() => setShowResetPassword(true)}
            className="btn-director-reset-trigger"
            title="Remotely reset master password for Primary Director (Owner)"
          >
            <KeyRound size={14} color="#f59e0b" />
            <span>Reset Director Password</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="button" onClick={onClose} disabled={saving} className="btn-close-modal">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className={`btn-save-universal ${saved ? 'saved' : ''}`}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="spin-icon" />
                  <span>Saving to Cloud...</span>
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>Settings Saved!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Developer Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showResetPassword && (
        <RemoteDirectorResetModal
          clinic={clinic}
          onClose={() => setShowResetPassword(false)}
          onSuccess={() => {
            setShowResetPassword(false);
            onUpdated();
          }}
        />
      )}

      {/* Scoped CSS with Strictly NO Scrolling */}
      <style>{`
        .dev-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 16px;
          overflow: hidden;
        }

        /* Strictly non-scrolling, fixed dimension card */
        .dev-modal-fixed-card {
          width: 820px;
          max-width: 95vw;
          background-color: #0d1117;
          border: 1px solid #21262d;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }

        .dev-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-bottom: 1px solid #21262d;
          background-color: #161b22;
        }

        .dev-header-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: rgba(37, 99, 235, 0.12);
          border: 1px solid rgba(37, 99, 235, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dev-modal-title {
          font-size: 0.98rem;
          font-weight: 800;
          color: #f0f6fc;
          margin: 0;
        }

        .dev-header-badge {
          font-size: 0.64rem;
          font-weight: 700;
          background-color: rgba(37, 99, 235, 0.18);
          color: #60a5fa;
          border: 1px solid rgba(37, 99, 235, 0.3);
          padding: 2px 7px;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .dev-mid-code {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: #38bdf8;
          background-color: rgba(56, 189, 248, 0.1);
          padding: 1px 5px;
          border-radius: 4px;
        }

        .dev-modal-close-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background-color: transparent;
          border: 1px solid #30363d;
          color: #8b949e;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dev-modal-close-btn:hover {
          background-color: #21262d;
          color: #f0f6fc;
        }

        .dev-error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 10px 18px 0;
          padding: 8px 12px;
          border-radius: 6px;
          background-color: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          font-size: 0.76rem;
        }

        /* 2x2 Clean Grid - Strictly NO scrolling */
        .dev-containers-grid {
          padding: 14px 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          overflow: hidden;
        }

        .dev-box {
          background-color: #161b22;
          border: 1px solid #21262d;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
        }

        .box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .box-title-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .box-title {
          font-size: 0.86rem;
          font-weight: 800;
          color: #f0f6fc;
          margin: 0;
        }

        .box-tag {
          font-size: 0.64rem;
          font-weight: 700;
          color: #8b949e;
          background-color: #21262d;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .box-desc {
          font-size: 0.72rem;
          line-height: 1.35;
          color: #8b949e;
          margin: 0 0 8px 0;
        }

        .box-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .slider-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background-color: #0d1117;
          border: 1px solid #21262d;
          border-radius: 6px;
          gap: 8px;
        }

        .slider-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .slider-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #f0f6fc;
        }

        .slider-subtitle {
          font-size: 0.66rem;
          color: #8b949e;
        }

        /* Toggle switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 38px;
          height: 20px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #30363d;
          transition: 0.2s;
          border-radius: 20px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: #ffffff;
          transition: 0.2s;
          border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: #f97316;
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(18px);
        }

        .lifetime-active-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 6px;
          font-size: 0.70rem;
          line-height: 1.3;
          color: #c9d1d9;
        }

        .dates-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .date-field {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .date-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #8b949e;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .field-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #f0f6fc;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 10px;
          color: #8b949e;
          pointer-events: none;
        }

        .dev-input {
          width: 100%;
          height: 32px;
          padding: 0 10px;
          background-color: #0d1117;
          border: 1px solid #30363d;
          border-radius: 6px;
          color: #f0f6fc;
          font-size: 0.78rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .dev-input.pl-icon {
          padding-left: 32px;
        }

        .dev-input:focus {
          border-color: #f97316;
        }

        .status-pill-box {
          padding: 5px 10px;
          background-color: #0d1117;
          border: 1px solid #21262d;
          border-radius: 6px;
        }

        /* Modal Footer with Universal Save */
        .dev-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-top: 1px solid #21262d;
          background-color: #161b22;
        }

        .btn-director-reset-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid rgba(245, 158, 11, 0.4);
          background-color: rgba(245, 158, 11, 0.08);
          color: #f59e0b;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .btn-director-reset-trigger:hover {
          background-color: #f59e0b;
          color: #000000;
          border-color: #f59e0b;
        }

        .btn-director-reset-trigger:hover svg {
          color: #000000 !important;
        }

        .btn-close-modal {
          padding: 7px 16px;
          border-radius: 6px;
          background-color: transparent;
          border: 1px solid #30363d;
          color: #c9d1d9;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-close-modal:hover {
          background-color: #21262d;
          color: #ffffff;
        }

        /* Single Universal Save Button */
        .btn-save-universal {
          padding: 7px 18px;
          background-color: #f97316;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
        }

        .btn-save-universal:hover:not(:disabled) {
          background-color: #ea580c;
        }

        .btn-save-universal:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .btn-save-universal.saved {
          background-color: #10b981;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
