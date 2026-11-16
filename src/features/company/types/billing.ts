import type { Tone } from '@/features/dashboard';

export interface Invoice {
  id: string;
  /** English i18n key, e.g. "October 2026" */
  period: string;
  amount: number;
  /** English i18n key: "Paid" | "Pending" */
  status: string;
  statusTone: Tone;
  date: string;
  method: string;
}

export interface PaymentMethod {
  brand: string;
  last4: string;
  expiry: string;
  holder: string;
  email: string;
}
