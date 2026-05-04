'use client'

import { ArrowRight } from 'lucide-react'
import SectionHeader, { ProductCard } from './SectionComponents'
import { useTranslations } from '@/lib/translations'

interface Product {
  id: string
  title: string
  slug: string
  summary: string
  coverImage: string
  tags: string[]
  badge?: string
}

interface ProductsSectionProps {
  products: Product[]
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const t = useTranslations()
  
  const display = products.length > 0 ? products : []

  return (
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('products.badge')}
          title={t('products.title')}
          subtitle={t('products.subtitle')}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {display.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              desc={product.summary}
              image={product.coverImage}
              tags={product.tags}
              href={`/products/${product.slug}`}
              badge={product.badge}
            />
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="/products"
            className="inline-flex items-center space-x-2 text-sky-500 font-semibold hover:text-sky-600 transition-colors"
          >
            <span>{t('viewDetails')}</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
