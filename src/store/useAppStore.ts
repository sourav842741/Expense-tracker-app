import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { PaymentPlan, PaymentCycle, PaymentMethod } from '../types/payment';
import { MoneyCircle, CircleMember, MemberPaymentStatus } from '../types/circle';
import { SavingsGoal, SavingsAchievement, SavingsTransaction } from '../types/goal';
import { AppNotification, NotificationPreferences } from '../types/notification';
import {
  INITIAL_USER,
  INITIAL_PAYMENT_PLANS,
  INITIAL_CIRCLES,
  INITIAL_GOALS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_PREFERENCES,
} from '../constants/mockData';
import { supabaseService } from '../services/supabaseService';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  availableBalance: number;
  monthlyIncome: number;
  plannedExpenses: number;
  savingsTarget: number;
  avatarUrl?: string;
}

interface AppState {
  // State
  user: UserProfile;
  themeMode: ThemeMode;
  hideBalance: boolean;
  paymentPlans: PaymentPlan[];
  circles: MoneyCircle[];
  goals: SavingsGoal[];
  achievements: SavingsAchievement[];
  notifications: AppNotification[];
  notificationPreferences: NotificationPreferences;

  // Auth & Security
  isAuthenticated: boolean;
  isGuest: boolean;
  pinCode: string | null;
  isLocked: boolean;
  onboardingDismissed: boolean;
  userVaults: Record<
    string,
    {
      user: UserProfile;
      paymentPlans: PaymentPlan[];
      circles: MoneyCircle[];
      goals: SavingsGoal[];
      pinCode: string | null;
    }
  >;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleHideBalance: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  
  // Auth Actions
  login: (email: string, name?: string, id?: string, pinCode?: string, income?: number, balance?: number, avatarUrl?: string) => void;
  setUserPlansAndCircles: (plans: PaymentPlan[], circles: MoneyCircle[], goals: SavingsGoal[]) => void;
  signup: (userData: { name: string; email: string; id?: string; pinCode?: string; monthlyIncome?: number; plannedExpenses?: number; savingsTarget?: number }) => void;
  logout: () => void;
  continueAsGuest: () => void;

  // PIN Actions
  setPin: (pin: string) => void;
  removePin: () => void;
  unlock: (pin: string) => boolean;
  lock: () => void;

  // Onboarding Actions
  dismissOnboarding: () => void;
  loadCleanUserData: (name: string, email: string, income: number) => void;
  loadDemoData: () => void;
  
  // Payment Actions
  addPaymentPlan: (plan: Omit<PaymentPlan, 'id' | 'createdAt' | 'cycles'>) => void;
  updatePaymentPlan: (id: string, plan: Partial<PaymentPlan>) => void;
  deletePaymentPlan: (id: string) => void;
  markCyclePaid: (
    planId: string,
    cycleId: string,
    details: { method: PaymentMethod; referenceNumber?: string; notes?: string; proofUrl?: string }
  ) => void;

  // Circle Actions
  addCircle: (circle: Omit<MoneyCircle, 'id' | 'createdAt'>) => void;
  updateCircle: (id: string, circle: Partial<MoneyCircle>) => void;
  recordMemberPayment: (circleId: string, memberId: string, amount: number) => void;

  // Goal Actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'transactions'>) => void;
  depositToGoal: (goalId: string, amount: number, note?: string) => void;

  // Notification Actions
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void;

  // Reset
  resetToDefaults: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      themeMode: 'light',
      hideBalance: false,
      paymentPlans: INITIAL_PAYMENT_PLANS,
      circles: INITIAL_CIRCLES,
      goals: INITIAL_GOALS,
      achievements: INITIAL_ACHIEVEMENTS,
      notifications: INITIAL_NOTIFICATIONS,
      notificationPreferences: INITIAL_NOTIFICATION_PREFERENCES,
      isAuthenticated: true,
      isGuest: false,
      pinCode: '1234',
      isLocked: false,
      onboardingDismissed: false,
      userVaults: {
        user_sourav_1: {
          user: INITIAL_USER,
          paymentPlans: INITIAL_PAYMENT_PLANS,
          circles: INITIAL_CIRCLES,
          goals: INITIAL_GOALS,
          pinCode: '1234',
        },
      },

      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleHideBalance: () => set((state) => ({ hideBalance: !state.hideBalance })),
      updateUserProfile: (profile) =>
        set((state) => {
          const updatedUser = { ...state.user, ...profile };
          const currentVaults = { ...state.userVaults };
          if (state.user?.id) {
            currentVaults[state.user.id] = {
              user: updatedUser,
              paymentPlans: state.paymentPlans,
              circles: state.circles,
              goals: state.goals,
              pinCode: state.pinCode,
            };
          }
          return {
            user: updatedUser,
            userVaults: currentVaults,
          };
        }),

