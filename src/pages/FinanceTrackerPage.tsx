import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Plus,
  ArrowLeft,
  PieChart,
  Wallet,
  Building2,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { ClinicLicense, ExpenseRecord } from '../types/license';
import { licenseService } from '../services/licenseService';
import { expenseService } from '../services/expenseService';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { SolidPieChart } from '../components/SolidPieChart';
import { ClientLedgerModal } from '../components/ClientLedgerModal';
import { ExpenseLedgerModal } from '../components/ExpenseLedgerModal';

interface FinanceTrackerPageProps {
  onBackToLicenses: () => void;
}

export const FinanceTrackerPage: React.FC<FinanceTrackerPageProps> = ({ onBackToLicenses }) => {
  const [clinics, setClinics] = useState<ClinicLicense[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isClientLedgerOpen, setIsClientLedgerOpen] = useState(false);
  const [isExpenseLedgerOpen, setIsExpenseLedgerOpen] = useState(false);

  // Real-time Subscriptions
  useEffect(() => {
    const unsubClinics = licenseService.subscribeToClinics((list) => {
      setClinics(list);
    });

    const unsubExpenses = expenseService.subscribeToExpenses((list) => {
      setExpenses(list);
    });

    return () => {
      unsubClinics();
      unsubExpenses();
    };
  }, []);

  // Helper to parse numeric software cost safely
  const parseCost = (cost: any): number => {
    if (!cost) return 0;
    const clean = typeof cost === 'string' ? cost.replace(/,/g, '').trim() : cost;
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // 1. Total Software Revenue (Sum of each and every license, whether PAID or PENDING)
  const totalSoftwareRevenue = clinics.reduce((acc, c) => acc + parseCost(c.softwareCost), 0);

  // 2. Paid Software Amount (Only clients where paymentStatus === 'PAID')
  const paidClinics = clinics.filter((c) => (c.paymentStatus || 'PAID') === 'PAID');
  const paidSoftwareRevenue = paidClinics.reduce((acc, c) => acc + parseCost(c.softwareCost), 0);

  // 3. Pending Amount (Only clients where paymentStatus === 'PENDING')
  const pendingClinics = clinics.filter((c) => c.paymentStatus === 'PENDING');
  const pendingSoftwareRevenue = pendingClinics.reduce((acc, c) => acc + parseCost(c.softwareCost), 0);

  // 4. Total Expenses (Sum of all company expenses recorded)
  const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // 5. Net Revenue / Net Profit (Paid Software Amount - Total Expenses)
  const netRevenue = paidSoftwareRevenue - totalExpenses;
  const isProfitable = netRevenue >= 0;

  // Collection efficiency percentage
  const collectionRate = totalSoftwareRevenue > 0
    ? Math.round((paidSoftwareRevenue / totalSoftwareRevenue) * 100)
    : 100;

  // --------------------------------------------------------------------------
  // SOLID PIE CHART ANALYTICS DATA
  // --------------------------------------------------------------------------

  // 1. Major HMS Category Breakdown
  const categoryStatsMap = new Map<string, { count: number; totalRev: number }>();
  clinics.forEach((c) => {
    const cat = c.category?.trim() || 'Dental HMS';
    const current = categoryStatsMap.get(cat) || { count: 0, totalRev: 0 };
    current.count += 1;
    current.totalRev += parseCost(c.softwareCost);
    categoryStatsMap.set(cat, current);
  });

  const CHART_COLORS = ['#38bdf8', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

  const categoryAnalytics = Array.from(categoryStatsMap.entries()).map(([cat, data]) => ({
    category: cat,
    count: data.count,
    totalRev: data.totalRev,
    percentage: totalSoftwareRevenue > 0 ? Math.round((data.totalRev / totalSoftwareRevenue) * 100) : 0,
  })).sort((a, b) => b.totalRev - a.totalRev);

  // 2. Expense Category Breakdown
  const expenseCatMap = new Map<string, number>();
  expenses.forEach((e) => {
    const cat = e.category?.trim() || 'Miscellaneous';
    expenseCatMap.set(cat, (expenseCatMap.get(cat) || 0) + (Number(e.amount) || 0));
  });

  const EXPENSE_COLORS = ['#ef4444', '#f59e0b', '#38bdf8', '#a855f7', '#10b981', '#ec4899', '#6366f1'];

  const expenseAnalytics = Array.from(expenseCatMap.entries()).map(([cat, amount]) => ({
    category: cat,
    amount,
    percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="finance-layout">
      {/* 1. Header Bar with Simple Back & Add Expense */}
      <div className="finance-header">
        <div className="finance-header-text">
          <h2 className="finance-title">Company Finance & Revenue Tracker</h2>
          <p className="finance-subtitle">
            Real-time accounting of software sales, cash collections, business expenses, and net profit.
          </p>
        </div>

        <div className="finance-actions">
          <button
            type="button"
            onClick={onBackToLicenses}
            className="btn-back-hub"
            title="Return to License Dashboard"
          >
            <ArrowLeft size={15} />
            <span>Back to Licenses</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            className="btn-add-expense"
            title="Record New Business Expense"
          >
            <Plus size={15} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 Key Metric Cards (Unified Minimal Geometry) */}
      <div className="finance-cards-grid">
        {/* Card 1: Total Software Revenue (Gross) */}
        <div className="finance-card card-total">
          <div className="card-top">
            <span className="card-label">Total Software Revenue</span>
            <div className="card-icon-box bg-blue">
              <TrendingUp size={16} color="var(--color-primary)" />
            </div>
          </div>
          <div className="card-value font-mono tabular-nums color-blue">
            ₹{totalSoftwareRevenue.toLocaleString('en-IN')}
          </div>
          <div className="card-sub-info">
            <span>All Booked Contracts</span>
            <strong style={{ color: 'var(--color-primary)' }}>{clinics.length} Clients</strong>
          </div>
          <div className="card-bar">
            <div className="card-bar-fill bg-blue-fill" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 2: Paid Software Amount */}
        <div className="finance-card card-paid">
          <div className="card-top">
            <span className="card-label">Paid Software Amount</span>
            <div className="card-icon-box bg-emerald">
              <Wallet size={16} color="#10b981" />
            </div>
          </div>
          <div className="card-value font-mono tabular-nums color-emerald">
            ₹{paidSoftwareRevenue.toLocaleString('en-IN')}
          </div>
          <div className="card-sub-info">
            <span>Collected Cash Inflow</span>
            <strong style={{ color: '#10b981' }}>{paidClinics.length} Paid</strong>
          </div>
          <div className="card-bar">
            <div
              className="card-bar-fill bg-emerald-fill"
              style={{ width: `${totalSoftwareRevenue > 0 ? (paidSoftwareRevenue / totalSoftwareRevenue) * 100 : 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Pending Amount */}
        <div className="finance-card card-pending">
          <div className="card-top">
            <span className="card-label">Pending Receivables</span>
            <div className="card-icon-box bg-amber">
              <Receipt size={16} color="#f59e0b" />
            </div>
          </div>
          <div className="card-value font-mono tabular-nums color-amber">
            ₹{pendingSoftwareRevenue.toLocaleString('en-IN')}
          </div>
          <div className="card-sub-info">
            <span>Awaiting Client Payout</span>
            <strong style={{ color: '#f59e0b' }}>{pendingClinics.length} Follow-ups</strong>
          </div>
          <div className="card-bar">
            <div
              className="card-bar-fill bg-amber-fill"
              style={{ width: `${totalSoftwareRevenue > 0 ? (pendingSoftwareRevenue / totalSoftwareRevenue) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 4: Total Expenses */}
        <div className="finance-card card-expense">
          <div className="card-top">
            <span className="card-label">Total Business Expenses</span>
            <div className="card-icon-box bg-rose">
              <Receipt size={16} color="#ef4444" />
            </div>
          </div>
          <div className="card-value font-mono tabular-nums color-rose">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="card-sub-info">
            <span>Operational & Ads Costs</span>
            <strong style={{ color: '#ef4444' }}>{expenses.length} Entries</strong>
          </div>
          <div className="card-bar">
            <div className="card-bar-fill bg-rose-fill" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 5: Net Profit / Net Revenue */}
        <div className={`finance-card card-net ${isProfitable ? 'net-profit' : 'net-loss'}`}>
          <div className="card-top">
            <span className="card-label">Net Profit (Cash − Costs)</span>
            <div className={`card-icon-box ${isProfitable ? 'bg-cyan' : 'bg-red'}`}>
              {isProfitable ? <TrendingUp size={16} color="#06b6d4" /> : <TrendingDown size={16} color="#ef4444" />}
            </div>
          </div>
          <div className={`card-value font-mono tabular-nums ${isProfitable ? 'color-cyan' : 'color-rose'}`}>
            {netRevenue >= 0 ? '+' : '-'}₹{Math.abs(netRevenue).toLocaleString('en-IN')}
          </div>
          <div className="card-sub-info">
            <span>Company Health</span>
            <strong className={isProfitable ? 'badge-profit' : 'badge-deficit'}>
              {isProfitable ? '● Profitable' : '● Deficit'}
            </strong>
          </div>
          <div className="card-bar">
            <div className={`card-bar-fill ${isProfitable ? 'bg-cyan-fill' : 'bg-rose-fill'}`} style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* 3. Solid Circular Pie-Chart Analytics Section */}
      <div className="analytics-grid">
        {/* Analytics 1: HMS Category Sales Solid Pie Chart */}
        <div className="analytics-card">
          <div className="analytics-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="analytics-icon-box">
                <PieChart size={15} color="var(--color-primary)" />
              </div>
              <div>
                <h4 className="analytics-title">Top Selling HMS Categories</h4>
                <p className="analytics-sub">Circular product revenue & market share</p>
              </div>
            </div>
            <span className="analytics-badge font-mono">{categoryAnalytics.length} Products</span>
          </div>

          <div className="analytics-body">
            <SolidPieChart
              slices={categoryAnalytics.map((item, idx) => ({
                label: item.category,
                value: item.totalRev,
                percentage: item.percentage,
                color: CHART_COLORS[idx % CHART_COLORS.length],
                formattedValue: `₹${item.totalRev.toLocaleString('en-IN')}`,
                count: item.count,
              }))}
              totalValue={totalSoftwareRevenue}
              emptyText="No HMS categories sold yet."
            />
          </div>
        </div>

        {/* Analytics 2: Collection Efficiency Solid Pie Chart */}
        <div className="analytics-card">
          <div className="analytics-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="analytics-icon-box" style={{ background: 'var(--color-success-soft)' }}>
                <Wallet size={15} color="#10b981" />
              </div>
              <div>
                <h4 className="analytics-title">Collection Efficiency</h4>
                <p className="analytics-sub">Paid cash vs outstanding receivables</p>
              </div>
            </div>
            <span className="analytics-badge font-mono" style={{ color: '#10b981' }}>{collectionRate}% Collected</span>
          </div>

          <div className="analytics-body">
            <SolidPieChart
              slices={[
                {
                  label: 'Paid Collections',
                  value: paidSoftwareRevenue,
                  percentage: collectionRate,
                  color: '#10b981',
                  formattedValue: `₹${paidSoftwareRevenue.toLocaleString('en-IN')}`,
                  count: paidClinics.length,
                },
                {
                  label: 'Pending Receivables',
                  value: pendingSoftwareRevenue,
                  percentage: totalSoftwareRevenue > 0 ? 100 - collectionRate : 0,
                  color: '#f59e0b',
                  formattedValue: `₹${pendingSoftwareRevenue.toLocaleString('en-IN')}`,
                  count: pendingClinics.length,
                },
              ]}
              totalValue={totalSoftwareRevenue || 1}
              emptyText="No software sales recorded."
            />
          </div>
        </div>

        {/* Analytics 3: Expense Category Breakdown Solid Pie Chart */}
        <div className="analytics-card">
          <div className="analytics-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="analytics-icon-box" style={{ background: 'var(--color-danger-soft)' }}>
                <Receipt size={15} color="#ef4444" />
              </div>
              <div>
                <h4 className="analytics-title">Business Expense Breakdown</h4>
                <p className="analytics-sub">Circular capital deployment by category</p>
              </div>
            </div>
            <span className="analytics-badge font-mono" style={{ color: '#ef4444' }}>
              ₹{totalExpenses.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="analytics-body">
            <SolidPieChart
              slices={expenseAnalytics.map((item, idx) => ({
                label: item.category,
                value: item.amount,
                percentage: item.percentage,
                color: EXPENSE_COLORS[idx % EXPENSE_COLORS.length],
                formattedValue: `₹${item.amount.toLocaleString('en-IN')}`,
              }))}
              totalValue={totalExpenses}
              emptyText="No expenses logged yet. Click + Record Expense."
            />
          </div>
        </div>
      </div>

      {/* 4. Ledger Pop-up Launchpad (Simple, Executive & Modern - Side by Side) */}
      <div className="ledger-launchpad-grid">
        {/* Left: Client Ledger Launcher */}
        <div className="ledger-launcher-card client-ledger-card">
          <div className="launcher-header">
            <div className="launcher-icon-box client-icon-box">
              <Building2 size={20} color="var(--color-primary)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 className="launcher-title">Client Accounts Ledger</h3>
                <span className="launcher-pill client-pill font-mono">
                  {clinics.length} Registered Clinics
                </span>
              </div>
              <p className="launcher-desc">
                Access complete client directory, doctor contacts, clinic locations, payment tracking (Paid vs Pending), and setup dates in a dedicated full ledger.
              </p>
            </div>
          </div>

          <div className="launcher-footer">
            <div className="launcher-stat-row">
              <span className="stat-label">Booked Software Sales:</span>
              <strong className="stat-val-client font-mono">₹{totalSoftwareRevenue.toLocaleString('en-IN')}</strong>
            </div>

            <button
              type="button"
              onClick={() => setIsClientLedgerOpen(true)}
              className="btn-launch-ledger btn-launch-client"
              title="Open interactive Client Ledger modal"
            >
              <FileSpreadsheet size={15} />
              <span>View Client Ledger</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Right: Expense Ledger Launcher */}
        <div className="ledger-launcher-card expense-ledger-card">
          <div className="launcher-header">
            <div className="launcher-icon-box expense-icon-box">
              <Receipt size={20} color="#ef4444" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 className="launcher-title">Company Business Expense Ledger</h3>
                <span className="launcher-pill expense-pill font-mono">
                  {expenses.length} Expense Entries
                </span>
              </div>
              <p className="launcher-desc">
                View itemized operational costs, marketing expenses, tools & servers, vendor payments, and amounts in words with real-time editing & delete tools.
              </p>
            </div>
          </div>

          <div className="launcher-footer">
            <div className="launcher-stat-row">
              <span className="stat-label">Total Outflow Spent:</span>
              <strong className="stat-val-expense font-mono">₹{totalExpenses.toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(true)}
                className="btn-mini-add-exp"
                title="Quick Add Expense"
              >
                <Plus size={14} />
                <span>+ Add</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpenseLedgerOpen(true)}
                className="btn-launch-ledger btn-launch-expense"
                title="Open interactive Business Expense Ledger modal"
              >
                <Receipt size={15} />
                <span>View Expense Ledger</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Client Ledger Modal Popup */}
      {isClientLedgerOpen && (
        <ClientLedgerModal
          clinics={clinics}
          onClose={() => setIsClientLedgerOpen(false)}
          onUpdated={() => {}}
        />
      )}

      {/* 6. Expense Ledger Modal Popup */}
      {isExpenseLedgerOpen && (
        <ExpenseLedgerModal
          expenses={expenses}
          onClose={() => setIsExpenseLedgerOpen(false)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />
      )}

      {/* 7. Add Expense Modal */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          onClose={() => setIsAddExpenseOpen(false)}
          onAdded={(newRecord) => {
            setExpenses((prev) => {
              if (prev.some((e) => e.id === newRecord.id)) return prev;
              return [newRecord, ...prev];
            });
          }}
        />
      )}

      <style>{`
        .finance-layout {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 40px 60px 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .finance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding-bottom: 4px;
        }

        .finance-header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .finance-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .finance-badge-tag {
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #10b981;
          background-color: var(--color-success-soft);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 2px 7px;
          border-radius: 4px;
        }

        .finance-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--color-heading);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .finance-subtitle {
          font-size: 0.78rem;
          color: var(--color-text-secondary);
          margin: 0;
          max-width: 720px;
          line-height: 1.45;
        }

        .finance-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-back-hub {
          height: 38px;
          padding: 0 16px;
          border-radius: var(--radius-md, 10px);
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-primary);
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: var(--card-shadow);
        }

        .btn-back-hub:hover {
          border-color: var(--color-primary);
          background-color: var(--color-surface-secondary);
          transform: translateY(-1px);
        }

        .btn-add-expense {
          height: 38px;
          padding: 0 16px;
          border-radius: var(--radius-md, 10px);
          border: none;
          background-color: var(--color-primary);
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
          transition: all 0.15s ease;
        }

        .btn-add-expense:hover {
          background-color: var(--color-primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }

        /* 5 Top Metric Cards Grid */
        .finance-cards-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 1200px) {
          .finance-cards-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .finance-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .finance-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 14px);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--card-shadow);
          position: relative;
          overflow: hidden;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .finance-card:hover {
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
          font-size: 0.70rem;
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

        .card-icon-box.bg-amber {
          background-color: var(--color-warning-soft);
        }

        .card-icon-box.bg-rose {
          background-color: var(--color-danger-soft);
        }

        .card-icon-box.bg-cyan {
          background-color: rgba(6, 182, 212, 0.12);
        }

        .card-icon-box.bg-red {
          background-color: var(--color-danger-soft);
        }

        .card-value {
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        .color-blue {
          color: var(--color-primary);
        }

        .color-emerald {
          color: #10b981;
        }

        .color-amber {
          color: #f59e0b;
        }

        .color-rose {
          color: #ef4444;
        }

        .color-cyan {
          color: #06b6d4;
        }

        /* Light Theme High-Contrast Refinements */
        [data-theme='light'] .color-blue {
          color: #1d4ed8;
        }

        [data-theme='light'] .color-emerald {
          color: #047857;
        }

        [data-theme='light'] .color-amber {
          color: #b45309;
        }

        [data-theme='light'] .color-rose {
          color: #b91c1c;
        }

        [data-theme='light'] .color-cyan {
          color: #0e7490;
        }

        [data-theme='light'] .badge-profit {
          color: #047857;
        }

        [data-theme='light'] .badge-deficit {
          color: #b91c1c;
        }

        [data-theme='light'] .card-icon-box.bg-blue {
          background-color: #eff6ff;
          border: 1px solid #dbeafe;
        }

        [data-theme='light'] .card-icon-box.bg-emerald {
          background-color: #ecfdf5;
          border: 1px solid #d1fae5;
        }

        [data-theme='light'] .card-icon-box.bg-amber {
          background-color: #fffbeb;
          border: 1px solid #fef3c7;
        }

        [data-theme='light'] .card-icon-box.bg-rose {
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
        }

        [data-theme='light'] .card-icon-box.bg-cyan {
          background-color: #f0fdfa;
          border: 1px solid #ccfbf1;
        }

        [data-theme='light'] .card-icon-box.bg-red {
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
        }

        [data-theme='light'] .client-icon-box {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        [data-theme='light'] .expense-icon-box {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
        }

        [data-theme='light'] .client-pill {
          color: #1d4ed8;
          background-color: #eff6ff;
          border-color: #bfdbfe;
        }

        [data-theme='light'] .expense-pill {
          color: #b91c1c;
          background-color: #fef2f2;
          border-color: #fecaca;
        }

        [data-theme='light'] .btn-mini-add-exp {
          background-color: #f8fafc;
          border-color: #cbd5e1;
          color: #334155;
        }

        [data-theme='light'] .btn-mini-add-exp:hover {
          color: #b91c1c;
          border-color: #b91c1c;
          background-color: #fef2f2;
        }

        [data-theme='light'] .analytics-card,
        [data-theme='light'] .ledger-launcher-card,
        [data-theme='light'] .finance-card {
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.03);
          border-color: #e2e8f0;
        }

        [data-theme='light'] .analytics-icon-box {
          background-color: #eff6ff;
          border: 1px solid #dbeafe;
        }

        [data-theme='light'] .btn-back-hub {
          background-color: #ffffff;
          border-color: #cbd5e1;
          color: #2563eb;
        }

        [data-theme='light'] .btn-back-hub:hover {
          background-color: #f8fafc;
          border-color: #2563eb;
        }

        .card-sub-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.70rem;
          color: var(--color-text-secondary);
        }

        .badge-profit {
          color: #10b981;
          font-weight: 700;
        }

        .badge-deficit {
          color: #ef4444;
          font-weight: 700;
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

        .bg-amber-fill {
          background-color: #f59e0b;
        }

        .bg-rose-fill {
          background-color: #ef4444;
        }

        .bg-cyan-fill {
          background-color: #06b6d4;
        }

        /* 3 Circular Pie Chart Analytics Grid */
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 1024px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }

        .analytics-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 14px);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: var(--card-shadow);
        }

        .analytics-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--color-border-subtle);
          gap: 8px;
        }

        .analytics-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background-color: var(--color-primary-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .analytics-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-heading);
          margin: 0;
        }

        .analytics-sub {
          font-size: 0.68rem;
          color: var(--color-text-secondary);
          margin: 1px 0 0 0;
        }

        .analytics-badge {
          font-size: 0.66rem;
          font-weight: 700;
          color: var(--color-primary);
          background-color: var(--color-surface-secondary);
          border: 1px solid var(--color-border);
          padding: 2px 7px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .analytics-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* 4. Ledger Launchpad Grid (Executive, Clean Side-by-Side Cards) */
        .ledger-launchpad-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 860px) {
          .ledger-launchpad-grid {
            grid-template-columns: 1fr;
          }
        }

        .ledger-launcher-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 14px);
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          box-shadow: var(--card-shadow);
          position: relative;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .client-ledger-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary);
          box-shadow: var(--card-hover-shadow);
        }

        .expense-ledger-card:hover {
          transform: translateY(-2px);
          border-color: #ef4444;
          box-shadow: var(--card-hover-shadow);
        }

        .launcher-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .launcher-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .client-icon-box {
          background-color: var(--color-primary-soft);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .expense-icon-box {
          background-color: var(--color-danger-soft);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .launcher-title {
          font-size: 0.96rem;
          font-weight: 700;
          color: var(--color-heading);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .launcher-pill {
          font-size: 0.66rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .client-pill {
          color: var(--color-primary);
          background-color: var(--color-primary-soft);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .expense-pill {
          color: #ef4444;
          background-color: var(--color-danger-soft);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .launcher-desc {
          font-size: 0.76rem;
          color: var(--color-text-secondary);
          margin: 4px 0 0 0;
          line-height: 1.45;
        }

        .launcher-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid var(--color-border-subtle);
          gap: 12px;
          flex-wrap: wrap;
        }

        .launcher-stat-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .stat-label {
          font-size: 0.70rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .stat-val-client {
          font-size: 0.98rem;
          font-weight: 800;
          color: var(--color-primary);
        }

        .stat-val-expense {
          font-size: 0.98rem;
          font-weight: 800;
          color: #ef4444;
        }

        .btn-launch-ledger {
          height: 38px;
          padding: 0 16px;
          border-radius: var(--radius-md, 10px);
          border: none;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .btn-launch-client {
          background-color: var(--color-primary);
          color: #ffffff;
        }

        .btn-launch-client:hover {
          background-color: var(--color-primary-hover);
        }

        .btn-launch-expense {
          background-color: #ef4444;
          color: #ffffff;
        }

        .btn-launch-expense:hover {
          background-color: #dc2626;
        }

        .btn-mini-add-exp {
          height: 38px;
          padding: 0 12px;
          border-radius: var(--radius-md, 10px);
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-secondary);
          color: var(--color-text-secondary);
          font-size: 0.76rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .btn-mini-add-exp:hover {
          color: #ef4444;
          border-color: #ef4444;
        }

        @media (max-width: 768px) {
          .finance-layout {
            padding: 16px;
            gap: 16px;
          }

          .finance-header {
            flex-direction: column;
            align-items: stretch;
          }

          .finance-actions {
            width: 100%;
          }

          .btn-back-hub, .btn-add-expense {
            flex: 1;
            justify-content: center;
          }

          .launcher-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-launch-ledger {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
