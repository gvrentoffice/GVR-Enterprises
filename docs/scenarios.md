# Ryth-Bazar Unified Portal Scenarios

Detailed journeys for Customers, Sales Agents, and Admins within the B2B ecosystem.

---

## 1. Customer B2B Journey
**Scenario:** A shop owner replenishes supplies.
1.  **Auth:** Login via WhatsApp.
2.  **Trade Preview:** Sees catalog with **MOQ** markers. Price is hidden (e.g., "Pending Approval").
3.  **Order Placement:** Adds 100 units to cart. Checkout uses the pre-filled shop address. Adds "Warehouse 2" as secondary address.
4.  **Confirmation:** Receiver's popup: *"Your order is successfully placed. Our sales agent will get in touch to preview and confirm your order."*
5.  **Tracking:** 
    *   Finds **Invoice** in history after agent approval.
    *   Monitors payment status: "Advance Paid," "Fully Paid."
    *   Live tracking: Sees vehicle number and driver info once dispatched.

---

## 2. Sales Agent B2B Journey
**Scenario:** Managing a route and processing orders.
1.  **Start:** Marks attendance. Reviews **Route Planner** for the day.
2.  **Onboarding:** In a new store, fills the form and snaps photos of the store front + visiting card.
3.  **Sales Action:** Approves price access for the new lead. Monitors onboarding vs. sales targets.
4.  **Order Processing:**
    *   Receives customer order. Verifies inventory.
    *   Generates **Invoice**. Updates the system after collecting the **Advance Payment**.
    *   Once full payment is received, inputs dispatch info (Vehicle details).

---

## 3. Admin B2B Journey
**Scenario:** Managing inventory and verifying business flow.
1.  **Inventory Control:**
    *   Bulk uploads 50 new products via CSV.
    *   Sets "Online/Offline" status for products. Mark items "Out of Stock" if unavailable.
2.  **Dashboard:** Checks metrics (Total leads, agents online, total delivery today). Identifies most-sold products.
3.  **Verification:**
    *   Approves a large order processed by Agent Rajesh.
    *   Verifies the payment receipt and clicks "Verify Delivery" to finalize the lifecycle.
4.  **Logistics:** Monitors the inventory health and adjusts stock levels.

> [!IMPORTANT]
> **Database Rule:** All portals share a **Single Firestore Database**. This ensures that when the Admin approves a payment, the Customer sees their order status change instantly.
