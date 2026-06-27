'use client'

import Image from 'next/image'
import SectionHeader from './SectionComponents'
import { useTranslations } from '@/lib/translations'

/* ─── 应用场景 (Application Scenes) ─── */
const sceneItems = [
  { src: '/images/gallery/scenes/table-protector.png', labelKey: 'gallery.scenes.tableProtector', subKey: 'gallery.scenes.tableProtector.sub' },
  { src: '/images/gallery/scenes/pvc-placemat.jpg', labelKey: 'gallery.scenes.placemat', subKey: 'gallery.scenes.placemat.sub' },
  { src: '/images/gallery/scenes/pvc-anti-slip-mat.png', labelKey: 'gallery.scenes.antiSlip', subKey: 'gallery.scenes.antiSlip.sub' },
]

/* ─── 纹路样式 (Pattern Styles) ─── */
const patternItems = [
  { src: '/images/gallery/patterns/grid-sdy801.jpg', labelKey: 'gallery.patterns.grid', code: 'SDY-801#' },
  { src: '/images/gallery/patterns/cloud-sdy802.jpg', labelKey: 'gallery.patterns.cloud', code: 'SDY-802#' },
  { src: '/images/gallery/patterns/bark-sdy803.jpg', labelKey: 'gallery.patterns.bark', code: 'SDY-803#' },
  { src: '/images/gallery/patterns/cookie-sdy822.jpg', labelKey: 'gallery.patterns.cookie', code: 'SDY-822#' },
  { src: '/images/gallery/patterns/dots-sdy829.jpg', labelKey: 'gallery.patterns.dots', code: 'SDY-829#' },
  { src: '/images/gallery/patterns/web-sdy830.jpg', labelKey: 'gallery.patterns.web', code: 'SDY-830#' },
  { src: '/images/gallery/patterns/coin-sdy822.jpg', labelKey: 'gallery.patterns.coin', code: 'SDY-822#' },
  { src: '/images/gallery/patterns/willow-sdy818.jpg', labelKey: 'gallery.patterns.willow', code: 'SDY-818#' },
  { src: '/images/gallery/patterns/chrysanthemum-sdy804.jpg', labelKey: 'gallery.patterns.chrysanthemum', code: 'SDY-804#' },
  { src: '/images/gallery/patterns/diamond-sdy812.jpg', labelKey: 'gallery.patterns.diamond', code: 'SDY-812#' },
]

export default function GallerySection() {
  const t = useTranslations()

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Part 1: 应用场景 ─── */}
        <div className="mb-20">
          <SectionHeader
            badge={t('gallery.scenes.badge')}
            title={t('gallery.scenes.title')}
            subtitle={t('gallery.scenes.subtitle')}
            badgeColor="sky"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {sceneItems.map((item, index) => (
              <figure key={index} className="group cursor-pointer">
                <div className="aspect-square rounded-xl overflow-hidden relative shadow-md">
                  <Image
                    fill
                    src={item.src}
                    alt={t(item.labelKey)}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <span className="text-white font-medium text-sm p-3">{t(item.labelKey)}</span>
                  </div>
                </div>
                <figcaption className="mt-2 text-center">
                  <p className="text-sm font-semibold text-gray-900">{t(item.labelKey)}</p>
                  <p className="text-xs text-gray-500">{t(item.subKey)}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* ─── Part 2: 纹路样式 ─── */}
        <div>
          <SectionHeader
            badge={t('gallery.patterns.badge')}
            title={t('gallery.patterns.title')}
            subtitle={t('gallery.patterns.subtitle')}
            badgeColor="amber"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {patternItems.map((item, index) => (
              <figure key={index} className="group cursor-pointer">
                <div className="aspect-square rounded-xl overflow-hidden relative shadow-md border border-gray-100">
                  <Image
                    fill
                    src={item.src}
                    alt={t(item.labelKey)}
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                    <span className="text-white font-medium text-sm">{t(item.labelKey)}</span>
                    <span className="text-white/80 text-xs font-mono">{item.code}</span>
                  </div>
                </div>
                <figcaption className="mt-2 text-center">
                  <p className="text-sm font-semibold text-gray-900">{t(item.labelKey)}</p>
                  <p className="text-xs text-gray-400 font-mono">{item.code}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
