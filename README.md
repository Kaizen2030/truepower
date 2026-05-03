# TruePower — React + Vite + Supabase E-Commerce

Multi-page e-commerce site for TruePower Kenya. Built with React, Vite, Tailwind CSS, React Router, and Supabase.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, categories, featured products, testimonials |
| `/shop` | All products with category filter + search + sort |
| `/product/:id` | Product detail page with image gallery |
| `/wishlist` | Saved products (stored in localStorage) |
| `/about` | About TruePower |
| `/admin` | Admin dashboard (requires login) |
| `/admin/login` | Admin sign-in |

---

## Setup

### 1. Clone and install
```bash
git clone <your-repo>
cd truepower
npm install
```

### 2. Supabase setup
1. Go to [supabase.com](https://supabase.com) → your project
2. Open the **SQL Editor** and run everything in `supabase-schema.sql`
3. Go to **Storage** → create a bucket called `products` → set to **Public**
4. Go to **Authentication** → create an admin user (email + password)

### 3. Environment variables
Create a `.env` file (copy from `.env.example`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Find these in Supabase → Settings → API.

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
# Push to GitHub, then connect repo in vercel.com
# Add env vars in Vercel dashboard:
# VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

`vercel.json` is already configured for SPA routing.

---

## Admin Usage

1. Visit `/admin/login` and sign in with your Supabase auth credentials
2. **Products tab** — add products with name, price, category, images, features, specs
3. **Testimonials tab** — add customer reviews that show on homepage
4. **Settings tab** — update WhatsApp number, hero text, stats

### Product image upload
- Upload images directly from the admin panel
- Images go to Supabase Storage (`products` bucket)
- Multiple images supported — first image is the cover

---

## Product categories

| Key | Label |
|-----|-------|
| `wall-heaters` | Wall Heaters |
| `with-pump` | With Pump |
| `shower-heads` | Shower Heads |
| `accessories` | Accessories |

---

## Tech Stack

- **React 18** + **Vite 5**
- **React Router 6** — multi-page routing
- **Tailwind CSS 3** — utility styling
- **Supabase** — database, auth, file storage
- **Lucide React** — icons
- **Syne + DM Sans** — Google Fonts

## Customising WhatsApp number
Go to Admin → Settings tab → update WhatsApp Number. Or edit directly in `.env` by updating the default in `src/lib/supabase.js`.
