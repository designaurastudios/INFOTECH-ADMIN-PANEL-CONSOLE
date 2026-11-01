import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  Search,
  Plus,
  Trash2,
  Calendar,
  Tag,
  IndianRupee,
  Filter,
} from 'lucide-react';
import { ExpenseRecord } from '../types/license';
import { formatDateTime } from '../utils/dateFormat';
import { expenseService, DEFAULT_EXPENSE_CATEGORIES } from '../services/expenseService';

interface ExpenseLedgerModalProps {
  expenses: ExpenseRecord[];
  onClose: () => void;
  onOpenAddExpense: () => void;
}

export const ExpenseLedgerModal: React.FC<ExpenseLedgerModalProps> = ({
  expenses,
  onClose,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Extract unique categories from current expenses + defaults
  const uniqueCategories = Array.from(
    new Set([...DEFAULT_EXPENSE_CATEGORIES, ...expenses.map((e) => e.category)])
  );

  const filteredExpenses = expenses.filter((e) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.expenseName.toLowerCase().includes(q) ||
      e.particulars.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      String(e.amount).includes(q) ||
      (e.notes && e.notes.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'ALL' || e.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalFilteredExpense = filteredExpenses.reduce(
    (acc, e) => acc + (Number(e.amount) || 0),
    0
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the expense entry "${name}"?`)) {
      await expenseService.deleteExpense(id);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="expense-ledger-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ledger-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="ledger-icon-badge expense">
              <Receipt size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="ledger-title">Company Business Expenses Ledger</h3>
                <span className="ledger-count-pill expense">{filteredExpenses.length} Records</span>
              </div>
              <p className="ledger-sub">
                Complete accounting of operational expenditures, advertisements, server hosting & tooling.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="ledger-close-btn" title="Close Ledger">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="ledger-toolbar">
          <div className="toolbar-search">
            <Search size={15} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by expense name, vendor, particulars, amount..."
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
            <div className="filter-select-wrapper">
              <Tag size={13} color="var(--color-text-muted)" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Expense Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenAddExpense}
              className="btn-toolbar-add"
            >
              <Plus size={14} />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="ledger-table-wrap">
          {filteredExpenses.length === 0 ? (
            <div className="ledger-empty">
              <Receipt size={40} color="var(--color-text-muted)" />
              <h4>No Expense Records Found</h4>
              <p>Record your company's marketing, servers, salaries, or operating costs.</p>
              <button
                type="button"
                onClick={onOpenAddExpense}
                className="btn-empty-action"
              >
                <Plus size={14} />
                <span>Record New Expense</span>
              </button>
            </div>
          ) : (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>SR NO</th>
                  <th style={{ width: '175px' }}>DATE & TIME</th>
                  <th style={{ minWidth: '180px' }}>EXPENSE NAME</th>
                  <th style={{ width: '160px' }}>CATEGORY</th>
                  <th style={{ minWidth: '160px' }}>PAID TO / VENDOR</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ minWidth: '200px' }}>AMOUNT IN WORDS</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp, index) => (
                  <tr key={exp.id || index}>
                    <td style={{ textAlign: 'center' }}>
                      <span className="sr-no-pill">#{index + 1}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={12} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-heading)', fontWeight: 600 }}>
                          {formatDateTime(exp.expenseDate || exp.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong className="expense-title-cell">{exp.expenseName}</strong>
                      {exp.notes && (
                        <span className="expense-note-cell">Ref: {exp.notes}</span>
                      )}
                    </td>
                    <td>
                      <span className="expense-cat-badge">{exp.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)' }}>
                        {exp.particulars}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong className="expense-amount-cell">
                        ₹{Number(exp.amount).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span className="words-cell">{exp.amountInWords || '—'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id, exp.expenseName)}
                        className="btn-delete-row"
                        title="Delete expense entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="ledger-footer">
          <div className="footer-summary">
            <span>Filtered Total Business Expenses: </span>
            <strong style={{ color: '#ef4444', fontSize: '0.92rem' }}>
              ₹{totalFilteredExpense.toLocaleString('en-IN')}
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

        .expense-ledger-modal-card {
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

        .ledger-icon-badge.expense {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
        }

        .ledger-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-heading, #ffffff);
          margin: 0;
        }

        .ledger-count-pill.expense {
          font-size: 0.68rem;
          font-weight: 800;
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
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

        .btn-toolbar-add {
          height: 38px;
          padding: 0 16px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.35);
          white-space: nowrap;
        }

        .btn-toolbar-add:hover {
          opacity: 0.95;
          transform: translateY(-1px);
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

        .expense-title-cell {
          font-size: 0.86rem;
          color: var(--color-heading);
          display: block;
        }

        .expense-note-cell {
          font-size: 0.70rem;
          color: var(--color-text-muted, #9ca3af);
          display: block;
          margin-top: 1px;
        }

        .expense-cat-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          padding: 2px 7px;
          border-radius: 999px;
        }

        .expense-amount-cell {
          font-size: 0.88rem;
          color: #ef4444;
          font-weight: 800;
        }

        .words-cell {
          font-size: 0.70rem;
          color: var(--color-text-muted, #9ca3af);
          font-style: italic;
        }

        .btn-delete-row {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid transparent;
          background-color: transparent;
          color: var(--color-text-muted, #6b7280);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .btn-delete-row:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          background-color: rgba(239, 68, 68, 0.1);
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

        .btn-empty-action {
          margin-top: 6px;
          height: 34px;
          padding: 0 16px;
          border-radius: 6px;
          border: none;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: #ffffff;
          font-size: 0.76rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
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
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.35);
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

