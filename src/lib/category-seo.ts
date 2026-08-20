/**
 * Keyword-optimized SEO metadata for product category pages (English).
 *
 * Based on Google search volume research:
 * - PVC table protector: 9,900/mo, CPC $1.78
 * - PVC foam board: 3,600/mo
 * - PVC placemat: 260/mo
 * - PVC foam manufacturer: 40/mo, CPC $5.00 (high B2B value)
 *
 * Non-English locales fall back to CMS defaults via generateMetadata callers.
 */

export interface CategorySeoData {
  title: string
  description: string
  keywords: string
}

export const CATEGORY_SEO: Record<string, CategorySeoData> = {
  'table-protector': {
    title: 'Clear PVC Table Protector Manufacturer | Wholesale',
    description:
      'Professional manufacturer of clear PVC table protectors, plastic tablecloth covers, and vinyl table protectors. Wholesale pricing, OEM/ODM supported. 15+ years experience.',
    keywords:
      'clear plastic table protector, pvc table protector, clear vinyl tablecloth protector, table protector manufacturer, table protector wholesale',
  },
  'pvc-foam': {
    title: 'PVC Foam Board Manufacturer & Supplier',
    description:
      'Leading PVC foam board manufacturer supplying foamex boards, expanded PVC sheets, and PVC foam core boards. Factory direct pricing, ISO certified, OEM/ODM supported.',
    keywords:
      'pvc foam board, pvc foam manufacturer, pvc board supplier, expanded pvc sheet, foamex board, pvc foam sheet',
  },
  'pvc-mats': {
    title: 'PVC Placemat & Table Mat Manufacturer',
    description:
      'Wholesale PVC placemats, table mats, and anti-slip mats. Woven, round, and transparent designs available. Factory direct from Shimond, OEM/ODM supported.',
    keywords:
      'pvc placemat, pvc table mat, pvc table placemats, woven pvc placemats, pvc mats manufacturer',
  },
  'soundproof-cotton': {
    title: 'PVC Soundproof Cotton Supplier',
    description:
      'Professional PVC soundproof cotton and acoustic insulation material supplier. Factory direct pricing, OEM/ODM supported. 15+ years manufacturing experience.',
    keywords:
      'pvc soundproof cotton, soundproof cotton supplier, acoustic insulation material',
  },
}

export const PRODUCTS_PAGE_SEO: CategorySeoData = {
  title: 'PVC Products Manufacturer | Foam Board, Table Protector, Mats',
  description:
    'Professional PVC products manufacturer since 2010. PVC foam boards, table protectors, placemats, and soundproof materials. ISO certified, OEM/ODM supported.',
  keywords:
    'pvc products manufacturer, pvc foam board, table protector, pvc placemat, pvc foam manufacturer',
}
