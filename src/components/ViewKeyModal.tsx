import React, { useState, useEffect } from 'react';
import { X, KeyRound, Copy, Check, MessageSquare, Server, Sparkles, Building2 } from 'lucide-react';
import { ClinicLicense } from '../types/license';

interface ViewKeyModalProps {
  clinic: ClinicLicense;
  onClose: () => void;
}

export const ViewKeyModal: React.FC<ViewKeyModalProps> = ({ clinic, onClose }) => {
  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedMid, setCopiedMid] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(clinic.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyMid = () => {
    navigator.clipboard.writeText(clinic.machineId);
    setCopiedMid(true);
    setTimeout(() => setCopiedMid(false), 2500);
  };

  const getWhatsAppMessage = (): string => {
    const prod = clinic.category || 'HMS Software';
    return `Hello ${clinic.doctorName || 'Doctor'},\n\nHere is your permanent Lifetime License Key for ${clinic.clinicName}:\n\n*Server Machine ID:* ${clinic.machineId}\n*License Key:*\n${clinic.licenseKey}\n\n*Instructions:*\n1. Open ${prod} on your Main Clinic Server PC.\n2. Paste this License Key into the activation box and click "Verify & Activate Lifetime License".\n3. Your clinic will be activated permanently with unlimited doctor and staff access across your local LAN.`;
  };

  const handleCopyMsg = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-badge">
              <KeyRound size={22} color="#ffffff" />
            </div>
            <div>
              <h3 className="modal-title">Client Lifetime License Key</h3>
              <p className="modal-sub">Copy and share this license key with your clinic client</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" title="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Clinic Info */}
        <div className="clinic-chip-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="var(--color-primary)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--color-heading)' }}>
                {clinic.clinicName}
              </strong>
            </div>
            <span className="badge-lifetime">LIFETIME ACCESS</span>
          </div>

          <div className="clinic-meta-row">
            <span style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
              Doctor: <strong style={{ color: 'var(--color-heading)' }}>{clinic.doctorName}</strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Server size={13} color="var(--color-text-muted)" />
              <code className="mid-code font-mono">{clinic.machineId}</code>
              <button
                type="button"
                onClick={handleCopyMid}
                className={`btn-icon-copy ${copiedMid ? 'copied' : ''}`}
                title="Copy Server Machine ID"
              >
                {copiedMid ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* License Key Box */}
        <div className="key-container">
          <div className="key-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={15} color="var(--color-primary)" />
              <span className="key-title">Cryptographic License Key</span>
            </div>
            <button
              type="button"
              onClick={handleCopyKey}
              className={`btn-copy-main ${copiedKey ? 'copied' : ''}`}
            >
              {copiedKey ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedKey ? 'Copied License Key!' : 'Copy License Key'}</span>
            </button>
          </div>
          <textarea
            readOnly
            rows={3}
            value={clinic.licenseKey}
            className="key-textarea font-mono"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            title="Click to select all"
          />
          <p className="key-hint">
            The client pastes this key into their {clinic.category || 'HMS'} Server activation modal.
          </p>
        </div>

        {/* WhatsApp Ready Dispatch Message */}
        <div className="dispatch-container">
          <div className="dispatch-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={15} color="#10b981" />
              <span className="dispatch-title">WhatsApp / Email Dispatch Message</span>
            </div>
            <button
              type="button"
              onClick={handleCopyMsg}
              className={`btn-copy-dispatch ${copiedMsg ? 'copied' : ''}`}
            >
              {copiedMsg ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedMsg ? 'Copied Message!' : 'Copy WhatsApp Message'}</span>
            </button>
          </div>
          <pre className="dispatch-pre">{getWhatsAppMessage()}</pre>
        </div>

        {/* Footer */}
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-done">
            <span>Done & Close</span>
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
          max-width: 620px;
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
          box-sizing: border-box;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-heading);
          margin: 0;
          line-height: 1.25;
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
          flex-shrink: 0;
          transition: all 0.15s ease;
        }

        .modal-close-btn:hover {
          color: var(--color-heading);
          border-color: var(--color-primary);
        }

        .clinic-chip-box {
          background-color: var(--color-surface-secondary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 12px 14px;
        }

        .clinic-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.05));
        }

        .badge-lifetime {
          font-size: 0.65rem;
          font-weight: 800;
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .mid-code {
          font-size: 0.74rem;
          color: #38bdf8;
          background-color: var(--color-input-background, #0a0c12);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--color-border);
        }

        .btn-icon-copy {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
          transition: all 0.15s ease;
        }

        .btn-icon-copy:hover {
          color: var(--color-heading);
          border-color: var(--color-border);
          background-color: var(--color-surface);
        }

        .key-container {
          background-color: var(--color-surface-secondary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 14px;
        }

        .key-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }

        .key-title {
          font-size: 0.80rem;
          font-weight: 700;
          color: var(--color-heading);
          letter-spacing: 0.01em;
        }

        .btn-copy-main {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 34px;
          padding: 0 14px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
          color: #ffffff !important;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          white-space: nowrap !important;
          flex-shrink: 0;
        }

        .btn-copy-main * {
          white-space: nowrap !important;
          color: #ffffff !important;
        }

        .btn-copy-main:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .btn-copy-main.copied {
          background: #10b981;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .key-textarea {
          width: 100%;
          min-height: 74px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-input-background, #0a0c12);
          color: #38bdf8;
          font-size: 0.76rem;
          line-height: 1.45;
          padding: 10px 12px;
          outline: none;
          resize: none;
          user-select: all;
          word-break: break-all;
          box-sizing: border-box;
        }

        .key-hint {
          font-size: 0.70rem;
          color: var(--color-text-muted);
          margin: 6px 0 0 0;
          line-height: 1.35;
        }

        .dispatch-container {
          background-color: var(--color-surface-secondary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 14px;
        }

        .dispatch-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }

        .dispatch-title {
          font-size: 0.80rem;
          font-weight: 700;
          color: var(--color-heading);
          letter-spacing: 0.01em;
        }

        .btn-copy-dispatch {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 34px;
          padding: 0 14px;
          border-radius: 8px;
          border: 1px solid rgba(16, 185, 129, 0.35);
          background-color: rgba(16, 185, 129, 0.12);
          color: #10b981 !important;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap !important;
          flex-shrink: 0;
        }

        .btn-copy-dispatch * {
          white-space: nowrap !important;
        }

        .btn-copy-dispatch:hover {
          background-color: rgba(16, 185, 129, 0.2);
          transform: translateY(-1px);
        }

        .btn-copy-dispatch.copied {
          background-color: #10b981;
          color: #ffffff !important;
          border-color: #10b981;
        }

        .btn-copy-dispatch.copied * {
          color: #ffffff !important;
        }

        .dispatch-pre {
          background-color: var(--color-input-background, #0a0c12);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 10px 12px;
          font-family: inherit;
          font-size: 0.72rem;
          color: var(--color-text-secondary);
          margin: 0;
          white-space: pre-wrap;
          max-height: 120px;
          overflow-y: auto;
          overflow-x: hidden;
          line-height: 1.45;
          word-break: break-word;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-top: 4px;
          flex-shrink: 0;
        }

        .btn-done {
          height: 42px;
          padding: 0 26px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
          color: #ffffff;
          font-size: 0.84rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 12px rgba(37, 99, 235, 0.35);
          transition: all 0.15s ease;
        }

        .btn-done:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        @media (max-width: 680px) {
          .modal-backdrop {
            padding: 10px;
          }

          .modal-card {
            padding: 16px;
            max-height: calc(100dvh - 20px);
            gap: 14px;
            border-radius: 16px;
          }

          .key-header, .dispatch-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .btn-copy-main, .btn-copy-dispatch {
            width: 100%;
            height: 38px;
            justify-content: center;
          }

          .clinic-chip-box {
            padding: 10px 12px;
          }

          .clinic-meta-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .modal-actions {
            justify-content: stretch;
          }

          .btn-done {
            width: 100%;
            height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

