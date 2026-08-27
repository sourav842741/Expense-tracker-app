export type NotificationType = 
  | 'PAYMENT_DUE'
  | 'PAYMENT_DUE_TODAY'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_PAID'
  | 'CIRCLE_MEMBER_PAID'
  | 'CIRCLE_MEMBER_PENDING'
  | 'MONTHLY_SUMMARY'
  | 'SAVINGS_GOAL_UPDATE'
  | 'SYSTEM_WELCOME';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string; // ISO date
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'payment' | 'circle' | 'goal';
}

export interface NotificationPreferences {
  paymentReminders: boolean;
  paymentSuccessful: boolean;
  overduePayments: boolean;
  circleMemberPayments: boolean;
  savingsUpdates: boolean;
  weeklySummary: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
