export interface ProductCategoryInfo {
  slug: string        // URL slug: 'pvc-foam'
  enumValue: string   // Prisma enum: 'PVC_FOAM'
  labelKey: string    // dictionary key: 'product.category.pvcFoam'
}

export const PRODUCT_CATEGORIES: ProductCategoryInfo[] = [
  { slug: 'pvc-foam', enumValue: 'PVC_FOAM', labelKey: 'product.category.pvcFoam' },
  { slug: 'pvc-mats', enumValue: 'PVC_MATS', labelKey: 'product.category.pvcMats' },
  { slug: 'table-protector', enumValue: 'TABLE_PROTECTOR', labelKey: 'product.category.tableProtector' },
  { slug: 'soundproof-cotton', enumValue: 'SOUNDCOTTON', labelKey: 'product.category.soundproofCotton' },
]

export function getCategoryBySlug(slug: string): ProductCategoryInfo | undefined {
  return PRODUCT_CATEGORIES.find(c => c.slug === slug)
}

export function isValidCategorySlug(slug: string): boolean {
  return PRODUCT_CATEGORIES.some(c => c.slug === slug)
}

// Map Prisma enum value to category info
export function getCategoryByEnum(enumValue: string): ProductCategoryInfo | undefined {
  return PRODUCT_CATEGORIES.find(c => c.enumValue === enumValue)
}
