# MoneyCircle — Mobile UI/UX Design Specification

## 1. Design Reference

The visual direction of MoneyCircle should closely follow the supplied mobile finance-app reference:

- Premium, minimal fintech aesthetic
- White/off-white app background
- Very light gray cards and surfaces
- Rounded cards with soft borders
- Large financial numbers
- Compact typography with strong hierarchy
- Small pill-shaped filters and status labels
- Thin line charts
- Simple category icons
- Bottom tab navigation
- Lots of whitespace
- Subtle shadows only where necessary
- iOS-style visual polish
- Content-first layout rather than heavy decoration

**Important:** Recreate the same *visual language and layout quality* as the reference, but use MoneyCircle's own product content, labels, icons, and branding. Do not copy proprietary logos or exact assets.

---

# 2. Product Identity

## Product Name

**MoneyCircle**

## Tagline

**Stay ahead of every payment. Save more every month.**

## Product Type

Personal finance + recurring payment + EMI + shared money management application.

## Primary Users

- People managing EMIs
- Families managing monthly contributions
- Roommates sharing recurring bills
- Friends managing group payments
- Users trying to save consistently
- Users managing subscriptions and recurring bills

---

# 3. Overall Visual Style

### Design personality

The interface should feel:

- Modern
- Premium
- Calm
- Trustworthy
- Financial
- Simple
- Data-driven
- Friendly

Avoid:

- Dark/heavy dashboards
- Excessive gradients
- Huge illustrations
- Too many colors
- Dense tables
- Complicated financial terminology

---

# 4. Color System

Use a mostly neutral palette.

## Background

```text
App Background:       #F7F7F5
Card Background:      #FFFFFF
Secondary Surface:    #F2F2EF
Input Background:     #F5F5F3
```

## Text

```text
Primary Text:         #171717
Secondary Text:       #737373
Muted Text:           #A3A3A3
Border:               #E8E8E5
```

## Semantic colors

Use color sparingly.

```text
Success:              #2F9E63
Warning:              #D9912B
Danger:               #D95757
Info:                 #5D7EDB
```

The exact visual result should remain mostly neutral. Status colors should only highlight important information.

---

# 5. Typography

Recommended font:

**Inter**

Fallback:

```text
-apple-system
BlinkMacSystemFont
sans-serif
```

## Type scale

```text
Large Balance:
32–38 px / Bold

Screen Heading:
24–28 px / Bold

Section Heading:
16–18 px / Semibold

Card Title:
14–16 px / Semibold

Body:
14 px / Regular

Secondary:
12–13 px / Regular

Caption:
11–12 px / Medium
```

Financial amounts should use tabular-looking numerals where possible.

---

# 6. Spacing System

Use an 8-point spacing system.

```text
4   — micro
8   — tight
12  — small
16  — standard
20  — section
24  — large
32  — major
40  — screen separation
```

Screen horizontal padding:

```text
16–20 px
```

---

# 7. Border Radius

Use rounded surfaces similar to the reference.

```text
Small chips:       10–12 px
Inputs:            14 px
Small cards:       14–16 px
Main cards:        18–22 px
Bottom sheets:     24–28 px
Buttons:           14–16 px
```

Do not use extremely circular cards except for avatars and icon buttons.

---

# 8. Shadows

Keep shadows extremely subtle.

Preferred:

```text
shadowOpacity: 0.04–0.07
shadowRadius: 8–16
shadowOffset: 0 2
```

Most cards should work with:

```text
background + 1px border
```

instead of a visible shadow.

---

# 9. Screen Structure

The application uses a 5-tab bottom navigation:

```text
Home
Payments
Circles
Goals
Profile
```

Bottom navigation should remain visually minimal.

Example:

```text
┌────────────────────────────────────┐
│                                    │
│            SCREEN CONTENT          │
│                                    │
│                                    │
├────────────────────────────────────┤
│  Home   Payments   +   Circles Goals│
└────────────────────────────────────┘
```

The central `+` action can be used for:

- Add payment
- Add expense
- Add saving
- Add circle payment

---

# 10. Home Dashboard

This is the most important screen.

The supplied reference has a strong financial summary card at the top. MoneyCircle should follow the same hierarchy.

## Header

```text
Good morning,
Sourav

                         🔍   🔔
```

Use:

- Small greeting
- Bold user name
- Search icon
- Notification icon
- Small red notification indicator when unread

---

# 11. Main Money Card

Large rounded card near the top.

