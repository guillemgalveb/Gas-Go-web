import { redirect } from 'next/navigation'
import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { GarageDoor } from './GarageDoor'
import { LogoutButton } from './LogoutButton'

const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
const currencyFormatter = new Intl.NumberFormat('es-ES', { currency: 'EUR', style: 'currency' })

export default async function PortalPage() {
  const user = await appAuth.getCurrentUser()
  if (!user) redirect('/#acceso')

  const payload = await getPayloadClient()
  const [vehiclesResult, refuelsResult, walletResult] = await Promise.all([
    payload.find({
      collection: 'vehicles',
      limit: 20,
      overrideAccess: false,
      sort: '-createdAt',
      user,
      where: { owner: { equals: user.id } },
    }),
    payload.find({
      collection: 'refuels',
      depth: 1,
      limit: 5,
      overrideAccess: false,
      sort: '-occurredAt',
      user,
      where: { owner: { equals: user.id } },
    }),
    payload.find({
      collection: 'wallet-entries',
      limit: 100,
      overrideAccess: false,
      sort: '-occurredAt',
      user,
      where: { owner: { equals: user.id } },
    }),
  ])

  const firstName = user.name?.trim().split(/\s+/)[0] || 'conductor'
  const points = walletResult.docs.reduce((total, entry) => total + entry.points, 0)

  return (
    <main className="portal-page">
      <header className="portal-header">
        <a className="portal-brand" href="/" aria-label="Volver a Gas&Go">
          <img src="/gasandgo-logo.png" alt="Gas&Go" />
        </a>
        <nav className="portal-nav" aria-label="Navegación del portal">
          <a href="#resumen">Resumen</a>
          <a href="#vehiculos">Vehículos</a>
          <a href="#repostajes">Repostajes</a>
          <a href="#wallet">Wallet</a>
        </nav>
        <div className="portal-account">
          <span>{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <section className="portal-dashboard" id="resumen">
        <div className="portal-welcome">
          <span className="eyebrow">Portal del usuario</span>
          <h1>Hola, {firstName}.</h1>
          <p>Tu movilidad, tus recompensas y toda tu actividad en un solo lugar.</p>
        </div>
        <div className="portal-metrics">
          <article><small>Go Points</small><strong>{points.toLocaleString('es-ES')}</strong><span>Saldo disponible</span></article>
          <article><small>Vehículos</small><strong>{vehiclesResult.totalDocs}</strong><span>Registrados en tu cuenta</span></article>
          <article><small>Repostajes</small><strong>{refuelsResult.totalDocs}</strong><span>Operaciones completadas</span></article>
        </div>
      </section>

      <GarageDoor vehicles={vehiclesResult.docs.map(({ fuelType, id, licensePlate, make, model, name }) => ({
        fuelType,
        id,
        licensePlate,
        make,
        model,
        name,
      }))} />

      <section className="portal-split">
        <div className="portal-panel" id="repostajes">
          <div className="portal-panel-heading"><div><span className="eyebrow">Actividad</span><h2>Últimos repostajes</h2></div></div>
          {refuelsResult.docs.length ? (
            <div className="refuel-list">
              {refuelsResult.docs.map((refuel) => (
                <article key={refuel.id}>
                  <div><strong>{refuel.station}</strong><span>{dateFormatter.format(new Date(refuel.occurredAt))} · {refuel.quantity} {refuel.energyType === 'electric' ? 'kWh' : 'L'}</span></div>
                  <div><strong>{currencyFormatter.format(refuel.totalAmount)}</strong><span>+{refuel.goPoints} Go Points</span></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="portal-empty-state portal-empty-state--compact"><span>02</span><div><h3>Sin repostajes todavía</h3><p>Tus operaciones aparecerán aquí automáticamente.</p></div></div>
          )}
        </div>

        <div className="wallet-card" id="wallet">
          <div className="wallet-top"><span>GAS&amp;GO WALLET</span><i /></div>
          <div className="wallet-balance"><small>Saldo de puntos</small><strong>{points.toLocaleString('es-ES')} <em>Go</em></strong></div>
          <div className="wallet-details">
            <div><small>Miembro</small><span>{user.name}</span></div>
            <div><small>Nivel</small><span>{points >= 1000 ? 'Road Pro' : 'Road Starter'}</span></div>
          </div>
          <p>{walletResult.docs.length ? `${walletResult.docs.length} movimientos en tu wallet` : 'Empieza a repostar para conseguir tus primeros Go Points.'}</p>
        </div>
      </section>
    </main>
  )
}
