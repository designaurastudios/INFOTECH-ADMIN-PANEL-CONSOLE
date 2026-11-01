import React, { useState, useEffect } from 'react';
import { X, Receipt, IndianRupee, Calendar, FileText, Tag, Loader2, Sparkles, Building2 } from 'lucide-react';
import { expenseService, DEFAULT_EXPENSE_CATEGORIES } from '../services/expenseService';
import { numberToWordsIndian } from '../utils/numberToWords';
import { ExpenseRecord } from '../types/license';

interface AddExpenseModalProps {
  onClose: () => void;
  onAdded: (expense: ExpenseRecord) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onAdded }) => {
  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [expenseDate, setExpenseDate] = useState(() => {
    const now = new Date();
    // YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  });
  const [particulars, setParticulars] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Lock background scrolling while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Dynamic live amount in words
  const amountNumber = parseFloat(amount.replace(/,/g, '')) || 0;
  const liveInWords = amountNumber > 0 ? numberToWordsIndian(amountNumber) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim() || amountNumber <= 0 || !particulars.trim()) {
      alert('Please fill in Expense Name, Particulars, and a valid Amount greater than 0.');
      return;
    }

    setSaving(true);
    try {
      const selectedCategory = isCustomCategory ? customCategory.trim() || 'Miscellaneous' : category;
      const record = await expenseService.addExpense({
        expenseName: expenseName.trim(),
        category: selectedCategory,
        expenseDate,
        particulars: particulars.trim(),
        amount: amountNumber,
        notes: notes.trim(),
      });
      onAdded(record);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error recording expense.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="expense-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="expense-icon-badge">
              <Receipt size={22} color="#ffffff" />
            </div>
            <div>
              <h3 className="modal-title">Record Company Business Expense</h3>
              <p className="modal-sub">Log ads, marketing, servers, salaries or miscellaneous operational costs</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          {/* 1. Expense Name & Category */}
          <div className="form-grid-2">
            <div>
              <label className="form-label">
                <span>Expense Name / Title</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google Ads Campaign, Firebase Hosting"
                className="form-input"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  <span>Expense Category</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="btn-custom-toggle"
                >
                  {isCustomCategory ? 'Select Standard' : '+ Custom Category'}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  placeholder="e.g. Sales Event, Hardware Purchase"
                  className="form-input"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  autoFocus
                />
              ) : (
                <select
                  className="form-input form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 2. Date & Time and Particulars */}
          <div className="form-grid-2">
            <div>
              <label className="form-label">
                <span>Date & Time of Expense</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="datetime-local"
                required
                className="form-input"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">
                <span>Particulars / Paid To (Vendor / Person)</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google India, DigitalOcean, Freelancer"
                className="form-input"
                value={particulars}
                onChange={(e) => setParticulars(e.target.value)}
              />
            </div>
          </div>

          {/* 3. Amount Input with Dynamic IN WORDS Preview */}
          <div className="amount-section-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                <span>Expense Amount (₹ INR)</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.70rem', color: '#10b981', fontWeight: 700 }}>
                Automatic Words Converter
              </span>
            </div>

            <div className="amount-input-wrapper">
              <span className="currency-prefix">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="e.g. 15000"
                className="amount-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Dynamic In-Words Display */}
            {liveInWords ? (
              <div className="amount-words-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#10b981" />
                  <span className="words-label">Amount in Words:</span>
                </div>
                <strong className="words-text">{liveInWords}</strong>
              </div>
            ) : (
              <p className="words-hint">
                Enter an amount above to automatically generate official words for accounts.
              </p>
            )}
          </div>

          {/* 4. Notes / Invoicing / Payment Mode */}
          <div>
            <label className="form-label">Notes, Transaction ID or Invoice Reference (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Invoice #2026-OCT-819, Paid via Corporate UPI / HDFC NetBanking"
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={saving || amountNumber <= 0} className="btn-submit">
              {saving ? (
                <>
                  <Loader2 size={16} className="btn-spin" />
                  <span>Recording Expense...</span>
                </>
              ) : (
                <>
                  <Receipt size={16} />
                  <span>Save Business Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
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

        .expense-modal-card {
          width: 100%;
          max-width: 620px;
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          background-color: var(--color-surface, #0e1017);
          border: 1px solid var(--color-border, #202433);
          border-radius: var(--radius-xl, 20px);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
          box-sizing: border-box;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .expense-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 1.12rem;
          font-weight: 800;
          color: var(--color-heading, #ffffff);
          margin: 0;
          line-height: 1.25;
        }

        .modal-sub {
          font-size: 0.74rem;
          color: var(--color-text-secondary, #9ca3af);
          margin: 3px 0 0 0;
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
          flex-shrink: 0;
          transition: all 0.15s ease;
        }

        .modal-close-btn:hover {
          color: var(--color-heading, #ffffff);
          border-color: var(--color-primary);
        }

        .expense-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 600px) {
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
          color: var(--color-heading, #ffffff);
          margin-bottom: 5px;
        }

        .btn-custom-toggle {
          background: none;
          border: none;
          color: var(--color-primary, #2563eb);
          font-size: 0.70rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .btn-custom-toggle:hover {
          text-decoration: underline;
        }

        .form-input {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-input-background, #0a0c12);
          color: var(--color-heading, #ffffff);
          font-size: 0.82rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .form-input:focus {
          border-color: var(--color-primary, #2563eb);
        }

        .form-select {
          cursor: pointer;
        }

        .amount-section-box {
          background-color: var(--color-surface-secondary, #141722);
          border: 1px solid var(--color-border, #202433);
          border-radius: 12px;
          padding: 14px;
        }

        .amount-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-prefix {
          position: absolute;
          left: 12px;
          font-size: 1.1rem;
          font-weight: 800;
          color: #ef4444;
        }

        .amount-input {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 32px;
          border-radius: 8px;
          border: 1.5px solid var(--color-border, #202433);
          background-color: var(--color-input-background, #0a0c12);
          color: #ef4444;
          font-size: 1.1rem;
          font-weight: 800;
          outline: none;
          box-sizing: border-box;
        }

        .amount-input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .amount-words-card {
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .words-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .words-text {
          font-size: 0.82rem;
          color: #ffffff;
          font-weight: 700;
          font-style: italic;
        }

        .words-hint {
          font-size: 0.70rem;
          color: var(--color-text-muted, #6b7280);
          margin: 6px 0 0 0;
        }

        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-input-background, #0a0c12);
          color: var(--color-heading, #ffffff);
          font-size: 0.80rem;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
        }

        .form-textarea:focus {
          border-color: var(--color-primary, #2563eb);
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 6px;
        }

        .btn-cancel {
          height: 40px;
          padding: 0 18px;
          border-radius: 8px;
          border: 1px solid var(--color-border, #202433);
          background-color: var(--color-surface-secondary, #141722);
          color: var(--color-text-secondary, #9ca3af);
          font-size: 0.80rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-submit {
          height: 40px;
          padding: 0 22px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
          transition: all 0.15s ease;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .btn-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

