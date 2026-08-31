import { supabase } from '@/lib/supabase';
import { PaymentPlan, PaymentCycle } from '@/types/payment';
import { MoneyCircle, CircleMember } from '@/types/circle';
import { SavingsGoal, SavingsTransaction } from '@/types/goal';

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

  // ==========================================
  // PAYMENT PLANS CRUD (STRICTLY SCOPED TO USER)
  // ==========================================

  /**
   * Fetch payment plans scoped ONLY to the logged in user
   */
  async getUserPaymentPlans(userId: string): Promise<PaymentPlan[]> {
    if (!userId) return [];
    try {
      const { data: plansData, error: plansErr } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (plansErr || !plansData || plansData.length === 0) return [];

      const planIds = plansData.map((p) => p.id);
      const { data: cyclesData } = await supabase
        .from('payment_cycles')
        .select('*')
        .in('payment_plan_id', planIds)
        .order('cycle_number', { ascending: true });

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
            paidAt: c.paid_at || undefined,
            paymentMethod: c.payment_method || undefined,
            referenceNumber: c.reference_number || undefined,
            proofUrl: c.proof_url || undefined,
            notes: c.notes || undefined,
          }));

        return {
          id: p.id,
          userId: p.user_id,
          title: p.title,
          description: p.description || '',
          amount: Number(p.amount),
          category: p.category,
          frequency: p.frequency,
          startDate: p.start_date,
          endDate: p.end_date || undefined,
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
   * Insert new payment plan and generated cycles scoped to the user
   */
  async createPaymentPlan(plan: PaymentPlan) {
    try {
      const { error: planError } = await supabase.from('payment_plans').upsert({
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
        console.warn('Supabase plan upsert error:', planError);
      }

      if (plan.cycles && plan.cycles.length > 0) {
        const cyclesToInsert = plan.cycles.map((c) => ({
          id: c.id,
          payment_plan_id: plan.id,
          cycle_number: c.cycleNumber,
          due_date: c.dueDate,
          amount: c.amount,
          status: c.status,
          paid_at: c.paidAt || null,
          payment_method: c.paymentMethod || null,
          reference_number: c.referenceNumber || null,
          proof_url: c.proofUrl || null,
          notes: c.notes || null,
        }));

        await supabase.from('payment_cycles').upsert(cyclesToInsert);
      }
    } catch (err) {
      console.warn('Failed to push payment plan to Supabase:', err);
    }
  },

  /**
   * Update existing payment plan
   */
  async updatePaymentPlan(id: string, fields: Partial<PaymentPlan>) {
    try {
      const payload: any = {};
      if (fields.title !== undefined) payload.title = fields.title;
      if (fields.description !== undefined) payload.description = fields.description;
      if (fields.amount !== undefined) payload.amount = fields.amount;
      if (fields.category !== undefined) payload.category = fields.category;
      if (fields.frequency !== undefined) payload.frequency = fields.frequency;
      if (fields.startDate !== undefined) payload.start_date = fields.startDate;
      if (fields.endDate !== undefined) payload.end_date = fields.endDate;
      if (fields.totalCycles !== undefined) payload.total_cycles = fields.totalCycles;
      if (fields.dueDay !== undefined) payload.due_day = fields.dueDay;
      if (fields.paymentMethod !== undefined) payload.payment_method = fields.paymentMethod;
      if (fields.reminderDaysBefore !== undefined) payload.reminder_days_before = fields.reminderDaysBefore;
      if (fields.status !== undefined) payload.status = fields.status;

      if (Object.keys(payload).length > 0) {
        await supabase.from('payment_plans').update(payload).eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to update payment plan in Supabase:', err);
    }
  },

  /**
   * Delete payment plan
   */
  async deletePaymentPlan(id: string) {
    try {
      await supabase.from('payment_cycles').delete().eq('payment_plan_id', id);
      await supabase.from('payment_plans').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete payment plan in Supabase:', err);
    }
  },

  /**
   * Update cycle status to paid in Supabase (persisting proof URL, ref number, and method)
   */
  async markCyclePaid(
    cycleId: string,
    details: { method: string; referenceNumber?: string; notes?: string; proofUrl?: string }
  ) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await supabase
        .from('payment_cycles')
        .update({
          status: 'paid',
          paid_at: todayStr,
          payment_method: details.method,
          reference_number: details.referenceNumber || null,
          notes: details.notes || null,
          proof_url: details.proofUrl || null,
        })
        .eq('id', cycleId);
    } catch (err) {
      console.warn('Failed to update cycle status in Supabase:', err);
    }
  },

  // ==========================================
  // MONEY CIRCLES CRUD (STRICTLY SCOPED TO USER)
  // ==========================================

  /**
   * Fetch Circles scoped ONLY to the logged in user
   */
  async getUserCircles(userId: string): Promise<MoneyCircle[]> {
    if (!userId) return [];
    try {
      const { data: circlesData, error: cErr } = await supabase
        .from('circles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cErr || !circlesData || circlesData.length === 0) return [];

      const circleIds = circlesData.map((c) => c.id);
      const { data: membersData } = await supabase
        .from('circle_members')
        .select('*')
        .in('circle_id', circleIds);

      const { data: paymentsData } = await supabase
        .from('circle_payments')
        .select('*')
        .in('circle_id', circleIds)
        .order('created_at', { ascending: false });

      return circlesData.map((c) => {
        const members: CircleMember[] = (membersData || [])
          .filter((m) => m.circle_id === c.id)
          .map((m) => {
            const memberPayments = (paymentsData || []).filter(
              (p) => p.member_id === m.id && p.circle_id === c.id
            );

            const history = memberPayments.map((p) => {
              const pDate = p.paid_at ? new Date(p.paid_at) : new Date(p.created_at);
              const monthStr = pDate.toLocaleString('en-US', { month: 'short' });
              return {
                month: monthStr,
                amount: Number(p.amount),
                status: 'paid' as const,
                date: p.paid_at || p.created_at,
              };
            });

            return {
              id: m.id,
              name: m.name,
              expectedAmount: Number(m.expected_amount),
              paidAmount: Number(m.paid_amount),
              status: m.status,
              lastPaymentDate: m.last_payment_date || undefined,
              history,
            };
          });

        return {
          id: c.id,
          userId: c.user_id,
          name: c.name,
          description: c.description || '',
          targetAmount: Number(c.target_amount),
          collectedAmount: Number(c.collected_amount),
          frequency: c.frequency || 'monthly',
          dueDay: c.due_day || 15,
          dueDate: c.due_date || '',
          category: c.category || 'Family',
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
   * Insert new Money Circle and its members scoped to the user
   */
  async createCircle(circle: MoneyCircle, userId: string) {
    try {
      const ownerId = userId || circle.userId;
      const { error: cError } = await supabase.from('circles').upsert({
        id: circle.id,
        user_id: ownerId,
        name: circle.name,
        description: circle.description || '',
        target_amount: circle.targetAmount,
        collected_amount: circle.collectedAmount || 0,
        frequency: circle.frequency,
        due_day: circle.dueDay,
        due_date: circle.dueDate,
        category: circle.category,
      });

      if (cError) {
        console.warn('Supabase circle insert error:', cError);
      }

      if (circle.members && circle.members.length > 0) {
        const membersToInsert = circle.members.map((m) => ({
          id: m.id,
          circle_id: circle.id,
          name: m.name,
          expected_amount: m.expectedAmount,
          paid_amount: m.paidAmount || 0,
          status: m.status || 'pending',
          last_payment_date: m.lastPaymentDate || null,
        }));

        await supabase.from('circle_members').upsert(membersToInsert);
      }
    } catch (err) {
      console.warn('Failed to save circle in Supabase:', err);
    }
  },

  /**
   * Update Money Circle fields
   */
  async updateCircle(id: string, fields: Partial<MoneyCircle>) {
    try {
      const payload: any = {};
      if (fields.name !== undefined) payload.name = fields.name;
      if (fields.description !== undefined) payload.description = fields.description;
      if (fields.targetAmount !== undefined) payload.target_amount = fields.targetAmount;
      if (fields.collectedAmount !== undefined) payload.collected_amount = fields.collectedAmount;
      if (fields.frequency !== undefined) payload.frequency = fields.frequency;
      if (fields.dueDay !== undefined) payload.due_day = fields.dueDay;
      if (fields.dueDate !== undefined) payload.due_date = fields.dueDate;
      if (fields.category !== undefined) payload.category = fields.category;

      if (Object.keys(payload).length > 0) {
        await supabase.from('circles').update(payload).eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to update circle in Supabase:', err);
    }
  },

  /**
   * Delete Money Circle
   */
  async deleteCircle(id: string) {
    try {
      await supabase.from('circle_payments').delete().eq('circle_id', id);
      await supabase.from('circle_members').delete().eq('circle_id', id);
      await supabase.from('circles').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete circle in Supabase:', err);
    }
  },

  /**
   * Record member payment contribution in Supabase
   */
  async recordMemberPayment(
    circleId: string,
    memberId: string,
    amount: number,
    newPaidAmount: number,
    status: string,
    newCollectedTotal: number
  ) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Update member record
      await supabase
        .from('circle_members')
        .update({
          paid_amount: newPaidAmount,
          status: status,
          last_payment_date: todayStr,
        })
        .eq('id', memberId);

      // 2. Insert into circle_payments
      await supabase.from('circle_payments').insert({
        id: `cp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        circle_id: circleId,
        member_id: memberId,
        amount: amount,
        status: 'paid',
        paid_at: todayStr,
      });

      // 3. Update circle collected total
      await supabase
        .from('circles')
        .update({ collected_amount: newCollectedTotal })
        .eq('id', circleId);
    } catch (err) {
      console.warn('Failed to record member payment in Supabase:', err);
    }
  },

  // ==========================================
  // SAVINGS GOALS CRUD (STRICTLY SCOPED TO USER)
  // ==========================================

  /**
   * Fetch Savings Goals scoped ONLY to the logged in user
   */
  async getUserGoals(userId: string): Promise<SavingsGoal[]> {
    if (!userId) return [];
    try {
      const { data: goalsData, error: gErr } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (gErr || !goalsData || goalsData.length === 0) return [];

      const goalIds = goalsData.map((g) => g.id);
      const { data: txData } = await supabase
        .from('savings_transactions')
        .select('*')
        .in('goal_id', goalIds)
        .order('date', { ascending: false });

      return goalsData.map((g) => ({
        id: g.id,
        userId: g.user_id,
        title: g.title,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        targetDate: g.target_date || '',
        monthlyContribution: Number(g.monthly_contribution || 0),
        category: g.category || 'emergency',
        createdAt: g.created_at,
        transactions: (txData || [])
          .filter((t) => t.goal_id === g.id)
          .map((t) => ({
            id: t.id,
            goalId: t.goal_id,
            amount: Number(t.amount),
            type: t.type,
            date: t.date,
            note: t.note || undefined,
          })),
      }));
    } catch (err) {
      console.warn('Error fetching user goals:', err);
      return [];
    }
  },

  /**
   * Insert new Savings Goal scoped to the user
   */
  async createGoal(goal: SavingsGoal, userId: string) {
    try {
      const ownerId = userId || goal.userId;
      const { error: gError } = await supabase.from('savings_goals').upsert({
        id: goal.id,
        user_id: ownerId,
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount || 0,
        target_date: goal.targetDate,
        monthly_contribution: goal.monthlyContribution || 0,
        category: goal.category,
      });

      if (gError) {
        console.warn('Supabase savings goal upsert error:', gError);
      }
    } catch (err) {
      console.warn('Failed to save savings goal in Supabase:', err);
    }
  },

  /**
   * Update Savings Goal fields
   */
  async updateGoal(id: string, fields: Partial<SavingsGoal>) {
    try {
      const payload: any = {};
      if (fields.title !== undefined) payload.title = fields.title;
      if (fields.targetAmount !== undefined) payload.target_amount = fields.targetAmount;
      if (fields.currentAmount !== undefined) payload.current_amount = fields.currentAmount;
      if (fields.targetDate !== undefined) payload.target_date = fields.targetDate;
      if (fields.monthlyContribution !== undefined) payload.monthly_contribution = fields.monthlyContribution;
      if (fields.category !== undefined) payload.category = fields.category;

      if (Object.keys(payload).length > 0) {
        await supabase.from('savings_goals').update(payload).eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to update goal in Supabase:', err);
    }
  },

  /**
   * Delete Savings Goal
   */
  async deleteGoal(id: string) {
    try {
      await supabase.from('savings_transactions').delete().eq('goal_id', id);
      await supabase.from('savings_goals').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete goal in Supabase:', err);
    }
  },

  /**
   * Deposit or withdraw from savings goal
   */
  async depositToGoal(goalId: string, amount: number, newCurrentAmount: number, note?: string) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Update goal balance
      await supabase
        .from('savings_goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId);

      // 2. Insert transaction
      await supabase.from('savings_transactions').insert({
        id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        goal_id: goalId,
        amount: amount,
        type: 'deposit',
        date: todayStr,
        note: note || 'Manual deposit',
      });
    } catch (err) {
      console.warn('Failed to record goal deposit in Supabase:', err);
    }
  },

  // ==========================================
  // USER PROFILES & AUTH
  // ==========================================

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

  async signupUser(userData: {
    name: string;
    email: string;
    password?: string;
    pinCode?: string;
    monthlyIncome?: number;
  }) {
    try {
      const cleanEmail = userData.email.trim().toLowerCase();

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

  async updatePinCode(userId: string, pinCode: string) {
    try {
      await supabase.from('profiles').update({ pin_code: pinCode }).eq('id', userId);
    } catch (err) {
      console.warn('Failed to update PIN in database:', err);
    }
  },

  async updateUserAvatar(userId: string, avatarUrl: string) {
    try {
      await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId);
    } catch (err) {
      console.warn('Failed to update avatar in database:', err);
    }
  },
};
