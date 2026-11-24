import React, { useState, useEffect } from 'react';
import { X, KeyRound, Copy, Check, MessageSquare, Sparkles, Loader2, Download, ShieldCheck, Plus, Calendar, Tag, Clock, CreditCard } from 'lucide-react';
import { licenseService, DEFAULT_CATEGORIES } from '../services/licenseService';
import { decodeLicensePayload } from '../services/cryptoService';
import { ClinicLicense } from '../types/license';

interface CreateLicenseModalProps {
  onClose: () => void;
  onCreated: (clinic: ClinicLicense) => void;
}

export const CreateLicenseModal: React.FC<CreateLicenseModalProps> = ({
  onClose,
  onCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'IMPORT'>('NEW');

  // Dynamic Categories & Setup Date
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [category, setCategory] = useState<string>('DENTAL HMS');
  const [showAddCategory, setShowAddCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [addingCategory, setAddingCategory] = useState<boolean>(false);
  const [setupDate, setSetupDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form states for new license
  const [clinicName, setClinicName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [softwareCost, setSoftwareCost] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [machineId, setMachineId] = useState('');
  const [notes, setNotes] = useState('');

  // Form states for importing existing key
  const [importKeyInput, setImportKeyInput] = useState('');
  const [importDoctorName, setImportDoctorName] = useState('');
  const [importPhone, setImportPhone] = useState('');
  const [importCity, setImportCity] = useState('');
  const [importClinicEmail, setImportClinicEmail] = useState('');
  const [importSoftwareCost, setImportSoftwareCost] = useState('');
  const [importPaymentStatus, setImportPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [importNotes, setImportNotes] = useState('');

  const [generating, setGenerating] = useState(false);
  const [createdClinic, setCreatedClinic] = useState<ClinicLicense | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Fetch dynamic categories on mount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    licenseService.getCategories().then((list) => {
      if (list && list.length > 0) {
        setCategories(list);
        if (!category) setCategory(list[0]);
      }
    });
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleAddNewCategory = async () => {
    const clean = newCategoryName.trim().toUpperCase();
    if (!clean) return;
    setAddingCategory(true);
    try {
      const updated = await licenseService.addCategory(clean);
      setCategories(updated);
      setCategory(clean);
      setNewCategoryName('');
      setShowAddCategory(false);
    } finally {
      setAddingCategory(false);
    }
  };

  // Auto-decode existing key if pasting in import tab
  const decodedImportPayload = importKeyInput.trim()
    ? decodeLicensePayload(importKeyInput.trim())
    : null;

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || !doctorName.trim() || !machineId.trim()) {
      alert('Please fill in Clinic Name, Doctor Name, and Server Machine ID.');
      return;
    }

    const normalizedMid = machineId.trim().toUpperCase();
    const isMedflow = category.toLowerCase().includes('medflow');
    const isDental = category.toLowerCase().includes('dental');
    if (isMedflow && normalizedMid.startsWith('DHMS-')) {
      alert('Category Mismatch: You entered a Dental HMS Machine ID ("DHMS-..."), but the selected Software Category is "' + category + '". Please select "DENTAL HMS" in the Software Category dropdown.');
      return;
    }
    if (isDental && normalizedMid.startsWith('MFMS-')) {
      alert('Category Mismatch: You entered a Medflow HMS Machine ID ("MFMS-..."), but the selected Software Category is "' + category + '". Please select or add "MEDFLOW HMS" in the Software Category dropdown above.');
      return;
    }

    setGenerating(true);
    try {
      const result = await licenseService.createClinic({
        clinicName,
        doctorName,
        phone,
        city,
        clinicEmail,
        softwareCost,
        paymentStatus,
        category,
        setupDate,
        machineId,
        notes,
      });
      setCreatedClinic(result);
      onCreated(result);
    } catch (err: any) {
      alert(err.message || 'Error creating license.');
    } finally {
      setGenerating(false);
    }
  };

  const handleImportExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decodedImportPayload) {
      alert('Please paste a valid license key starting with DHMS-LIC or MEDFLOW-LIC.');
      return;
    }

    setGenerating(true);
    try {
      const result = await licenseService.importExistingLicense(importKeyInput.trim(), {
        doctorName: importDoctorName || 'Clinic Doctor',
        phone: importPhone,
        city: importCity,
        clinicEmail: importClinicEmail,
        softwareCost: importSoftwareCost,
        paymentStatus: importPaymentStatus,
        category,
        setupDate,
        notes: importNotes,
      });
      setCreatedClinic(result);
      onCreated(result);
    } catch (err: any) {
      alert(err.message || 'Error importing license.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (createdClinic) {
      navigator.clipboard.writeText(createdClinic.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const getWhatsAppMessage = (): string => {
    if (!createdClinic) return '';
    const prod = createdClinic.category || 'HMS Software';
    return `Hello ${createdClinic.doctorName},\n\nThank you for choosing ${prod}! Here is your permanent Lifetime License Key for ${createdClinic.clinicName}:\n\n*Server Machine ID:* ${createdClinic.machineId}\n*License Key:*\n${createdClinic.licenseKey}\n\n*Instructions:*\n1. Open ${prod} on your Main Clinic Server PC.\n2. Paste this License Key into the activation box and click "Verify & Activate Lifetime License".\n3. Your clinic will be activated permanently with unlimited doctor and staff access across your local LAN.`;
  };

  const handleCopyWhatsAppMsg = () => {
    const msg = getWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <KeyRound size={20} color="#ffffff" />
            </div>
            <div>
              <h3 className="modal-heading">
                {activeTab === 'NEW' ? 'Issue Lifetime License Key' : 'Import Existing License Key'}
              </h3>
              <p className="modal-sub">
                {activeTab === 'NEW'
                  ? 'Generate a hardware-locked lifetime license for a clinic'
                  : 'Register a previously generated key into Cloud Admin to manage & revoke'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher if not yet created */}
        {!createdClinic && (
          <div className="tab-switcher">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'NEW' ? 'active' : ''}`}
              onClick={() => setActiveTab('NEW')}
            >
              <Sparkles size={14} />
              <span>Issue New License</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'IMPORT' ? 'active' : ''}`}
              onClick={() => setActiveTab('IMPORT')}
            >
              <Download size={14} />
              <span>Import Existing Key</span>
            </button>
          </div>
        )}

        {/* Step 1: Form Input */}
        {!createdClinic ? (
          activeTab === 'NEW' ? (
            <form onSubmit={handleCreateNew} className="modal-form">
              <div className="form-grid-2">
                <div>
                  <label className="form-label">
                    <span>Clinic / Hospital Name</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Dental Hospital"
                    className="form-input"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">
                    <span>Primary Doctor (Owner)</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Sharma"
                    className="form-input"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">WhatsApp / Contact Mobile</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, MH"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Clinic Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. clinic@gmail.com"
                  className="form-input"
                  value={clinicEmail}
                  onChange={(e) => setClinicEmail(e.target.value)}
                />
                <span className="form-hint">For clinic records and correspondence</span>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Software Cost (₹) (Internal)</label>
                  <input
                    type="text"
                    placeholder="e.g. 25,000"
                    className="form-input"
                    value={softwareCost}
                    onChange={(e) => setSoftwareCost(e.target.value)}
                  />
                  <span className="form-hint">Internal vendor selling price for tracking</span>
                </div>

                <div>
                  <label className="form-label">
                    <span>Payment Status</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="payment-toggle-group">
                    <button
                      type="button"
                      className={`payment-toggle-btn ${paymentStatus === 'PAID' ? 'active-paid' : ''}`}
                      onClick={() => setPaymentStatus('PAID')}
                    >
                      <Check size={14} />
                      <span>PAID</span>
                    </button>
                    <button
                      type="button"
                      className={`payment-toggle-btn ${paymentStatus === 'PENDING' ? 'active-pending' : ''}`}
                      onClick={() => setPaymentStatus('PENDING')}
                    >
                      <Clock size={14} />
                      <span>PENDING</span>
                    </button>
                  </div>
                  <span className="form-hint">Track collected vs pending revenue</span>
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      <span>Software Category / Type</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {!showAddCategory && (
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(true)}
                        className="btn-text-action"
                      >
                        + Add Category
                      </button>
                    )}
                  </div>

                  {!showAddCategory ? (
                    <select
                      className="form-input form-select"
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setShowAddCategory(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__NEW__">+ Add New Category...</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="text"
                        autoFocus
                        placeholder="e.g. MEDFLOW HMS"
                        className="form-input"
                        style={{ textTransform: 'uppercase' }}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewCategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        disabled={addingCategory || !newCategoryName.trim()}
                        className="btn-cat-save"
                      >
                        {addingCategory ? '...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="btn-cat-cancel"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <span className="form-hint">Default: DENTAL HMS. New categories are saved in UPPERCASE in Firebase.</span>
                </div>

                <div>
                  <label className="form-label">
                    <span>Software Setup / Install Date</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={setupDate}
                    onChange={(e) => setSetupDate(e.target.value)}
                  />
                  <span className="form-hint">Defaults to today; adjust if installed earlier</span>
                </div>
              </div>

              <div>
                <label className="form-label">
                  <span>Server Machine ID (From Clinic Server PC)</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={category.toLowerCase().includes('medflow') ? 'MFMS-XXXX-XXXX-XXXX-XXXX' : 'DHMS-XXXX-XXXX-XXXX-XXXX'}
                  className="form-input font-mono"
                  value={machineId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMachineId(val);
                    const upper = val.trim().toUpperCase();
                    if (upper.startsWith('MFMS-')) {
                      const medflowCat = categories.find((c) => c.toUpperCase().includes('MEDFLOW'));
                      if (medflowCat) setCategory(medflowCat);
                    } else if (upper.startsWith('DHMS-')) {
                      const dentalCat = categories.find((c) => c.toUpperCase().includes('DENTAL'));
                      if (dentalCat) setCategory(dentalCat);
                    }
                  }}
                />
                <span className="form-hint">
                  Client provides this Machine ID from their {category || 'HMS'} Server activation screen.
                </span>
              </div>

              <div>
                <label className="form-label">Internal Notes / Invoice # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #2026-104, Paid via UPI"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={generating} className="btn-submit">
                  {generating ? (
                    <>
                      <Loader2 size={16} className="btn-spin" />
                      <span>Generating & Signing Key...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate Lifetime License</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Import Existing Form */
            <form onSubmit={handleImportExisting} className="modal-form">
              <div>
                <label className="form-label">
                  <span>Paste Existing Lifetime License Key</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="DHMS-LIC.eyJjbGluaWNOYW1lIjoiRGVudGFsIEhvc3BpdGFsIE1hc3RlciIs..."
                  className="form-textarea font-mono"
                  value={importKeyInput}
                  onChange={(e) => setImportKeyInput(e.target.value)}
                />
                <span className="form-hint">
                  Paste any existing key previously created. The system will decode and link it to Firebase.
                </span>
              </div>

              {decodedImportPayload && (
                <div className="decoded-preview-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <ShieldCheck size={16} color="#10b981" />
                    <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#10b981' }}>
                      Valid License Key Detected
                    </span>
                  </div>
                  <div className="decoded-grid">
                    <div>
                      <span className="decoded-lbl">Clinic Name:</span>
                      <strong className="decoded-val">{decodedImportPayload.clinicName}</strong>
                    </div>
                    <div>
                      <span className="decoded-lbl">Machine ID:</span>
                      <strong className="decoded-val font-mono">{decodedImportPayload.machineId}</strong>
                    </div>
                    <div>
                      <span className="decoded-lbl">Plan Type:</span>
                      <strong className="decoded-val">{decodedImportPayload.planType}</strong>
                    </div>
                    <div>
                      <span className="decoded-lbl">Issued Date:</span>
                      <strong className="decoded-val">{decodedImportPayload.issuedAt}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Doctor Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ramesh Sharma"
                    className="form-input"
                    value={importDoctorName}
                    onChange={(e) => setImportDoctorName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Contact Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="form-input"
                    value={importPhone}
                    onChange={(e) => setImportPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">City / State (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, MH"
                    className="form-input"
                    value={importCity}
                    onChange={(e) => setImportCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Clinic Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. clinic@gmail.com"
                    className="form-input"
                    value={importClinicEmail}
                    onChange={(e) => setImportClinicEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Software Cost (₹) (Internal)</label>
                  <input
                    type="text"
                    placeholder="e.g. 25,000"
                    className="form-input"
                    value={importSoftwareCost}
                    onChange={(e) => setImportSoftwareCost(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">
                    <span>Payment Status</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="payment-toggle-group">
                    <button
                      type="button"
                      className={`payment-toggle-btn ${importPaymentStatus === 'PAID' ? 'active-paid' : ''}`}
                      onClick={() => setImportPaymentStatus('PAID')}
                    >
                      <Check size={14} />
                      <span>PAID</span>
                    </button>
                    <button
                      type="button"
                      className={`payment-toggle-btn ${importPaymentStatus === 'PENDING' ? 'active-pending' : ''}`}
                      onClick={() => setImportPaymentStatus('PENDING')}
                    >
                      <Clock size={14} />
                      <span>PENDING</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Software Category / Type</label>
                <select
                  className="form-input form-select"
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
                <label className="form-label">Setup / Installation Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={setupDate}
                  onChange={(e) => setSetupDate(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-cancel">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || !decodedImportPayload}
                  className="btn-submit"
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} className="btn-spin" />
                      <span>Registering in Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Register & Link to Cloud Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        ) : (
          /* Step 2: Key Generated / Registered Success View */
          <div className="success-view">
            <div className="success-banner">
              <Sparkles size={24} color="#10b981" />
              <div>
                <h4 className="success-title">Lifetime License Registered in Cloud!</h4>
                <p className="success-desc">
                  This license is now tracked live in Google Firebase. You can suspend, activate, or push developer commands remotely.
                </p>
              </div>
            </div>

            {/* License Key Box */}
            <div className="key-box">
              <div className="key-box-header">
                <span className="key-box-title">Cryptographic Lifetime License Key</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className={`btn-copy ${copiedKey ? 'copied' : ''}`}
                >
                  {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Copied Key!' : 'Copy Key'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={3}
                value={createdClinic.licenseKey}
                className="key-textarea font-mono"
              />
            </div>

            {/* Quick WhatsApp Dispatch */}
            <div className="whatsapp-box">
              <div className="whatsapp-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} color="#10b981" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-heading)' }}>
                    Ready-to-Send Client Dispatch Message
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyWhatsAppMsg}
                  className={`btn-copy ${copiedMsg ? 'copied' : ''}`}
                >
                  {copiedMsg ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedMsg ? 'Copied Message!' : 'Copy WhatsApp Message'}</span>
                </button>
              </div>
              <pre className="whatsapp-pre">{getWhatsAppMessage()}</pre>
            </div>

            <div className="modal-actions" style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (createdClinic) onCreated(createdClinic);
                  onClose();
                }}
                className="btn-submit"
                style={{ width: '100%', height: '44px', fontSize: '0.86rem' }}
              >
                <span>Done & View in Dashboard</span>
              </button>
            </div>
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

        .modal-card {
          width: 100%;
          max-width: 600px;
          max-height: 92vh;
          overflow-y: auto;
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

        .modal-icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
          flex-shrink: 0;
        }

        .modal-heading {
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

        .tab-switcher {
          display: flex;
          gap: 6px;
          background-color: var(--color-surface-secondary);
          padding: 4px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 34px;
          border-radius: 8px;
          border: none;
          background-color: transparent;
          color: var(--color-text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tab-btn.active {
          background-color: var(--color-surface);
          color: var(--color-heading);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 580px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--color-heading);
          margin-bottom: 5px;
        }

        .form-hint {
          display: block;
          font-size: 0.70rem;
          color: var(--color-text-muted);
          margin-top: 4px;
        }

        .form-input {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-input-background);
          color: var(--color-heading);
          font-size: 0.82rem;
          outline: none;
          box-sizing: border-box;
        }

        .payment-toggle-group {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 38px;
        }

        .payment-toggle-btn {
          flex: 1;
          height: 100%;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-input-background);
          color: var(--color-text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .payment-toggle-btn.active-paid {
          border-color: #10b981;
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .payment-toggle-btn.active-pending {
          border-color: #f59e0b;
          background-color: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .form-select {
          cursor: pointer;
        }

        .btn-text-action {
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: 0.70rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.15s ease;
        }

        .btn-text-action:hover {
          text-decoration: underline;
        }

        .btn-cat-save {
          height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          border: none;
          background-color: var(--color-primary);
          color: #ffffff;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn-cat-cancel {
          height: 38px;
          width: 38px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-secondary);
          color: var(--color-text-muted);
          font-size: 0.82rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .form-input:focus {
          border-color: var(--color-primary);
        }

        .form-textarea {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-input-background);
          color: var(--color-heading);
          font-size: 0.76rem;
          outline: none;
          resize: vertical;
        }

        .form-textarea:focus {
          border-color: var(--color-primary);
        }

        .decoded-preview-box {
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 10px;
          padding: 12px;
        }

        .decoded-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 0.74rem;
        }

        .decoded-lbl {
          color: var(--color-text-muted);
          display: block;
          font-size: 0.68rem;
        }

        .decoded-val {
          color: var(--color-heading);
        }

        .font-mono {
          font-family: monospace;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
        }

        .btn-cancel {
          height: 38px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-secondary);
          color: var(--color-text-secondary);
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-submit {
          height: 38px;
          padding: 0 18px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
          color: #ffffff;
          font-size: 0.80rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
        }

        .btn-spin {
          animation: spin 1s linear infinite;
        }

        .success-view {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 14px;
        }

        .success-title {
          font-size: 0.94rem;
          font-weight: 800;
          color: var(--color-heading);
          margin: 0;
        }

        .success-desc {
          font-size: 0.74rem;
          color: var(--color-text-secondary);
          margin: 3px 0 0 0;
        }

        .key-box, .whatsapp-box {
          background-color: var(--color-surface-secondary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 12px;
        }

        .key-box-header, .whatsapp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .key-box-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--color-heading);
        }

        .btn-copy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 30px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-heading);
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap !important;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }

        .btn-copy * {
          white-space: nowrap !important;
        }

        .btn-copy.copied {
          color: #10b981;
          border-color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
        }

        .key-textarea {
          width: 100%;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background-color: var(--color-input-background);
          color: #38bdf8;
          font-size: 0.72rem;
          padding: 8px;
          outline: none;
          resize: none;
        }

        .whatsapp-pre {
          background-color: var(--color-input-background);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 10px;
          font-family: inherit;
          font-size: 0.72rem;
          color: var(--color-text-secondary);
          margin: 0;
          white-space: pre-wrap;
          max-height: 120px;
          overflow-y: auto;
          overflow-x: hidden;
          word-break: break-word;
        }

        @media (max-width: 600px) {
          .modal-backdrop {
            padding: 10px;
          }

          .modal-card {
            padding: 16px;
            max-height: 94vh;
          }

          .form-grid-2 {
            grid-template-columns: 1fr;
          }

          .key-box-header, .whatsapp-header {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
          }

          .btn-copy {
            width: 100%;
            height: 36px;
          }
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