```text
┌─────────────────────────────────────┐
│                                     │
│ TOTAL AVAILABLE                     │
│                                     │
│ ₹24,892.90                          │
│                                     │
│ Income        Payments       Saved  │
│ +₹40,000      -₹13,000       ₹8,000 │
│                                     │
└─────────────────────────────────────┘
```

Do not make the card visually complicated.

The most important number should be the largest element.

---

# 12. Safe-to-Spend Insight

Immediately below the balance card:

```text
┌─────────────────────────────────────┐
│ ✦  Safe to spend                    │
│                                     │
│ ₹14,000 available this month        │
│                                     │
│ Based on upcoming payments and      │
│ your savings target.            ›   │
└─────────────────────────────────────┘
```

This replaces the reference app's AI spending warning with MoneyCircle's main differentiator.

---

# 13. Upcoming Payments Section

Section header:

```text
Upcoming Payments                 See all
```

Cards should be compact.

Example:

```text
┌─────────────────────────────────────┐
│ 💳  Bike EMI                        │
│     Due Sep 10                      │
│                                     │
│     ₹5,000                 4 days   │
└─────────────────────────────────────┘
```

Second:

```text
┌─────────────────────────────────────┐
│ 🏠  Rent                            │
│     Due Sep 12                      │
│                                     │
│     ₹10,000                6 days   │
└─────────────────────────────────────┘
```

Use a small pill for urgency:

```text
Due in 4 days
Due tomorrow
Due today
Overdue
```

---

# 14. Payment Progress

Add a horizontal progress card.

```text
September Payments

₹18,000 / ₹25,000

██████████████░░░ 72%

4 of 5 payments completed
```

This gives users an immediate monthly overview.

---

# 15. Recent Payments

Similar to the reference's Recent Transactions section.

```text
Recent Payments                  See all

✓ Bike EMI                  ₹5,000
  UPI · Today

✓ Family Contribution       ₹3,000
  Bank Transfer · Yesterday

⚠ Internet Bill               ₹799
  Due in 2 days
```

Each row:

```text
[icon] [title]
       [metadata]
                    [amount]
                    [status]
```

---

# 16. Payments Screen

Title:

```text
Payments
```

Top segmented control:

```text
All     Upcoming     Paid     Overdue
```

Then cards grouped by date/month.

Example:

```text
September 2026

Bike EMI
₹5,000
Due Sep 10
4 days remaining

Rent
₹10,000
Due Sep 12
6 days remaining
```

---

# 17. Payment Detail Screen

Follow the reference's transaction-detail screen hierarchy.

Header:

```text
‹                         •••
```

Centered:

```text
Bike EMI

₹5,000

September 10, 2026
Monthly · UPI
```

Status:

```text
✓ PAID
```

Then:

```text
Payment Details

Payment amount          ₹5,000
Due date                Sep 10
Paid date               Sep 9
Payment method          UPI
Reference               1234567890
```

Then:

```text
Payment Proof

[ receipt image ]
```

Then:

```text
Plan Progress

8 / 12 payments completed
██████████████░░ 67%
```

---

# 18. Create Payment Screen

Use a clean form.

```text
Add Payment

Payment name
[ Bike EMI                    ]

Amount
[ ₹5,000                      ]

Category
[ EMI                       › ]

Frequency
[ Monthly                   › ]

Due date
[ 10th of every month       › ]

Start date
[ Sep 10, 2026              ]

End date
[ Sep 10, 2027              ]

Reminder
[ 7 days before             › ]

             Add Payment
```

Primary button should be full width.

---

# 19. Payment Status Design

Use simple status pills.

### Paid

```text
✓ Paid
```

### Pending

```text
Pending
```

### Due Soon

```text
Due in 2 days
```

### Due Today

```text
Due today
```

### Overdue

```text
Overdue
```

Do not use large red blocks. Status should remain subtle.

---

# 20. Money Circles Screen

This is the shared-payment feature.

Header:

```text
Money Circles                         +
```

Circle cards:

```text
┌─────────────────────────────────────┐
│ 👨‍👩‍👧 Family Monthly Pool             │
│                                     │
│ ₹18,000 / ₹20,000                   │
│ ███████████████░░ 90%               │
│                                     │
│ 4 members · Due in 5 days           │
└─────────────────────────────────────┘
```

Another:

```text
┌─────────────────────────────────────┐
│ 🏠 Flat Expenses                    │
│                                     │
│ ₹7,500 / ₹10,000                    │
│ ███████████░░░░ 75%                 │
│                                     │
│ 3 members · Due Sep 12              │
└─────────────────────────────────────┘
```

---

# 21. Circle Detail Screen

Header:

