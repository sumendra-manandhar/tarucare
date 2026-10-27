import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { contact, defaultHeroSlides, products as fallbackProducts, shopDefaults, withSkinBenefits } from './data'
import { api } from './lib/api'

const fallback = {
  products: fallbackProducts.map(withSkinBenefits),
  settings: { ...contact, ...shopDefaults, showTeaser: true, teaserText: 'Exciting new herbal blends are coming soon for every skin need.', heroSlides: defaultHeroSlides },
}

const SiteDataContext = createContext(fallback)

// Public site renders immediately with bundled data, then swaps in live data from the API.
// If the API is unreachable (e.g. static hosting) the bundled data simply stays.
export function SiteDataProvider({ children }) {
  const [data, setData] = useState(fallback)
  const [live, setLive] = useState(false)

  // Re-fetched after an order so stock levels stay current.
  const refresh = useCallback(
    () =>
      Promise.all([api.get('/products'), api.get('/settings')])
        .then(([products, settings]) => {
          setData({ products: products.map(withSkinBenefits), settings: { ...shopDefaults, heroSlides: defaultHeroSlides, ...settings } })
          setLive(true)
        })
        .catch(() => {}),
    [],
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  return <SiteDataContext.Provider value={{ ...data, live, refresh }}>{children}</SiteDataContext.Provider>
}

export const useSiteData = () => useContext(SiteDataContext)
