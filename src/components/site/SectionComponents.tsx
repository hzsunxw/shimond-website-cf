'use client'

import { ArrowRight, ShieldCheck, Factory, Award, Truck, Headphones } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

interface SectionHeaderProps {
  badge: string
  title: string
  subtitle?: string
  badgeColor?: 'sky' | 'emerald' | 'amber' | 'rose'
}

export default function SectionHeader({ badge, title, subtitle, badgeColor = 'sky' }: SectionHeaderProps) {
  const colorMap = {
    sky: 'bg-sky-100 text-sky-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
  }

  return (
    <div className="text-center mb-16">
      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${colorMap[badgeColor]}`}>
        {badge}
      </span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
      {subtitle && <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>}
    </div>
  )
}

export function FeatureCard({
  icon,
  title,
  desc,
  color = 'sky',
}: {
  icon: React.ReactNode
  title: string
  desc: string
  color?: 'sky' | 'emerald' | 'amber' | 'purple'
}) {
  const colorMap = {
    sky: 'bg-sky-50 text-sky-500',
    emerald: 'bg-emerald-50 text-emerald-500',
    amber: 'bg-amber-50 text-amber-500',
    purple: 'bg-purple-50 text-purple-500',
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorMap[color]}`}>{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  )
}

export function ProductCard({
  title,
  desc,
  image,
  tags,
  href,
  badge,
}: {
  title: string
  desc: string
  image: string
  tags: string[]
  href: string
  badge?: string
}) {
  const t = useTranslations()
  
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden group">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <a
            href={href}
            className="w-full bg-white text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
          >
            <span>{t('viewDetails')}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        {badge && (
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                badge === '热销' || badge === 'Hot' ? 'bg-sky-500' : 'bg-emerald-500'
              }`}
            >
              {badge}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{desc}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sky-500 font-bold text-lg">{t('inquiry')}</span>
          <a
            href="/contact"
            className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
