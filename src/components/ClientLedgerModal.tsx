import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  IndianRupee,
  Tag,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { ClinicLicense } from '../types/license';
import { formatDateTime, formatDateOnly } from '../utils/dateFormat';
import { licenseService } from '../services/licenseService';

interface ClientLedgerModalProps {
  clinics: ClinicLicense[];
  onClose: () => void;
  onUpdated: () => void;
}

export const ClientLedgerModal: React.FC<ClientLedgerModalProps> = ({
  clinics,
  onClose,
  onUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Extract unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(clinics.map((c) => c.category?.trim() || 'Dental HMS'))
  );

  // Filtered clients list
  const filteredClinics = clinics.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.clinicName.toLowerCase().includes(q) ||
      c.doctorName.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.clinicEmail && c.clinicEmail.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'ALL' || (c.category?.trim() || 'Dental HMS') === categoryFilter;

    const matchesStatus =
      statusFilter === 'ALL' || (c.paymentStatus || 'PAID') === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleTogglePayment = async (clinic: ClinicLicense) => {
    const nextStatus = (clinic.paymentStatus || 'PAID') === 'PAID' ? 'PENDING' : 'PAID';
    try {
      await licenseService.togglePaymentStatus(clinic.licenseKey, nextStatus);
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  const parseCost = (cost: any): number => {
    if (!cost) return 0;
    const clean = typeof cost === 'string' ? cost.replace(/,/g, '').trim() : cost;
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const totalFilteredRevenue = filteredClinics.reduce(
    (acc, c) => acc + parseCost(c.softwareCost),
    0
  );

  return (
    <div className="modal-backdrop">
      <div className="client-ledger-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="ledger-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="ledger-icon-badge">
              <Building2 size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="ledger-title">Enterprise Client Ledger</h3>
                <span className="ledger-count-pill">{filteredClinics.length} Clients</span>
              </div>
              <p className="ledger-sub">
                Comprehensive accounts of all clinic clients, category editions, payment status & deployment dates.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="ledger-close-btn" title="Close Ledger">
            <X size={18} />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="ledger-toolbar">
          <div className="toolbar-search">
            <Search size={15} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by clinic, doctor, phone, email, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="toolbar-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="toolbar-clear-btn"
              >
                ✕
              </button>
            )}
          </div>

          <div className="toolbar-filter-group">
            {/* Category Filter */}
            <div className="filter-select-wrapper">
              <Tag size={13} color="var(--color-text-muted)" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Segment Filter */}
            <div className="status-filter-pills">
              <button
                type="button"
                className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-btn paid ${statusFilter === 'PAID' ? 'active-paid' : ''}`}
                onClick={() => setStatusFilter('PAID')}
              >
                Paid
              </button>
              <button
                type="button"
                className={`filter-btn pending ${statusFilter === 'PENDING' ? 'active-pending' : ''}`}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="ledger-table-wrap">
          {filteredClinics.length === 0 ? (
            <div className="ledger-empty">
              <Building2 size={40} color="var(--color-text-muted)" />
              <h4>No Client Records Found</h4>
              <p>No clinics match your search or active filter criteria.</p>
            </div>
          ) : (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>SR NO</th>
                  <th style={{ minWidth: '180px' }}>CLINIC NAME</th>
                  <th style={{ minWidth: '160px' }}>DOCTOR NAME</th>
                  <th style={{ width: '135px' }}>CATEGORY</th>
                  <th style={{ width: '130px' }}>PHONE NUMBER</th>
                  <th style={{ minWidth: '160px' }}>EMAIL ID</th>
                  <th style={{ width: '120px' }}>LOCATION</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>PAYMENT STATUS</th>
                  <th style={{ width: '165px' }}>SETUP DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredClinics.map((clinic, index) => {
                  const isPaid = (clinic.paymentStatus || 'PAID') === 'PAID';
                  const cost = parseCost(clinic.softwareCost);
                  return (
                    <tr key={clinic.id || index}>
                      <td style={{ textAlign: 'center' }}>
                        <span className="sr-no-pill">#{index + 1}</span>
                      </td>
                      <td>
                        <strong className="clinic-name-cell">{clinic.clinicName}</strong>
                        {cost > 0 && (
                          <span className="clinic-cost-sub">
                            ₹{cost.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} color="var(--color-text-muted)" />
                          <span className="doctor-name-cell">{clinic.doctorName || 'Not recorded'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill-tag">
                          {clinic.category || 'Dental HMS'}
                        </span>
                      </td>
                      <td>
                        {clinic.phone ? (
                          <a href={`tel:${clinic.phone}`} className="contact-link">
                            <Phone size={12} />
                            <span>{clinic.phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-cell">—</span>
                        )}
                      </td>
                      <td>
                        {clinic.clinicEmail ? (
                          <a href={`mailto:${clinic.clinicEmail}`} className="contact-link">
                            <Mail size={12} />
                            <span>{clinic.clinicEmail}</span>
                          </a>
                        ) : (
                          <span className="text-muted-cell">—</span>
                        )}
                      </td>
                      <td>
                        {clinic.city ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={12} color="var(--color-text-muted)" />
                            <span>{clinic.city}</span>
                          </div>
                        ) : (
                          <span className="text-muted-cell">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`payment-pill ${isPaid ? 'pill-paid' : 'pill-pending'}`}>
                            {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            <span>{isPaid ? 'PAID' : 'PENDING'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePayment(clinic)}
                            className="btn-status-toggle"
                            title={`Toggle payment to ${isPaid ? 'PENDING' : 'PAID'}`}
                          >
                            Set {isPaid ? 'Pending' : 'Paid'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={12} color="var(--color-text-muted)" />
                          <span style={{ fontSize: '0.76rem', color: 'var(--color-heading)', fontWeight: 600 }}>
                            {formatDateTime(clinic.setupDate || clinic.issuedAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Ledger Footer */}
        <div className="ledger-footer">
          <div className="footer-summary">
            <span>Filtered Total Software Revenue: </span>
            <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>
              ₹{totalFilteredRevenue.toLocaleString('en-IN')}
            </strong>
          </div>
          <button type="button" onClick={onClose} className="btn-done-ledger">
            <span>Done & Close</span>
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(6, 7, 9, 0.88);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .client-ledger-modal-card {
          width: 100%;
          max-width: 1180px;
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

        .ledger-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--color-border, #202433);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--color-surface, #0e1017);
          flex-shrink: 0;
          gap: 12px;
        }

        .ledger-icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }

        .ledger-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-heading, #ffffff);
          margin: 0;
        }

        .ledger-count-pill {
          font-size: 0.68rem;
          font-weight: 800;
          color: #38bdf8;
          background-color: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .ledger-sub {
          font-size: 0.74rem;
          color: var(--color-text-secondary, #9ca3af);
          margin: 2px 0 0 0;
        }

        .ledger-close-btn {
          width: 34px;
          height: 34px;
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

        .ledger-close-btn:hover {
          color: #ffffff;
          background-color: #202433;
        }

        /* Toolbar */
        .ledger-toolbar {
          padding: 12px 24px;
          border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.05));
          background-color: var(--color-surface-secondary, #141722);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          flex-shrink: 0;
        }

        .toolbar-search {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface, #0e1017);
          flex: 1;
          min-width: 260px;
          max-width: 480px;
        }

        .toolbar-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-heading, #ffffff);
          font-size: 0.80rem;
        }

        .toolbar-clear-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 0.70rem;
        }

        .toolbar-filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-select-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface, #0e1017);
        }

        .filter-select {
          background: transparent;
          border: none;
          color: var(--color-heading, #ffffff);
          font-size: 0.76rem;
          font-weight: 700;
          outline: none;
          cursor: pointer;
        }

        .filter-select option {
          background-color: var(--color-surface, #0e1017);
          color: #ffffff;
        }

        .status-filter-pills {
          display: flex;
          align-items: center;
          gap: 4px;
          background-color: var(--color-surface, #0e1017);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
        }

        .filter-btn {
          height: 30px;
          padding: 0 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary, #9ca3af);
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-btn.active {
          background-color: var(--color-primary);
          color: #ffffff;
        }

        .filter-btn.active-paid {
          background-color: #10b981;
          color: #ffffff;
        }

        .filter-btn.active-pending {
          background-color: #f59e0b;
          color: #ffffff;
        }

        /* Table */
        .ledger-table-wrap {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          min-height: 280px;
        }

        .ledger-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.80rem;
          text-align: left;
        }

        .ledger-table th {
          position: sticky;
          top: 0;
          padding: 12px 14px;
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--color-text-muted, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface-secondary, #141722);
          z-index: 10;
        }

        .ledger-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.04));
          vertical-align: middle;
          white-space: nowrap;
        }

        .ledger-table tr:hover td {
          background-color: var(--color-surface-secondary);
        }

        .sr-no-pill {
          font-family: var(--font-family-mono, monospace);
          font-size: 0.70rem;
          font-weight: 700;
          color: var(--color-text-muted);
          background-color: var(--color-surface-secondary);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--color-border);
        }

        .clinic-name-cell {
          font-size: 0.86rem;
          color: var(--color-heading);
          display: block;
        }

        .clinic-cost-sub {
          font-size: 0.70rem;
          color: #10b981;
          font-weight: 700;
        }

        .doctor-name-cell {
          font-size: 0.80rem;
          color: var(--color-heading);
          font-weight: 600;
        }

        .category-pill-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--color-primary);
          background-color: var(--color-primary-soft);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 2px 7px;
          border-radius: 999px;
        }

        .contact-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--color-primary);
          text-decoration: none;
          font-size: 0.76rem;
          font-weight: 600;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        .text-muted-cell {
          color: var(--color-text-muted);
          font-style: italic;
        }

        .payment-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 2px 7px;
          border-radius: 999px;
        }

        .pill-paid {
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .pill-pending {
          color: #f59e0b;
          background-color: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .btn-status-toggle {
          background-color: var(--color-surface, #0e1017);
          border: 1px solid var(--color-border, #202433);
          color: var(--color-text-muted, #9ca3af);
          font-size: 0.66rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .btn-status-toggle:hover {
          color: var(--color-heading, #ffffff);
          border-color: var(--color-primary);
        }

        .ledger-empty {
          padding: 50px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .ledger-empty h4 {
          margin: 0;
          color: var(--color-heading, #ffffff);
          font-size: 0.95rem;
        }

        .ledger-empty p {
          margin: 0;
          color: var(--color-text-secondary, #9ca3af);
          font-size: 0.76rem;
        }

        /* Footer */
        .ledger-footer {
          padding: 14px 24px;
          border-top: 1px solid var(--color-border, #202433);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--color-surface, #0e1017);
          flex-shrink: 0;
        }

        .footer-summary {
          font-size: 0.78rem;
          color: var(--color-text-secondary, #9ca3af);
        }

        .btn-done-ledger {
          height: 38px;
          padding: 0 20px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
        }

        @media (max-width: 640px) {
          .ledger-header {
            padding: 14px 16px;
          }
          .ledger-toolbar {
            padding: 10px 16px;
          }
          .ledger-footer {
            padding: 12px 16px;
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }
          .btn-done-ledger {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

