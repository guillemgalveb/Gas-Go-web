import type { Access, CollectionConfig } from 'payload'
import { appUserOrAdminOwnerAccess } from './access/appUserOwner'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Refuels: CollectionConfig = {
  slug: 'refuels',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: appUserOrAdminOwnerAccess,
    update: isAdmin,
  },
  admin: { group: 'Operaciones Gas&Go', useAsTitle: 'station' },
  fields: [
    { name: 'owner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'vehicle', type: 'relationship', relationTo: 'vehicles' },
    { name: 'station', type: 'text', required: true },
    { name: 'occurredAt', type: 'date', required: true, index: true },
    {
      name: 'energyType',
      type: 'select',
      required: true,
      options: [
        { label: 'Gasolina', value: 'gasoline' },
        { label: 'Diésel', value: 'diesel' },
        { label: 'Electricidad', value: 'electric' },
      ],
    },
    { name: 'quantity', type: 'number', required: true, min: 0 },
    { name: 'totalAmount', type: 'number', required: true, min: 0 },
    { name: 'goPoints', type: 'number', required: true, min: 0 },
  ],
  versions: false,
}
