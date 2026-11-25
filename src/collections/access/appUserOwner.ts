import type { Access, FieldAccess } from 'payload'

export const isAppUser: Access = ({ req }) => req.user?.collection === 'users'

export const appUserOrAdminOwnerAccess: Access = ({ req }) => {
  if (req.user?.collection === 'admins') return true
  if (req.user?.collection !== 'users') return false

  return {
    owner: {
      equals: req.user.id,
    },
  }
}

export const protectOwnerField: FieldAccess = ({ req }) => req.user?.collection === 'admins'
