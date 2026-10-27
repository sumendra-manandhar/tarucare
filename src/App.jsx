import { useEffect, useState } from 'react'
import Site from './site/Site'
import Admin from './admin/Admin'

const isAdminHash = () => /^#\/?admin/.test(window.location.hash)

export default function App() {
  const [admin, setAdmin] = useState(isAdminHash)
  useEffect(() => {
    const onHash = () => {
      const next = isAdminHash()
      setAdmin((prev) => {
        if (prev !== next) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return admin ? <Admin /> : <Site />
}
