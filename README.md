# Shofy — Ecommerce Multivendor Marketplace

Full rewrite of the Shofy marketplace platform.

**Stack:** Laravel 11 API · Next.js 14 (App Router) · Tailwind CSS · TanStack Query · Zustand

---

## Quick Start

### Backend

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Configure your database in .env, then run migrations + seed
php artisan migrate --seed

# Create storage symlink
php artisan storage:link

# Start the dev server (port 8000)
php artisan serve
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start the dev server (port 3000)
npm run dev
```

---

## Architecture

```
shofy-rewrite/
├── backend/                  # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/      # Public + customer API
│   │   │   │   ├── Admin/    # Admin panel API
│   │   │   │   └── Vendor/   # Store owner API
│   │   │   ├── Resources/    # API response transformers
│   │   │   └── Middleware/
│   │   ├── Models/           # 30+ Eloquent models
│   │   └── Services/         # Business logic layer
│   ├── database/
│   │   ├── migrations/       # 11 migration files
│   │   └── seeders/
│   └── routes/api.php        # All API routes
│
└── frontend/                 # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── (store pages) shop, products, cart, checkout…
        │   ├── account/      # Customer dashboard
        │   ├── admin/        # Admin panel
        │   └── vendor/       # Vendor dashboard
        ├── components/
        │   ├── layout/       # Header, Footer, SearchModal
        │   ├── product/      # ProductCard, ProductFilter…
        │   ├── cart/         # CartDrawer
        │   └── ui/           # Pagination, StarRating, CountdownTimer
        ├── store/            # Zustand stores (cart, auth, wishlist)
        ├── lib/              # API client, utils
        └── types/            # Full TypeScript types
```

## API Endpoints

| Prefix | Auth | Description |
|--------|------|-------------|
| `GET /api/v1/products` | No | Product listing with filters |
| `POST /api/v1/auth/login` | No | Customer login |
| `POST /api/v1/cart` | No* | Add to cart |
| `POST /api/v1/checkout` | Required | Place order |
| `GET /api/v1/orders` | Required | Order history |
| `GET /api/v1/admin/*` | Admin role | Admin management |
| `GET /api/v1/vendor/*` | Any auth | Vendor dashboard |

*Cart works for both guests (session) and authenticated customers.

## Default Credentials (after seeding)

- **Admin:** admin@shofy.com / password

## Features

- ✅ Multivendor marketplace with store management
- ✅ Product catalog with variations, attributes, flash sales
- ✅ Cart (guest + authenticated with merge)
- ✅ Checkout with Stripe, PayPal, COD, bank transfer
- ✅ Order tracking (public + authenticated)
- ✅ Wishlist, compare, recently viewed
- ✅ Review system with star ratings
- ✅ Blog with categories and tags
- ✅ Vendor dashboard with payout requests
- ✅ Admin panel (products, orders, customers, stores, blog)
- ✅ Coupon/discount system
- ✅ Newsletter subscription
- ✅ Responsive design (mobile-first)
- ✅ Password reset via email
