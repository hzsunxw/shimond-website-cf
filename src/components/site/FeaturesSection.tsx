'use client'

import { FlaskConical, Leaf, Cog, BarChart3 } from 'lucide-react'
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
            icon={<FlaskConical className="w-7 h-7" />}
            title={t('features.tech')}
            desc={t('features.tech.desc')}
            color="sky"
          />
          <FeatureCard
            icon={<Leaf className="w-7 h-7" />}
            title={t('features.eco')}
            desc={t('features.eco.desc')}
            color="emerald"
          />
          <FeatureCard
            icon={<Cog className="w-7 h-7" />}
            title={t('features.smart')}
            desc={t('features.smart.desc')}
            color="amber"
          />
          <FeatureCard
            icon={<BarChart3 className="w-7 h-7" />}
            title={t('features.capacity')}
            desc={t('features.capacity.desc')}
            color="purple"
          />
        </div>
      </div>
    </section>
  )
}
