import type { Access, CollectionConfig } from 'payload'
import { appUserOrAdminOwnerAccess } from './access/appUserOwner'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const WalletEntries: CollectionConfig = {
  slug: 'wallet-entries',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: appUserOrAdminOwnerAccess,
    update: isAdmin,
  },
  admin: { group: 'Operaciones Gas&Go', useAsTitle: 'description' },
  fields: [
    { name: 'owner', type: 'relationship', relationTo: 'users', required: true, index: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Puntos conseguidos', value: 'earned' },
        { label: 'Puntos canjeados', value: 'redeemed' },
        { label: 'Ajuste', value: 'adjustment' },
      ],
    },
    { name: 'points', type: 'number', required: true },
    { name: 'description', type: 'text', required: true },
    { name: 'occurredAt', type: 'date', required: true, index: true },
    { name: 'refuel', type: 'relationship', relationTo: 'refuels' },
  ],
  versions: false,
}
