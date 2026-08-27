import { PaymentPlan } from '../types/payment';
import { MoneyCircle } from '../types/circle';
import { SavingsGoal, SavingsAchievement } from '../types/goal';
import { AppNotification, NotificationPreferences } from '../types/notification';

export const INITIAL_USER = {
  id: 'user_sourav_1',
  name: 'Sourav Kumar',
  email: 'sourav@example.com',
  currency: '₹',
  availableBalance: 0,
  monthlyIncome: 0,
  plannedExpenses: 0,
  savingsTarget: 0,
};

export const INITIAL_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  paymentReminders: true,
  paymentSuccessful: true,
  overduePayments: true,
  circleMemberPayments: true,
  savingsUpdates: false,
  weeklySummary: true,
  emailNotifications: true,
  pushNotifications: true,
};

// Generate relative dates for realistic presentation
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const prevMonth = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, '0');
const prevYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;

export const INITIAL_PAYMENT_PLANS: PaymentPlan[] = [];

export const INITIAL_CIRCLES: MoneyCircle[] = [];

export const INITIAL_GOALS: SavingsGoal[] = [];

export const INITIAL_ACHIEVEMENTS: SavingsAchievement[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
