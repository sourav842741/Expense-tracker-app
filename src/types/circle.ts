export type CircleFrequency = 'monthly' | 'weekly' | 'custom';

export type MemberPaymentStatus = 'paid' | 'pending' | 'overdue';

export interface CircleMember {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  expectedAmount: number;
  paidAmount: number;
  status: MemberPaymentStatus;
  lastPaymentDate?: string;
  history: {
    month: string; // "Jan", "Feb", etc.
    amount: number;
    status: MemberPaymentStatus;
    date?: string;
  }[];
}

export interface MoneyCircle {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  collectedAmount: number;
  frequency: CircleFrequency;
  dueDay: number;
  dueDate: string; // next due date YYYY-MM-DD
  members: CircleMember[];
  category: string;
  createdAt: string;
}
