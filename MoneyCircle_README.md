# 💰 MoneyCircle — Payment, EMI & Savings Manager

MoneyCircle is a mobile-first **payment, EMI, recurring-bill, group-contribution, and savings management app** built with **React Native + Expo + TypeScript**.

The goal is simple: help users know **what they need to pay, who has paid, how much is pending, when the next payment is due, and how much money they can safely spend or save**.

It is designed to be useful for individuals, families, friends, roommates, and small groups that manage recurring payments together.

---

## 🚀 Product Vision

Most EMI/payment apps focus only on recording a payment.

MoneyCircle goes further:

> **Track → Remind → Collect → Analyze → Save**

A user should be able to open the app and immediately understand:

- How much they need to pay this month
- How much they have already paid
- What payments are coming next
- How many days remain until each due date
- Which members have paid and who is pending
- How much they have saved
- How much they can safely spend
- Whether they are staying on track with their financial goals

---

# ✨ Core Features

## 1. 📊 Smart Dashboard

The home screen provides a complete financial snapshot.

Example:

```text
Good Morning 👋

September Overview

Income                 ₹40,000
Payments               ₹13,000
Expenses               ₹14,500
Savings                 ₹8,000

Safe to Spend          ₹14,000

Upcoming
────────────────────────────
🏠 Rent                 ₹10,000
   Due in 4 days

💳 EMI                   ₹5,000
   Due in 8 days

👨‍👩‍👧 Family Pool          ₹3,000
   Due in 12 days
```

### Dashboard metrics

- Total monthly income
- Total scheduled payments
- Total paid
- Total pending
- Total savings
- Upcoming payments
- Safe-to-spend amount
- Payment completion percentage
- Savings progress
- Active payment plans

---

# 2. 💳 Payment / EMI Plans

Users can create recurring payment plans.

Examples:

- Personal EMI
- Car EMI
- Bike EMI
- Home rent
- Insurance
- School/college fees
- Subscription
- Family contribution
- Monthly group payment
- Custom recurring payment

### Payment plan fields

```text
Title
Description
Amount
Frequency
Start Date
End Date / Number of Cycles
Due Day
Category
Payment Method
Reminder Settings
Notes
```

### Example

```text
Title: Bike EMI
Amount: ₹5,000
Frequency: Monthly
Due Day: 10
Duration: 24 months
Start: January 2026
```

The app automatically creates the monthly payment schedule.

---

# 3. 📅 Monthly Payment Cycle

Every recurring plan has a payment history.

Example:

```text
Bike EMI — ₹5,000/month

January     ✓ Paid
February    ✓ Paid
March       ✓ Paid
April       ✓ Paid
May         ✓ Paid
June        ✓ Paid
July        ✓ Paid
August      ◐ Pending
September   ○ Upcoming
October     ○ Upcoming
```

Progress:

```text
7 / 24 payments completed

██████████░░░░░░ 29%
```

The user can immediately see:

- Completed payments
- Pending payments
- Upcoming payments
- Missed payments
- Remaining cycles
- Total paid
- Total remaining

---

# 4. ⏳ Due-Date Countdown

Every upcoming payment displays a countdown.

```text
Bike EMI

₹5,000

Due:
10 September 2026

⏳ 4 days remaining
```

Status changes automatically:

```text
30 days → Upcoming
7 days  → Due Soon
2 days  → Due Very Soon
Today   → Due Today
Past due → Overdue
Paid    → Completed
```

---

# 5. 👥 Shared Money Circles

A Money Circle allows multiple people to manage a shared recurring payment.

Example:

### Family Monthly Pool

```text
Monthly Target: ₹20,000

Sourav       ₹5,000 ✓
Rahul        ₹5,000 ✓
Mom          ₹5,000 ✓
Dad          ₹3,000 ◐

Collected: ₹18,000
Remaining:  ₹2,000
```

Users can create circles for:

- Family
- Friends
- Roommates
- Travel groups
- Apartment/society groups
- Team contributions
- Monthly savings groups

---

# 6. 👤 Member Payment Tracking

Every member gets an individual payment history.

```text
Rahul

Expected:
₹60,000

Paid:
₹45,000

Pending:
₹15,000

Payment History
──────────────────
Jan     ₹5,000 ✓
Feb     ₹5,000 ✓
Mar     ₹5,000 ✓
Apr     ₹5,000 ✓
May     ₹5,000 ✓
Jun     ₹5,000 ✓
Jul     ₹5,000 ✓
Aug     ₹0     ✕
```

