# TARU CARE – Herbal Soap

Marketing website and admin panel for TARU CARE, handcrafted Ayurvedic herbal soaps from Nepal.

Built with React 18, Vite, Tailwind CSS, Framer Motion and Lucide icons.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Admin panel

Open `/#admin` (or use the "Admin" link in the footer).

Demo login: `admin` / `taru@123`

- **Dashboard**: stock per soap, inquiries this week, low-stock alerts
- **Products**: add, edit, hide or delete soaps with a live soap-colour preview
- **Inquiries**: messages sent from the contact form; mark read/replied, reply by email
- **Settings**: contact details, social handles and the announcement bar

> Data is stored in the browser's `localStorage`, and the login is a demo check in the
> front end. Connect a real backend (API, database and authentication) before going live.

## Structure

```
src/
  admin/Admin.jsx        admin panel (login, dashboard, products, inquiries, settings)
  site/                  website sections (Hero, About, Collection, Ingredients, Benefits, Contact)
  components/Art.jsx     SVG soap-bar and ingredient illustrations
  components/ui.jsx      animated UI primitives (spotlight card, marquee, tilt, blur text…)
  data.js                default products, ingredients, settings and sample inquiries
  store.jsx              shared state persisted to localStorage
```
