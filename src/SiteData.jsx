import { createContext, useContext, useEffect, useState } from 'react'
import { contact, defaultHeroSlides, products as fallbackProducts, withSkinBenefits } from './data'
import { api } from './lib/api'

const fallback = {
  products: fallbackProducts.map(withSkinBenefits),
  settings: { ...contact, showTeaser: true, teaserText: 'Exciting new herbal blends are coming soon for every skin need.', heroSlides: defaultHeroSlides },
}

const SiteDataContext = createContext(fallback)

// Public site renders immediately with bundled data, then swaps in live data from the API.
// If the API is unreachable (e.g. static hosting) the bundled data simply stays.
export function SiteDataProvider({ children }) {
  const [data, setData] = useState(fallback)

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/settings')])
      .then(([products, settings]) => setData({ products: products.map(withSkinBenefits), settings: { heroSlides: defaultHeroSlides, ...settings } }))
      .catch(() => {})
  }, [])

  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>
}

export const useSiteData = () => useContext(SiteDataContext)