The circle owner can see:

- Total expected
- Total paid
- Total pending
- Current month status
- Payment history
- Last payment date

---

# 7. 💰 Payment Recording

Users can manually record a payment.

```text
Amount:
₹5,000

Payment Date:
10 September 2026

Payment Method:
UPI

Reference Number:
1234567890

Notes:
September EMI
```

Payment methods can include:

- UPI
- Bank Transfer
- Cash
- Card
- Auto Debit
- Other

---

# 8. 📷 Payment Proof

Users can attach proof to a payment.

Examples:

- UPI screenshot
- Bank transfer receipt
- Invoice
- Payment receipt

Example:

```text
₹5,000
✓ Paid

UPI
10 Sep 2026

Reference:
1234567890

[ View Payment Proof ]
```

Uploaded files should be stored securely.

---

# 9. 📧 Email Notifications

Email notifications are a major feature of MoneyCircle.

The system sends transactional emails when important payment events occur.

## EMI / Payment Due

Example:

```text
Subject: 🔔 Your Bike EMI of ₹5,000 is due in 3 days

Hi Sourav,

Your Bike EMI payment of ₹5,000 is due on
10 September 2026.

Days remaining: 3

Please make the payment before the due date.

Open MoneyCircle
```

---

## Payment Due Today

```text
Subject: ⚠️ Your ₹5,000 payment is due today

Your Bike EMI of ₹5,000 is due today.

Due date: 10 September 2026
Amount: ₹5,000
```

---

## Payment Overdue

```text
Subject: 🚨 Payment overdue — ₹5,000

Your Bike EMI payment of ₹5,000 was due on
10 September 2026.

Please update the payment status after completing it.
```

---

## Payment Successfully Recorded

```text
Subject: ✅ Payment recorded — ₹5,000

Your Bike EMI payment has been recorded successfully.

Amount: ₹5,000
Date: 10 September 2026
Method: UPI
```

---

## Circle Member Payment

When a member pays:

```text
Subject: ✅ Rahul paid ₹5,000

Rahul has completed his September contribution.

Family Monthly Pool

Collected: ₹20,000 / ₹20,000
Status: Fully Paid
```

---

## Member Payment Reminder

If a member has not paid:

```text
Subject: 🔔 September contribution pending

Hi Rahul,

Your September contribution of ₹5,000 is still pending.

Due date: 12 September 2026
```

---

# 10. 🔔 Push Notifications

Email is useful for persistent communication, while push notifications provide immediate alerts.

Examples:

```text
🔔 EMI due in 7 days
🔔 EMI due in 2 days
⚠️ EMI due today
🚨 EMI overdue
✅ Payment recorded
👤 Rahul has paid
👤 Rahul's payment is pending
🎯 Savings goal updated
```

Users can control notification preferences.

---

# 11. 📱 Notification Preferences

Users can configure:

```text
Payment reminders
[ ON ]

Payment successful
[ ON ]

Overdue payments
[ ON ]

Circle member payments
[ ON ]

Savings updates
[ OFF ]

Weekly summary
[ ON ]

Email notifications
[ ON ]

Push notifications
[ ON ]
```

Reminder schedule can be:

- 30 days before
- 14 days before
- 7 days before
- 3 days before
- 1 day before
- On due date
- After overdue

---

# 12. 💡 Safe-to-Spend Calculator

One of the main differentiating features.

The app estimates how much money the user can spend after accounting for upcoming commitments and savings goals.

Example:

```text
Monthly Income             ₹40,000

Upcoming Payments          ₹13,000
Planned Expenses             ₹8,000
Savings Target               ₹5,000
──────────────────────────────────
Safe to Spend              ₹14,000
```

Formula for the initial implementation:

```text
Safe To Spend =
Income
- Required Payments
- Planned Expenses
- Savings Target
```

This is a budgeting estimate, not financial advice.

---

# 13. 🎯 Savings Goals

Users can create savings goals.

Examples:

- Emergency Fund
- New Phone
- Laptop
- Vacation
- Bike
- Education
- Wedding
- Custom goal

Example:

