# AGENTS.md — Shodesh Medicine Shop (Frontend)

Guidelines, architecture patterns, and conventions for AI agents and developers working on the **Shodesh Medicine Shop Frontend**.

---

## 1. Project Overview

- **Application Name**: Shodesh Medicine Shop (Frontend Client)
- **Domain**: Pharmacy Point of Sale (POS), Inventory & Batch/Expiry Management, Sales, Returns, and User Administration.
- **Architecture Setup**: **Decoupled / Multi-repo**.
  - This repository contains exclusively the **Frontend** client.
  - The backend is developed separately in a dedicated **NestJS** repository.
  - The frontend communicates with the backend via RESTful APIs

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode, no `any`)
- **UI & Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`), Lucide React icons
- **State Management**: React Context
- **Forms & Validation**: React Hook Form (`^7.x`) + Zod (`^4.x`) with `@hookform/resolvers`
- **Charts & Analytics**: Recharts
- **Package Manager**: `pnpm` (default: `pnpm@11.x`)

---

## 3. Directory Structure

```text
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── dashboard/        # Dashboard subroutes (medicines, sales, returns, users)
│   ├── login/            # Authentication page
│   ├── layout.tsx        # Root layout with context providers
│   ├── page.tsx          # Main POS / Sales register view
│   └── globals.css       # Tailwind CSS base styles
├── components/           # Modular React components
│   ├── dashboard/        # Analytics, summary metrics & charts
│   ├── layout/           # Header, Sidebar, Navigation components
│   ├── medicines/        # Medicine list, batch forms, stock alerts
│   ├── pos/              # Point of sale cart, barcode/search, receipt modal
│   ├── returns/          # Return processing & refund tables
│   ├── ui/               # Reusable primitives (Buttons, Inputs, Badges, Modals)
│   └── users/            # User management table & role assignment forms
├── repositories/         # DATA ACCESS LAYER (Crucial for API migration)
│   ├── authRepository.ts
│   ├── medicineRepository.ts
│   ├── returnRepository.ts
│   ├── salesRepository.ts
│   └── userRepository.ts
├── stores/               # Global state providers (CartContext, AuthContext)
├── types/                # TypeScript interfaces, enums, and domain types (index.ts)
├── data/                 # Fallback initial mock data (used for offline/dev)
└── lib/                  # Utilities (expiry calculation, date formatting, cn helpers)
```

---

## 4. Architectural Rules & Coding Standards

### Rule 1: Always Use the Repository Layer
- **Never make direct API calls or manipulate local storage inside UI components or pages.**
- All read and write operations must go through functions exported in `src/repositories/*`.
- *Why?* The app is currently using `localStorage` / mock data during early development. When connecting to the NestJS backend, only the repository methods will be updated to `fetch()`/`axios` calls without touching any UI code.

### Rule 2: Multi-Batch & Expiry Calculation Consistency
- Medicines contain multiple batches (`MedicineBatch[]`), each with `batchNumber`, `expiryDate` (ISO format `YYYY-MM-DD`), and `stock`.
- The medicine's `currentStock` is always the computed sum of all active batch stocks:
  $$\text{currentStock} = \sum \text{batch.stock}$$
- Always utilize `getDaysRemaining(expiryDate)` from `@/lib/expiryUtils` for stock status checks:
  - **Expired**: Days $\le 0$
  - **Expiring Soon**: $1 \le \text{Days} \le 90$
  - **Good**: Days $> 90$
- In the POS, default to FIFO / nearest expiring batches to prevent stock loss.

### Rule 3: Form Handling & Validation
- Always use `react-hook-form` paired with `zod` for schemas.
- Place reusable schemas alongside related types or in component-adjacent files.
- Always provide clear inline validation errors and disabled/loading states during submission.

### Rule 4: Type Safety First
- Centralize domain models in `src/types/index.ts`.
- Avoid `any` or loose type casting (`as unknown as ...`) unless parsing legacy storage keys.
- Ensure all repository functions have explicit return types (e.g., `Promise<Medicine[]>` or `Medicine[]`).

### Rule 5: UI & Styling Principles
- Use Tailwind utility classes via `clsx` / `tailwind-merge` (`cn` helper in `src/lib/utils.ts`).
- Ensure all interactive elements have visible focus, hover, and disabled states.
- Support quick numeric entry and keyboard shortcuts (barcode scanners, Enter to search/add).

---

## 5. Integrating with the NestJS Backend

When ready to connect to the separate NestJS backend:

1. **Environment Variables**:
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```
2. **API Client**:
   Implement a centralized `src/lib/apiClient.ts` that automatically handles:
   - Base URL configuration
   - Attaching `Authorization: Bearer <token>` from `AuthContext`
   - Global HTTP error handling (401 redirects, 500 toast alerts)
3. **Repository Migration**:
   Update `src/repositories/*` functions from synchronous `localStorage` handlers to asynchronous `Promise`-based HTTP calls:
   ```ts
   // Example migration in medicineRepository.ts
   export async function getAllMedicines(): Promise<Medicine[]> {
     return apiClient.get('/medicines');
   }
   ```

---

## 6. Developer & Agent Workflow Commands

```bash
# Install dependencies
pnpm install

# Start local Next.js development server (Turbopack enabled)
pnpm dev

# Typecheck and production build
pnpm build

# Linting and style validation
pnpm lint
```
