'use client'

import Image from 'next/image'
import { useTranslations } from '@/lib/translations'

export default function ProductionLineSection() {
  const t = useTranslations()

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image src="/images/about/production-line.jpg" alt="Production Line" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium mb-4">
              {t('about.production.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t('about.production.title')}</h2>
            <p className="text-lg text-gray-600 mb-8">{t('about.production.desc')}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: t('about.production.areaValue'), label: t('about.production.area') },
                { value: t('about.production.outputValue'), label: t('about.production.output') },
                { value: '4', label: t('about.production.units') },
              ].map((metric, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{metric.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{metric.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                t('about.production.unit1'),
                t('about.production.unit2'),
                t('about.production.unit3'),
                t('about.production.unit4'),
              ].map((unit, index) => (
                <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 font-medium text-sm">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
