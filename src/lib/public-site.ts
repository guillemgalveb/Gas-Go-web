export const corporateOnly = process.env.NEXT_PUBLIC_CORPORATE_ONLY === 'true'

export function publicAsset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`
}
