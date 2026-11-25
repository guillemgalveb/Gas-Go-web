const GOVERNMENT_STATIONS_URL =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'

type GovernmentStation = Record<string, string>

type Station = {
  address: string
  id: string
  latitude: number
  longitude: number
  municipality: string
  name: string
  postalCode: string
  prices: {
    dieselA: number | null
    gasoline95: number | null
    gasoline98: number | null
  }
  schedule: string
}

let cache: { expiresAt: number; stations: Station[]; updatedAt: string } | null = null

function parseNumber(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

export async function GET() {
  try {
    if (cache && cache.expiresAt > Date.now()) {
      return Response.json({
        source: 'Ministerio para la Transición Ecológica y el Reto Demográfico',
        sourceUrl: 'https://geoportalgasolineras.es/geoportal-instalaciones/Inicio',
        stations: cache.stations,
        updatedAt: cache.updatedAt,
      })
    }

    const response = await fetch(GOVERNMENT_STATIONS_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 900 },
    })
    if (!response.ok) throw new Error(`Government API returned ${response.status}`)

    const data = (await response.json()) as {
      Fecha?: string
      ListaEESSPrecio?: GovernmentStation[]
    }

    const stations = (data.ListaEESSPrecio ?? [])
      .map((station) => {
        const latitude = parseNumber(station.Latitud)
        const longitude = parseNumber(station['Longitud (WGS84)'])
        if (latitude === null || longitude === null) return null

        return {
          address: station.Dirección || '',
          id: station.IDEESS,
          latitude,
          longitude,
          municipality: station.Municipio || station.Localidad || '',
          name: station.Rótulo || 'Estación de servicio',
          postalCode: station['C.P.'] || '',
          prices: {
            dieselA: parseNumber(station['Precio Gasoleo A']),
            gasoline95: parseNumber(station['Precio Gasolina 95 E5']),
            gasoline98: parseNumber(station['Precio Gasolina 98 E5']),
          },
          schedule: station.Horario || 'Horario no disponible',
        }
      })
      .filter((station): station is Station => station !== null)

    cache = {
      expiresAt: Date.now() + 15 * 60 * 1000,
      stations,
      updatedAt: data.Fecha || '',
    }

    return Response.json({
      source: 'Ministerio para la Transición Ecológica y el Reto Demográfico',
      sourceUrl: 'https://geoportalgasolineras.es/geoportal-instalaciones/Inicio',
      stations,
      updatedAt: data.Fecha || '',
    })
  } catch {
    return Response.json(
      { error: 'No se han podido consultar las estaciones oficiales en este momento.' },
      { status: 502 },
    )
  }
}
