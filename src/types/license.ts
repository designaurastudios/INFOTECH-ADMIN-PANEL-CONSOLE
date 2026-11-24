export type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
export type PaymentStatus = 'PAID' | 'PENDING';

export interface DeveloperSettings {
  staffManagementEnabled: boolean;
  visitLimitEnabled: boolean;
  visitLimit: number;
  directorEmail: string;
  lifetimeAccess: boolean;
  planStartDate?: string;
  planEndDate?: string;
  directorPasswordReset?: {
    status: 'PENDING' | 'COMPLETED';
    newPassword?: string;
    requestedAt?: string;
  };
}

export interface ClinicLicense {
  id: string; // Document ID (usually the licenseKey)
  licenseKey: string;
  clinicName: string;
  doctorName: string;
  phone: string;
  city: string;
  clinicEmail?: string; // Optional clinic email address
  softwareCost?: number | string; // Internal sale price / software cost for vendor records
  paymentStatus?: PaymentStatus; // 'PAID' or 'PENDING'
  category?: string; // e.g. 'Dental HMS', 'General OPD HMS', 'Ayurved HMS', etc.
  setupDate?: string; // Software installation / setup date (YYYY-MM-DD)
  status: LicenseStatus;
  planType: 'LIFETIME' | 'TRIAL';
  machineId: string;
  computerName?: string;
  issuedAt: string;
  createdAt?: string;
  lastSeenAt?: string;
  amcStatus: '1st_Year_Free' | 'Renewed' | 'Not_Active';
  developerSettings: DeveloperSettings;
  tamperDetected?: boolean;
  tamperReason?: string;
  tamperedAt?: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  expenseName: string;
  category: string;
  expenseDate: string; // ISO datetime YYYY-MM-DD or YYYY-MM-DDTHH:mm
  particulars: string;
  amount: number;
  amountInWords?: string;
  notes?: string;
  createdAt: string;
}

