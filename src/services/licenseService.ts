import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { ref, set, update, remove } from 'firebase/database';
import { db, rtdb } from '../config/firebase';
import { ClinicLicense, LicenseStatus, DeveloperSettings } from '../types/license';
import { generateLicenseKey, decodeLicensePayload } from './cryptoService';

export function encodeRtdbKey(key: string): string {
  return key.trim().replace(/\./g, '~');
}

const COLLECTION_NAME = 'licenses';
const LOCAL_STORAGE_KEY = 'dental_hms_admin_clinics_cache';
const SETTINGS_COLLECTION = 'system_settings';
const CATEGORIES_DOC_ID = 'categories';
const CATEGORIES_STORAGE_KEY = 'dental_hms_admin_categories_cache';

export const DEFAULT_CATEGORIES = ['Dental HMS', 'General OPD HMS', 'Ayurved HMS'];

function getCachedCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_CATEGORIES;
}

function saveCachedCategories(categories: string[]): void {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // ignore
  }
}

function getCachedClinics(): ClinicLicense[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

function saveCachedClinics(clinics: ClinicLicense[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clinics));
  } catch {
    // ignore
  }
}

export const licenseService = {
  /**
   * Subscribe to realtime clinics list from Firestore
   */
  subscribeToClinics: (callback: (clinics: ClinicLicense[]) => void): (() => void) => {
    // Emit local cache immediately for instant UI
    const cached = getCachedClinics();
    if (cached.length > 0) {
      callback(cached);
    }

    try {
      const colRef = collection(db, COLLECTION_NAME);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const list: ClinicLicense[] = [];
          snapshot.forEach((d) => {
            if (d.id.startsWith('__')) return; // Ignore internal system docs (e.g. __company_ledger__)
            list.push({ ...(d.data() as ClinicLicense), id: d.id });
          });
          callback(list);
          saveCachedClinics(list);
        },
        (error) => {
          console.error('[Firebase Firestore] Error fetching licenses:', error);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('[Firebase Firestore] Error subscribing to licenses:', err);
      return () => {};
    }
  },

  /**
   * Create a new clinic record and generate a signed Lifetime License Key in Firestore
   */
  createClinic: async (data: {
    clinicName: string;
    doctorName: string;
    phone: string;
    city: string;
    machineId: string;
    clinicEmail?: string;
    softwareCost?: number | string;
    paymentStatus?: 'PAID' | 'PENDING';
    category?: string;
    setupDate?: string;
    notes?: string;
  }): Promise<ClinicLicense> => {
    const key = await generateLicenseKey(data.clinicName, data.machineId, 'LIFETIME');

    const today = new Date().toISOString().split('T')[0];
    const newClinic: ClinicLicense = {
      id: key,
      licenseKey: key,
      clinicName: data.clinicName.trim(),
      doctorName: data.doctorName.trim(),
      phone: data.phone.trim(),
      city: data.city.trim(),
      clinicEmail: data.clinicEmail ? data.clinicEmail.trim() : '',
      softwareCost: data.softwareCost !== undefined && data.softwareCost !== '' ? data.softwareCost : '',
      paymentStatus: data.paymentStatus || 'PAID',
      category: data.category?.trim() || 'Dental HMS',
      setupDate: data.setupDate?.trim() || today,
      status: 'ACTIVE',
      planType: 'LIFETIME',
      machineId: data.machineId.trim().toUpperCase(),
      issuedAt: today,
      lastSeenAt: 'Never connected yet',
      amcStatus: '1st_Year_Free',
      developerSettings: {
        staffManagementEnabled: true,
        visitLimitEnabled: false,
        visitLimit: 0,
        directorEmail: '',
        lifetimeAccess: true,
      },
      notes: data.notes || '',
    };

    const docRef = doc(db, COLLECTION_NAME, key);
    await setDoc(docRef, newClinic);

    // Mirror to Firebase Realtime Database (RTDB - Solution C Mode 1)
    if (rtdb) {
      try {
        const rtdbKey = encodeRtdbKey(key);
        await set(ref(rtdb, `licenses/${rtdbKey}`), newClinic);
      } catch (rtdbErr) {
        console.warn('[RTDB Mirror] Failed to mirror createClinic:', rtdbErr);
      }
    }

    const list = getCachedClinics();
    list.unshift(newClinic);
    saveCachedClinics(list);

    return newClinic;
  },

  /**
   * Import an existing license key into Firestore management
   */
  importExistingLicense: async (
    licenseKey: string,
    details?: {
      doctorName?: string;
      phone?: string;
      city?: string;
      clinicEmail?: string;
      softwareCost?: number | string;
      paymentStatus?: 'PAID' | 'PENDING';
      category?: string;
      setupDate?: string;
      notes?: string;
    }
  ): Promise<ClinicLicense> => {
    const payload = decodeLicensePayload(licenseKey);
    if (!payload) {
      throw new Error('Invalid license key format. Must start with DHMS-LIC.');
    }

    const today = new Date().toISOString().split('T')[0];
    const cleanKey = licenseKey.trim();
    const clinic: ClinicLicense = {
      id: cleanKey,
      licenseKey: cleanKey,
      clinicName: payload.clinicName,
      doctorName: details?.doctorName?.trim() || 'Clinic Owner',
      phone: details?.phone?.trim() || '',
      city: details?.city?.trim() || '',
      clinicEmail: details?.clinicEmail?.trim() || '',
      softwareCost: details?.softwareCost !== undefined && details?.softwareCost !== '' ? details?.softwareCost : '',
      paymentStatus: details?.paymentStatus || 'PAID',
      category: details?.category?.trim() || 'Dental HMS',
      setupDate: details?.setupDate?.trim() || payload.issuedAt || today,
      status: 'ACTIVE',
      planType: payload.planType,
      machineId: payload.machineId,
      issuedAt: payload.issuedAt,
      lastSeenAt: 'Imported from existing installation',
      amcStatus: '1st_Year_Free',
      developerSettings: {
        staffManagementEnabled: true,
        visitLimitEnabled: false,
        visitLimit: 0,
        directorEmail: '',
        lifetimeAccess: true,
      },
      notes: details?.notes || 'Imported existing active license',
    };

    const docRef = doc(db, COLLECTION_NAME, cleanKey);
    await setDoc(docRef, clinic);

    // Mirror to Firebase Realtime Database (RTDB - Solution C Mode 1)
    if (rtdb) {
      try {
        const rtdbKey = encodeRtdbKey(cleanKey);
        await set(ref(rtdb, `licenses/${rtdbKey}`), clinic);
      } catch (rtdbErr) {
        console.warn('[RTDB Mirror] Failed to mirror importExistingLicense:', rtdbErr);
      }
    }

    const list = getCachedClinics();
    list.unshift(clinic);
    saveCachedClinics(list);

    return clinic;
  },

  /**
   * Update license status (ACTIVE, SUSPENDED, REVOKED) in Firestore
   */
  updateStatus: async (licenseKey: string, status: LicenseStatus): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, licenseKey);
    await updateDoc(docRef, { status });

    // Mirror to Firebase Realtime Database (RTDB - Solution C Mode 1)
    if (rtdb) {
      try {
        const rtdbKey = encodeRtdbKey(licenseKey);
        await update(ref(rtdb, `licenses/${rtdbKey}`), { status });
      } catch (rtdbErr) {
        console.warn('[RTDB Mirror] Failed to mirror updateStatus:', rtdbErr);
      }
    }

    const list = getCachedClinics().map((c) =>
      c.licenseKey === licenseKey ? { ...c, status } : c
    );
    saveCachedClinics(list);
  },

  /**
   * Reset hardware binding (allows clinic to bind a new PC) in Firestore
   */
  resetHardwareBinding: async (licenseKey: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, licenseKey);
    await updateDoc(docRef, {
      machineId: 'PENDING_NEW_DEVICE',
      computerName: '',
      lastSeenAt: 'Reset for new machine transfer',
    });

    const list = getCachedClinics().map((c) =>
      c.licenseKey === licenseKey
        ? {
            ...c,
            machineId: 'PENDING_NEW_DEVICE',
            computerName: '',
            lastSeenAt: 'Reset for new machine transfer',
          }
        : c
    );
    saveCachedClinics(list);
  },

  /**
   * Update clinic client profile info (Name, Doctor, Phone, City, Email, Cost, Category, SetupDate, Notes)
   */
  updateClinicInfo: async (
    licenseKey: string,
    updates: {
      clinicName?: string;
      doctorName?: string;
      phone?: string;
      city?: string;
      clinicEmail?: string;
      softwareCost?: number | string;
      paymentStatus?: 'PAID' | 'PENDING';
      category?: string;
      setupDate?: string;
      notes?: string;
    }
  ): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, licenseKey);
    const payload: Record<string, any> = {};

    if (updates.clinicName !== undefined) payload.clinicName = updates.clinicName.trim();
    if (updates.doctorName !== undefined) payload.doctorName = updates.doctorName.trim();
    if (updates.phone !== undefined) payload.phone = updates.phone.trim();
    if (updates.city !== undefined) payload.city = updates.city.trim();
    if (updates.clinicEmail !== undefined) payload.clinicEmail = updates.clinicEmail.trim();
    if (updates.softwareCost !== undefined) payload.softwareCost = updates.softwareCost;
    if (updates.paymentStatus !== undefined) payload.paymentStatus = updates.paymentStatus;
    if (updates.category !== undefined) payload.category = updates.category.trim();
    if (updates.setupDate !== undefined) payload.setupDate = updates.setupDate.trim();
    if (updates.notes !== undefined) payload.notes = updates.notes;

    if (Object.keys(payload).length > 0) {
      await updateDoc(docRef, payload);
    }

    const list = getCachedClinics().map((c) =>
      c.licenseKey === licenseKey ? { ...c, ...payload } : c
    );
    saveCachedClinics(list);
  },

  /**
   * Fast toggle payment status between PAID and PENDING
   */
  togglePaymentStatus: async (licenseKey: string, newStatus: 'PAID' | 'PENDING'): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, licenseKey);
    await updateDoc(docRef, { paymentStatus: newStatus });

    const list = getCachedClinics().map((c) =>
      c.licenseKey === licenseKey ? { ...c, paymentStatus: newStatus } : c
    );
    saveCachedClinics(list);
  },

  /**
   * Fetch all categories (default + dynamically created)
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC_ID);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data?.list) && data.list.length > 0) {
          saveCachedCategories(data.list);
          return data.list;
        }
      }
    } catch (err) {
      console.warn('[Categories] Using local fallback:', err);
    }
    return getCachedCategories();
  },

  /**
   * Add a new category dynamically and save to Firestore & Local Cache
   */
  addCategory: async (newCategory: string): Promise<string[]> => {
    const clean = newCategory.trim();
    if (!clean) return getCachedCategories();

    const current = await licenseService.getCategories();
    const exists = current.some((c) => c.toLowerCase() === clean.toLowerCase());
    if (exists) return current;

    // Newly added category shows first
    const updated = [clean, ...current.filter((c) => c.toLowerCase() !== clean.toLowerCase())];
    saveCachedCategories(updated);

    try {
      const docRef = doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC_ID);
      await setDoc(docRef, { list: updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('[Categories] Failed to sync new category to Firestore:', err);
    }

    return updated;
  },

  /**
   * Update remote developer settings in Firestore
   * Strictly sanitizes all fields to prevent Firestore updateDoc/setDoc undefined rejections
   */
  updateDeveloperSettings: async (
    licenseKey: string,
    settings: Partial<DeveloperSettings>
  ): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, licenseKey);
    const sanitizedSettings: Record<string, any> = {};

    if (settings.staffManagementEnabled !== undefined) {
      sanitizedSettings.staffManagementEnabled = Boolean(settings.staffManagementEnabled);
    }
    if (settings.directorEmail !== undefined) {
      sanitizedSettings.directorEmail = (settings.directorEmail || '').trim();
    }
    if (settings.visitLimitEnabled !== undefined) {
      sanitizedSettings.visitLimitEnabled = Boolean(settings.visitLimitEnabled);
    }
    if (settings.visitLimit !== undefined) {
      sanitizedSettings.visitLimit = Number(settings.visitLimit) || 0;
    }
    if (settings.lifetimeAccess !== undefined) {
      sanitizedSettings.lifetimeAccess = Boolean(settings.lifetimeAccess);
    }
    if (settings.planStartDate !== undefined) {
      sanitizedSettings.planStartDate = String(settings.planStartDate || '');
    }
    if (settings.planEndDate !== undefined) {
      sanitizedSettings.planEndDate = String(settings.planEndDate || '');
    }

    if (Object.keys(sanitizedSettings).length > 0) {
      await setDoc(docRef, { developerSettings: sanitizedSettings }, { merge: true });

      // Mirror to Firebase Realtime Database (RTDB - Solution C Mode 1)
      if (rtdb) {
        try {
          const rtdbKey = encodeRtdbKey(licenseKey);
          await update(ref(rtdb, `licenses/${rtdbKey}/developerSettings`), sanitizedSettings);
        } catch (rtdbErr) {
          console.warn('[RTDB Mirror] Failed to mirror devSettings to RTDB:', rtdbErr);
        }
      }
    }

    const list = getCachedClinics().map((c) =>
      c.licenseKey === licenseKey
        ? {
            ...c,
            developerSettings: {
              ...(c.developerSettings || {
                staffManagementEnabled: true,
                visitLimitEnabled: false,
                visitLimit: 0,
                directorEmail: '',
                lifetimeAccess: true,
              }),
              ...sanitizedSettings,
            },
          }
        : c
    );
    saveCachedClinics(list);
  },

  /**
   * Trigger Remote Emergency Primary Director Password Reset in Firestore & RTDB
   */
  triggerDirectorPasswordReset: async (
    licenseKey: string,
    newPassword: string
  ): Promise<void> => {
    const cleanPass = newPassword.trim();
    const resetPayload = {
      status: 'PENDING' as const,
      newPassword: cleanPass,
      requestedAt: new Date().toISOString(),
    };

    const docRef = doc(db, COLLECTION_NAME, licenseKey);
    try {
      await updateDoc(docRef, {
        'developerSettings.directorPasswordReset': resetPayload,
      });
    } catch {
      await setDoc(
        docRef,
        {
          developerSettings: {
            directorPasswordReset: resetPayload,
          },
        },
        { merge: true }
      );
    }

    if (rtdb) {
      try {
        const rtdbKey = encodeRtdbKey(licenseKey);
        await set(ref(rtdb, `licenses/${rtdbKey}/developerSettings/directorPasswordReset`), resetPayload);
      } catch (rtdbErr) {
        console.warn('[RTDB Mirror] Failed to mirror reset password to RTDB:', rtdbErr);
      }
    }

    const list = getCachedClinics().map((c) =>
      c.licenseKey === licenseKey
        ? {
            ...c,
            developerSettings: {
              ...c.developerSettings,
              directorPasswordReset: resetPayload,
            },
          }
        : c
    );
    saveCachedClinics(list);
  },

  /**
   * Permanently delete and blacklist a license key in Firestore
   */
  deleteLicense: async (licenseKey: string): Promise<void> => {
    const cleanKey = licenseKey.trim();
    const rtdbKey = encodeRtdbKey(cleanKey);

    // 1. Record in 'revoked_licenses' collection in Firestore & RTDB
    try {
      const revokedDocRef = doc(db, 'revoked_licenses', cleanKey);
      await setDoc(revokedDocRef, {
        licenseKey: cleanKey,
        status: 'REVOKED',
        revokedAt: new Date().toISOString(),
        reason: 'Permanently deleted by software vendor',
      });
      if (rtdb) {
        await set(ref(rtdb, `revoked_licenses/${rtdbKey}`), {
          licenseKey: cleanKey,
          status: 'REVOKED',
          revokedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error recording to revoked_licenses:', err);
    }

    // 2. Remove document from active 'licenses' collection in Firestore & RTDB
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanKey);
      await deleteDoc(docRef);
      if (rtdb) {
        await remove(ref(rtdb, `licenses/${rtdbKey}`));
      }
    } catch (err) {
      console.error('Error removing document from licenses:', err);
    }

    // 3. Remove from local cache
    const list = getCachedClinics().filter((c) => c.licenseKey !== cleanKey);
    saveCachedClinics(list);
  },
};