      updateUserAvatar: (avatarUrl) =>
        set((state) => {
          const updatedUser = { ...state.user, avatarUrl };
          const currentVaults = { ...state.userVaults };
          if (state.user?.id) {
            currentVaults[state.user.id] = {
              user: updatedUser,
              paymentPlans: state.paymentPlans,
              circles: state.circles,
              goals: state.goals,
              pinCode: state.pinCode,
            };
          }
          // Sync to Supabase in background
          supabaseService.updateUserAvatar(state.user.id, avatarUrl).catch(() => {});

          return {
            user: updatedUser,
            userVaults: currentVaults,
          };
        }),

      login: (email, name, id, pinCode, income, balance, avatarUrl) =>
        set((state) => {
          const userId = id || state.user?.id || 'user_sourav_1';
          const vault = state.userVaults[userId];

          const restoredPlans =
            vault && vault.paymentPlans && vault.paymentPlans.length > 0
              ? vault.paymentPlans
              : state.paymentPlans && state.paymentPlans.length > 0
              ? state.paymentPlans
              : userId === 'user_sourav_1'
              ? INITIAL_PAYMENT_PLANS
              : [];

          const restoredCircles =
            vault && vault.circles && vault.circles.length > 0
              ? vault.circles
              : state.circles && state.circles.length > 0
              ? state.circles
              : userId === 'user_sourav_1'
              ? INITIAL_CIRCLES
              : [];

          const restoredGoals =
            vault && vault.goals && vault.goals.length > 0
              ? vault.goals
              : state.goals && state.goals.length > 0
              ? state.goals
              : userId === 'user_sourav_1'
              ? INITIAL_GOALS
              : [];

          const restoredAvatar =
            avatarUrl ||
            (vault ? vault.user?.avatarUrl : undefined) ||
            state.user?.avatarUrl;

          return {
            isAuthenticated: true,
            isGuest: false,
            isLocked: false,
            pinCode: pinCode || (vault ? vault.pinCode : state.pinCode) || '1234',
            paymentPlans: restoredPlans,
            circles: restoredCircles,
            goals: restoredGoals,
            user: {
              ...state.user,
              id: userId,
              email: email || state.user.email,
              name: name || state.user.name,
              monthlyIncome: income !== undefined ? income : state.user.monthlyIncome,
              availableBalance: balance !== undefined ? balance : state.user.availableBalance,
              avatarUrl: restoredAvatar,
            },
          };
        }),

      setUserPlansAndCircles: (plans, circles, goals) =>
        set((state) => {
          const currentVaults = { ...state.userVaults };
          if (state.user?.id) {
            currentVaults[state.user.id] = {
              user: state.user,
              paymentPlans: plans,
              circles: circles,
              goals: goals,
              pinCode: state.pinCode,
            };
          }
          return {
            paymentPlans: plans,
            circles: circles,
            goals: goals,
            userVaults: currentVaults,
          };
        }),

