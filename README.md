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

## Deploy on Vercel

The site and the API both run on Vercel: `api/index.js` is a serverless function, and data and photos are kept in Upstash Redis (Vercel's own disk doesn't persist).

1. In the Vercel project, open **Storage → Create Database → Upstash for Redis** (the free plan is fine) and connect it to this project. Vercel adds its connection variables automatically.
2. In **Settings → Environment Variables**, add `ADMIN_PASSWORD` with the password you want for the admin panel. `SESSION_SECRET` is optional.
3. Redeploy. The admin panel is linked from the footer and lives at `/admin`.

To change the admin password, edit `ADMIN_PASSWORD` and redeploy; everyone signed in is signed out.

### Demo admin (for showing clients)

Anyone can try the admin without a password or any storage connected: click **Explore the demo admin** on the sign-in page, or share the direct link **`/admin?demo`**. It runs the full admin on sample data kept only in that visitor's browser (`src/lib/demoApi.js`), with a banner and an **Exit demo** button. The real shop's data is never touched.

## Self-hosted production

```bash
npm run build
npm start              # serves the built site + API on PORT (default 3001)
```

A static preview without the server can be built with `VITE_DEMO=1 npm run build`. It runs an in-browser copy of the API (`src/lib/demoApi.js`) that keeps everything in the visitor's localStorage: the cart and checkout work, and the admin opens from the footer at `#admin` (demo password `taru@123`). Production builds never include it.

Data lives in `server/db.json` and uploaded photos in `server/uploads/` — both are git-ignored, so back them up separately.
