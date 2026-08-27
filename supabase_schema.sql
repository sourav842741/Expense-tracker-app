-- ===================================================================
-- MONEYCIRCLE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ===================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT NOT NULL,
  currency TEXT DEFAULT '₹',
  available_balance NUMERIC DEFAULT 24892.90,
  monthly_income NUMERIC DEFAULT 40000,
  planned_expenses NUMERIC DEFAULT 8000,
  savings_target NUMERIC DEFAULT 5000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Payment Plans Table
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  category TEXT DEFAULT 'emi',
  frequency TEXT DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  total_cycles INTEGER DEFAULT 12,
  due_day INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'UPI',
  reminder_days_before INTEGER DEFAULT 3,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Cycles Table
CREATE TABLE IF NOT EXISTS public.payment_cycles (
  id TEXT PRIMARY KEY,
  payment_plan_id TEXT REFERENCES public.payment_plans(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'upcoming',
  paid_at DATE,
  payment_method TEXT,
  reference_number TEXT,
  proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Circles Table
CREATE TABLE IF NOT EXISTS public.circles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL,
  collected_amount NUMERIC DEFAULT 0,
  frequency TEXT DEFAULT 'monthly',
  due_day INTEGER DEFAULT 15,
  due_date DATE,
  category TEXT DEFAULT 'Family',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Circle Members Table
CREATE TABLE IF NOT EXISTS public.circle_members (
  id TEXT PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  expected_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  last_payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Circle Payments Table
CREATE TABLE IF NOT EXISTS public.circle_payments (
  id TEXT PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES public.circle_members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'paid',
  paid_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  target_date DATE,
  monthly_contribution NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'emergency',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Savings Transactions Table
CREATE TABLE IF NOT EXISTS public.savings_transactions (
  id TEXT PRIMARY KEY,
  goal_id TEXT REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT DEFAULT 'deposit',
  date DATE DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous / authenticated read and write for testing and demo
CREATE POLICY "Allow public read-write profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write payment_plans" ON public.payment_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write payment_cycles" ON public.payment_cycles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write circles" ON public.circles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write circle_members" ON public.circle_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write circle_payments" ON public.circle_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write savings_goals" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write savings_transactions" ON public.savings_transactions FOR ALL USING (true) WITH CHECK (true);

-- ===================================================================
-- INITIAL SEED DATA
-- ===================================================================
INSERT INTO public.profiles (id, email, name, currency, available_balance, monthly_income, planned_expenses, savings_target)
VALUES ('user_sourav_1', 'sourav@example.com', 'Sourav Kumar', '₹', 24892.90, 40000, 8000, 5000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payment_plans (id, user_id, title, description, amount, category, frequency, start_date, total_cycles, due_day, payment_method, reminder_days_before, status)
VALUES
  ('plan_bike_emi', 'user_sourav_1', 'Bike EMI', 'HDFC Two Wheeler Loan', 5000, 'emi', 'monthly', '2026-01-10', 24, 10, 'UPI', 3, 'active'),
  ('plan_rent', 'user_sourav_1', 'Apartment Rent', 'Monthly flat rent transfer', 10000, 'housing', 'monthly', '2026-01-12', 12, 12, 'Bank Transfer', 5, 'active'),
  ('plan_family_pool', 'user_sourav_1', 'Family Monthly Pool', 'Shared family household contribution', 3000, 'contribution', 'monthly', '2026-01-15', 12, 15, 'UPI', 3, 'active'),
  ('plan_internet', 'user_sourav_1', 'Internet Fiber', 'Airtel Xstream Fiber 200Mbps', 799, 'utility', 'monthly', '2026-01-18', 12, 18, 'Auto Debit', 2, 'active'),
  ('plan_insurance', 'user_sourav_1', 'Health Insurance', 'Star Health Family Optima', 2000, 'insurance', 'monthly', '2026-01-25', 12, 25, 'Card', 4, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.circles (id, name, description, target_amount, collected_amount, frequency, due_day, due_date, category)
VALUES
  ('circle_family', 'Family Monthly Pool', 'Joint fund for household grocery and utilities', 20000, 18000, 'monthly', 15, '2026-09-15', 'Family'),
  ('circle_flat', 'Flat Expenses', 'Apartment maintenance, cook & maid pool', 10000, 7500, 'monthly', 12, '2026-09-12', 'Roommates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.savings_goals (id, title, target_amount, current_amount, target_date, monthly_contribution, category)
VALUES
  ('goal_emergency', 'Emergency Fund', 50000, 28000, '2026-12-31', 5500, 'emergency'),
  ('goal_laptop', 'New Laptop', 80000, 35000, '2026-11-15', 7500, 'gadget'),
  ('goal_vacation', 'Goa Vacation', 30000, 12000, '2027-01-20', 3000, 'travel')
ON CONFLICT (id) DO NOTHING;
