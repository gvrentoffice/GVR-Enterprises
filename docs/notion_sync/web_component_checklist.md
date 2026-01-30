# ✅ Web Component Checklist (Next.js + Shadcn)

This checklist defines the build order for the React Web App.
We prioritize **Shadcn UI** components over custom CSS.

---

## Phase 0: Project Setup ✅

- [x] Initialize Next.js 15 with App Router
- [x] Install Tailwind CSS
- [x] Install Shadcn UI
- [x] Configure Firebase SDK
- [x] Setup environment variables
- [x] Create base folder structure

---

## Phase 1: Core System

### 1.1 Theme System
- [ ] Configure `tailwind.config.js` with Design System colors
  - Primary: `#4169E1` (Royal Blue)
  - Secondary: `#FFB84D` (Amber)
  - Radius: `0.5rem`
- [ ] Create `ThemeProvider` (if using dark mode later)
- [ ] Test color classes (`bg-primary`, `text-primary`)

### 1.2 Layout Components
- [x] `SidebarLayout` (Desktop, > 1024px)
- [x] `StackedLayout` (Mobile, < 1024px)
- [x] `Sidebar` component with navigation
- [x] `BottomNavigation` component
- [x] `TopBar` with title and profile
- [x] `ResponsiveLayout` auto-switching wrapper

### 1.3 Firebase Integration
- [ ] Initialize Firebase config in `lib/firebase.ts`
- [ ] Test Firestore connection
- [ ] Create basic CRUD hooks (useProducts, useOrders)

---

## Phase 2: Customer Portal Components

### 2.1 Product Display
- [ ] `ProductCard` (image, name, price, CTA)
- [ ] `ProductGrid` layout
- [ ] `ProductDetail` page component
- [ ] Image carousel (Shadcn Carousel)

### 2.2 Booking Flow
- [ ] `BookingForm` (quantity, address, date)
- [ ] `BookingSummary` component
- [ ] `ConfirmationCard` after order

### 2.3 Order Tracking
- [x] `OrderCard` (compact view)
- [x] `OrderDetail` (full view)
- [x] Status badge component

---

## Phase 3: Sales Agent Portal Components

### 3.1 Dashboard Cards
- [ ] `StatCard` (Today's Orders, Revenue, etc.)
- [ ] `ProgressCard` (Target vs Achieved)
- [ ] `QuickActionCard` (Create Order, Record Visit)

### 3.2 Daily Execution
- [ ] `RouteList` component (assigned routes)
- [ ] `VisitLogForm` (mark visit complete)
- [ ] `LeadForm` (capture new leads)

### 3.3 Order Management
- [ ] `CreateOrderForm` (agent-side booking)
- [ ] `OrderList` with filters
- [ ] Order status updater

---

## Phase 4: Admin Dashboard Components

### 4.1 Overview Stats
- [ ] `AdminStatCard` (Total Orders, Revenue, Agents)
- [ ] `ChartCard` (using Recharts or similar)
  - Orders over time
  - Revenue breakdown

### 4.2 Data Tables
- [ ] `OrderTable` with pagination (Shadcn Table)
- [ ] `ProductTable` (CRUD actions)
- [ ] `AgentTable` (list with metrics)

### 4.3 Modals & Forms
- [ ] `OrderDetailModal`
- [ ] `ProductFormModal` (Create/Edit)
- [ ] `ConfirmationDialog` (Shadcn Alert Dialog)

---

## Phase 5: Shared Components

### 5.1 Form Inputs (Shadcn)
- [ ] `Input` component
- [ ] `Select` dropdown
- [ ] `DatePicker`
- [ ] `Textarea`
- [ ] Form validation wrapper

### 5.2 Feedback
- [ ] `Toast` notifications (Shadcn Toast)
- [ ] `LoadingSpinner`
- [ ] `EmptyState` component
- [ ] Error boundaries

### 5.3 Navigation
- [ ] `Breadcrumbs`
- [ ] `Tabs` component
- [ ] `Pagination`

---

## Phase 6: Screens (Final Build Order)

### Customer Portal (6 screens)
- [x] Home / Product Catalog
- [x] Product Detail
- [x] Booking / Checkout
- [x] Booking Confirmation
- [x] Order History
- [x] Order Detail

### Sales Agent Portal (5 screens)
- [ ] Login / Attendance
- [ ] Dashboard
- [ ] Route Planner
- [ ] Order Creator
- [ ] Lead Manager

### Admin Dashboard (5 screens)
- [ ] Overview Dashboard
- [ ] Order Management
- [ ] Product Management (List + CRUD)
- [ ] Agent Manager
- [ ] Settings

---

## Special Components (Admin Portal)

- [ ] **Product Editor:** A form to add/edit products with image upload.
- [ ] **Order Manager:** List of orders with filters (status, date, agent).
- [ ] **Agent Manager:** List of Agents and their assigned routes.
- [ ] **LR Upload Modal:** A dialog to upload the transport receipt image.

---

## Testing Checklist

- [ ] Test responsive layouts (mobile and desktop)
- [ ] Verify Firestore reads/writes
- [ ] Test form validations
- [ ] Check loading states
- [ ] Verify error handling

---

## Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] Firebase production credentials
- [ ] Test preview deployment
- [ ] Merge to `main` for production
- [ ] Monitor for errors

---

**Status:** Checklist locked ✅  
**Next:** Start Phase 1 – Core System
