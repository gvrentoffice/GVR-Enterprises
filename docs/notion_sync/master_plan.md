# PAGE 1: Ryth_Bazar Master Plan

## 1. Project Overview & Tech Stack

**Product: Unified E-Commerce System**
- **Customer Website** (Browse & Book)
- **Sales Agent Portal** (Daily Tasks & Leads)
- **Admin Dashboard** (Data & Control)

**Frontend:**
- Customer/Admin: Next.js 15 + Tailwind CSS + Shadcn
- Sales App: Flutter (Phase 2)

**Backend:**
- Firebase:
  - Firestore (Primary Database)
  - Storage (Media & Files)
  - Authentication (Optional)
  - Analytics (Basic tracking)
- Cloud Functions (Optional server logic)

**Version Control & Deployment:**
- GitHub (Single repo → monorepo later)
- Vercel (Automatic deployment)

---

## 2. Deployment Strategy (Automated GitHub → Vercel)

### 2.1 Production Setup
- **Branch:** `main`
- **Trigger:** Push to `main` branch auto-deploys
- **URL:** `https://ryth-bazar.vercel.app` (or custom)
- **Firebase:** Production Firestore

### 2.2 Development Setup  
- **Branch:** `dev` (or feature branches)
- **Trigger:** Preview deployments for PRs
- **URL:** Auto-generated Vercel previews
- **Firebase:** Dev Firestore (optional, same instance, different collections)

### 2.3 Workflow Rules
1. **Never commit to `main` directly.**
2. All development happens in `dev` or feature branches.
3. Pull Request (PR) → Review → Merge to `main`
4. Vercel automatically builds and deploys on merge.

### 2.4 GitHub → Vercel Integration
- Connect Vercel to GitHub repo
- Auto-deploy on `main` push
- Preview URLs for all branches

---

## 3. Development Workflow (Local → Dev → Production)

### Phase 1: Local Development
1. Clone repo
2. Install dependencies (`npm install`)
3. Create `.env.local` with Firebase config
4. Run `npm run dev` → localhost:3000
5. Test locally

### Phase 2: Push to Dev Branch
1. Commit changes to `dev`
2. Push to GitHub
3. Vercel creates preview URL
4. Test on preview

### Phase 3: Merge to Main (Production)
1. Create PR: `dev` → `main`
2. Review changes
3. Merge
4. Vercel auto-deploys to production

---

## 4. Firebase Configuration (Single Backend for All Apps)

### 4.1 Firestore Structure
```
products/
  {productId}
    - name, price, images, stock, etc.

orders/
  {orderId}
    - customerId, items[], total, status, etc.

agents/
  {agentId}
    - name, territory, metrics, etc.

routes/
  {routeId}
    - agentId, locations[], date, etc.
```

### 4.2 Security Rules
- **Customer:** Read products, write orders (with limits)
- **Agent:** Read assigned data, write visit logs
- **Admin:** Full read/write access

---

## 5. File Structure (Next.js 15 App Router)

```
ryth-bazar/
├── app/
│   ├── (customer)/        # Customer-facing routes
│   ├── (agent)/           # Sales Agent Portal
│   ├── (admin)/           # Admin Dashboard
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Shadcn components
│   ├── shared/            # Reusable components
│   └── layouts/           # Layout components
├── lib/
│   ├── firebase.ts        # Firebase config
│   └── utils.ts           # Helper functions
├── public/                # Static assets
├── .env.local             # Firebase keys (gitignored)
└── package.json
```

---

## 6. Key Rules for Antigravity Agent

### 6.1 Design Consistency
- **Source of Truth:** "Design System" page (Hex codes locked)
- **Layout Rules:** "Unified UI Rules" (Sidebar/Stacked layouts)
- **Component Order:** "Web Component Checklist"

### 6.2 Scope Enforcement
- **Allowed Screens:** Only those in "Final Screen List"
- **No Scope Creep:** Don't add features not listed
- **No Premature Optimization:** Build → Test → Iterate

### 6.3 Deployment Rules
- All code goes to GitHub
- Test on Vercel preview first
- Merge to `main` only after approval

---

## 7. Success Criteria (Sprint Check)

**Sprint 1 (Week 1)**
- ✅ Core System setup (Theme, Router, Firebase)
- ✅ Customer Home + Product Detail
- ✅ Working deployment on Vercel

**Sprint 2 (Week 2)**
- ✅ Order flow (Booking → Confirmation)
- ✅ Sales Agent Dashboard
- ✅ Basic Firebase integration

**Sprint 3 (Week 3)**
- ✅ Admin Dashboard
- ✅ Order Management
- ✅ End-to-end testing

---

## 8. What NOT to Build (Phase 1)

- Payment gateway
- Advanced analytics
- User reviews
- Notifications
- Mobile apps
- Marketing features

---

## 9. Firebase Environment Variables (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ryth-bazar.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ryth-bazar
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ryth-bazar.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 10. Final Guardrails

1. **Design:** Follow "Design System" strictly
2. **Scope:** Build only "Final Screen List" screens
3. **Deployment:** GitHub → Vercel (never FTP)
4. **Testing:** Preview before production
5. **Communication:** Update user on blockers

---

**Status:** Master Plan locked ✅  
**Next:** Begin Sprint 1 – Core System Setup
