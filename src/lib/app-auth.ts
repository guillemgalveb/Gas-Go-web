import 'server-only'

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

const APP_USER_COLLECTION = 'users' as const
const SESSION_COOKIE = 'app-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

type Credentials = {
  email: string
  password: string
}

type Registration = Credentials & {
  name: string
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }
}

export function createAppAuth(appUserCollection: typeof APP_USER_COLLECTION) {
  return {
    async clearSession() {
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, '', {
        ...sessionCookieOptions(),
        maxAge: 0,
      })
    },

    async getCurrentUser() {
      const token = (await cookies()).get(SESSION_COOKIE)?.value
      if (!token) return null

      const payload = await getPayloadClient()
      const authHeaders = new Headers({ Authorization: `JWT ${token}` })
      const { user } = await payload.auth({ headers: authHeaders })

      if (!user || user.collection !== appUserCollection) return null
      return user
    },

    async login({ email, password }: Credentials) {
      const payload = await getPayloadClient()
      const result = await payload.login({
        collection: appUserCollection,
        data: { email, password },
        overrideAccess: false,
      })

      if (!result.token || !result.user) {
        throw new Error('No se pudo iniciar la sesión.')
      }

      return result
    },

    async register({ email, name, password }: Registration) {
      const payload = await getPayloadClient()

      await payload.create({
        collection: appUserCollection,
        data: { email, name, password },
        overrideAccess: false,
      })

      return this.login({ email, password })
    },

    async setSession(token: string) {
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions())
    },
  }
}

export const appAuth = createAppAuth(APP_USER_COLLECTION)
