import React, { Suspense, lazy, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SiteDataProvider } from './SiteData.jsx'
import { CartProvider } from './Cart.jsx'
import './index.css'

// Admin code is split into its own chunk so visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
// Real deployments serve the admin at /admin. Static previews (VITE_DEMO) can only use the
// URL hash, so there the admin lives at #admin.
const isAdmin = () =>
  import.meta.env.VITE_DEMO ? /^#admin/.test(window.location.hash) : window.location.pathname.startsWith('/admin')

function Root() {
  const [admin, setAdmin] = useState(isAdmin)
  useEffect(() => {
    const onHash = () => setAdmin((was) => {
      const now = isAdmin()
      if (now !== was) window.scrollTo(0, 0)
      return now
    })
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return admin ? (
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>
  ) : (
    <SiteDataProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SiteDataProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