```text
Emergency Fund

Goal: ₹50,000
Saved: ₹28,000

███████████░░░░ 56%

Remaining:
₹22,000
```

### Goal fields

```text
Goal Name
Target Amount
Current Amount
Target Date
Monthly Contribution
Category
```

---

# 14. 🔥 Savings Streaks

Gamification encourages users to save consistently.

```text
🔥 7 Month Savings Streak

You saved money every month
for the last 7 months.

Total Saved:
₹32,500
```

Achievements:

```text
🏆 First ₹10K Saved
🏆 3-Month Streak
🏆 ₹50K Emergency Fund
🏆 Paid Every Month On Time
🏆 Zero Missed Payments
```

---

# 15. 📊 Financial Analytics

The analytics section provides monthly and yearly insights.

### Monthly report

```text
September 2026

Income                ₹40,000
Payments              ₹13,000
Expenses              ₹14,500
Savings                ₹8,000

Savings Rate:
20%

Payment Completion:
100%
```

### Charts

- Monthly income
- Monthly payments
- Monthly expenses
- Monthly savings
- Savings rate
- Payment completion
- Category spending
- Upcoming obligations

---

# 16. 📅 Payment Calendar

A calendar view shows all scheduled payments.

Example:

```text
September 2026

Mon Tue Wed Thu Fri Sat Sun
      1   2   3   4   5   6
 7   8   9  10  11  12  13
             💳      👥
14  15  16  17  18  19  20
             🏠
```

Payment types can use different icons:

```text
💳 EMI
🏠 Rent
🛡 Insurance
📱 Subscription
👥 Group Payment
🎯 Savings
```

---

# 17. 🔎 Payment Search & Filters

Users should be able to search and filter transactions.

### Search

```text
Search:
"bike"
```

### Filters

```text
Category
Status
Date
Amount
Payment Method
Circle
```

Example:

```text
Status:
✓ Paid
◐ Pending
✕ Overdue
○ Upcoming
```

---

# 18. 🤖 AI Money Assistant

An optional advanced feature.

Users can ask questions based on their own financial data.

Example:

> "How much do I need to pay next month?"

The app can summarize:

```text
Next Month

EMI                 ₹5,000
Rent               ₹10,000
Family contribution ₹3,000
Subscription          ₹799

Total               ₹18,799
```

Another example:

> "Can I save ₹5,000 this month?"

The assistant can use the user's recorded income, commitments, and budget to provide a calculation.

The AI feature should clearly state that it is a budgeting assistant and **not professional financial advice**.

---

# 19. 📈 What-If Calculator

Users can simulate payment scenarios.

Example:

```text
Current Payment:
₹5,000 / month

Remaining:
₹80,000

Extra Payment:
₹3,000
```

The app can calculate how the additional payment changes the repayment timeline.

For real loans, interest/prepayment calculations must use the actual loan terms. The app should never promise savings without the required loan data.

---

# 20. 🧾 Recurring Bills

The app isn't limited to EMI.

Users can track:

```text
🏠 Rent
💳 EMI
🛡 Insurance
📱 Mobile
🌐 Internet
🎬 Streaming
🎓 Tuition
👨‍👩‍👧 Family Contribution
```

Every recurring bill can have:

- Amount
- Due date
- Frequency
- Reminder
- Payment history
- Category
- Auto-renewal status

---

# 21. 🔐 Security & Privacy

MoneyCircle handles sensitive financial information, so security is a first-class feature.

### Security features

- Email/password authentication
- OAuth authentication if required
- PIN lock
- Biometric unlock
- Secure local storage
- Row-level database security
- Encrypted transport
- Private payment proofs
- User-specific data access
- Automatic session expiration
- Hide balance mode

Example:

```text
Balance

••••••••

Tap to reveal
```

---

# 🧭 Application Navigation

Recommended bottom navigation:

```text
┌───────────────────────────────────┐
│                                   │
│             CONTENT               │
│                                   │
├───────────────────────────────────┤
│ Home | Payments | Circles | Goals | Profile │
└───────────────────────────────────┘
```

### Home

Dashboard and upcoming payments.

### Payments

All recurring plans and payment history.

### Circles

Shared group payments.

### Goals

Savings goals and progress.

### Profile

Account, notification, security, and preferences.

---

# 📱 Recommended Screens

## Authentication

```text
Splash
Login
Register
Forgot Password
Email Verification
```

