import type { Access, CollectionConfig } from 'payload'

const isCurrentUser: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false

  return {
    id: {
      equals: req.user.id,
    },
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: () => true,
    delete: () => false,
    read: isCurrentUser,
    update: isCurrentUser,
  },
  admin: {
    hidden: true,
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
  versions: false,
}
