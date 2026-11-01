import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Server,
  KeyRound,
  Calendar,
  Clock,
  FileText,
  Edit3,
  Save,
  Check,
  Copy,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
  Tag,
  CreditCard,
} from 'lucide-react';
import { ClinicLicense } from '../types/license';
import { licenseService, DEFAULT_CATEGORIES } from '../services/licenseService';
import { formatDateTime, formatDateOnly } from '../utils/dateFormat';

interface ClinicDetailsModalProps {
  clinic: ClinicLicense;
  onClose: () => void;
  onUpdated: () => void;
  onShareKey?: (clinic: ClinicLicense) => void;
}

export const ClinicDetailsModal: React.FC<ClinicDetailsModalProps> = ({
  clinic,
  onClose,
  onUpdated,
  onShareKey,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields (Clinic client info only)
  const [clinicName, setClinicName] = useState(clinic.clinicName || '');
  const [doctorName, setDoctorName] = useState(clinic.doctorName || '');
  const [clinicEmail, setClinicEmail] = useState(clinic.clinicEmail || '');
  const [phone, setPhone] = useState(clinic.phone || '');
  const [city, setCity] = useState(clinic.city || '');
  const [softwareCost, setSoftwareCost] = useState(
    clinic.softwareCost !== undefined ? String(clinic.softwareCost) : ''
  );
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>(clinic.paymentStatus || 'PAID');
  const [category, setCategory] = useState(clinic.category || 'Dental HMS');
  const [setupDate, setSetupDate] = useState(clinic.setupDate || clinic.issuedAt || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(clinic.notes || '');

  // Dynamic Categories
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    licenseService.getCategories().then((list) => {
      if (list && list.length > 0) {
        setCategories(list);
      }
    });
  }, []);

  // Copy helpers
  const [copiedMid, setCopiedMid] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyMid = () => {
    navigator.clipboard.writeText(clinic.machineId);
    setCopiedMid(true);
    setTimeout(() => setCopiedMid(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(clinic.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTogglePaymentStatus = async () => {
    const nextStatus = (clinic.paymentStatus || 'PAID') === 'PAID' ? 'PENDING' : 'PAID';
    try {
      await licenseService.togglePaymentStatus(clinic.licenseKey, nextStatus);
      setPaymentStatus(nextStatus);
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || !doctorName.trim()) {
      setErrorMsg('Clinic Name and Doctor Name are required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await licenseService.updateClinicInfo(clinic.licenseKey, {
        clinicName: clinicName.trim(),
        doctorName: doctorName.trim(),
        clinicEmail: clinicEmail.trim(),
        phone: phone.trim(),
        city: city.trim(),
        softwareCost: softwareCost.trim(),
        paymentStatus,
        category: category.trim(),
        setupDate: setupDate.trim(),
        notes: notes.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setIsEditing(false);
      onUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update clinic information.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setClinicName(clinic.clinicName || '');
    setDoctorName(clinic.doctorName || '');
    setClinicEmail(clinic.clinicEmail || '');
    setPhone(clinic.phone || '');
    setCity(clinic.city || '');
    setSoftwareCost(clinic.softwareCost !== undefined ? String(clinic.softwareCost) : '');
    setPaymentStatus(clinic.paymentStatus || 'PAID');
    setCategory(clinic.category || 'Dental HMS');
    setSetupDate(clinic.setupDate || clinic.issuedAt || new Date().toISOString().split('T')[0]);
    setNotes(clinic.notes || '');
    setErrorMsg(null);
    setIsEditing(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="clinic-details-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="details-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div className="details-avatar">
              <Building2 size={22} color="#ffffff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 className="details-title">{clinic.clinicName}</h3>
                <span className={`status-badge-pill ${clinic.status === 'ACTIVE' ? 'badge-active' : 'badge-suspended'}`}>
                  {clinic.status === 'ACTIVE' ? (
                    <>
                      <ShieldCheck size={12} />
                      <span>ACTIVE</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={12} />
                      <span>SUSPENDED</span>
                    </>
                  )}
                </span>
              </div>
              <p className="details-sub">
                Client Profile & System Deployment Records
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-edit-trigger"
                title="Edit Client Information"
              >
                <Edit3 size={14} />
                <span>Edit Info</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="alert-success">
            <Check size={15} />
            <span>Clinic details updated successfully in cloud database!</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert-error">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Anti-Tamper Security Alert */}
        {clinic.tamperDetected && (
          <div className="alert-tamper">
            <ShieldAlert size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#ef4444', display: 'block', fontSize: '0.80rem' }}>
                SECURITY INTEGRITY ALERT: Code Tampering Detected!
              </strong>
              <span style={{ fontSize: '0.74rem', color: '#c9d1d9' }}>
                {clinic.tamperReason || 'Unauthorized modification of core application files was reported by this server.'}
                {clinic.tamperedAt && ` (Detected at: ${clinic.tamperedAt})`}
              </span>
            </div>
          </div>
        )}

        {/* Content Body: View Mode or Edit Mode */}
        {!isEditing ? (
          /* ================= VIEW MODE (2-COLUMN LAYOUT) ================= */
          <div className="details-body details-body-grid">
            {/* 1. LEFT COLUMN: Vendor Client Records */}
            <div className="info-section-card">
              <div className="section-header">
                <span className="section-title">Vendor Client Records</span>
                <span className="section-hint">Internal Accounting & Client Info</span>
              </div>

              <div className="vendor-card-layout">
                {/* Full Width Clinic / Hospital Name */}
                <div className="vendor-field-banner">
                  <div className="v-label">
                    <Building2 size={13} color="var(--color-primary)" />
                    <span>Clinic / Hospital Name</span>
                  </div>
                  <div className="v-value clinic-name-headline">{clinic.clinicName}</div>
                </div>

                {/* Structured 2-Column Info Grid */}
                <div className="vendor-fields-grid">
                  <div className="v-field-item">
                    <div className="v-label">
                      <User size={13} color="var(--color-primary)" />
                      <span>Primary Doctor</span>
                    </div>
                    <div className="v-value">{clinic.doctorName || <span className="empty-text">Not recorded</span>}</div>
                  </div>

                  <div className="v-field-item">
                    <div className="v-label">
                      <Phone size={13} color="var(--color-primary)" />
                      <span>WhatsApp / Mobile</span>
                    </div>
                    <div className="v-value">
                      {clinic.phone ? (
                        <a href={`tel:${clinic.phone}`} className="phone-link">
                          {clinic.phone}
                        </a>
                      ) : (
                        <span className="empty-text">None provided</span>
                      )}
                    </div>
                  </div>

                  <div className="v-field-item">
                    <div className="v-label">
                      <Mail size={13} color="var(--color-primary)" />
                      <span>Email Address</span>
                    </div>
                    <div className="v-value">
                      {clinic.clinicEmail ? (
                        <a href={`mailto:${clinic.clinicEmail}`} className="email-link">
                          {clinic.clinicEmail}
                        </a>
                      ) : (
                        <span className="empty-text">None provided</span>
                      )}
                    </div>
                  </div>

                  <div className="v-field-item">
                    <div className="v-label">
                      <MapPin size={13} color="var(--color-primary)" />
                      <span>City / Location</span>
                    </div>
                    <div className="v-value">{clinic.city || <span className="empty-text">Not specified</span>}</div>
                  </div>

                  <div className="v-field-item">
                    <div className="v-label">
                      <IndianRupee size={13} color="#10b981" />
                      <span>Software Selling Cost</span>
                    </div>
                    <div className="v-value cost-value" style={{ whiteSpace: 'nowrap' }}>
                      {clinic.softwareCost ? `₹${Number(clinic.softwareCost).toLocaleString('en-IN')}` : <span className="empty-text">₹0</span>}
                    </div>
                  </div>

                  <div className="v-field-item full-span">
                    <div className="v-label">
                      <CreditCard size={13} color={clinic.paymentStatus === 'PENDING' ? '#f59e0b' : '#10b981'} />
                      <span>Payment Status</span>
                    </div>
                    <div className="v-value payment-row-value">
                      <span className={`payment-badge ${clinic.paymentStatus === 'PENDING' ? 'payment-pending' : 'payment-paid'}`}>
                        {clinic.paymentStatus === 'PENDING' ? (
                          <>
                            <Clock size={11} />
                            <span>PENDING</span>
                          </>
                        ) : (
                          <>
                            <Check size={11} />
                            <span>PAID</span>
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={handleTogglePaymentStatus}
                        className="btn-toggle-payment"
                        title="Quick toggle between Paid and Pending"
                      >
                        Set {(clinic.paymentStatus || 'PAID') === 'PAID' ? 'Pending' : 'Paid'}
                      </button>
                    </div>
                  </div>

                  <div className="v-field-item">
                    <div className="v-label">
                      <Tag size={13} color="var(--color-primary)" />
                      <span>Product Category</span>
                    </div>
                    <div className="v-value">
                      <span className="category-pill">{clinic.category || 'Dental HMS'}</span>
                    </div>
                  </div>

                  <div className="v-field-item">
                    <div className="v-label">
                      <Calendar size={13} color="var(--color-primary)" />
                      <span>Setup Date</span>
                    </div>
                    <div className="v-value" style={{ fontSize: '0.80rem' }}>
                      {formatDateTime(clinic.setupDate || clinic.issuedAt)}
                    </div>
                  </div>
                </div>

                {clinic.notes && (
                  <div className="vendor-field-banner notes-banner">
                    <div className="v-label">
                      <FileText size={13} color="var(--color-text-muted)" />
                      <span>Internal Notes / Invoicing</span>
                    </div>
                    <p className="notes-text">{clinic.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. RIGHT COLUMN: License & System Hardware Details */}
            <div className="info-section-card">
              <div className="section-header">
                <span className="section-title">License & System Hardware</span>
                <span className="section-hint">Hardware-Locked</span>
              </div>

              <div className="details-grid-2">
                <div className="detail-item">
                  <div className="item-label">
                    <ShieldCheck size={13} color="var(--color-primary)" />
                    <span>Operational Status</span>
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`status-badge-pill ${clinic.status === 'ACTIVE' ? 'badge-active' : 'badge-suspended'}`}>
                      <span className="status-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      <span>{clinic.status}</span>
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="item-label">
                    <Sparkles size={13} color="#10b981" />
                    <span>Plan Access & AMC</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                    <span className="plan-badge">LIFETIME ACCESS</span>
                    <span className="amc-badge">
                      {clinic.amcStatus === '1st_Year_Free' ? '1st Year Free AMC' : clinic.amcStatus}
                    </span>
                  </div>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <div className="item-label">
                    <Server size={13} color="#38bdf8" />
                    <span>Server Machine ID</span>
                  </div>
                  <div className="copyable-box">
                    <code className="mid-code font-mono">{clinic.machineId}</code>
                    <button
                      type="button"
                      onClick={handleCopyMid}
                      className="btn-mini-copy"
                      title="Copy Machine ID"
                    >
                      {copiedMid ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="item-label">
                    <Calendar size={13} color="var(--color-text-muted)" />
                    <span>Issued Date</span>
                  </div>
                  <div className="item-value">{formatDateTime(clinic.issuedAt)}</div>
                </div>

                <div className="detail-item">
                  <div className="item-label">
                    <Clock size={13} color="var(--color-text-muted)" />
                    <span>Last Connected</span>
                  </div>
                  <div className="item-value">
                    {clinic.lastSeenAt ? formatDateTime(clinic.lastSeenAt) : 'Never connected yet'}
                  </div>
                </div>
              </div>

              {/* Developer Controls Summary */}
              {clinic.developerSettings && (
                <div className="dev-summary-box">
                  <span className="dev-summary-title">Remote Developer Privileges</span>
                  <div className="dev-summary-grid">
                    <div>
                      <span className="dev-summary-label">Staff Management: </span>
                      <strong style={{ color: clinic.developerSettings.staffManagementEnabled ? '#10b981' : '#ef4444' }}>
                        {clinic.developerSettings.staffManagementEnabled ? 'Active' : 'Disabled'}
                      </strong>
                    </div>
                    <div>
                      <span className="dev-summary-label">Visit Limit: </span>
                      <strong>
                        {clinic.developerSettings.visitLimitEnabled ? `${clinic.developerSettings.visitLimit || 100} visits` : 'Unlimited'}
                      </strong>
                    </div>
                    {clinic.developerSettings.directorEmail && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <span className="dev-summary-label">OTP Security Email: </span>
                        <code style={{ fontSize: '0.72rem', color: '#c9d1d9' }}>{clinic.developerSettings.directorEmail}</code>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick License Key snippet */}
              <div className="key-snippet-box">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div className="item-label">
                    <KeyRound size={13} color="var(--color-primary)" />
                    <span>Cryptographic License Key</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="btn-key-action"
                    >
                      {copiedKey ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                    </button>
                    {onShareKey && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onShareKey(clinic);
                        }}
                        className="btn-key-action share"
                      >
                        <KeyRound size={12} />
                        <span>Share Full Key</span>
                      </button>
                    )}
                  </div>
                </div>
                <code className="key-snippet font-mono">{clinic.licenseKey}</code>
              </div>
            </div>
          </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSave} className="details-body">
            <div className="edit-banner">
              <Edit3 size={15} color="var(--color-primary)" />
              <span>Editing Client Profile. Changes update in Firestore instantly.</span>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="field-label">
                  <span>Clinic / Hospital Name</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field-input"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                />
              </div>

              <div>
                <label className="field-label">
                  <span>Primary Doctor (Owner)</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field-input"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="field-label">Clinic Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. clinic@gmail.com"
                  className="field-input"
                  value={clinicEmail}
                  onChange={(e) => setClinicEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="field-label">WhatsApp / Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="field-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="field-label">City / State</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, MH"
                  className="field-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label className="field-label">Software Selling Cost (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 25,000"
                  className="field-input"
                  value={softwareCost}
                  onChange={(e) => setSoftwareCost(e.target.value)}
                />
                <span className="field-hint">Internal vendor price for accounting</span>
              </div>
            </div>

            <div>
              <label className="field-label">Payment Status</label>
              <div className="payment-select-group">
                <button
                  type="button"
                  className={`payment-option-btn ${paymentStatus === 'PAID' ? 'active-paid' : ''}`}
                  onClick={() => setPaymentStatus('PAID')}
                >
                  <Check size={14} />
                  <span>PAID</span>
                </button>
                <button
                  type="button"
                  className={`payment-option-btn ${paymentStatus === 'PENDING' ? 'active-pending' : ''}`}
                  onClick={() => setPaymentStatus('PENDING')}
                >
                  <Clock size={14} />
                  <span>PENDING</span>
                </button>
              </div>
              <span className="field-hint">Current payment collection status</span>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="field-label">Software Category / Product</label>
                <select
                  className="field-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Setup / Installation Date</label>
                <input
                  type="date"
                  className="field-input"
                  value={setupDate}
                  onChange={(e) => setSetupDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="field-label">Internal Notes / Invoice Records</label>
              <textarea
                rows={3}
                placeholder="e.g. Paid in full via UPI, AMC renewed till Nov 2027"
                className="field-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="edit-actions">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-save-primary"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="spin-icon" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save Clinic Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer (View Mode only) */}
        {!isEditing && (
          <div className="details-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-close-footer"
            >
              Done & Close
            </button>
          </div>
        )}
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

        .clinic-details-card {
          width: 100%;
          max-width: 1040px;
          max-height: calc(100dvh - 32px);
          background-color: var(--color-surface, #0e1017);
          border: 1px solid var(--color-border, #202433);
          border-radius: 18px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
        }

        .details-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--color-border, #202433);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--color-surface, #0e1017);
          flex-shrink: 0;
          gap: 12px;
        }

        .details-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .details-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-heading, #ffffff);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .details-sub {
          font-size: 0.74rem;
          color: var(--color-text-secondary, #9ca3af);
          margin: 2px 0 0 0;
        }

        .status-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.03em;
        }

        .badge-active {
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-suspended {
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn-edit-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface-secondary, #141722);
          color: var(--color-heading, #ffffff);
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-edit-trigger:hover {
          border-color: var(--color-primary, #2563eb);
          color: #38bdf8;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface-secondary, #141722);
          color: var(--color-text-muted, #6b7280);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .modal-close-btn:hover {
          color: #ffffff;
          background-color: #202433;
        }

        .alert-success {
          margin: 14px 24px 0 24px;
          padding: 10px 14px;
          border-radius: 8px;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-error {
          margin: 14px 24px 0 24px;
          padding: 10px 14px;
          border-radius: 8px;
          background-color: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .alert-tamper {
          margin: 14px 24px 0 24px;
          padding: 10px 14px;
          border-radius: 8px;
          background-color: rgba(220, 38, 38, 0.15);
          border: 1px solid rgba(220, 38, 38, 0.4);
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .details-body {
          padding: 20px 24px;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .details-body.details-body-grid {
          display: grid;
          grid-template-columns: minmax(320px, 1.1fr) minmax(300px, 1fr);
          gap: 16px;
          align-items: start;
        }

        .details-body.details-body-grid > * {
          min-width: 0;
        }

        @media (max-width: 860px) {
          .details-body.details-body-grid {
            grid-template-columns: 1fr;
          }
        }

        .dev-summary-box {
          margin-top: 6px;
          padding: 10px 12px;
          background-color: var(--color-input-background, #0a0c12);
          border: 1px solid var(--color-border, #202433);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .dev-summary-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--color-text-muted, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .dev-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          font-size: 0.74rem;
          color: #c9d1d9;
          min-width: 0;
        }

        .dev-summary-label {
          color: var(--color-text-muted, #6b7280);
        }

        .info-section-card {
          background-color: var(--color-surface-secondary, #141722);
          border: 1px solid var(--color-border, #202433);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
          box-sizing: border-box;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--color-border-subtle, #191c28);
          gap: 8px;
          flex-wrap: wrap;
        }

        .section-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--color-heading, #ffffff);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .section-hint {
          font-size: 0.68rem;
          color: var(--color-text-muted, #6b7280);
          font-weight: 600;
        }

        .vendor-card-layout {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }

        .vendor-field-banner {
          background-color: var(--color-surface, #0e1017);
          border: 1px solid var(--color-border, #202433);
          border-radius: 8px;
          padding: 9px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .vendor-field-banner.notes-banner {
          background-color: rgba(10, 12, 18, 0.6);
        }

        .clinic-name-headline {
          font-size: 1.02rem;
          font-weight: 800;
          color: #38bdf8;
          line-height: 1.3;
          word-break: break-word;
          min-width: 0;
        }

        .vendor-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          min-width: 0;
        }

        @media (max-width: 600px) {
          .vendor-fields-grid {
            grid-template-columns: 1fr;
          }
        }

        .v-field-item {
          background-color: var(--color-surface, #0e1017);
          border: 1px solid var(--color-border, #202433);
          border-radius: 8px;
          padding: 9px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .v-field-item.full-span {
          grid-column: 1 / -1;
        }

        .v-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--color-text-muted, #9ca3af);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .v-value {
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--color-heading, #ffffff);
          word-break: normal;
          overflow-wrap: anywhere;
          min-width: 0;
        }

        .payment-row-value {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
        }

        .payment-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 0.70rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 3px 10px;
          border-radius: 999px;
          white-space: nowrap !important;
          word-break: keep-all !important;
          flex-shrink: 0;
        }

        .payment-paid {
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .payment-pending {
          color: #f59e0b;
          background-color: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .btn-toggle-payment {
          background-color: var(--color-surface-secondary, #141722);
          border: 1px solid var(--color-border, #202433);
          color: var(--color-text-muted, #9ca3af);
          font-size: 0.66rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap !important;
          word-break: keep-all !important;
          flex-shrink: 0;
        }

        .btn-toggle-payment:hover {
          color: var(--color-heading, #ffffff);
          border-color: var(--color-primary);
        }

        .payment-select-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }

        .payment-option-btn {
          flex: 1;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface, #0e1017);
          color: var(--color-text-secondary, #9ca3af);
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .payment-option-btn.active-paid {
          border-color: #10b981;
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .payment-option-btn.active-pending {
          border-color: #f59e0b;
          background-color: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .details-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 600px) {
          .details-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-text-muted, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .item-value {
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--color-heading, #ffffff);
        }

        .item-value.highlight {
          font-weight: 800;
          color: #ffffff;
        }

        .cost-value {
          font-weight: 800;
          color: #10b981;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #38bdf8;
          background-color: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
        }

        .empty-text {
          color: var(--color-text-muted, #6b7280);
          font-style: italic;
          font-weight: normal;
        }

        .email-link, .phone-link {
          color: #38bdf8;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .email-link:hover, .phone-link:hover {
          text-decoration: underline;
        }

        .detail-notes-box {
          margin-top: 4px;
          padding-top: 10px;
          border-top: 1px dashed var(--color-border-subtle, #191c28);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notes-text {
          font-size: 0.82rem;
          color: var(--color-text-secondary, #9ca3af);
          line-height: 1.5;
          margin: 0;
          white-space: pre-wrap;
        }

        .copyable-box {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .mid-code {
          font-size: 0.76rem;
          padding: 4px 8px;
          border-radius: 6px;
          background-color: var(--color-input-background, #0a0c12);
          border: 1px solid var(--color-border, #202433);
          color: #38bdf8;
          font-weight: 700;
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-mini-copy {
          background: transparent;
          border: none;
          color: var(--color-text-muted, #6b7280);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .btn-mini-copy:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.05);
        }

        .plan-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 8px;
          border-radius: 999px;
          white-space: nowrap !important;
          flex-shrink: 0;
        }

        .amc-badge {
          font-size: 0.68rem;
          color: var(--color-text-muted, #6b7280);
          white-space: nowrap !important;
          flex-shrink: 0;
        }

        .key-snippet-box {
          margin-top: 6px;
          padding-top: 10px;
          border-top: 1px solid var(--color-border-subtle, #191c28);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .key-snippet {
          font-size: 0.72rem;
          padding: 8px 10px;
          border-radius: 6px;
          background-color: var(--color-input-background, #0a0c12);
          border: 1px solid var(--color-border, #202433);
          color: #38bdf8;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
        }

        .btn-key-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface, #0e1017);
          color: var(--color-text-secondary, #9ca3af);
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-key-action:hover {
          color: #ffffff;
          border-color: #38bdf8;
        }

        .btn-key-action.share {
          color: #38bdf8;
        }

        /* EDIT MODE STYLES */
        .edit-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          background-color: rgba(37, 99, 235, 0.1);
          border: 1px solid rgba(37, 99, 235, 0.25);
          color: #93c5fd;
          font-size: 0.76rem;
          font-weight: 600;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-heading, #ffffff);
          margin-bottom: 6px;
        }

        .field-hint {
          display: block;
          font-size: 0.68rem;
          color: var(--color-text-muted, #6b7280);
          margin-top: 4px;
        }

        .field-input {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          background-color: var(--color-input-background, #0a0c12);
          border: 1px solid var(--color-border, #202433);
          border-radius: 8px;
          color: var(--color-heading, #ffffff);
          font-size: 0.82rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .field-input:focus {
          border-color: var(--color-primary, #2563eb);
        }

        .field-textarea {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--color-input-background, #0a0c12);
          border: 1px solid var(--color-border, #202433);
          border-radius: 8px;
          color: var(--color-heading, #ffffff);
          font-size: 0.82rem;
          outline: none;
          box-sizing: border-box;
          resize: vertical;
          transition: border-color 0.15s ease;
        }

        .field-textarea:focus {
          border-color: var(--color-primary, #2563eb);
        }

        .edit-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 8px;
        }

        .btn-cancel {
          height: 38px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: transparent;
          color: var(--color-text-secondary, #9ca3af);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-cancel:hover {
          background-color: var(--color-surface-secondary, #141722);
          color: #ffffff;
        }

        .btn-save-primary {
          height: 38px;
          padding: 0 18px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
        }

        .btn-save-primary:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
        }

        .details-footer {
          padding: 14px 24px;
          border-top: 1px solid var(--color-border, #202433);
          display: flex;
          justify-content: flex-end;
          background-color: var(--color-surface, #0e1017);
          flex-shrink: 0;
        }

        .btn-close-footer {
          height: 38px;
          padding: 0 20px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface-secondary, #141722);
          color: var(--color-heading, #ffffff);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-close-footer:hover {
          background-color: #202433;
          color: #ffffff;
        }

        @media (max-width: 640px) {
          .modal-backdrop {
            padding: 8px;
          }

          .clinic-details-card {
            max-height: calc(100dvh - 16px);
            border-radius: 14px;
          }

          .details-header {
            padding: 14px 16px;
          }

          .details-body {
            padding: 14px 16px;
            gap: 12px;
          }

          .details-footer {
            padding: 12px 16px;
          }

          .btn-close-footer {
            width: 100%;
          }
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