## Main App

```text
Home
Payments
Payment Details
Create Payment
Edit Payment
Payment History
Payment Calendar
```

## Money Circles

```text
Circles
Create Circle
Circle Details
Add Member
Member Details
Member Payment History
```

## Savings

```text
Goals
Create Goal
Goal Details
Savings History
```

## Analytics

```text
Monthly Report
Yearly Report
Payment Analytics
Savings Analytics
```

## Settings

```text
Profile
Notification Settings
Security
Currency
Theme
Email Preferences
Data Export
Delete Account
```

---

# 🏗️ Recommended Tech Stack

## Mobile

- React Native
- Expo
- TypeScript
- Expo Router

## State Management

Recommended:

- Zustand

Alternative:

- Redux Toolkit

## Backend

Recommended for MVP:

- Supabase

Possible production architecture:

```text
React Native / Expo
        ↓
REST API
        ↓
Node.js + Express
        ↓
PostgreSQL
```

## Authentication

- Supabase Auth
- Or custom JWT authentication

## Database

- PostgreSQL

## File Storage

For payment proofs:

- Supabase Storage
- AWS S3
- Cloudflare R2

## Notifications

Push:

- Expo Notifications
- Expo Push Service
- Firebase Cloud Messaging where appropriate

Email:

- Resend
- SendGrid
- Amazon SES

The email provider should be isolated behind a backend service so it can be replaced later.

## Charts

Possible libraries:

- Victory Native
- React Native SVG based charting
- Another actively maintained Expo-compatible chart library

## Maps

If location-based features are added later:

- react-native-maps
- Google Maps / Apple Maps providers

---

# 🗄️ Database Design

## users

```text
id
email
name
avatar_url
currency
created_at
updated_at
```

---

## payment_plans

```text
id
user_id
title
description
amount
category
frequency
start_date
end_date
due_day
payment_method
status
created_at
updated_at
```

### Frequency

```text
monthly
weekly
yearly
custom
```

---

## payment_cycles

Each recurring plan creates individual payment cycles.

```text
id
payment_plan_id
cycle_number
due_date
amount
status
paid_at
payment_method
reference_number
proof_url
notes
created_at
updated_at
```

### Status

```text
upcoming
due_soon
due_today
pending
paid
overdue
cancelled
```

---

## circles

```text
id
owner_id
name
description
target_amount
frequency
due_day
created_at
updated_at
```

---

## circle_members

```text
id
circle_id
user_id
expected_amount
status
joined_at
```

---

## circle_payments

```text
id
circle_id
member_id
amount
due_date
paid_at
status
reference_number
proof_url
notes
```

---

## savings_goals

```text
id
user_id
name
target_amount
current_amount
target_date
monthly_target
category
status
created_at
updated_at
```

---

## savings_transactions

```text
id
goal_id
amount
type
date
note
created_at
```

### Type

```text
deposit
withdrawal
adjustment
```

---

## expenses

```text
id
user_id
title
amount
category
date
payment_method
notes
created_at
```

---

## notifications

```text
id
user_id
type
title
message
channel
status
scheduled_for
sent_at
created_at
```

### Channel

```text
push
email
```

---

# 🔄 Notification Architecture

Notifications should not depend only on the mobile application.

Use a backend scheduler.

```text
Database
   ↓
Scheduled Payment
   ↓
Notification Worker / Cron
   ↓
Check due date
   ↓
Notification Service
   ├── Email
   └── Push
```

Example:

```text
Payment due:
10 September

Scheduler:
3 September
      ↓
Email + Push

8 September
      ↓
Email + Push

9 September
      ↓
Email + Push

10 September
      ↓
Due Today notification
```

After the user marks the payment as paid:

```text
Payment Status
      ↓
      PAID
      ↓
Cancel future reminders for this cycle
      ↓
Send payment confirmation
```

---

# 📧 Email Template System

Use reusable transactional email templates.

Recommended templates:

```text
payment_due_7_days
payment_due_3_days
payment_due_1_day
payment_due_today
payment_overdue
payment_paid
circle_member_paid
circle_member_pending
monthly_summary
savings_goal_update
```

Email events should be generated from backend events rather than directly from the React Native client.

---

# 🔁 Payment Lifecycle

