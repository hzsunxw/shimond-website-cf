'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Trash2, Plus, Minus, ShoppingCart, Package } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

interface InquiryProduct {
  serviceItemId: string
  slug: string
  title: string
  coverImage: string | null
  summary: string | null
  quantity: number
  productSpec: string
}

const STORAGE_KEY = 'shimond_inquiry_cart'

export default function InquiryPage() {
  const t = useTranslations()
  const [items, setItems] = useState<InquiryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const [form, setForm] = useState({
    customerName: '',
    customerCompany: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    customerNote: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        setItems([])
      }
    }
    setLoading(false)
  }, [])

  const saveItems = (newItems: InquiryProduct[]) => {
    setItems(newItems)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
  }

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items]
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta)
    saveItems(newItems)
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    saveItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      alert(t('inquiry.addFirst'))
      return
    }
    if (!form.customerName) {
      alert(t('inquiry.nameRequired'))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            serviceItemId: item.serviceItemId,
            productName: item.title,
            productSpec: item.productSpec || null,
            quantity: item.quantity,
          })),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setOrderNumber(data.orderNumber)
        setSubmitted(true)
        localStorage.removeItem(STORAGE_KEY)
        setItems([])
      } else {
        const err = await res.json()
        alert(err.error || t('contact.error'))
      }
    } catch (err) {
      console.error('Submit inquiry error:', err)
      alert(t('contact.errorRetry'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="page-body pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('inquiry.success')}</h1>
          <p className="text-gray-600 mb-2">{t('inquiry.successMsg')}</p>
          <p className="text-lg font-semibold text-sky-600 mb-8">{t('inquiry.orderNo')}: {orderNumber}</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-sky-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-sky-600 transition-colors"
            >
              <span>{t('inquiry.continue')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <span>{t('home')}</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-body pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-sky-500 transition-colors">{t('home')}</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-sky-500 font-medium">{t('inquiry')}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
          <ShoppingCart className="w-8 h-8 text-sky-500" />
          <span>{t('inquiry')}</span>
          <span className="text-lg font-normal text-gray-500">({items.length})</span>
        </h1>

        {items.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">{t('inquiry.empty')}</p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-sky-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-sky-600 transition-colors"
            >
              <span>{t('inquiry.continue')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Product List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.serviceItemId}
                  className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex gap-4"
                >
                  <img
                    src={item.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">{item.summary || ''}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-gray-600">{t('inquiry.qty')}:</span>
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="px-3 py-1 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="px-3 py-1 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <Input
                      value={item.productSpec}
                      onChange={(e) => {
                        const newItems = [...items]
                        newItems[index].productSpec = e.target.value
                        saveItems(newItems)
                      }}
                      placeholder={t('inquiry.specPlaceholder')}
                      className="text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 self-start"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <Link
                href="/products"
                className="inline-flex items-center space-x-2 text-sky-500 font-medium hover:text-sky-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t('inquiry.addMore')}</span>
              </Link>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t('inquiry.contactInfo')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inquiry.name')}</label>
                    <Input
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder={t('inquiry.namePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inquiry.company')}</label>
                    <Input
                      value={form.customerCompany}
                      onChange={(e) => setForm({ ...form, customerCompany: e.target.value })}
                      placeholder={t('inquiry.companyPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inquiry.phone')}</label>
                    <Input
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      placeholder={t('inquiry.phonePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inquiry.email')}</label>
                    <Input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      placeholder={t('inquiry.emailPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inquiry.address')}</label>
                    <textarea
                      value={form.shippingAddress}
                      onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                      placeholder={t('inquiry.addressPlaceholder')}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inquiry.note')}</label>
                    <textarea
                      value={form.customerNote}
                      onChange={(e) => setForm({ ...form, customerNote: e.target.value })}
                      placeholder={t('inquiry.notePlaceholder')}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting || items.length === 0}>
                    {submitting ? t('inquiry.submitting') : t('inquiry.submit')}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    {t('inquiry.submitNote')}
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