```text
Family Monthly Pool
September 2026

₹18,000 / ₹20,000
90%
```

Member list:

```text
Members

Sourav             ₹5,000   ✓
Rahul              ₹5,000   ✓
Mom                ₹5,000   ✓
Dad                ₹3,000   Pending
```

Each member row should contain:

- Avatar
- Name
- Expected amount
- Paid amount
- Status

---

# 22. Member Detail

```text
Rahul

September
₹5,000 ✓

August
₹5,000 ✓

July
₹5,000 ✓

June
₹0     Overdue
```

Summary card:

```text
Total Expected       ₹20,000
Total Paid           ₹15,000
Pending               ₹5,000
```

---

# 23. Goals Screen

Follow the clean analytics-card style from the reference.

Header:

```text
Savings Goals                         +
```

Main goal:

```text
Emergency Fund

₹28,000 / ₹50,000

███████████░░░░ 56%

₹22,000 remaining
Target: Dec 2026
```

Other goals:

```text
New Laptop
₹35,000 / ₹80,000

Vacation
₹12,000 / ₹30,000
```

---

# 24. Goal Detail Screen

```text
Emergency Fund

₹28,000

of ₹50,000

56%

████████████░░░░

Target Date
December 31, 2026

Monthly Target
₹5,500
```

Buttons:

```text
+ Add Savings

View History
```

---

# 25. Analytics Screen

The reference has a spending insight screen. MoneyCircle should have:

```text
Money Insights

September 2026

Week    Month    Year
```

Summary cards:

```text
Total Payments
₹13,000

Total Saved
₹8,000

Pending
₹2,000

Savings Rate
20%
```

---

# 26. Payment Trend Chart

Use a clean line chart.

```text
Payment Trend

₹15K ┤                       ●
₹10K ┤          ●       ●
 ₹5K ┤     ●
   0 ┼────────────────────────
       W1    W2    W3    W4
```

No heavy grid lines.

---

# 27. Savings Trend

```text
Savings Trend

₹10K ┤                    ●
 ₹8K ┤              ●
 ₹6K ┤        ●
 ₹4K ┤   ●
    0┼────────────────────────
       May   Jun   Jul   Aug
```

---

# 28. Category Breakdown

Use compact category cards.

```text
Monthly Commitments

💳 EMI             ₹5,000
🏠 Housing        ₹10,000
🛡 Insurance       ₹2,000
📱 Subscriptions     ₹799
👥 Circles         ₹3,000
```

---

# 29. Calendar Screen

Monthly calendar with small indicators.

```text
September 2026

Mon Tue Wed Thu Fri Sat Sun
      1   2   3   4   5   6
 7   8   9  10  11  12  13
            ●       ●
14  15  16  17  18  19  20
       ●
```

Under calendar:

```text
Sep 10

💳 Bike EMI          ₹5,000
✓ Paid
```

---

# 30. Notification Center

Header:

```text
Notifications                 Mark all read
```

Groups:

```text
Today

✓ Payment recorded
Bike EMI of ₹5,000 was marked paid.

⚠ Payment due soon
Rent of ₹10,000 is due in 2 days.

Yesterday

👤 Rahul paid
Rahul completed his September contribution.
```

Use small notification icons and clean separators.

---

# 31. Email Notification UX

Email is a backend feature but the mobile app should expose preferences.

Settings screen:

```text
Email Notifications

Payment Due
[ ON ]

Payment Paid
[ ON ]

Payment Overdue
[ ON ]

Circle Member Paid
[ ON ]

Circle Member Pending
[ ON ]

Monthly Summary
[ ON ]

Savings Updates
[ OFF ]
```

---

# 32. Email Event Types

The UI should support these event states:

```text
PAYMENT_DUE
PAYMENT_DUE_TODAY
PAYMENT_OVERDUE
PAYMENT_PAID
CIRCLE_MEMBER_PAID
CIRCLE_MEMBER_PENDING
MONTHLY_SUMMARY
SAVINGS_GOAL_UPDATE
```

---

# 33. Search

Search icon in the header should open:

```text
Search payments, circles, goals...

[ bike ]

Results

Bike EMI
₹5,000
Due Sep 10

Bike Insurance
₹1,200
Due Sep 18
```

Use rounded search input matching the reference style.

---

# 34. Filters

Filter chips:

```text
All
EMI
Rent
Insurance
Subscriptions
Circle
Paid
Pending
Overdue
```

Horizontal scroll.

---

# 35. Profile Screen

