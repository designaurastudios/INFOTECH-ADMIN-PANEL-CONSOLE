import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Building2,
  Copy,
  Check,
  Sliders,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Server,
  ExternalLink,
  Trash2,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { ClinicLicense, LicenseStatus } from '../types/license';
import { licenseService } from '../services/licenseService';
import { StatsCards } from '../components/StatsCards';
import { CreateLicenseModal } from '../components/CreateLicenseModal';
import { DevSettingsModal } from '../components/DevSettingsModal';
import { RemoteDirectorResetModal } from '../components/RemoteDirectorResetModal';
import { DeleteLicenseModal } from '../components/DeleteLicenseModal';
import { ViewKeyModal } from '../components/ViewKeyModal';
import { ConfirmStatusModal } from '../components/ConfirmStatusModal';
import { ClinicDetailsModal } from '../components/ClinicDetailsModal';
import { formatDateTime } from '../utils/dateFormat';

function formatSetupDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return formatDateTime(dateStr);
}

interface DashboardPageProps {
  onNavigateToFinance?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToFinance }) => {
  const [clinics, setClinics] = useState<ClinicLicense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [devSettingsClinic, setDevSettingsClinic] = useState<ClinicLicense | null>(null);
  const [deletingClinic, setDeletingClinic] = useState<ClinicLicense | null>(null);
  const [viewingKeyClinic, setViewingKeyClinic] = useState<ClinicLicense | null>(null);
  const [selectedDetailsClinic, setSelectedDetailsClinic] = useState<ClinicLicense | null>(null);
  const [statusModalClinic, setStatusModalClinic] = useState<{
    clinic: ClinicLicense;
    targetStatus: LicenseStatus;
  } | null>(null);

  // Copied Machine ID / Key feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Screen width detection for responsive search placeholder
  const [isMobileScreen, setIsMobileScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = licenseService.subscribeToClinics((list) => {
      setClinics(list);
    });
    return () => unsubscribe();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleStatus = (clinic: ClinicLicense) => {
    const nextStatus: LicenseStatus = clinic.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setStatusModalClinic({ clinic, targetStatus: nextStatus });
  };

  const handleConfirmStatus = async (clinic: ClinicLicense, targetStatus: LicenseStatus) => {
    await licenseService.updateStatus(clinic.licenseKey, targetStatus);
  };

  const handleDeleteLicense = (clinic: ClinicLicense) => {
    setDeletingClinic(clinic);
  };

  const handleConfirmDelete = async (clinic: ClinicLicense) => {
    await licenseService.deleteLicense(clinic.licenseKey);
  };

  // Filtered Clinics
  const filteredClinics = clinics.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.clinicName.toLowerCase().includes(q) ||
      c.doctorName.toLowerCase().includes(q) ||
      c.machineId.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const timeA = a.createdAt ? Date.parse(a.createdAt) : Date.parse(a.issuedAt || a.setupDate || '1970-01-01');
    const timeB = b.createdAt ? Date.parse(b.createdAt) : Date.parse(b.issuedAt || b.setupDate || '1970-01-01');
    return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
  });

  return (
    <div className="dashboard-layout">
      {/* 1. Header Bar with Action Button */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Clinic Deployments & Licenses</h2>
          <p className="dashboard-subtitle">
            Manage hardware-bound lifetime licenses, track connected servers, and push remote developer commands.
          </p>
        </div>

        <div className="header-actions-group">
          {onNavigateToFinance && (
            <button
              type="button"
              onClick={onNavigateToFinance}
              className="btn-finance-tracker-action"
              title="Open Company Financial Operations & Profitability Tracker"
            >
              <TrendingUp size={16} />
              <span>Finance Tracker</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="btn-create-license"
          >
            <Plus size={16} />
            <span>Issue New Lifetime License</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <StatsCards clinics={clinics} />

      {/* 3. Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder={
              isMobileScreen
                ? 'Search clinic, doctor, ID...'
                : 'Search by clinic name, doctor, phone, or Machine ID...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="search-clear-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-pills">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
          >
            <span>All Clinics</span>
            <span className="counter-badge">{clinics.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`filter-pill ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
          >
            <span>Active</span>
            <span className="counter-badge badge-active">{clinics.filter((c) => c.status === 'ACTIVE').length}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SUSPENDED')}
            className={`filter-pill ${statusFilter === 'SUSPENDED' ? 'active' : ''}`}
          >
            <span>Suspended</span>
            <span className="counter-badge badge-suspended">{clinics.filter((c) => c.status === 'SUSPENDED').length}</span>
          </button>
        </div>
      </div>

      {/* 4. Clinics List Table */}
      <div className="table-container">
        {filteredClinics.length === 0 ? (
          <div className="empty-state">
            <Building2 size={40} color="var(--color-text-muted)" />
            <h4 style={{ margin: '8px 0 0 0', color: 'var(--color-heading)' }}>No Clinics Found</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: 'var(--color-text-secondary)' }}>
              {searchTerm
                ? 'No clinics match your search query.'
                : 'Click "Issue New Lifetime License" above to register your first clinic.'}
            </p>
          </div>
        ) : (
          <table className="clinics-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>SR NO</th>
                <th style={{ minWidth: '220px' }}>CLINIC / DOCTOR</th>
                <th style={{ width: '125px' }}>SETUP DATE</th>
                <th style={{ width: '200px' }}>SERVER MACHINE ID</th>
                <th style={{ width: '115px' }}>LICENSE KEY</th>
                <th style={{ width: '135px' }}>STATUS</th>
                <th style={{ width: '245px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.map((clinic, index) => (
                <tr
                  key={clinic.id}
                  onClick={() => setSelectedDetailsClinic(clinic)}
                  className="clickable-row"
                  title="Click to view full clinic details and edit profile"
                >
                  {/* 1. Sr No */}
                  <td style={{ textAlign: 'center' }}>
                    <span className="sr-no-badge">#{index + 1}</span>
                  </td>

                  {/* 2. Clinic Name & Doctor */}
                  <td>
                    <div className="cell-clinic">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="clinic-name">{clinic.clinicName}</span>
                        <span className="category-tag">{clinic.category || 'Dental HMS'}</span>
                      </div>
                      <span className="doctor-sub">
                        {clinic.doctorName} {clinic.city ? `• ${clinic.city}` : ''} {clinic.phone ? `(${clinic.phone})` : ''}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                        {clinic.softwareCost && (
                          <span className="cost-tag">
                            ₹{Number(clinic.softwareCost).toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className={`payment-pill-tag ${clinic.paymentStatus === 'PENDING' ? 'pill-pending' : 'pill-paid'}`}>
                          {clinic.paymentStatus === 'PENDING' ? 'PENDING' : 'PAID'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 3. Setup Date */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="var(--color-primary)" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-heading)', fontWeight: 600 }}>
                        {formatSetupDate(clinic.setupDate || clinic.issuedAt)}
                      </span>
                    </div>
                  </td>

                  {/* 4. Machine ID */}
                  <td>
                    <div className="mid-chip-box">
                      <code className="mid-text">{clinic.machineId}</code>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(clinic.machineId, `mid-${clinic.id}`);
                        }}
                        className="copy-icon-btn"
                        title="Copy Machine ID"
                      >
                        {copiedId === `mid-${clinic.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>

                  {/* 5. License Key (Single clean Share Key button - no duplicates) */}
                  <td>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingKeyClinic(clinic);
                      }}
                      className="btn-key-view"
                      title="View full License Key & WhatsApp dispatch template"
                    >
                      <KeyRound size={12} color="#38bdf8" />
                      <span>Share Key</span>
                    </button>
                  </td>

                  {/* 6. Status & Last Seen */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span className={`status-pill ${clinic.status === 'ACTIVE' ? 'pill-active' : 'pill-suspended'}`}>
                          <span className="status-dot" />
                          <span>{clinic.status}</span>
                        </span>
                        {clinic.tamperDetected && (
                          <span className="tamper-tag" title={clinic.tamperReason || 'Security integrity violation detected'}>
                            TAMPERED
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {clinic.lastSeenAt || 'Never connected'}
                      </span>
                    </div>
                  </td>

                  {/* 7. Action Buttons (Dev Settings, Suspend/Activate, Delete) */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-row">
                      {/* 1. Developer Settings (contains Director Reset PW) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDevSettingsClinic(clinic);
                        }}
                        className="action-btn btn-dev"
                        title="Configure Remote Developer Settings & Director Password Reset"
                      >
                        <Sliders size={12} />
                        <span>Dev Settings</span>
                      </button>

                      {/* 2. Quick Suspend/Activate */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(clinic);
                        }}
                        className={`action-btn ${clinic.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                        title={clinic.status === 'ACTIVE' ? 'Suspend Clinic License' : 'Activate Clinic License'}
                      >
                        {clinic.status === 'ACTIVE' ? (
                          <>
                            <ShieldAlert size={12} />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={12} />
                            <span>Activate</span>
                          </>
                        )}
                      </button>

                      {/* 3. Delete License */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLicense(clinic);
                        }}
                        className="action-btn btn-delete"
                        title="Permanently Delete License (Reverts PC to Activation Required)"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. Mobile & Tablet Responsive Clinic Cards View (<= 880px) */}
      {filteredClinics.length > 0 && (
        <div className="mobile-cards-view">
          {filteredClinics.map((clinic, index) => (
            <div
              key={`m-${clinic.id}`}
              onClick={() => setSelectedDetailsClinic(clinic)}
              className="m-clinic-card clickable-card"
              title="Tap to view full clinic details and edit profile"
            >
              {/* Header: Sr No + Clinic Name & Status */}
              <div className="m-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="sr-no-badge">#{index + 1}</span>
                    <h4 className="m-clinic-name">{clinic.clinicName}</h4>
                    <span className="category-tag">{clinic.category || 'Dental HMS'}</span>
                  </div>
                  <span className="m-doctor-sub">
                    {clinic.doctorName} {clinic.city ? `• ${clinic.city}` : ''} {clinic.phone ? `(${clinic.phone})` : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                      Setup: {formatSetupDate(clinic.setupDate || clinic.issuedAt)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                      {clinic.softwareCost && (
                        <span className="cost-tag">
                          ₹{Number(clinic.softwareCost).toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className={`payment-pill-tag ${clinic.paymentStatus === 'PENDING' ? 'pill-pending' : 'pill-paid'}`}>
                        {clinic.paymentStatus === 'PENDING' ? 'PENDING' : 'PAID'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={`status-pill ${clinic.status === 'ACTIVE' ? 'pill-active' : 'pill-suspended'}`}>
                    <span className="status-dot" />
                    <span>{clinic.status}</span>
                  </span>
                  {clinic.tamperDetected && (
                    <span className="tamper-tag">
                      TAMPERED
                    </span>
                  )}
                </div>
              </div>

              {/* Hardware ID & License Key Row */}
              <div className="m-card-meta-row">
                <div className="mid-chip-box">
                  <code className="mid-text">{clinic.machineId}</code>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(clinic.machineId, `mid-${clinic.id}`);
                    }}
                    className="copy-icon-btn"
                    title="Copy Machine ID"
                  >
                    {copiedId === `mid-${clinic.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingKeyClinic(clinic);
                  }}
                  className="btn-key-view"
                  title="View full License Key & WhatsApp template"
                >
                  <KeyRound size={12} color="#38bdf8" />
                  <span>Share Key</span>
                </button>
              </div>

              {/* Action Buttons Grid */}
              <div className="m-card-actions-grid">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDevSettingsClinic(clinic);
                  }}
                  className="action-btn btn-dev m-btn"
                >
                  <Sliders size={12} />
                  <span>Dev Settings</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(clinic);
                  }}
                  className={`action-btn ${clinic.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'} m-btn`}
                >
                  {clinic.status === 'ACTIVE' ? (
                    <>
                      <ShieldAlert size={12} />
                      <span>Suspend</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={12} />
                      <span>Activate</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLicense(clinic);
                  }}
                  className="action-btn btn-delete m-btn"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <CreateLicenseModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => setIsCreateOpen(false)}
        />
      )}

      {devSettingsClinic && (
        <DevSettingsModal
          clinic={devSettingsClinic}
          onClose={() => setDevSettingsClinic(null)}
          onUpdated={() => {
            // refresh data if needed
          }}
        />
      )}

      {deletingClinic && (
        <DeleteLicenseModal
          clinic={deletingClinic}
          onClose={() => setDeletingClinic(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {viewingKeyClinic && (
        <ViewKeyModal
          clinic={viewingKeyClinic}
          onClose={() => setViewingKeyClinic(null)}
        />
      )}

      {statusModalClinic && (
        <ConfirmStatusModal
          clinic={statusModalClinic.clinic}
          targetStatus={statusModalClinic.targetStatus}
          onClose={() => setStatusModalClinic(null)}
          onConfirm={handleConfirmStatus}
        />
      )}

      {selectedDetailsClinic && (
        <ClinicDetailsModal
          clinic={selectedDetailsClinic}
          onClose={() => setSelectedDetailsClinic(null)}
          onUpdated={() => {
            const updated = clinics.find((c) => c.licenseKey === selectedDetailsClinic.licenseKey);
            if (updated) setSelectedDetailsClinic(updated);
          }}
          onShareKey={(clinicToShare) => setViewingKeyClinic(clinicToShare)}
        />
      )}

      <style>{`
        .dashboard-layout {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        .dashboard-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--color-heading);
          margin: 0;
        }

        .dashboard-subtitle {
          font-size: 0.78rem;
          color: var(--color-text-secondary);
          margin: 4px 0 0 0;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-finance-tracker-action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 38px;
          padding: 0 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-primary);
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: var(--card-shadow);
        }

        .btn-finance-tracker-action:hover {
          border-color: var(--color-primary);
          background-color: var(--color-surface-secondary);
          transform: translateY(-1px);
        }

        .btn-create-license {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 18px;
          border-radius: var(--radius-md);
          border: none;
          background-color: var(--color-primary);
          color: #ffffff;
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
          transition: all 0.15s ease;
        }

        .btn-create-license:hover {
          background-color: var(--color-primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }

        .payment-pill-tag {
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 1px 7px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .payment-pill-tag.pill-paid {
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .payment-pill-tag.pill-pending {
          color: #f59e0b;
          background-color: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 42px;
          padding: 0 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          flex: 1;
          min-width: 260px;
          max-width: 520px;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .search-box:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .search-input {
          flex: 1;
          height: 100%;
          border: none;
          background: transparent;
          color: var(--color-heading);
          font-size: 0.84rem;
          outline: none;
          min-width: 0;
          width: 100%;
        }

        .search-input::placeholder {
          color: var(--color-text-muted);
          font-size: 0.82rem;
        }

        .search-clear-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 0.75rem;
          padding: 3px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }

        .search-clear-btn:hover {
          color: var(--color-heading);
          background-color: var(--color-surface-secondary);
        }

        .sr-no-badge {
          font-family: var(--font-family-mono);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-text-muted);
          background-color: var(--color-surface-secondary);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--color-border);
        }

        .category-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--color-primary);
          background-color: var(--color-primary-soft);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 1px 7px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .filter-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: var(--color-surface);
          padding: 3px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
        }

        .filter-pill {
          padding: 6px 12px;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .filter-pill.active {
          background-color: var(--color-primary);
          color: #ffffff;
        }

        .counter-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 18px;
          padding: 0 6px;
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 800;
          background-color: var(--color-surface-secondary);
          color: var(--color-heading);
        }

        .filter-pill.active .counter-badge {
          background-color: rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }

        .counter-badge.badge-active {
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .filter-pill.active .counter-badge.badge-active {
          background-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .counter-badge.badge-suspended {
          background-color: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .filter-pill.active .counter-badge.badge-suspended {
          background-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .clickable-row {
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .clickable-row:hover {
          background-color: var(--color-surface-secondary) !important;
        }

        .cost-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 4px;
          padding: 1px 6px;
          width: fit-content;
        }

        .clickable-card {
          cursor: pointer;
          transition: border-color 0.15s ease, transform 0.12s ease;
        }

        .clickable-card:hover {
          border-color: var(--color-primary);
        }

        .table-container {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          overflow-x: hidden;
          width: 100%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .clinics-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.80rem;
          text-align: left;
          table-layout: auto;
        }

        .clinics-table th {
          padding: 12px 14px;
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--color-text-muted);
          background-color: var(--color-surface-secondary);
          border-bottom: 1px solid var(--color-border);
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .clinics-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;
        }

        .clinics-table tbody tr:hover {
          background-color: var(--color-surface-secondary);
        }

        .btn-key-view {
          height: 30px;
          padding: 0 10px;
          border-radius: 6px;
          border: 1px solid rgba(59, 130, 246, 0.25);
          background-color: var(--color-primary-soft);
          color: var(--color-primary);
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .btn-key-view:hover {
          background-color: var(--color-primary);
          color: #ffffff;
        }

        .btn-key-view:hover svg {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }

        .cell-clinic {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .clinic-name {
          font-weight: 800;
          color: var(--color-heading);
          font-size: 0.88rem;
        }

        .doctor-sub {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .mid-chip-box {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-secondary);
        }

        .mid-text {
          font-family: var(--font-family-mono);
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--color-primary);
          letter-spacing: 0.03em;
        }

        .copy-icon-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          padding: 2px;
        }

        .copy-icon-btn:hover {
          color: var(--color-heading);
        }

        .badge-lifetime {
          font-size: 0.64rem;
          font-weight: 800;
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 7px;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: currentColor;
        }

        .pill-active {
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .pill-suspended {
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .tamper-tag {
          font-size: 0.60rem;
          font-weight: 800;
          color: #ffffff;
          background-color: #dc2626;
          padding: 1px 6px;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(220, 38, 38, 0.35);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          flex-wrap: nowrap;
        }

        .action-btn {
          height: 30px;
          padding: 0 9px;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-heading);
          font-size: 0.70rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .action-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .action-btn.btn-dev {
          border-color: rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          background-color: rgba(56, 189, 248, 0.08);
        }

        .action-btn.btn-dev:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          color: #ffffff !important;
          border-color: #2563eb !important;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.4);
          transform: translateY(-1px);
        }

        .action-btn.btn-dev:hover svg {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }

        .btn-amber {
          border-color: rgba(245, 158, 11, 0.4);
          background-color: rgba(245, 158, 11, 0.08);
          color: #f59e0b;
        }

        .btn-amber:hover {
          background-color: #f59e0b;
          color: #000000;
        }

        .btn-danger {
          border-color: rgba(239, 68, 68, 0.35);
          background-color: rgba(239, 68, 68, 0.08);
          color: #ef4444;
        }

        .btn-danger:hover {
          background-color: #ef4444;
          color: #ffffff;
        }

        .btn-delete {
          border-color: rgba(239, 68, 68, 0.3);
          background-color: transparent;
          color: #ef4444;
        }

        .btn-delete:hover {
          background-color: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
        }

        .btn-success {
          border-color: rgba(16, 185, 129, 0.35);
          background-color: rgba(16, 185, 129, 0.08);
          color: #10b981;
        }

        .btn-success:hover {
          background-color: #10b981;
          color: #ffffff;
        }

        .empty-state {
          padding: 48px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mobile-cards-view {
          display: none;
        }

        .m-clinic-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .m-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .m-clinic-name {
          font-size: 0.96rem;
          font-weight: 800;
          color: var(--color-heading);
          margin: 0;
        }

        .m-doctor-sub {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          display: block;
          margin-top: 2px;
        }

        .m-card-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .m-card-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 480px) {
          .m-card-actions-grid {
            grid-template-columns: 1fr;
          }
        }

        .m-btn {
          height: 34px;
          justify-content: center;
          width: 100%;
        }

        @media (max-width: 880px) {
          .table-container {
            display: none;
          }

          .mobile-cards-view {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .dashboard-layout {
            padding: 18px 24px;
            gap: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-create-license {
            justify-content: center;
            width: 100%;
          }

          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }

          .filter-pills {
            overflow-x: auto;
            justify-content: flex-start;
            padding: 4px;
            -webkit-overflow-scrolling: touch;
          }

          .filter-pill {
            white-space: nowrap;
          }
        }

        @media (max-width: 640px) {
          .dashboard-layout {
            padding: 12px 14px;
            gap: 14px;
          }

          .search-box {
            height: 40px;
            padding: 0 10px;
            gap: 8px;
          }

          .search-input {
            font-size: 0.80rem;
          }
        }

        /* Light Theme High-Contrast Refinements */
        [data-theme='light'] .action-btn.btn-dev {
          border-color: #99f6e4;
          color: #0f766e;
          background-color: #f0fdfa;
        }

        [data-theme='light'] .btn-amber {
          border-color: #fde68a;
          background-color: #fffbeb;
          color: #b45309;
        }

        [data-theme='light'] .btn-danger {
          border-color: #fecaca;
          background-color: #fef2f2;
          color: #b91c1c;
        }

        [data-theme='light'] .btn-delete {
          border-color: #fecaca;
          background-color: #ffffff;
          color: #b91c1c;
        }

        [data-theme='light'] .btn-key-view {
          border-color: #bfdbfe;
          background-color: #eff6ff;
          color: #1d4ed8;
        }

        [data-theme='light'] .mid-chip-box {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }

        [data-theme='light'] .mid-text {
          color: #1d4ed8;
        }

        [data-theme='light'] .payment-pill-tag.pill-paid {
          color: #047857;
          background-color: #ecfdf5;
          border-color: #a7f3d0;
        }

        [data-theme='light'] .payment-pill-tag.pill-pending {
          color: #b45309;
          background-color: #fffbeb;
          border-color: #fde68a;
        }

        [data-theme='light'] .cost-tag {
          color: #047857;
          background-color: #ecfdf5;
          border-color: #a7f3d0;
        }

        [data-theme='light'] .category-tag {
          color: #1d4ed8;
          background-color: #eff6ff;
          border-color: #bfdbfe;
        }

        [data-theme='light'] .pill-active {
          color: #047857;
          background-color: #ecfdf5;
          border-color: #a7f3d0;
        }

        [data-theme='light'] .pill-suspended {
          color: #b91c1c;
          background-color: #fef2f2;
          border-color: #fecaca;
        }

        [data-theme='light'] .counter-badge.badge-active {
          background-color: #ecfdf5;
          color: #047857;
        }

        [data-theme='light'] .counter-badge.badge-suspended {
          background-color: #fef2f2;
          color: #b91c1c;
        }

        [data-theme='light'] .filter-pills {
          background-color: #f8fafc;
          border-color: #e2e8f0;
        }

        [data-theme='light'] .filter-pill {
          color: #64748b;
        }

        [data-theme='light'] .filter-pill.active {
          background-color: #2563eb;
          color: #ffffff;
        }

        [data-theme='light'] .search-box {
          background-color: #ffffff;
          border-color: #cbd5e1;
        }

        [data-theme='light'] .search-input {
          color: #0f172a;
        }

        [data-theme='light'] .table-container {
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.03);
          border-color: #e2e8f0;
        }

        [data-theme='light'] .clinics-table th {
          background-color: #f8fafc;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        [data-theme='light'] .clinics-table td {
          border-bottom: 1px solid #f1f5f9;
        }

        [data-theme='light'] .clinics-table tbody tr:hover {
          background-color: #f8fafc;
        }

        [data-theme='light'] .btn-finance-tracker-action {
          background-color: #ffffff;
          border-color: #cbd5e1;
          color: #2563eb;
        }

        [data-theme='light'] .btn-finance-tracker-action:hover {
          background-color: #f8fafc;
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

