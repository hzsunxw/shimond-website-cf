'use client'

import { Check, TrendingUp } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

export default function AboutSection() {
  const t = useTranslations()
  
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-2 bg-sky-100 text-sky-600 rounded-full text-sm font-medium mb-4">
              {t('about.badge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('about.title')}</h2>
            <p className="text-lg text-gray-600 mb-6">
              {t('about.desc1')}
            </p>
            <p className="text-lg text-gray-600 mb-8">
              {t('about.desc2')}
            </p>

            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex items-center space-x-2 bg-sky-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-sky-600 transition-colors"
              >
                <span>{t('contact')}</span>
                <Check className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&h=600&fit=crop"
                alt="Factory"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
