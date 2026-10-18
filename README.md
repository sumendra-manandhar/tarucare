# TARU CARE – Herbal Soap

Product website and admin panel for TARU CARE, handcrafted Ayurvedic herbal soaps from Nepal.

- **Website:** themed hero carousel, shop by skin need, all soaps, ingredients, how to use, story, quality process, FAQ, contact.
- **Admin (`/admin`):** manage products (photos, prices, skin benefits, visibility), order requests & inquiries, contact details and hero slides.

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

Data lives in `server/db.json` and uploaded photos in `server/uploads/` — both are git-ignored, so back them up separately.