      signup: (userData) =>
        set((state) => {
          const newUserId = userData.id || `user_${Date.now()}`;
          const newUser: UserProfile = {
            id: newUserId,
            name: userData.name,
            email: userData.email,
            currency: '₹',
            availableBalance: 0,
            monthlyIncome: userData.monthlyIncome || 35000,
            plannedExpenses: userData.plannedExpenses || 0,
            savingsTarget: userData.savingsTarget || 0,
          };
          const currentVaults = { ...state.userVaults };
          currentVaults[newUserId] = {
            user: newUser,
            paymentPlans: [],
            circles: [],
            goals: [],
            pinCode: userData.pinCode || '1234',
          };
          return {
            isAuthenticated: true,
            isGuest: false,
            isLocked: false,
            pinCode: userData.pinCode || '1234',
            onboardingDismissed: false,
            user: newUser,
            paymentPlans: [],
            circles: [],
            goals: [],
            achievements: [],
            userVaults: currentVaults,
            notifications: [
              {
                id: 'n_welcome',
                type: 'SYSTEM_WELCOME',
                title: 'Welcome to MoneyCircle!',
                message: 'Your smart financial commitments and savings manager is ready.',
                date: new Date().toISOString(),
                read: false,
              },
            ],
          };
        }),

      logout: () =>
        set((state) => {
          const currentVaults = { ...state.userVaults };
          if (state.user?.id) {
            currentVaults[state.user.id] = {
              user: state.user,
              paymentPlans: state.paymentPlans,
              circles: state.circles,
              goals: state.goals,
              pinCode: state.pinCode,
            };
          }
          return {
            isAuthenticated: false,
            isGuest: false,
            isLocked: false,
            userVaults: currentVaults,
          };
        }),

      continueAsGuest: () =>
        set({
          isAuthenticated: true,
          isGuest: true,
        }),

      setPin: (pin) =>
        set({
          pinCode: pin,
          isLocked: false,
        }),

      removePin: () =>
        set({
          pinCode: null,
          isLocked: false,
        }),

      unlock: (pin) => {
        const { pinCode } = get();
        if (!pinCode || pinCode === pin) {
          set({ isLocked: false });
          return true;
        }
        return false;
      },

      lock: () => {
        const { pinCode } = get();
        if (pinCode) {
          set({ isLocked: true });
        }
      },

      dismissOnboarding: () => set({ onboardingDismissed: true }),

      loadCleanUserData: (name, email, income) =>
        set(() => ({
          user: {
            id: `user_${Date.now()}`,
            name,
            email,
            currency: '₹',
            availableBalance: 0,
            monthlyIncome: income,
            plannedExpenses: 0,
            savingsTarget: 0,
          },
          paymentPlans: [],
          circles: [],
          goals: [],
          achievements: [],
          onboardingDismissed: false,
        })),

      loadDemoData: () =>
        set({
          user: INITIAL_USER,
          paymentPlans: INITIAL_PAYMENT_PLANS,
          circles: INITIAL_CIRCLES,
          goals: INITIAL_GOALS,
          achievements: INITIAL_ACHIEVEMENTS,
          notifications: INITIAL_NOTIFICATIONS,
          onboardingDismissed: true,
        }),

      addPaymentPlan: (newPlanData) => {
        const id = `plan_${Date.now()}`;
        const createdAt = new Date().toISOString().split('T')[0];
        
        // Generate monthly cycles for the plan
        const cycles: PaymentCycle[] = [];
        const start = new Date(newPlanData.startDate + 'T00:00:00');
        
        for (let i = 1; i <= Math.min(newPlanData.totalCycles, 12); i++) {
          const dueDate = new Date(start.getFullYear(), start.getMonth() + (i - 1), newPlanData.dueDay);
          const dueDateStr = dueDate.toISOString().split('T')[0];
          
          cycles.push({
            id: `c_${id}_${i}`,
            paymentPlanId: id,
            cycleNumber: i,
            dueDate: dueDateStr,
            amount: newPlanData.amount,
            status: i === 1 ? 'due_soon' : 'upcoming',
            paymentMethod: newPlanData.paymentMethod,
          });
        }

        set((state) => {
          const newPlan: PaymentPlan = {
            ...newPlanData,
            id,
            userId: state.user.id,
            createdAt,
            cycles,
          };

          const updatedPlans = [newPlan, ...state.paymentPlans];
          const currentVaults = { ...state.userVaults };
          if (state.user?.id) {
            currentVaults[state.user.id] = {
              user: state.user,
              paymentPlans: updatedPlans,
              circles: state.circles,
              goals: state.goals,
              pinCode: state.pinCode,
            };
          }

          // Persist to Supabase cloud in background
          supabaseService.createPaymentPlan(newPlan).catch(() => {});

          return {
            paymentPlans: updatedPlans,
            userVaults: currentVaults,
            notifications: [
              {
                id: `notif_${Date.now()}`,
                type: 'PAYMENT_DUE',
                title: 'New payment plan created',
                message: `${newPlan.title} (${newPlan.amount}) added to your active commitments.`,
                date: new Date().toISOString(),
                read: false,
                relatedEntityId: id,
                relatedEntityType: 'payment',
              },
              ...state.notifications,
            ],
          };
        });
      },

