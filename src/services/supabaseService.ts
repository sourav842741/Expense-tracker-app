import { supabase } from '@/lib/supabase';
import { PaymentPlan, PaymentCycle } from '@/types/payment';
import { MoneyCircle, CircleMember } from '@/types/circle';
import { SavingsGoal } from '@/types/goal';

export const supabaseService = {
  /**
   * Tests the Supabase connection by checking if the client can reach the database.
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Successfully connected to Supabase.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  },

  /**
   * Fetch payment plans and their cycles from Supabase
   */
  async getPaymentPlans(): Promise<PaymentPlan[] | null> {
    try {
      const { data: plansData, error: plansErr } = await supabase
        .from('payment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (plansErr || !plansData) return null;

      const { data: cyclesData } = await supabase.from('payment_cycles').select('*');

      const plans: PaymentPlan[] = plansData.map((p) => {
        const matchingCycles = (cyclesData || [])
          .filter((c) => c.payment_plan_id === p.id)
          .map((c) => ({
            id: c.id,
            paymentPlanId: c.payment_plan_id,
            cycleNumber: c.cycle_number,
            dueDate: c.due_date,
            amount: Number(c.amount),
            status: c.status,
            paidAt: c.paid_at,
            paymentMethod: c.payment_method,
            referenceNumber: c.reference_number,
            proofUrl: c.proof_url,
            notes: c.notes,
          }));

        return {
          id: p.id,
          userId: p.user_id || 'user_sourav_1',
          title: p.title,
          description: p.description,
          amount: Number(p.amount),
          category: p.category,
          frequency: p.frequency,
          startDate: p.start_date,
          endDate: p.end_date,
          totalCycles: p.total_cycles,
          dueDay: p.due_day,
          paymentMethod: p.payment_method,
          reminderDaysBefore: p.reminder_days_before,
          status: p.status,
          createdAt: p.created_at,
          cycles: matchingCycles,
        };
      });

      return plans;
    } catch (err) {
      console.warn('Error fetching payment plans from Supabase:', err);
      return null;
    }
  },

  /**
   * Insert new payment plan and generated cycles to Supabase
   */
  async createPaymentPlan(plan: PaymentPlan) {
    try {
      const { error: planError } = await supabase.from('payment_plans').insert({
        id: plan.id,
        user_id: plan.userId,
        title: plan.title,
        description: plan.description,
        amount: plan.amount,
        category: plan.category,
        frequency: plan.frequency,
        start_date: plan.startDate,
        end_date: plan.endDate,
        total_cycles: plan.totalCycles,
        due_day: plan.dueDay,
        payment_method: plan.paymentMethod,
        reminder_days_before: plan.reminderDaysBefore,
        status: plan.status,
      });

      if (planError) {
        console.warn('Supabase plan insert error:', planError);
        return;
      }

      if (plan.cycles && plan.cycles.length > 0) {
        const cyclesToInsert = plan.cycles.map((c) => ({
          id: c.id,
          payment_plan_id: plan.id,
          cycle_number: c.cycleNumber,
          due_date: c.dueDate,
          amount: c.amount,
          status: c.status,
          payment_method: c.paymentMethod,
        }));

        await supabase.from('payment_cycles').insert(cyclesToInsert);
      }
    } catch (err) {
      console.warn('Failed to push payment plan to Supabase:', err);
    }
  },

  /**
   * Update cycle status to paid in Supabase
   */
  async markCyclePaid(cycleId: string, details: { method: string; referenceNumber?: string; notes?: string }) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await supabase
        .from('payment_cycles')
        .update({
          status: 'paid',
          paid_at: todayStr,
          payment_method: details.method,
          reference_number: details.referenceNumber,
          notes: details.notes,
        })
        .eq('id', cycleId);
    } catch (err) {
      console.warn('Failed to update cycle status in Supabase:', err);
    }
  },

  /**
   * Fetch Circles and Members
   */
  async getCircles(): Promise<MoneyCircle[] | null> {
    try {
      const { data: circlesData, error: cErr } = await supabase.from('circles').select('*');
      if (cErr || !circlesData) return null;

      const { data: membersData } = await supabase.from('circle_members').select('*');

      const circles: MoneyCircle[] = circlesData.map((c) => {
        const members: CircleMember[] = (membersData || [])
          .filter((m) => m.circle_id === c.id)
          .map((m) => ({
            id: m.id,
            name: m.name,
            expectedAmount: Number(m.expected_amount),
            paidAmount: Number(m.paid_amount),
            status: m.status,
            lastPaymentDate: m.last_payment_date,
            history: [],
          }));

        return {
          id: c.id,
          name: c.name,
          description: c.description,
          targetAmount: Number(c.target_amount),
          collectedAmount: Number(c.collected_amount),
          frequency: c.frequency,
          dueDay: c.due_day,
          dueDate: c.due_date,
          category: c.category,
          createdAt: c.created_at,
          members,
        };
      });

      return circles;
    } catch (err) {
      console.warn('Error fetching circles from Supabase:', err);
      return null;
    }
  },

  /**
   * Validate credentials against Supabase profiles database
   */
  async validateAndLogin(email: string, password?: string) {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .limit(1);

      if (error) {
        return { success: false, error: 'DB_ERROR', message: error.message };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found in database. Please Sign Up first.',
        };
      }

      const userProfile = data[0];

      // If user has a password in database, verify it
      if (password && userProfile.password_hash && userProfile.password_hash !== password) {
        return {
          success: false,
          error: 'INVALID_PASSWORD',
          message: 'Incorrect password. Please check your credentials.',
        };
      }

      return { success: true, profile: userProfile };
    } catch (err: any) {
      return { success: false, error: 'NETWORK_ERROR', message: err.message || 'Connection error' };
    }
  },

  /**
   * Validate and authenticate via 4-Digit PIN directly against database
   */
  async loginWithPin(pin: string) {
    try {
      const cleanPin = pin.trim();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('pin_code', cleanPin)
        .limit(1);

      if (error) {
        return { success: false, error: 'DB_ERROR', message: error.message };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'INVALID_PIN',
          message: 'No registered user found with this 4-Digit PIN. Please sign up or use email.',
        };
      }

      return { success: true, profile: data[0] };
    } catch (err: any) {
      return { success: false, error: 'NETWORK_ERROR', message: err.message || 'Connection error' };
    }
  },

  /**
   * Register new user directly into Supabase database
   */
  async signupUser(userData: {
    name: string;
    email: string;
    password?: string;
    pinCode?: string;
    monthlyIncome?: number;
  }) {
    try {
      const cleanEmail = userData.email.trim().toLowerCase();

      // Check if already registered
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', cleanEmail)
        .limit(1);

      if (existing && existing.length > 0) {
        return {
          success: false,
          error: 'USER_EXISTS',
          message: 'An account with this email already exists in database. Please Sign In.',
        };
      }

      const newId = `user_${Date.now()}`;
      const newRecord = {
        id: newId,
        name: userData.name.trim(),
        email: cleanEmail,
        password_hash: userData.password || '',
        pin_code: userData.pinCode || '1234',
        currency: '₹',
        available_balance: 0,
        monthly_income: userData.monthlyIncome || 40000,
        planned_expenses: 0,
        savings_target: 0,
      };

      const { error: insertErr } = await supabase.from('profiles').insert(newRecord);

      if (insertErr) {
        return { success: false, error: 'INSERT_ERROR', message: insertErr.message };
      }

      return { success: true, profile: newRecord };
    } catch (err: any) {
      return { success: false, error: 'NETWORK_ERROR', message: err.message || 'Connection error' };
    }
  },

  /**
   * Update user's 4-digit security PIN in Supabase database
   */
  async updatePinCode(userId: string, pinCode: string) {
    try {
      await supabase.from('profiles').update({ pin_code: pinCode }).eq('id', userId);
    } catch (err) {
      console.warn('Failed to update PIN in database:', err);
    }
  },

  /**
   * Update user's profile avatar URL in Supabase database
   */
  async updateUserAvatar(userId: string, avatarUrl: string) {
    try {
      await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId);
    } catch (err) {
      console.warn('Failed to update avatar in database:', err);
    }
  },

  /**
   * Fetch payment plans scoped to a specific user
   */
  async getUserPaymentPlans(userId: string): Promise<PaymentPlan[]> {
    try {
      const { data: plansData, error: plansErr } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (plansErr || !plansData || plansData.length === 0) return [];

      const { data: cyclesData } = await supabase.from('payment_cycles').select('*');

      return plansData.map((p) => {
        const matchingCycles = (cyclesData || [])
          .filter((c) => c.payment_plan_id === p.id)
          .map((c) => ({
            id: c.id,
            paymentPlanId: c.payment_plan_id,
            cycleNumber: c.cycle_number,
            dueDate: c.due_date,
            amount: Number(c.amount),
            status: c.status,
            paidAt: c.paid_at,
            paymentMethod: c.payment_method,
            referenceNumber: c.reference_number,
            proofUrl: c.proof_url,
            notes: c.notes,
          }));

        return {
          id: p.id,
          userId: p.user_id,
          title: p.title,
          description: p.description,
          amount: Number(p.amount),
          category: p.category,
          frequency: p.frequency,
          startDate: p.start_date,
          endDate: p.end_date,
          totalCycles: p.total_cycles,
          dueDay: p.due_day,
          paymentMethod: p.payment_method,
          reminderDaysBefore: p.reminder_days_before,
          status: p.status,
          createdAt: p.created_at,
          cycles: matchingCycles,
        };
      });
    } catch (err) {
      console.warn('Error fetching user payment plans:', err);
      return [];
    }
  },

  /**
   * Fetch Circles scoped to a specific user
   */
  async getUserCircles(userId: string): Promise<MoneyCircle[]> {
    try {
      const { data: circlesData, error: cErr } = await supabase
        .from('circles')
        .select('*')
        .eq('user_id', userId);

      if (cErr || !circlesData || circlesData.length === 0) return [];

      const { data: membersData } = await supabase.from('circle_members').select('*');

      return circlesData.map((c) => {
        const members: CircleMember[] = (membersData || [])
          .filter((m) => m.circle_id === c.id)
          .map((m) => ({
            id: m.id,
            name: m.name,
            expectedAmount: Number(m.expected_amount),
            paidAmount: Number(m.paid_amount),
            status: m.status,
            lastPaymentDate: m.last_payment_date,
            history: [],
          }));

        return {
          id: c.id,
          name: c.name,
          description: c.description,
          targetAmount: Number(c.target_amount),
          collectedAmount: Number(c.collected_amount),
          frequency: c.frequency,
          dueDay: c.due_day,
          dueDate: c.due_date,
          category: c.category,
          createdAt: c.created_at,
          members,
        };
      });
    } catch (err) {
      console.warn('Error fetching user circles:', err);
      return [];
    }
  },

  /**
   * Fetch Savings Goals scoped to a specific user
   */
  async getUserGoals(userId: string): Promise<SavingsGoal[]> {
    try {
      const { data: goalsData, error: gErr } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId);

      if (gErr || !goalsData || goalsData.length === 0) return [];

      const { data: txData } = await supabase.from('savings_transactions').select('*');

      return goalsData.map((g) => ({
        id: g.id,
        title: g.title,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        targetDate: g.target_date,
        monthlyContribution: Number(g.monthly_contribution),
        category: g.category,
        createdAt: g.created_at,
        transactions: (txData || [])
          .filter((t) => t.goal_id === g.id)
          .map((t) => ({
            id: t.id,
            goalId: t.goal_id,
            amount: Number(t.amount),
            type: t.type,
            date: t.date,
            note: t.note,
          })),
      }));
    } catch (err) {
      console.warn('Error fetching user goals:', err);
      return [];
    }
  },
};
