import { appAuth } from '@/lib/app-auth'

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!isEmail(email) || password.length < 6) {
      return Response.json({ error: 'Revisa el correo y la contraseña.' }, { status: 400 })
    }

    const result = await appAuth.login({ email, password })
    await appAuth.setSession(result.token!)

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'El correo o la contraseña no son correctos.' }, { status: 401 })
  }
}