```text
UPCOMING
   ↓
DUE SOON
   ↓
DUE TODAY
   ↓
 ┌───────┴───────┐
 ↓               ↓
PAID           OVERDUE
 ↓               ↓
COMPLETED      REMINDER
```

If the user pays:

```text
OVERDUE → PAID
```

The system records the actual payment date.

---

# 💡 Safe-to-Spend Architecture

The first version can use a transparent calculation:

```text
Safe To Spend =
Monthly Income
- Required Payments
- Planned Expenses
- Savings Target
```

Example:

```text
Income                  ₹50,000
Required Payments       ₹15,000
Planned Expenses        ₹12,000
Savings Target           ₹8,000
───────────────────────────────
Safe To Spend            ₹15,000
```

The calculation should always show the components so users understand where the number came from.

---

# 🎯 MVP Scope

Do not build every feature initially.

The first release should contain:

### Authentication

- [ ] Register
- [ ] Login
- [ ] Logout

### Payments

- [ ] Create payment plan
- [ ] Edit payment plan
- [ ] Delete/cancel plan
- [ ] Monthly cycles
- [ ] Mark payment as paid
- [ ] Payment history
- [ ] Due-date countdown
- [ ] Overdue status

### Dashboard

- [ ] Total due
- [ ] Total paid
- [ ] Total pending
- [ ] Upcoming payments
- [ ] Payment completion

### Savings

- [ ] Create savings goal
- [ ] Add savings
- [ ] Goal progress

### Notifications

- [ ] Push reminder
- [ ] Payment-paid notification
- [ ] Overdue notification
- [ ] Transactional email

---

# 🚀 Phase 2

After MVP:

- [ ] Shared Money Circles
- [ ] Member tracking
- [ ] Payment proof
- [ ] Payment calendar
- [ ] Recurring bills
- [ ] Expense tracking
- [ ] Monthly reports
- [ ] Charts
- [ ] Email preference controls

---

# 🚀 Phase 3

Advanced features:

- [ ] Safe-to-Spend
- [ ] Savings streaks
- [ ] Achievements
- [ ] What-if calculator
- [ ] AI Money Assistant
- [ ] Smart spending insights
- [ ] Data export
- [ ] PDF monthly report
- [ ] Advanced analytics

---

# 🧠 Future Ideas

Potential future features:

### Smart Reminder Timing

Instead of sending reminders at a fixed time, allow users to choose preferred reminder windows.

### Salary-Day Planning

If salary arrives on the 1st:

```text
Salary: ₹40,000

1st → Income
2nd → Rent
5th → EMI
10th → Family contribution
15th → Savings
```

The app creates a monthly cash-flow view.

### Emergency Fund Calculator

```text
Average Monthly Essential Expenses:
₹25,000

Target:
6 months

Recommended Emergency Fund:
₹1,50,000
```

### Subscription Detector

Allow users to track recurring subscriptions and highlight unused or expensive recurring commitments.

### Shared Goals

A group can create:

```text
Goa Trip Fund

Target: ₹50,000

Sourav    ₹10,000
Rahul      ₹8,000
Aman       ₹7,000

Progress: ₹25,000 / ₹50,000
```

---

# 🧩 Suggested Project Structure

```text
moneycircle/
│
├── app/
│   ├── _layout.tsx
│   │
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── payments.tsx
│   │   ├── circles.tsx
│   │   ├── goals.tsx
│   │   └── profile.tsx
│   │
│   ├── payments/
│   │   ├── create.tsx
│   │   ├── [id].tsx
│   │   └── history.tsx
│   │
│   ├── circles/
│   │   ├── create.tsx
│   │   ├── [id].tsx
│   │   └── members.tsx
│   │
│   ├── goals/
│   │   ├── create.tsx
│   │   └── [id].tsx
│   │
│   └── settings/
│       ├── notifications.tsx
│       └── security.tsx
│
├── components/
│   ├── PaymentCard.tsx
│   ├── PaymentStatus.tsx
│   ├── Countdown.tsx
│   ├── CircleCard.tsx
│   ├── MemberCard.tsx
│   ├── SavingsGoalCard.tsx
│   ├── ProgressBar.tsx
│   └── EmptyState.tsx
│
├── store/
│   ├── authStore.ts
│   ├── paymentStore.ts
│   ├── circleStore.ts
│   └── goalStore.ts
│
├── services/
│   ├── auth.ts
│   ├── payments.ts
│   ├── circles.ts
│   ├── goals.ts
│   └── notifications.ts
│
├── lib/
│   ├── supabase.ts
│   ├── api.ts
│   └── storage.ts
│
├── utils/
│   ├── dates.ts
│   ├── currency.ts
│   └── calculations.ts
│
├── types/
│   ├── payment.ts
│   ├── circle.ts
│   ├── goal.ts
│   └── notification.ts
│
├── constants/
│   ├── categories.ts
│   └── config.ts
│
└── assets/
```

