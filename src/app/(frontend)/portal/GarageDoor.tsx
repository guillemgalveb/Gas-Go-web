'use client'

import { useState } from 'react'
import { AddVehicleForm } from './AddVehicleForm'

import type { Vehicle } from '@/payload-types'

type GarageVehicle = {
  fuelType: 'diesel' | 'electric' | 'gasoline' | 'hybrid'
  id: Vehicle['id']
  licensePlate: string
  make: string
  model: string
  name: string
}

const fuelLabels = {
  diesel: 'Diésel',
  electric: 'Eléctrico',
  gasoline: 'Gasolina',
  hybrid: 'Híbrido',
}

export function GarageDoor({ vehicles }: { vehicles: GarageVehicle[] }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="garage-experience" id="vehiculos">
      <div className="garage-heading">
        <div>
          <span className="eyebrow">Tu garaje</span>
          <h2>Vehículos registrados</h2>
        </div>
        <div className="garage-count"><strong>{vehicles.length}</strong><span>{vehicles.length === 1 ? 'vehículo' : 'vehículos'}</span></div>
      </div>

      <div className={`garage-stage ${open ? 'garage-stage--open' : ''}`}>
        <div className="garage-interior" aria-hidden={!open}>
          <div className="garage-ceiling"><i /><i /><i /></div>
          <div className="garage-content">
            <div className="garage-content-heading">
              <div><span>GAS&amp;GO GARAGE</span><h3>{vehicles.length ? 'Tu colección está lista.' : 'Hay espacio para tu primer vehículo.'}</h3></div>
              <div className="garage-actions">
                <button className="garage-close" type="button" onClick={() => setOpen(false)}>Cerrar puerta <span>↑</span></button>
                <AddVehicleForm />
              </div>
            </div>

            {vehicles.length ? (
              <div className="vehicle-list">
                {vehicles.map((vehicle) => (
                  <article className="vehicle-item" key={vehicle.id}>
                    <div className="vehicle-icon">G</div>
                    <div><small>{vehicle.name}</small><h3>{vehicle.make} {vehicle.model}</h3><span>{fuelLabels[vehicle.fuelType]}</span></div>
                    <strong>{vehicle.licensePlate}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <div className="garage-empty">
                <div className="garage-car-outline"><span /><i /><b /></div>
                <div><span>PLAZA DISPONIBLE</span><h3>Aún no tienes vehículos</h3><p>Añade tu primer vehículo para vincularlo a la experiencia Gas&amp;Go.</p></div>
              </div>
            )}
          </div>
        </div>

        <button
          className="garage-door"
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={open ? 'Cerrar la puerta del garaje' : 'Abrir la puerta del garaje para ver los vehículos'}
        >
          <span className="garage-door-brand">GAS&amp;GO</span>
          <span className="garage-door-slats" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</span>
          <span className="garage-door-control">
            <i aria-hidden="true" />
            <span>{open ? 'Cerrar garaje' : 'Pulsa para abrir'}</span>
            <small>{open ? 'Ocultar vehículos' : 'Ver tus vehículos'}</small>
          </span>
          <span className="garage-door-base" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
