# Unified UI Rules

# 📐 Unified UI Design Structure  
*(Web → Android → iOS compatible)*

This document defines the **base UI system** for:
1. Customer Website
2. Sales Agent Portal
3. Admin Dashboard

All apps use the **same components**, assembled differently based on role.

---

## 0. Design Philosophy (Lock This)

- Card-first UI
- Consistent spacing, radius, typography
- Same components across platforms
- Layout adapts, components don't
- Data > decoration

---

## 1. Core Design Tokens (Shared Across All Apps)

### 1.1 Spacing Scale
- XS: 4
- S: 8
- M: 16
- L: 24
- XL: 32

### 1.2 Radius
- Small: 8
- Medium (default): 16
- Large: 24

### 1.3 Elevation
- Card: soft shadow / elevation 1
- Modal / Sheet: elevation 3

---

## 2. Core Layout Types (Web Implementation)

### 2.1 Sidebar Layout (Desktop > 1024px)
* **Structure:** `flex-row` container.
* **Sidebar:** Fixed width (`w-64`), `h-screen`, `sticky`.
* **Content:** `flex-1`, `overflow-y-auto`.

### 2.2 Stacked Layout (Mobile < 1024px)
* **Structure:** `flex-col` container.
* **Nav:** `BottomNavigation` fixed at bottom (`fixed bottom-0 w-full`).
* **Content:** Padding bottom (`pb-20`) to prevent hiding behind nav.

## 3. Navigation Components

### 3.1 Sidebar Navigation
- Logo / App Name
- Primary menu
- Secondary menu
- Utility section

### 3.2 Bottom Navigation
- Max 4–5 items
- One primary action (optional)

### 3.3 Top Bar
- Page title
- Optional search
- Profile dropdown

---

## 4. Core Card Types

- Stat Card
- Product Card
- Progress Card
- List Card
- Chart Card

---

## 5. Action Components
- Primary Button
- Secondary Button
- Icon Button

---

## 6. Form System
- Text Input
- Dropdown
- Date / Time
- Number Input

---

## 7. Data Display
- Data List (mobile-first)
- Data Table (admin desktop)

---

## 8. App-wise Assembly

### 8.1 Customer Website
- Stacked Layout
- Product Cards
- Detail Sheet
- Bottom Navigation

### 8.2 Sales Agent Portal
- Sidebar / Stacked
- Stat Cards
- Progress Cards
- Forms
- Data Lists

### 8.3 Admin Dashboard
- Sidebar Layout
- Stat Cards
- Chart Cards
- Data Tables

---

## 9. Platform Scalability Rules
- Same widgets across platforms
- Layout changes only
- Theme-driven UI

---

## 10. What NOT to Design Now
- Animations
- Illustrations
- Advanced charts
- Custom transitions