---

# 🔌 Example API Endpoints

If using a custom Node.js backend:

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

## Payments

```http
GET    /api/payments
POST   /api/payments
GET    /api/payments/:id
PATCH  /api/payments/:id
DELETE /api/payments/:id

POST   /api/payments/:id/mark-paid
GET    /api/payments/:id/history
```

## Circles

```http
GET    /api/circles
POST   /api/circles
GET    /api/circles/:id
PATCH  /api/circles/:id
POST   /api/circles/:id/members
GET    /api/circles/:id/members
```

## Goals

```http
GET    /api/goals
POST   /api/goals
GET    /api/goals/:id
PATCH  /api/goals/:id
POST   /api/goals/:id/deposit
```

## Notifications

```http
GET    /api/notifications
PATCH  /api/notifications/preferences
POST   /api/notifications/test
```

---

# ⚙️ Local Development

## Prerequisites

Install:

- Node.js LTS
- npm / pnpm / yarn
- Expo CLI / Expo tooling
- Android Studio for Android development
- Xcode for iOS development on macOS
- Supabase project or another backend

---

## Create Project

```bash
npx create-expo-app@latest moneycircle
cd moneycircle
```

Install TypeScript and required Expo dependencies according to the current Expo documentation.

Example packages:

```bash
npx expo install expo-router
npx expo install expo-notifications
npx expo install expo-secure-store
npx expo install expo-image-picker
```

Then add your selected state-management, database, charting, and validation libraries.

---

# 🔐 Environment Variables

Never hard-code secrets inside the mobile application.

Example:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

API_BASE_URL=

EXPO_PUBLIC_APP_ENV=development
```

Server-only secrets must stay on the backend:

```env
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_API_KEY=
PUSH_NOTIFICATION_SECRET=
```

Do not expose these values in the Expo client.

---

# 📧 Email Service Design

Recommended architecture:

```text
React Native App
      ↓
Backend API
      ↓
Payment Event
      ↓
Notification Queue
      ↓
Email Service
      ↓
Email Provider
```

Example event:

```json
{
  "type": "PAYMENT_DUE",
  "userId": "user_123",
  "paymentId": "payment_456",
  "amount": 5000,
  "dueDate": "2026-09-10"
}
```

The notification worker decides which template to send.

This prevents the mobile app from containing email credentials and makes scheduled notifications reliable.

---

# 🛡️ Security Considerations

Because the application handles financial records:

1. Never store raw passwords.
2. Never expose backend service keys in the Expo app.
3. Validate all amounts on the server.
4. Validate dates on the server.
5. Apply authorization checks to every resource.
6. Use database row-level security where supported.
7. Restrict access to payment proofs.
8. Do not trust client-provided payment status.
9. Rate-limit authentication and sensitive endpoints.
10. Log important financial mutations.
11. Provide account deletion/data export mechanisms.
12. Avoid storing unnecessary sensitive financial information.

---

# 💵 Currency

The initial version can target:

```text
INR ₹
```

But the database should store monetary values in a consistent representation.

For financial calculations, avoid JavaScript floating-point arithmetic where exact currency precision matters.

Prefer storing minor units when appropriate:

```text
₹5,000
→
500000 paise
```

Then format for display:

```text
500000 → ₹5,000
```

---

# 📱 UX Principles

The app should be extremely clear about payment status.

Use consistent visual states:

```text
✓ Paid
◐ Pending
⚠ Due Soon
🔴 Overdue
○ Upcoming
```

Every payment card should answer four questions immediately:

1. **What is it?**
2. **How much?**
3. **When is it due?**
4. **What is its current status?**

Avoid making users open multiple screens to find basic payment information.

---

# 🧪 Testing Strategy

## Unit Tests

Test:

- Currency calculations
- Safe-to-spend calculation
- Due-date calculation
- Remaining cycles
- Savings progress
- Payment status transitions

Example:

```text
Income: ₹40,000
Payments: ₹13,000
Expenses: ₹8,000
Savings: ₹5,000

