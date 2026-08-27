export type GoalCategory = 
  | 'emergency'
  | 'gadget'
  | 'travel'
  | 'vehicle'
  | 'education'
  | 'lifestyle'
  | 'custom';

export interface SavingsTransaction {
  id: string;
  goalId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  category: GoalCategory;
  createdAt: string;
  transactions: SavingsTransaction[];
}

export interface SavingsAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}
