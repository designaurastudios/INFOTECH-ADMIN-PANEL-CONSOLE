import React from 'react';
import { Building2, ShieldCheck, ShieldAlert, Infinity as InfinityIcon } from 'lucide-react';
import { ClinicLicense } from '../types/license';

interface StatsCardsProps {
  clinics: ClinicLicense[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ clinics }) => {
  const totalClinics = clinics.length;
  const activeCount = clinics.filter((c) => c.status === 'ACTIVE').length;
  const suspendedCount = clinics.filter((c) => c.status === 'SUSPENDED').length;
  const lifetimeCount = clinics.filter((c) => c.planType === 'LIFETIME').length;

  const activeRate = totalClinics > 0 ? Math.round((activeCount / totalClinics) * 100) : 100;

  return (
    <div className="stats-cards-grid">
      {/* 1. Total Clinics */}
      <div className="metric-card card-total">
        <div className="card-top">
          <span className="card-label">Total Registered Clinics</span>
          <div className="card-icon-box bg-blue">
            <Building2 size={16} color="var(--color-primary)" />
          </div>
        </div>
        <div className="card-value font-mono tabular-nums">{totalClinics}</div>
        <div className="card-sub-info">
          <span>All Installed Deployments</span>
          <strong style={{ color: 'var(--color-primary)' }}>100% Tracked</strong>
        </div>
        <div className="card-bar">
          <div className="card-bar-fill bg-blue-fill" style={{ width: '100%' }} />
        </div>
      </div>

      {/* 2. Active Licenses */}
      <div className="metric-card card-active">
        <div className="card-top">
          <span className="card-label">Active Deployments</span>
          <div className="card-icon-box bg-emerald">
            <ShieldCheck size={16} color="#10b981" />
          </div>
        </div>
        <div className="card-value font-mono tabular-nums" style={{ color: '#10b981' }}>
          {activeCount}
        </div>
        <div className="card-sub-info">
          <span>Operational & Healthy</span>
          <strong style={{ color: '#10b981' }}>{activeRate}% Live</strong>
        </div>
        <div className="card-bar">
          <div
            className="card-bar-fill bg-emerald-fill"
            style={{ width: `${activeRate}%` }}
          />
        </div>
      </div>

      {/* 3. Suspended Clinics */}
      <div className="metric-card card-suspended">
        <div className="card-top">
          <span className="card-label">Suspended Clinics</span>
          <div className="card-icon-box bg-rose">
            <ShieldAlert size={16} color="#ef4444" />
          </div>
        </div>
        <div
          className="card-value font-mono tabular-nums"
          style={{ color: suspendedCount > 0 ? '#ef4444' : 'var(--color-text-muted)' }}
        >
          {suspendedCount}
        </div>
        <div className="card-sub-info">
          <span>Deactivated or Paused</span>
          <strong style={{ color: suspendedCount > 0 ? '#ef4444' : 'var(--color-text-muted)' }}>
            {suspendedCount > 0 ? 'Action Needed' : 'Zero Issues'}
          </strong>
        </div>
        <div className="card-bar">
          <div
            className="card-bar-fill bg-rose-fill"
            style={{ width: `${totalClinics > 0 ? (suspendedCount / totalClinics) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 4. Lifetime Access */}
      <div className="metric-card card-lifetime">
        <div className="card-top">
          <span className="card-label">Lifetime Plan Clients</span>
          <div className="card-icon-box bg-amber">
            <InfinityIcon size={16} color="#f59e0b" />
          </div>
        </div>
        <div className="card-value font-mono tabular-nums" style={{ color: '#f59e0b' }}>
          {lifetimeCount}
        </div>
        <div className="card-sub-info">
          <span>Perpetual License Bound</span>
          <strong style={{ color: '#f59e0b' }}>Lifetime Access</strong>
        </div>
        <div className="card-bar">
          <div className="card-bar-fill bg-amber-fill" style={{ width: '100%' }} />
        </div>
      </div>

      <style>{`
        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 1024px) {
          .stats-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 580px) {
          .stats-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .metric-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 14px);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--card-shadow);
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary);
          box-shadow: var(--card-hover-shadow);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .card-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-icon-box.bg-blue {
          background-color: var(--color-primary-soft);
        }

        .card-icon-box.bg-emerald {
          background-color: var(--color-success-soft);
        }

        .card-icon-box.bg-rose {
          background-color: var(--color-danger-soft);
        }

        .card-icon-box.bg-amber {
          background-color: var(--color-warning-soft);
        }

        .card-value {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--color-heading);
          line-height: 1.15;
        }

        .card-sub-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.70rem;
          color: var(--color-text-secondary);
        }

        .card-bar {
          width: 100%;
          height: 3px;
          background-color: var(--color-surface-secondary);
          border-radius: 999px;
          overflow: hidden;
        }

        .card-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .bg-blue-fill {
          background-color: var(--color-primary);
        }

        .bg-emerald-fill {
          background-color: #10b981;
        }

        .bg-rose-fill {
          background-color: #ef4444;
        }

        .bg-amber-fill {
          background-color: #f59e0b;
        }

        /* Light Theme High-Contrast Refinements */
        [data-theme='light'] .metric-card {
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.03);
          border-color: #e2e8f0;
        }

        [data-theme='light'] .card-icon-box.bg-blue {
          background-color: #eff6ff;
          border: 1px solid #dbeafe;
        }

        [data-theme='light'] .card-icon-box.bg-emerald {
          background-color: #ecfdf5;
          border: 1px solid #d1fae5;
        }

        [data-theme='light'] .card-icon-box.bg-rose {
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
        }

        [data-theme='light'] .card-icon-box.bg-amber {
          background-color: #fffbeb;
          border: 1px solid #fef3c7;
        }

        [data-theme='light'] .metric-card.card-active .card-value {
          color: #047857 !important;
        }

        [data-theme='light'] .metric-card.card-suspended .card-value {
          color: #b91c1c !important;
        }

        [data-theme='light'] .metric-card.card-lifetime .card-value {
          color: #b45309 !important;
        }

        [data-theme='light'] .bg-blue-fill { background-color: #2563eb; }
        [data-theme='light'] .bg-emerald-fill { background-color: #059669; }
        [data-theme='light'] .bg-rose-fill { background-color: #e11d48; }
        [data-theme='light'] .bg-amber-fill { background-color: #d97706; }
      `}</style>
    </div>
  );
};
