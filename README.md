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

## Production

```bash
npm run build
npm start              # serves the built site + API on PORT (default 3001)
```

A static preview without the server can be built with `VITE_DEMO=1 npm run build`. It runs an in-browser copy of the API (`src/lib/demoApi.js`) that keeps everything in the visitor's localStorage: the cart and checkout work, and the admin opens from the footer at `#admin` (demo password `taru@123`). Production builds never include it.

Data lives in `server/db.json` and uploaded photos in `server/uploads/` — both are git-ignored, so back them up separately.
