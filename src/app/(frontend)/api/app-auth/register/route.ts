import { appAuth } from '@/lib/app-auth'

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (name.length < 2 || name.length > 100 || !isEmail(email) || password.length < 8) {
      return Response.json(
        { error: 'Introduce un nombre válido, un correo válido y una contraseña de al menos 8 caracteres.' },
        { status: 400 },
      )
    }

    const result = await appAuth.register({ email, name, password })
    await appAuth.setSession(result.token!)

    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json(
      { error: 'No hemos podido crear la cuenta. Comprueba si el correo ya está registrado.' },
      { status: 400 },
    )
  }
}