```text
Profile

Sourav Kumar
sourav@example.com

────────────────────

Account
Personal Details
Currency
Data & Privacy

Notifications
Email Notifications
Push Notifications

Security
PIN Lock
Biometric Lock

Appearance
Light
Dark
System

────────────────────

Export Data
Help & Support
Delete Account
```

---

# 36. Add Action Sheet

When the user taps the central `+`:

```text
What do you want to add?

┌─────────────────────────────┐
│ 💳  Payment / EMI           │
├─────────────────────────────┤
│ 👥  Money Circle            │
├─────────────────────────────┤
│ 🎯  Savings Goal            │
├─────────────────────────────┤
│ 💸  Expense                 │
└─────────────────────────────┘
```

Use a rounded bottom sheet.

---

# 37. Empty States

Never show blank screens.

Example:

```text
No payments yet

Add your first recurring payment
to start tracking your monthly
commitments.

        + Add Payment
```

Circle:

```text
No money circles

Create a circle with your family,
friends, or roommates.
```

Goals:

```text
Start your first savings goal

Small monthly savings can build
toward something meaningful.

        + Create Goal
```

---

# 38. Loading States

Use skeleton cards rather than blocking spinners.

Example:

```text
████████████████
████████░░░░░░░
████████████
```

Keep the same rounded shape as the actual content.

---

# 39. Error States

Keep error messaging short.

```text
Something went wrong

We couldn't load your payments.

            Try Again
```

For network issues:

```text
You're offline

Your saved data is still available.
We'll sync when you're back online.
```

---

# 40. Micro Interactions

Use subtle animations.

### Payment marked paid

```text
Pending
   ↓
✓ Paid
```

Animate:

- Status change
- Progress bar
- Savings amount
- Circle collection
- Notification badge

Avoid excessive animations.

---

# 41. Haptic Feedback

Use haptics for:

- Payment marked paid
- Saving added
- Circle payment confirmed
- Important action completed

Do not use haptics for every tap.

---

# 42. Dark Mode

Dark mode should preserve the same visual hierarchy.

Example:

```text
Background:       #111111
Card:             #1A1A1A
Secondary:        #222222
Primary Text:     #F5F5F5
Secondary Text:   #A3A3A3
Border:           #2C2C2C
```

Keep semantic colors muted.

---

# 43. Responsive Mobile Layout

Primary target:

```text
Width: 375–430 px
```

Design for:

- iPhone-sized screens
- Android phones
- Safe areas
- Dynamic status bar
- Keyboard-aware forms

Avoid hard-coded screen dimensions.

Use:

```text
SafeAreaView
KeyboardAvoidingView
useWindowDimensions
```

where appropriate.

---

# 44. Accessibility

Every interactive element should have:

- Accessible label
- Sufficient touch target
- Good text contrast
- Screen-reader-friendly status
- No information conveyed by color alone

Minimum touch target:

```text
44 × 44 px
```

---

# 45. Component Design System

Create reusable components.

```text
MoneyCard
PaymentCard
PaymentStatus
ProgressBar
SectionHeader
AmountText
CategoryIcon
CircleCard
MemberRow
GoalCard
InsightCard
NotificationRow
FilterChip
PrimaryButton
SecondaryButton
IconButton
BottomSheet
EmptyState
SkeletonCard
```

---

# 46. Component Styling Rules

## Card

```text
padding: 16–20
borderRadius: 18–22
background: white
border: 1px neutral
```

## Primary Button

```text
height: 52
borderRadius: 15
fontWeight: 600
```

## Input

```text
height: 52
borderRadius: 14
paddingHorizontal: 16
```

## Chip

```text
height: 34
paddingHorizontal: 14
borderRadius: 17
```

---

# 47. Iconography

Use one consistent icon family.

Recommended:

**Lucide Icons** or another consistent outline icon set.

Style:

- Thin/medium stroke
- Rounded corners
- Minimal
- No mixed icon styles

Examples:

```text
Search
Bell
ChevronRight
Plus
CreditCard
Home
Users
Target
Calendar
Check
AlertCircle
Wallet
TrendingUp
```

---

# 48. Data Visualization Rules

Charts should remain minimal.

Use:

- One primary line
- Light baseline/grid
- Small labels
- Clear tooltip on interaction
- No 3D charts
- No unnecessary gradients
- No chart junk

Every chart should answer a specific question.

---

# 49. Home Screen Information Priority

The order is intentional:

```text
1. Available money / financial summary
2. Safe-to-spend insight
3. Upcoming payments
4. Monthly payment progress
5. Recent payments
```

Users should not have to scroll to find an urgent payment.

---

# 50. Payment Detail Information Priority

