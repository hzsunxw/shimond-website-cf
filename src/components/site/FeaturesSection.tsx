'use client'

import { Factory, Award, Truck, Headphones } from 'lucide-react'
import SectionHeader, { FeatureCard } from './SectionComponents'
import { useTranslations } from '@/lib/translations'

export default function FeaturesSection() {
  const t = useTranslations()
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge={t('features.badge')} title={t('features.title')} badgeColor="emerald" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Factory className="w-7 h-7" />}
            title={t('features.quality')}
            desc={t('features.quality.desc')}
            color="sky"
          />
          <FeatureCard
            icon={<Award className="w-7 h-7" />}
            title={t('features.custom')}
            desc={t('features.custom.desc')}
            color="emerald"
          />
          <FeatureCard
            icon={<Truck className="w-7 h-7" />}
            title={t('features.delivery')}
            desc={t('features.delivery.desc')}
            color="amber"
          />
          <FeatureCard
            icon={<Headphones className="w-7 h-7" />}
            title={t('features.support')}
            desc={t('features.support.desc')}
            color="purple"
          />
        </div>
      </div>
    </section>
  )
}
