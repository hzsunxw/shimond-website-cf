'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, ShoppingCart } from 'lucide-react'
import { useTranslations } from '@/lib/translations'
import { trackAddToInquiry } from '@/lib/gtag'

interface AddToInquiryButtonProps {
  product: {
    id: string
    slug: string
    title: string
    coverImage: string | null
    summary: string | null
  }
  variant?: 'primary' | 'outline' | 'icon'
}

const STORAGE_KEY = 'shimond_inquiry_cart'

export default function AddToInquiryButton({ product, variant = 'primary' }: AddToInquiryButtonProps) {
  const t = useTranslations()
  const [added, setAdded] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const items = JSON.parse(stored)
        setCount(items.length)
        const exists = items.some((item: any) => item.serviceItemId === product.id)
        setAdded(exists)
      } catch {
        setCount(0)
      }
    }
  }, [product.id])

  const handleAdd = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    let items = []
    if (stored) {
      try {
        items = JSON.parse(stored)
      } catch {
        items = []
      }
    }

    const exists = items.some((item: any) => item.serviceItemId === product.id)
    if (exists) {
      // Already added, navigate to inquiry
      window.location.href = '/inquiry'
      return
    }

    items.push({
      serviceItemId: product.id,
      slug: product.slug,
      title: product.title,
      coverImage: product.coverImage,
      summary: product.summary,
      quantity: 1,
      productSpec: '',
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    trackAddToInquiry(product.id, product.title)
    setAdded(true)
    setCount(items.length)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAdd}
        className={`p-2 rounded-full transition-colors ${
          added
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-white/90 text-gray-600 hover:bg-sky-50 hover:text-sky-500'
        }`}
        title={added ? t('inquiry.added') : t('inquiry.add')}
      >
        {added ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </button>
    )
  }

  if (variant === 'outline') {
    return (
      <button
        onClick={handleAdd}
        className={`w-full py-3 rounded-xl font-semibold text-lg transition-all flex items-center justify-center space-x-2 border-2 ${
          added
            ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
            : 'border-sky-500 text-sky-600 hover:bg-sky-50'
        }`}
      >
        {added ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        <span>{added ? t('inquiry.added') : t('inquiry.add')}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all text-center flex items-center justify-center space-x-2 ${
        added
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-sky-500/30'
      }`}
    >
      {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
      <span>{added ? t('inquiry.addedView') : t('inquiry.add')}</span>
    </button>
  )
}
