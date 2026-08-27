export type PaymentCategory = 
  | 'emi'
  | 'housing'
  | 'insurance'
  | 'subscription'
  | 'utility'
  | 'education'
  | 'contribution'
  | 'other';

export type PaymentFrequency = 'monthly' | 'weekly' | 'yearly' | 'custom';

export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cash' | 'Card' | 'Auto Debit' | 'Other';

export type PaymentCycleStatus = 
  | 'upcoming'
  | 'due_soon'
  | 'due_today'
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface PaymentCycle {
  id: string;
  paymentPlanId: string;
  cycleNumber: number;
  dueDate: string; // ISO date string YYYY-MM-DD
  amount: number;
  status: PaymentCycleStatus;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  proofUrl?: string;
  notes?: string;
}

export interface PaymentPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  category: PaymentCategory;
  frequency: PaymentFrequency;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  totalCycles: number;
  dueDay: number; // 1-31
  paymentMethod: PaymentMethod;
  reminderDaysBefore: number; // e.g. 3, 7
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  cycles: PaymentCycle[];
}
