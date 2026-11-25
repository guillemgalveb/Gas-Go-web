import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'

const fuelTypes = ['gasoline', 'diesel', 'hybrid', 'electric'] as const

export async function POST(request: Request) {
  const user = await appAuth.getCurrentUser()
  if (!user) return Response.json({ error: 'Inicia sesión para añadir un vehículo.' }, { status: 401 })

  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const make = typeof body.make === 'string' ? body.make.trim() : ''
    const model = typeof body.model === 'string' ? body.model.trim() : ''
    const licensePlate = typeof body.licensePlate === 'string' ? body.licensePlate.trim().toUpperCase() : ''
    const fuelType = typeof body.fuelType === 'string' ? body.fuelType : ''

    if (
      name.length < 2 ||
      make.length < 2 ||
      model.length < 1 ||
      !/^[A-Z0-9 -]{4,12}$/.test(licensePlate) ||
      !fuelTypes.includes(fuelType as (typeof fuelTypes)[number])
    ) {
      return Response.json({ error: 'Revisa los datos del vehículo.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const vehicle = await payload.create({
      collection: 'vehicles',
      data: {
        fuelType: fuelType as (typeof fuelTypes)[number],
        licensePlate,
        make,
        model,
        name,
        owner: user.id,
      },
      draft: false,
      overrideAccess: false,
      user,
    })

    return Response.json({ id: vehicle.id }, { status: 201 })
  } catch {
    return Response.json({ error: 'No se ha podido guardar el vehículo.' }, { status: 400 })
  }
}
