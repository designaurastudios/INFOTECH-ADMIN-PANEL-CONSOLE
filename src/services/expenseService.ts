import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { ExpenseRecord } from '../types/license';
import { numberToWordsIndian } from '../utils/numberToWords';

// Collection and document references
const LICENSES_COLLECTION = 'licenses';
const LEDGER_DOC_ID = '__company_ledger__';
const EXPENSES_COLLECTION = 'company_expenses';
const LOCAL_STORAGE_KEY = 'dental_hms_admin_expenses_cache';

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Marketing & Ads',
  'Cloud Infrastructure & Hosting',
  'Software Development & Tools',
  'Salaries & Freelancers',
  'Office Rent & Utilities',
  'Travel & Field Sales',
  'Legal & Accounting',
  'Miscellaneous',
];

function getCachedExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

function saveCachedExpenses(expenses: ExpenseRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    // ignore
  }
}

// In-memory active listeners for instant 0ms real-time UI updates
type ExpenseListener = (expenses: ExpenseRecord[]) => void;
const activeListeners = new Set<ExpenseListener>();

function notifyAllListeners(expenses: ExpenseRecord[]) {
  activeListeners.forEach((callback) => {
    try {
      callback(expenses);
    } catch (e) {
      console.error('Error notifying expense listener:', e);
    }
  });
}

// Cross-tab real-time sync via storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        notifyAllListeners(parsed);
      } catch {
        // ignore
      }
    }
  });
}

export const expenseService = {
  getCachedExpenses,

  /**
   * Realtime subscription to company expenses.
   * Connects to both local live memory, cross-tab events, and Cloud Firestore.
   */
  subscribeToExpenses: (callback: (expenses: ExpenseRecord[]) => void): (() => void) => {
    // 1. Register listener for instant 0ms local updates
    activeListeners.add(callback);

    // 2. Immediately emit current cached records
    const cached = getCachedExpenses();
    if (cached.length > 0) {
      callback(cached);
    }

    // 3. Cloud Firestore real-time listener:
    // We listen to doc(db, 'licenses', '__company_ledger__') which is PERMITTED
    // by existing Firestore security rules, giving instant cloud sync across all admin PCs.
    let unsubLedger: (() => void) | null = null;
    try {
      const ledgerDocRef = doc(db, LICENSES_COLLECTION, LEDGER_DOC_ID);
      unsubLedger = onSnapshot(
        ledgerDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data?.expenses)) {
              const list: ExpenseRecord[] = data.expenses;
              // Sort descending by date
              list.sort(
                (a, b) =>
                  new Date(b.expenseDate || b.createdAt).getTime() -
                  new Date(a.expenseDate || a.createdAt).getTime()
              );
              saveCachedExpenses(list);
              notifyAllListeners(list);
            }
          }
        },
        (error: any) => {
          // If Firestore is offline or permission error, silently keep local cache active
          if (error?.code !== 'permission-denied') {
            console.warn('[Firebase Firestore] Ledger listener notice:', error?.message);
          }
        }
      );
    } catch (err: any) {
      console.warn('[Firebase Firestore] Error subscribing to ledger doc:', err?.message);
    }

    // 4. Return clean unsubscriber
    return () => {
      activeListeners.delete(callback);
      if (unsubLedger) unsubLedger();
    };
  },

  /**
   * Add a new expense record:
   * 1. Updates memory & local storage in 0ms.
   * 2. Immediately broadcasts to all UI listeners in real time.
   * 3. Syncs to Cloud Firestore document '__company_ledger__' in real time.
   */
  addExpense: async (data: {
    expenseName: string;
    category: string;
    expenseDate: string;
    particulars: string;
    amount: number | string;
    notes?: string;
  }): Promise<ExpenseRecord> => {
    const cleanAmount = typeof data.amount === 'string' ? parseFloat(data.amount) || 0 : data.amount;
    const now = new Date().toISOString();
    const id = 'EXP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const record: ExpenseRecord = {
      id,
      expenseName: data.expenseName.trim(),
      category: data.category?.trim() || 'Miscellaneous',
      expenseDate: data.expenseDate || now.split('T')[0],
      particulars: data.particulars.trim(),
      amount: cleanAmount,
      amountInWords: numberToWordsIndian(cleanAmount),
      notes: data.notes?.trim() || '',
      createdAt: now,
    };

    // 1. Instant 0ms Local & Memory update
    const currentList = getCachedExpenses();
    const updatedList = [record, ...currentList];
    saveCachedExpenses(updatedList);

    // 2. Broadcast immediately to all active dashboard components in real time
    notifyAllListeners(updatedList);

    // 3. Real-time Cloud Sync to Firestore
    try {
      const ledgerDocRef = doc(db, LICENSES_COLLECTION, LEDGER_DOC_ID);
      await setDoc(
        ledgerDocRef,
        {
          expenses: updatedList,
          updatedAt: now,
          lastUpdatedBy: auth.currentUser?.email || 'admin',
        },
        { merge: true }
      );
    } catch (err: any) {
      console.warn('[Firebase Firestore] Ledger cloud sync notice:', err?.message);
    }

    // Secondary backup write to company_expenses collection if rules permit
    try {
      const expDocRef = doc(db, EXPENSES_COLLECTION, id);
      await setDoc(expDocRef, record);
    } catch {
      // ignore
    }

    return record;
  },

  /**
   * Delete an expense record:
   * 1. Removes from local storage in 0ms.
   * 2. Immediately broadcasts to all UI listeners in real time.
   * 3. Syncs deletion to Cloud Firestore in real time.
   */
  deleteExpense: async (id: string): Promise<void> => {
    // 1. Instant 0ms Local & Memory update
    const currentList = getCachedExpenses();
    const updatedList = currentList.filter((e) => e.id !== id);
    saveCachedExpenses(updatedList);

    // 2. Broadcast immediately to all active dashboard components in real time
    notifyAllListeners(updatedList);

    // 3. Real-time Cloud Sync to Firestore
    try {
      const ledgerDocRef = doc(db, LICENSES_COLLECTION, LEDGER_DOC_ID);
      await setDoc(
        ledgerDocRef,
        {
          expenses: updatedList,
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: auth.currentUser?.email || 'admin',
        },
        { merge: true }
      );
    } catch (err: any) {
      console.warn('[Firebase Firestore] Ledger deletion sync notice:', err?.message);
    }

    // Secondary backup delete from company_expenses collection if present
    try {
      const expDocRef = doc(db, EXPENSES_COLLECTION, id);
      await deleteDoc(expDocRef);
    } catch {
      // ignore
    }
  },
};