Expected Safe-to-Spend:
₹14,000
```

## Integration Tests

Test:

- Login
- Payment creation
- Marking payment as paid
- Circle member payment
- Notification creation
- Email event generation

## E2E Tests

Important flows:

```text
Register
  ↓
Create EMI
  ↓
Receive reminder
  ↓
Mark as paid
  ↓
Receive payment confirmation
  ↓
Next cycle generated
```

---

# 🗺️ Development Roadmap

## Week 1 — Foundation

```text
Project setup
Expo Router
TypeScript
Navigation
Theme
Reusable UI components
Supabase/backend setup
Authentication
```

## Week 2 — Payments

```text
Create payment plan
Payment details
Recurring cycles
Payment history
Mark as paid
Due-date calculations
```

## Week 3 — Dashboard & Savings

```text
Dashboard
Upcoming payments
Payment progress
Savings goals
Safe-to-spend calculation
```

## Week 4 — Notifications

```text
Push notifications
Email notifications
Reminder scheduler
Paid confirmation
Overdue notifications
Notification preferences
```

## Week 5 — Shared Circles

```text
Create circle
Invite members
Member payments
Circle dashboard
Pending reminders
Payment proof
```

## Week 6 — Polish

```text
Charts
Calendar
Animations
Empty states
Error handling
Loading states
Security
Testing
Performance
```

---

# 🎨 UI Direction

Recommended visual style:

- Clean financial dashboard
- Large readable amounts
- Rounded cards
- Minimal icons
- Strong typography
- Light and dark themes
- Clear payment status indicators
- Progress bars
- Calendar-based interactions
- Bottom-tab navigation

The app should feel more like a **modern personal finance product** than a spreadsheet.

---

# 🌟 Example User Journey

### First day

```text
User signs up
      ↓
Adds monthly income
      ↓
Creates Bike EMI
      ↓
₹5,000 / month
      ↓
Due every 10th
      ↓
Creates Emergency Fund
      ↓
Target ₹50,000
```

### Before due date

```text
7 days remaining
      ↓
Push notification
      ↓
Email reminder
```

### Payment

```text
User pays ₹5,000
      ↓
Opens app
      ↓
Mark as Paid
      ↓
Adds UPI reference
      ↓
Uploads payment proof
```

### After payment

```text
Payment status → PAID
      ↓
Reminder cancelled
      ↓
Payment confirmation email
      ↓
Dashboard updated
      ↓
Next month's cycle appears
```

### End of month

```text
Monthly Summary

Payments       ₹13,000
Expenses       ₹14,500
Savings         ₹8,000

Savings Rate      20%
Payment Rate     100%
```

---

# 🚀 Future Product Direction

MoneyCircle can eventually evolve into a broader **personal cash-flow and recurring-payment management platform**.

Potential modules:

```text
Payments
    ↓
Recurring Bills
    ↓
Shared Money Circles
    ↓
Savings Goals
    ↓
Budgeting
    ↓
Cash Flow
    ↓
Analytics
    ↓
AI Assistant
```

The key product philosophy should remain:

> **Know what you owe. Know what you've paid. Know what's coming. Save what you can.**

---

# ⚠️ Financial Disclaimer

MoneyCircle is intended as a **personal budgeting and payment-recording tool**.

It should not present itself as a bank, lender, investment adviser, credit provider, or regulated financial service unless the required regulatory, legal, compliance, and licensing requirements are satisfied.

Calculations such as "Safe to Spend" are estimates based on user-provided information and should not be represented as professional financial advice.

---

# 📄 License

Choose an appropriate license before making the repository public.

For a private portfolio project, no public open-source license is required.

If you open-source the project, consider a permissive license such as MIT after reviewing whether it fits your intended use.

---

# ❤️ Project Goal

MoneyCircle is designed to solve a simple but common problem:

> **People have multiple recurring payments, but they often don't have one clear place to understand their upcoming obligations and savings progress.**

The app brings those responsibilities together into one simple mobile experience.

**Track your payments.  
Stay ahead of your due dates.  
Manage your group contributions.  
Build your savings.  
Keep more control over your money.**
