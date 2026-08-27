# Implementation Plan: MoneyCircle React Native Expo App

MoneyCircle is a mobile-first payment, EMI, recurring-bill, group-contribution, and savings management app built with **React Native + Expo + TypeScript**, designed strictly according to the UI/UX specifications in [design(2).md](file:///c:/Expense-tracker-app/design(2).md) and product architecture in [MoneyCircle_README.md](file:///c:/Expense-tracker-app/MoneyCircle_README.md).

## User Review Required

> [!IMPORTANT]
> The app will be initialized with Expo SDK 52 (latest), Expo Router, TypeScript, Zustand with AsyncStorage for local persistence, Lucide icons, and React Native SVG for lightweight, high-performance charts. Pre-seeded realistic demo data will ensure the app immediately displays the complete dashboard, EMI cycles, Money Circles, and Savings Goals as outlined in the design spec.

## Proposed Architecture & Directory Structure

```text
Expense-tracker-app/
├── app/
│   ├── _layout.tsx                     # Root layout with ThemeProvider, fonts, toast
│   ├── (tabs)/
│   │   ├── _layout.tsx                 # 5-tab bar (Home, Payments, Circles, Goals, Profile) + Quick Add FAB
│   │   ├── index.tsx                   # Home Dashboard (Balance Card, Safe-to-Spend, Upcoming, Progress, Recent)
│   │   ├── payments.tsx                # Payments list (Segmented filters: All, Upcoming, Paid, Overdue)
│   │   ├── circles.tsx                 # Money Circles (Family Pool, Flat Expenses, Group Targets)
│   │   ├── goals.tsx                   # Savings Goals (Emergency Fund, Laptop, Streaks & Achievements)
│   │   └── profile.tsx                 # Profile & Settings (Preferences, Theme, Notifications, Security, Data)
│   ├── payments/
│   │   ├── [id].tsx                    # Payment Details (Cycle timeline, proof preview, mark as paid)
│   │   └── create.tsx                  # Add Payment / EMI Plan Form
│   ├── circles/
│   │   ├── [id].tsx                    # Circle Details (Target progress, member payments, add contribution)
│   │   └── create.tsx                  # Create Money Circle
│   ├── goals/
│   │   ├── [id].tsx                    # Goal Details & Deposit Modal
│   │   └── create.tsx                  # Create Savings Goal
│   ├── analytics.tsx                   # Deep Dive Analytics & Trends (SVG charts, breakdown)
│   ├── calendar.tsx                    # Payment Calendar View (Monthly calendar with due day markers)
│   ├── notifications.tsx               # Notification Center (Due soon, paid confirmations, overdue alerts)
│   └── search.tsx                      # Global Search Modal with filter chips
├── components/
│   ├── ui/
│   │   ├── Card.tsx                    # Rounded card with 1px border (#E8E8E5) and subtle depth
│   │   ├── Button.tsx                  # Primary & Secondary button components (52px height, 15px radius)
│   │   ├── Input.tsx                   # Standardized input fields with focus states
│   │   ├── ProgressBar.tsx             # Animated progress bar
│   │   ├── StatusBadge.tsx             # Paid, Due Soon, Overdue, Upcoming status pills
│   │   ├── SegmentedControl.tsx        # Pill-shaped tab switches
│   │   ├── BottomSheetModal.tsx        # Add action sheet & deposit sheets
│   │   └── EmptyState.tsx              # Clean empty state with icon and action button
│   ├── dashboard/
│   │   ├── AvailableMoneyCard.tsx      # Large balance with Income, Payments, Saved breakdown
│   │   ├── SafeToSpendCard.tsx         # Differentiator card with calculation details
│   │   ├── PaymentProgressCard.tsx     # Monthly completion percentage bar
│   │   └── UpcomingPaymentRow.tsx      # Compact payment row with countdown pill
│   ├── payments/
│   │   ├── PaymentCycleTimeline.tsx    # 12/24-month payment cycle visualizer
│   │   └── PaymentProofCard.tsx        # Mock receipt / proof attachment display
│   ├── charts/
│   │   ├── TrendLineChart.tsx          # Minimal SVG curved line chart
│   │   └── CategoryBarChart.tsx        # SVG horizontal category distribution
│   └── circles/
│       ├── MemberRow.tsx               # Member avatar, expected amount, payment status
│       └── CircleContributionModal.tsx # Record member payment
├── constants/
│   ├── theme.ts                        # Design tokens: colors, typography, spacing (8pt), radius, shadows
│   └── mockData.ts                     # Pre-populated realistic Indian Rupee (₹) financial data
├── store/
│   ├── useAppStore.ts                  # Zustand persistent store (Payments, Circles, Goals, Notifications, Settings)
│   └── themeStore.ts                   # Light/Dark mode state management
├── types/
│   ├── payment.ts                      # PaymentPlan, PaymentCycle, PaymentStatus
│   ├── circle.ts                       # MoneyCircle, CircleMember, CirclePayment
│   ├── goal.ts                         # SavingsGoal, SavingsTransaction
│   └── notification.ts                 # AppNotification, NotificationPreferences
└── utils/
    ├── currency.ts                     # Formatting INR (e.g. ₹5,000, ₹24,892.90)
    ├── dates.ts                        # Due-date countdown calculations ("Due in 4 days", "Due today")
    └── safeToSpend.ts                  # Safe-to-Spend formula logic
```

---

## Key Feature Implementation Plan

### 1. Design System & Tokens ([design(2).md](file:///c:/Expense-tracker-app/design(2).md))
- Strict implementation of color palettes:
  - Light: App Background `#F7F7F5`, Card `#FFFFFF`, Secondary Surface `#F2F2EF`, Border `#E8E8E5`, Text `#171717`/`#737373`/`#A3A3A3`.
  - Dark: Background `#111111`, Card `#1A1A1A`, Secondary `#222222`, Border `#2C2C2C`, Text `#F5F5F5`/`#A3A3A3`.
  - Semantic: Success `#2F9E63`, Warning `#D9912B`, Danger `#D95757`, Info `#5D7EDB`.
- 8-point spacing system: `4, 8, 12, 16, 20, 24, 32, 40`.
- Rounded cards (`18-22px`), inputs (`14px`), buttons (`14-16px`, 52px height), chips (`10-12px`).
- Icons: `lucide-react-native`.

### 2. Smart Dashboard (Home)
- Header with user greeting ("Good morning, Sourav"), notification bell (with unread badge), and search icon.
- **Available Money Card**: Large balance display (e.g. `₹24,892.90`), with sub-metrics for Income (`+₹40,000`), Payments (`-₹13,000`), and Saved (`₹8,000`).
- **Safe-to-Spend Insight Card**: Highlights available budget (`₹14,000 available this month`) with calculation breakdown drawer: `Income - Required Payments - Planned Expenses - Savings Target`.
- **Upcoming Payments**: Cards with due date countdown pills ("Due in 4 days", "Due Sep 10").
- **Monthly Progress**: Progress bar (`₹18,000 / ₹25,000 (72%)` completed).
- **Recent Payments**: Fast glance at recently cleared or pending transactions.

### 3. Payments & EMI Manager
- Tabbed filters: All, Upcoming, Paid, Overdue.
- Payment detail screen with 12/24-month cycle tracker (Paid ✓, Pending ◐, Upcoming ○).
- Manually record payment: mark cycle as paid with payment method (UPI, Bank Transfer, Card, Cash), reference ID, and payment receipt attachment.
- Create payment plan: Title, amount, category (EMI, Rent, Insurance, Subscription, Utility), frequency (Monthly, Weekly, Yearly), due day, reminders.

### 4. Shared Money Circles
- Track group contributions (e.g., "Family Monthly Pool", "Flat Expenses", "Goa Trip Fund").
- Target amount, current collected amount, progress bar, remaining amount.
- Member list with individual expected vs. paid amounts and statuses.
- Record member payment modal with instant tally update.

### 5. Savings Goals & Streaks
- Goals (e.g., "Emergency Fund", "New Laptop", "Vacation").
- Target vs. current saved amounts, completion percentage, target date.
- "+ Add Savings" deposit modal.
- Savings streaks & milestone badges ("🔥 7 Month Savings Streak", "🏆 First ₹10K Saved").

### 6. Analytics, Calendar & Notifications
- **Analytics**: Week/Month/Year toggle, clean SVG trend lines for payments and savings, category spending breakdown.
- **Calendar**: Interactive calendar grid marking due dates with category icons, displaying payments due on selected date.
- **Notification Center**: Event-driven alerts (Payment due in 3 days, Payment due today, Member paid, Overdue alert).
- **Settings & Profile**: Currency selector (INR ₹ default), Dark/Light theme switcher, notification preferences (Email & Push toggles), Data export, reset demo data.

---

## Verification Plan

### Automated Verification
1. `npm run lint` / TypeScript check (`npx tsc --noEmit`) to verify zero type or build errors.
2. Expo app start validation (`npx expo start` / web preview or headless bundling check) to guarantee clean compilation.

### Manual / Browser Verification
1. Start the Expo development server with web support (`npx expo start --web`).
2. Use browser subagent to interactively verify:
   - Dashboard layout, Available Money card, and Safe-to-Spend computation.
   - Tab navigation between Home, Payments, Circles, Goals, and Profile.
   - Creating a new payment plan and marking a payment cycle as paid.
   - Recording a circle member contribution and adding a savings deposit.
   - Switching between Light and Dark mode.
   - Verifying clean responsive styling across mobile screen dimensions (375px - 430px).
