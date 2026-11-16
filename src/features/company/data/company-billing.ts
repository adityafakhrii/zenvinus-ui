/**
 * Zenvinus — Company billing data layer (mock backend).
 *
 * In production every helper below maps 1:1 to a backend endpoint:
 *   getBillingSummary() -> GET /api/company/billing/summary
 *   getInvoices()       -> GET /api/company/billing/invoices
 *   getPaymentMethod()  -> GET /api/company/billing/payment-method
 *
 * Spend-per-type reuse: getSpendBreakdown() from the dashboard feature.
 */
import type { KpiItem } from "@/features/dashboard";
import type { Invoice, PaymentMethod } from "../types/billing";


export const getBillingSummary = (): KpiItem[] => [
  {
    id: "month",
    label: "Spend This Month",
    value: "$12,480",
    delta: -4.1,
    icon: "fa-solid fa-wallet",
    tone: "orange",
    good: true,
  },
  {
    id: "outstanding",
    label: "Outstanding",
    value: "$12,480",
    icon: "fa-solid fa-file-invoice-dollar",
    tone: "amber",
    note: "INV-2026-10 · auto-charge Nov 01",
  },
  {
    id: "next",
    label: "Next Invoice",
    value: "Nov 01",
    icon: "fa-regular fa-calendar",
    tone: "blue",
    note: "October period",
  },
  {
    id: "ytd",
    label: "Spend YTD 2026",
    value: "$98,340",
    delta: 18.2,
    icon: "fa-solid fa-chart-line",
    tone: "mint",
    note: "vs. 2025 same period",
  },
];

export const getInvoices = (): Invoice[] => [
  { id: "INV-2026-10", period: "October 2026", amount: 12480, status: "Pending", statusTone: "amber", date: "Nov 01", method: "Visa •• 4242" },
  { id: "INV-2026-09", period: "September 2026", amount: 11204, status: "Paid", statusTone: "mint", date: "Oct 02, 2026", method: "Visa •• 4242" },
  { id: "INV-2026-08", period: "August 2026", amount: 10690, status: "Paid", statusTone: "mint", date: "Sep 02, 2026", method: "Visa •• 4242" },
  { id: "INV-2026-07", period: "July 2026", amount: 13980, status: "Paid", statusTone: "mint", date: "Aug 02, 2026", method: "Visa •• 4242" },
  { id: "INV-2026-06", period: "June 2026", amount: 9840, status: "Paid", statusTone: "mint", date: "Jul 02, 2026", method: "Visa •• 4242" },
  { id: "INV-2026-05", period: "May 2026", amount: 8710, status: "Paid", statusTone: "mint", date: "Jun 02, 2026", method: "Visa •• 4242" },
];

export const getPaymentMethod = (): PaymentMethod => ({
  brand: "VISA",
  last4: "4242",
  expiry: "08/28",
  holder: "Zenvinus Labs Finance",
  email: "billing@zenvinuslabs.io",
});