```text
1. Payment name
2. Amount
3. Paid / Pending / Overdue
4. Due date
5. Payment history
6. Reference / proof
7. Plan progress
```

---

# 51. Design Inspiration Mapping

The supplied reference contains three strong patterns that should be adapted:

### Pattern A — Financial summary

Reference:

```text
Large balance
Income
Expenses
Saved
```

MoneyCircle:

```text
Available money
Income
Payments
Saved
```

### Pattern B — Transaction detail

Reference:

```text
Merchant
Amount
Date
Receipt
Merchant info
Similar transactions
```

MoneyCircle:

```text
Payment
Amount
Due/Paid date
Payment proof
Plan information
Payment history
```

### Pattern C — Analytics

Reference:

```text
Total spent
Daily average
Biggest category
AI saving
Trend
Budget vs Actual
```

MoneyCircle:

```text
Total payments
Monthly savings
Pending
Savings rate
Payment trend
Commitment breakdown
```

---

# 52. Suggested Home Screen Wireframe

```text
┌──────────────────────────────────────┐
│ Good morning,                       │
│ Sourav                         🔍 🔔 │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ AVAILABLE MONEY                  │ │
│ │                                  │ │
│ │ ₹24,892.90                       │ │
│ │                                  │ │
│ │ Income      Payments       Saved │ │
│ │ +₹40,000    -₹13,000       ₹8,000│ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ✦ Safe to spend                 ›│ │
│ │ ₹14,000 available this month    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Upcoming Payments             See all│
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 💳 Bike EMI                      │ │
│ │ Due Sep 10                       │ │
│ │ ₹5,000                 4 days    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Monthly Progress                     │
│ ₹18,000 / ₹25,000                   │
│ ███████████████░░ 72%               │
│                                      │
│ Recent Payments              See all│
│                                      │
│ ✓ Bike EMI                   ₹5,000 │
│ ✓ Family Contribution        ₹3,000 │
│ ⚠ Internet Bill                ₹799 │
│                                      │
├──────────────────────────────────────┤
│  Home  Payments  +  Circles  Goals  │
└──────────────────────────────────────┘
```

---

# 53. Technical UI Requirements

Recommended stack:

```text
React Native
Expo
TypeScript
Expo Router
Zustand
React Hook Form
Zod
Supabase / REST API
Expo Notifications
Expo Secure Store
```

For charts:

```text
A maintained React Native chart library
```

For icons:

```text
Lucide React Native
```

---

# 54. Design-to-Code Rules

When implementing the design:

1. Build reusable components first.
2. Keep all spacing values centralized.
3. Keep colors centralized.
4. Keep typography centralized.
5. Do not duplicate card styles across screens.
6. Use `StyleSheet` or a consistent styling system.
7. Avoid inline magic numbers.
8. Keep business logic outside UI components.
9. Keep date/currency calculations in utility functions.
10. Use skeleton states for loading.
11. Use optimistic UI only where rollback is safe.
12. Never put email/API secrets inside the Expo application.

---

# 55. Design Tokens

Suggested central token file:

```text
colors
spacing
radius
typography
shadows
layout
```

Example:

```ts
spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}
```

---

# 56. Final Design Goal

MoneyCircle should look like a polished fintech application that could realistically appear in the App Store.

The visual target is:

```text
Minimal
     +
Premium
     +
Data-rich
     +
Easy to understand
     +
Mobile-first
```

The reference's strongest visual characteristics should be preserved:

- Large financial summary
- Rounded white cards
- Neutral background
- Compact category sections
- Clean transaction lists
- Small status indicators
- Elegant charts
- Strong whitespace
- Minimal navigation

But the product content should remain distinctly **MoneyCircle**:

> **Payments + EMI + Money Circles + Savings + Safe-to-Spend + Notifications**

---

# 57. Definition of Done — UI

A screen is considered complete when:

- [ ] Layout matches the design system
- [ ] Typography hierarchy is correct
- [ ] Cards use consistent radius
- [ ] Spacing follows the 8pt system
- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists where applicable
- [ ] Accessibility labels exist
- [ ] Dark mode works
- [ ] Keyboard behavior is correct
- [ ] Safe areas are respected
- [ ] Navigation transitions feel natural
- [ ] No horizontal overflow exists
- [ ] Long text does not break layouts
- [ ] Amounts remain readable on small screens

---

# 58. Brand Statement

**MoneyCircle**

### Know what you owe.
### Know what you've paid.
### Know what's coming.
### Save what you can.

The product should feel calm and reassuring, not stressful. Financial information should be presented in a way that helps users make better everyday decisions without overwhelming them.
