import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SiteDataProvider } from './SiteData.jsx'
import './index.css'

// Admin code is split into its own chunk so visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const isAdmin = window.location.pathname.startsWith('/admin')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <SiteDataProvider>
        <App />
      </SiteDataProvider>
    )}
  </React.StrictMode>
)
