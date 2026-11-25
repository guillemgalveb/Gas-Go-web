'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AddVehicleForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError('')

    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const response = await fetch('/api/portal/vehicles', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result.error || 'No se ha podido guardar el vehículo.')
        return
      }

      form.reset()
      setOpen(false)
      router.refresh()
    } catch {
      setError('No se ha podido conectar con el servidor.')
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return <button className="portal-add-button" type="button" onClick={() => setOpen(true)}>Añadir vehículo <span>＋</span></button>
  }

  return (
    <form className="vehicle-form" onSubmit={submit}>
      <div className="vehicle-form-heading">
        <div><small>Nuevo vehículo</small><h3>Datos del vehículo</h3></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
      </div>
      <div className="vehicle-form-grid">
        <label>Nombre<input required name="name" minLength={2} placeholder="Mi coche" /></label>
        <label>Matrícula<input required name="licensePlate" minLength={4} maxLength={12} placeholder="1234 ABC" /></label>
        <label>Marca<input required name="make" minLength={2} placeholder="Marca" /></label>
        <label>Modelo<input required name="model" placeholder="Modelo" /></label>
        <label>Tipo
          <select required name="fuelType" defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            <option value="gasoline">Gasolina</option>
            <option value="diesel">Diésel</option>
            <option value="hybrid">Híbrido</option>
            <option value="electric">Eléctrico</option>
          </select>
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar vehículo'} <span>→</span></button>
    </form>
  )
}
