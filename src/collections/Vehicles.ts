import type { CollectionConfig } from 'payload'
import { appUserOrAdminOwnerAccess, isAppUser, protectOwnerField } from './access/appUserOwner'

export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
  access: {
    create: isAppUser,
    delete: appUserOrAdminOwnerAccess,
    read: appUserOrAdminOwnerAccess,
    update: appUserOrAdminOwnerAccess,
  },
  admin: {
    group: 'Operaciones Gas&Go',
    useAsTitle: 'licensePlate',
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user?.collection === 'users') {
          return { ...data, owner: req.user.id }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        update: protectOwnerField,
      },
    },
    { name: 'name', type: 'text', required: true },
    { name: 'licensePlate', type: 'text', required: true, index: true },
    { name: 'make', type: 'text', required: true },
    { name: 'model', type: 'text', required: true },
    {
      name: 'fuelType',
      type: 'select',
      required: true,
      options: [
        { label: 'Gasolina', value: 'gasoline' },
        { label: 'Diésel', value: 'diesel' },
        { label: 'Híbrido', value: 'hybrid' },
        { label: 'Eléctrico', value: 'electric' },
      ],
    },
  ],
  versions: false,
}
