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
- **State Management**: React Context (`AuthContext` wraps TanStack Query) + TanStack Query (server state / data fetching)
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
│   ├── providers/        # AppProviders (QueryClientProvider)
│   ├── returns/          # Return processing & refund tables
│   ├── ui/               # Reusable primitives (Buttons, Inputs, Badges, Modals)
│   └── users/            # User management table & role assignment forms
├── services/            # API LAYER — one function per backend endpoint (single source of truth)
│   └── auth.service.ts  # getMe / login / logout
├── hooks/               # TanStack Query hooks (consume services)
│   └── auth/            # useSession, useLogin, useLogout
├── repositories/        # Legacy localStorage/mock data access (being migrated to services/)
│   ├── medicineRepository.ts
│   ├── returnRepository.ts
│   ├── salesRepository.ts
│   └── userRepository.ts
├── stores/              # Global state providers (AuthContext wraps TanStack Query; CartContext)
├── types/               # TypeScript interfaces, enums, and domain types (index.ts)
├── data/                # Fallback initial mock data (offline/dev, being migrated out)
├── lib/                 # apiClient.ts, apiErrors.ts, queryClient.ts, expiry & cn utilities
└── proxy.ts             # Next.js 16 route guard (httpOnly cookie presence → /login)
```

---

## 4. Architectural Rules & Coding Standards

### Rule 1: Data Access Goes Through the Services Layer
- **Never make direct API calls or touch `localStorage` inside UI components or pages.**
- Backend integration is done in `src/services/*` (one function per endpoint, the single source of truth), consumed by TanStack Query hooks in `src/hooks/*`. Components call hooks, never `fetch`.
- `src/lib/apiClient.ts` is the only place that calls `fetch` — it handles the `{ success, data }` envelope, sends `credentials: 'include'` (httpOnly auth cookies), and runs single-flight `/auth/refresh` on 401.
- `src/repositories/*` is legacy localStorage/mock data retained for not-yet-migrated features; migrate these to `services/` + TanStack Query hooks module by module (medicines → sales → returns → users).

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

Auth is already wired up against the real API (httpOnly cookies, TanStack Query, single-flight refresh). Other modules migrate the same way.

1. **Environment & Same-Origin Proxy** (`.env.local`):
   ```bash
   NEXT_PUBLIC_API_URL=/api/v1            # same-origin; next.config.ts rewrites /api/v1/* -> backend
   BACKEND_API_URL=http://localhost:5000  # server-only rewrite destination
   ```
   The rewrite keeps API calls same-origin so the browser stores the backend's httpOnly auth cookies for the frontend origin (sent automatically, and readable by `src/proxy.ts` for route guarding).
2. **apiClient** (`src/lib/apiClient.ts`):
   - Base URL from `NEXT_PUBLIC_API_URL`, `credentials: 'include'` on every request
   - Unwraps the `{ success, data }` envelope; throws `ApiError` on failure
   - Single-flight `/auth/refresh` on 401 (one refresh, all concurrent 401s retry once)
   - Registers a session-expired handler (cleared by `AuthProvider`) — no router coupling
3. **Services + Hooks** (no direct `fetch` in UI):
   ```ts
   // services/medicines.service.ts
   export const medicinesService = {
     getAll: () => api.get<Medicine[]>('/medicines'),
   };
   // hooks/medicines/useMedicines.ts
   export function useMedicines() {
     return useQuery({ queryKey: ['medicines'], queryFn: medicinesService.getAll });
   }
   ```
   Migrate each `repositories/*` module to `services/*` + `hooks/*` (medicines → sales → returns → users).
4. **Auth & Routing**:
   - Tokens are **httpOnly cookies only — never `localStorage`**. The frontend never reads/attaches tokens.
   - `src/stores/AuthContext.tsx` wraps `useSession` (`GET /auth/me`) + login/logout mutations, exposing the `useAuth()` shape.
   - `src/proxy.ts` (Next.js 16 "proxy", formerly middleware) guards `/dashboard/*` by cookie presence; real validation is `/auth/me`.

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