      updatePaymentPlan: (id, updatedFields) => {
        set((state) => ({
          paymentPlans: state.paymentPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updatedFields } : plan
          ),
        }));
      },

      deletePaymentPlan: (id) => {
        set((state) => ({
          paymentPlans: state.paymentPlans.filter((plan) => plan.id !== id),
        }));
      },

      markCyclePaid: (planId, cycleId, details) => {
        const todayStr = new Date().toISOString().split('T')[0];
        let planTitle = 'Payment';
        let cycleAmount = 0;

        set((state) => {
          const updatedPlans = state.paymentPlans.map((plan) => {
            if (plan.id !== planId) return plan;
            planTitle = plan.title;

            const updatedCycles = plan.cycles.map((cycle) => {
              if (cycle.id !== cycleId) return cycle;
              cycleAmount = cycle.amount;

              return {
                ...cycle,
                status: 'paid' as const,
                paidAt: todayStr,
                paymentMethod: details.method,
                referenceNumber: details.referenceNumber,
                proofUrl: details.proofUrl,
                notes: details.notes,
              };
            });

            return {
              ...plan,
              cycles: updatedCycles,
            };
          });

          const newNotification: AppNotification = {
            id: `notif_${Date.now()}`,
            type: 'PAYMENT_PAID',
            title: 'Payment recorded',
            message: `${planTitle} of ₹${cycleAmount.toLocaleString('en-IN')} marked as paid.`,
            date: new Date().toISOString(),
            read: false,
            relatedEntityId: planId,
            relatedEntityType: 'payment',
          };

          return {
            paymentPlans: updatedPlans,
            availableBalance: Math.max(0, state.user.availableBalance - cycleAmount),
            notifications: [newNotification, ...state.notifications],
          };
        });
      },

      addCircle: (circleData) => {
        const id = `circle_${Date.now()}`;
        const newCircle: MoneyCircle = {
          ...circleData,
          id,
          createdAt: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          circles: [newCircle, ...state.circles],
          notifications: [
            {
              id: `notif_${Date.now()}`,
              type: 'CIRCLE_MEMBER_PAID',
              title: 'Money Circle created',
              message: `New circle "${newCircle.name}" created with target ₹${newCircle.targetAmount.toLocaleString('en-IN')}.`,
              date: new Date().toISOString(),
              read: false,
              relatedEntityId: id,
              relatedEntityType: 'circle',
            },
            ...state.notifications,
          ],
        }));
      },

      updateCircle: (id, partial) => {
        set((state) => ({
          circles: state.circles.map((c) => (c.id === id ? { ...c, ...partial } : c)),
        }));
      },

      recordMemberPayment: (circleId, memberId, amount) => {
        const todayStr = new Date().toISOString().split('T')[0];
        let circleName = '';
        let memberName = '';

        set((state) => {
          const updatedCircles = state.circles.map((circle) => {
            if (circle.id !== circleId) return circle;
            circleName = circle.name;

            const updatedMembers = circle.members.map((member) => {
              if (member.id !== memberId) return member;
              memberName = member.name;
              const newPaid = member.paidAmount + amount;
              const isFullyPaid = newPaid >= member.expectedAmount;
              const paymentStatus: MemberPaymentStatus = isFullyPaid ? 'paid' : 'pending';

              const newHistory = [
                {
                  month: new Date().toLocaleString('en-US', { month: 'short' }),
                  amount,
                  status: paymentStatus,
                  date: todayStr,
                },
                ...member.history,
              ];

              return {
                ...member,
                paidAmount: newPaid,
                status: paymentStatus,
                lastPaymentDate: todayStr,
                history: newHistory,
              };
            });

            const newCollected = updatedMembers.reduce((sum, m) => sum + m.paidAmount, 0);

            return {
              ...circle,
              collectedAmount: newCollected,
              members: updatedMembers,
            };
          });

          const newNotification: AppNotification = {
            id: `notif_${Date.now()}`,
            type: 'CIRCLE_MEMBER_PAID',
            title: `${memberName} paid contribution`,
            message: `${memberName} contributed ₹${amount.toLocaleString('en-IN')} to ${circleName}.`,
            date: new Date().toISOString(),
            read: false,
            relatedEntityId: circleId,
            relatedEntityType: 'circle',
          };

          return {
            circles: updatedCircles,
            notifications: [newNotification, ...state.notifications],
          };
        });
      },

      addSavingsGoal: (goalData) => {
        const id = `goal_${Date.now()}`;
        const newGoal: SavingsGoal = {
          ...goalData,
          id,
          createdAt: new Date().toISOString().split('T')[0],
          transactions: [],
        };

        set((state) => ({
          goals: [newGoal, ...state.goals],
          notifications: [
            {
              id: `notif_${Date.now()}`,
              type: 'SAVINGS_GOAL_UPDATE',
              title: 'Savings Goal set',
              message: `Goal "${newGoal.title}" started with target ₹${newGoal.targetAmount.toLocaleString('en-IN')}.`,
              date: new Date().toISOString(),
              read: false,
              relatedEntityId: id,
              relatedEntityType: 'goal',
            },
            ...state.notifications,
          ],
        }));
      },

      depositToGoal: (goalId, amount, note) => {
        const todayStr = new Date().toISOString().split('T')[0];
        let goalTitle = '';

        set((state) => {
          const updatedGoals = state.goals.map((goal) => {
            if (goal.id !== goalId) return goal;
            goalTitle = goal.title;

            const newAmount = goal.currentAmount + amount;
            const newTx: SavingsTransaction = {
              id: `tx_${Date.now()}`,
              goalId,
              amount,
              type: 'deposit',
              date: todayStr,
              note: note || 'Manual deposit',
            };

            return {
              ...goal,
              currentAmount: newAmount,
              transactions: [newTx, ...goal.transactions],
            };
          });

          const newNotification: AppNotification = {
            id: `notif_${Date.now()}`,
            type: 'SAVINGS_GOAL_UPDATE',
            title: 'Savings added',
            message: `Added ₹${amount.toLocaleString('en-IN')} to ${goalTitle}.`,
            date: new Date().toISOString(),
            read: false,
            relatedEntityId: goalId,
            relatedEntityType: 'goal',
          };

          return {
            goals: updatedGoals,
            notifications: [newNotification, ...state.notifications],
          };
        });
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      deleteNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      addNotification: (notif) => {
        const fullNotif: AppNotification = {
          ...notif,
          id: `notif_${Date.now()}`,
          date: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [fullNotif, ...state.notifications],
        }));
      },

      updateNotificationPreferences: (prefs) => {
        set((state) => ({
          notificationPreferences: { ...state.notificationPreferences, ...prefs },
        }));
      },

      resetToDefaults: () => {
        set({
          user: INITIAL_USER,
          paymentPlans: INITIAL_PAYMENT_PLANS,
          circles: INITIAL_CIRCLES,
          goals: INITIAL_GOALS,
          achievements: INITIAL_ACHIEVEMENTS,
          notifications: INITIAL_NOTIFICATIONS,
          notificationPreferences: INITIAL_NOTIFICATION_PREFERENCES,
        });
      },
    }),
    {
      name: 'moneycircle-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          if (Platform.OS === 'web' && typeof window === 'undefined') return null;
          return AsyncStorage.getItem(name);
        },
        setItem: async (name: string, value: string) => {
          if (Platform.OS === 'web' && typeof window === 'undefined') return;
          return AsyncStorage.setItem(name, value);
        },
        removeItem: async (name: string) => {
          if (Platform.OS === 'web' && typeof window === 'undefined') return;
          return AsyncStorage.removeItem(name);
        },
      })),
    }
  )
);
