# AgroFix Frontend

React + Vite + Tailwind CSS frontend for the AgroFix bulk produce ordering marketplace.

## Architecture

```
src/
├── App.jsx                # Routes + top-level layout (Navbar/Footer)
├── main.jsx                # Entry point — providers (Toast, Auth, Cart)
├── api/                    # Thin wrappers around the backend API
│   ├── client.js            # Shared axios instance (auth header + error/401 handling)
│   ├── auth.js, products.js, orders.js
├── context/
│   ├── AuthContext.jsx       # Reactive auth state (user, login, logout)
│   ├── CartContext.jsx       # Persistent (localStorage) shopping cart
│   └── ToastContext.jsx      # Toast notifications (replaces alert()/confirm())
├── components/
│   ├── Navbar.jsx, Footer.jsx, ProtectedRoute.jsx
│   └── ui/                  # Shared primitives: Button, Input, Spinner,
│                             # EmptyState, StatusBadge, ConfirmDialog
├── pages/                  # One file per route
│   ├── LandingPage, LoginPage, SignupPage, ForgotPassword, ResetPassword, NotFound
│   ├── admin/                # ProductListAdmin, ProductForm, AdminOrders
│   └── user/                 # UserProducts, UserOrders
└── utils/                  # format.js (currency/date), validation.js
```

## Setup

```bash
npm install
cp .env.example .env   # set VITE_BACKEND_URL
npm run dev
```

## Notable fixes in this pass

- Every page previously duplicated its own `Cookies.get("token")` / `localStorage` parsing and
  read auth state independently; login/logout forced a full `location.reload()` as a workaround.
  Replaced with a single reactive `AuthContext`.
- All API calls went through raw `fetch()` (axios was installed but unused), with inconsistent
  token retrieval (`js-cookie` in some files, manual `document.cookie` parsing in others). Replaced
  with one axios instance (`api/client.js`) that attaches the auth header and normalizes errors.
- Error responses were read as `errorData.message`, but the backend returns `{ error: "..." }` —
  so the real reason was silently dropped and a generic fallback always showed. Fixed centrally in
  the axios error interceptor.
- Fixed a dead link on the landing page (`/user/order` instead of `/user/orders`).
- Added a proper 404 page (previously any unmatched route silently rendered the landing page).
- Replaced `alert()` / `window.confirm()` with a toast system and a `ConfirmDialog` component.
- Added a persistent (localStorage-backed) cart with an order-review step before placing an order.
- Added client-side validation (email format, password strength, phone) to signup/login, matching
  what reset-password already did.
- Removed dead Vite boilerplate (default title/favicon, unused CSS/assets) and rebranded to AgroFix.
- Merged `ProductCreateForm`/`ProductEditForm` (near-duplicates) into one reusable `ProductForm`.
