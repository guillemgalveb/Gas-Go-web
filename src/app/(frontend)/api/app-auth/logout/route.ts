import { appAuth } from '@/lib/app-auth'

export async function POST() {
  await appAuth.clearSession()
  return Response.json({ ok: true })
}
