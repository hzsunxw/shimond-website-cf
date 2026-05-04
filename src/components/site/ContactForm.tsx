'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

export default function ContactForm() {
  const t = useTranslations()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    product: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const err = await res.json()
        alert(err.error || t('contact.error'))
      }
    } catch (err) {
      console.error('Submit contact error:', err)
      alert(t('contact.errorRetry'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('contact.sent')}</h3>
        <p className="text-gray-600">{t('contact.thanks')}</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.name')} *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
              placeholder={t('contact.namePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.email')} *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.company')}</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
            placeholder={t('contact.companyPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.product')}</label>
          <select
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
          >
            <option value="">{t('contact.selectProduct')}</option>
            <option value="pvc-leather">{t('product.pvcLeather')}</option>
            <option value="pvc-mats">{t('product.pvcMats')}</option>
            <option value="table-protector">{t('product.tableProtector')}</option>
            <option value="other">{t('product.other')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.message')} *</label>
          <textarea
            rows={4}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all resize-none"
            placeholder={t('contact.messagePlaceholder')}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-sky-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          <span>{submitting ? t('contact.sending') : t('sendMessage')}</span>
        </button>
      </form>
    </div>
  )
}
