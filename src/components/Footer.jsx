import { ArrowUp, Lock } from 'lucide-react'
import { useSiteData } from '../SiteData'
import { Mountains } from './Illustrations'

export default function Footer() {
  const { products, settings: contact } = useSiteData()
  return (
    <footer className="grain relative overflow-hidden bg-moss text-cream">
      <div className="relative mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-serif text-3xl leading-tight">Pure care.<br /><em className="text-amber">Natural beauty.</em></p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/65">
              Handcrafted Ayurvedic soaps inspired by Nepal’s nature. Pure. Natural. Nourishing. For every skin.
            </p>
            <a href="#collection" className="mt-6 inline-flex rounded-full bg-cream px-5 py-3 text-sm font-semibold text-moss transition hover:bg-amber">
              Shop the collection
            </a>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber">Collection</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/70">
              {products.map((p) => (
                <li key={p.id}><a href="#collection" className="transition hover:text-cream">{p.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/70">
              <li><a href={contact.phoneHref} className="hover:text-cream">{contact.phone}</a></li>
              <li><a href={`mailto:${contact.email}`} className="break-all hover:text-cream">{contact.email}</a></li>
              <li><a href={`https://${contact.website}`} className="hover:text-cream">{contact.website}</a></li>
              <li>Made in Nepal 🇳🇵</li>
              <li>
                <a href={contact.facebook} className="hover:text-cream">Facebook</a> · <a href={contact.instagram} className="hover:text-cream">Instagram</a> @tarucare
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* oversized wordmark */}
      <div className="relative mt-16">
        <Mountains className="absolute inset-x-0 bottom-0 h-28 w-full opacity-50" />
        <p aria-hidden="true" className="relative select-none text-center font-serif text-[24vw] font-bold leading-[0.8] tracking-tight text-cream/[0.07]">
          TARU
        </p>
      </div>

      <div className="relative border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-cream/50 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} TARU CARE · Herbal Soap. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {/* Static previews (VITE_DEMO) open the in-browser admin at #admin. */}
            <a href={import.meta.env.VITE_DEMO ? '#admin' : '/admin'} className="inline-flex items-center gap-1.5 hover:text-cream">
              <Lock size={13} /> Admin
            </a>
            <a href="#top" className="inline-flex items-center gap-1.5 hover:text-cream">
              Back to top <ArrowUp size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
