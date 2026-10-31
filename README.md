# TARU CARE – Herbal Soap

Product website and admin panel for TARU CARE, handcrafted Ayurvedic herbal soaps from Nepal.

- **Website:** themed hero carousel, shop by skin need, all soaps, ingredients, how to use, story, quality process, FAQ, contact.
- **Shop:** add to cart from any soap, cart drawer with free-delivery progress and "pairs well with" suggestions, phone-first checkout (no account), order confirmation. Prices and stock are checked on the server.
- **Product photos:** each soap has a photo gallery (up to 12, with captions). The first photo is the cover on cards; the product popup shows the full gallery with swipe and full-screen view.
- **Admin (`/admin`):** orders (status flow pending → confirmed → shipped → delivered, cancel returns stock, notes, CSV export), products (photo gallery upload/reorder/captions, price, stock, skin benefits, visibility), inquiries, contact details, hero slides, and shop settings (cart on/off, delivery fee, free-delivery threshold, max per soap, payment methods, delivery promise).

**Stack:** React 18, Vite, Tailwind CSS v4, Framer Motion, Lucide · Express API with a JSON-file database.

## Run locally

```bash
npm install
cp .env.example .env   # then set ADMIN_PASSWORD and SESSION_SECRET
npm run dev            # site on http://localhost:5173, admin at /admin
```

## Accounts and access

- **Shoppers** sign in with Google at checkout (Admin → Settings → "Require Google sign-in to order"). Their orders and saved delivery details are in **My account** (person icon in the navbar), and they appear in Admin → **Customers**.
- **Owner** signs in to `/admin` with `ADMIN_PASSWORD` (email left empty) and can use every menu.
- **Staff** get their own email + password from the owner in Admin → **Team**. Each person has a role (Manager, Sales, Marketing, Support, or your own), and Team has a grid to choose which menus each role can open. The server enforces the same permissions, so hidden menus can't be reached through the API either. Switching an account off or setting a new password signs that person out immediately.

## Deploy on Vercel

The site and the API both run on Vercel: `api/index.js` is a serverless function, and data and product photos are kept in **Supabase** (Vercel's own disk doesn't persist).

1. **Supabase project:** `tarucare` (Mumbai region). The tables and the `product-photos` bucket are created by the SQL in `supabase/migrations/`. For a new project, run those files in order in Supabase → **SQL Editor**.
2. In Vercel → **Settings → Environment Variables**, add:
   - `SUPABASE_URL`: the project URL (already set for this project).
   - `SUPABASE_SECRET_KEY`: Supabase → **Project Settings → API Keys → Secret keys** (`sb_secret_…`). Mark it **Sensitive**. It stays on the server and must never be put in front-end code.
   - `ADMIN_PASSWORD`: the owner password for the admin panel.
   - `SESSION_SECRET`: a long random string (recommended in production, so sessions don't depend on the password).
   - `GOOGLE_CLIENT_ID`: for shopper sign-in (see below).
3. Redeploy. The admin panel is linked from the footer and lives at `/admin`.

### Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create a project, set up the **OAuth consent screen** (External, app name "TARU CARE", your support email), then **Create credentials → OAuth client ID → Web application**.
2. Under **Authorized JavaScript origins**, add every address the site is opened on, for example `https://tarucare.com.np`, `https://www.tarucare.com.np` and your `*.vercel.app` address. (No redirect URI is needed.)
3. Copy the client ID into Vercel as `GOOGLE_CLIENT_ID` and redeploy.

### Custom domain

In Vercel → **Settings → Domains**, add `tarucare.com.np` (and `www`), then create the DNS records Vercel shows at your domain registrar (for `.com.np`, wherever the domain's DNS is managed). HTTPS certificates are issued automatically. Add the new domain to Google's authorized origins as well.

To change the admin password, edit `ADMIN_PASSWORD` and redeploy; everyone signed in is signed out.

### Demo admin (for showing clients)

Anyone can try the admin without a password or any storage connected: click **Explore the demo admin** on the sign-in page, or share the direct link **`/admin?demo`**. It runs the full admin on sample data kept only in that visitor's browser (`src/lib/demoApi.js`), with a banner and an **Exit demo** button. The real shop's data is never touched.

### Where the data lives (Supabase)

| Table | Holds |
| --- | --- |
| `products` | Soaps: name, price, stock, photos, published |
| `orders` | Orders with status, total, payment and customer |
| `customers` | Shoppers who signed in with Google |
| `inquiries` | Contact form messages and order requests |
| `staff`, `roles` | Staff logins (hashed passwords) and role permissions |
| `settings` | Contact details, shop and checkout settings |

Each row keeps the full record in `data` plus readable columns for filtering in the Table Editor. Product photos are in Storage → `product-photos`. Row level security is on with no public policies: only the server, using the secret key, can read or change anything. For restorable daily backups, use Supabase's Pro plan; on the free plan, export orders regularly (Admin → Orders → Export CSV).

Storage is chosen automatically: Supabase when `SUPABASE_URL` and a secret key are set, otherwise Upstash Redis (`UPSTASH_REDIS_REST_URL`/`KV_REST_API_URL`), otherwise `server/db.json` locally.

## Self-hosted production

```bash
npm run build
npm start              # serves the built site + API on PORT (default 3001)
```

A static preview without the server can be built with `VITE_DEMO=1 npm run build`. It runs an in-browser copy of the API (`src/lib/demoApi.js`) that keeps everything in the visitor's localStorage: the cart and checkout work, and the admin opens from the footer at `#admin` (demo password `taru@123`). Production builds never include it.

Data lives in `server/db.json` and uploaded photos in `server/uploads/` — both are git-ignored, so back them up separately.
