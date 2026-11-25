'use client'

import { useState } from 'react'

export function LogoutButton() {
  const [pending, setPending] = useState(false)

  const logout = async () => {
    setPending(true)
    try {
      await fetch('/api/app-auth/logout', { method: 'POST' })
      window.location.assign('/')
    } finally {
      setPending(false)
    }
  }

  return (
    <button className="portal-logout" type="button" onClick={logout} disabled={pending}>
      {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
  )
}
