'use client'

import { useState } from 'react'
import { getTranslation } from '@/lib/dictionary'

interface ContactFormProps {
  locale: string
}

export default function ContactForm({ locale }: ContactFormProps) {
  const t = (key: string) => getTranslation(locale, key)

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || t('contact.errorRetry'))
      }
    } catch {
      setError(t('contact.errorRetry'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="contact-form">
        <div className="form-success is-visible">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <div>
            <strong>{t('contact.sent')}</strong>
            <div className="form-success-text">{t('contact.thanks')}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-success is-visible" style={{ background: '#fff1f2', borderColor: 'var(--c-rose)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ color: 'var(--c-rose)' }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <div>
            <strong>{t('contact.error')}</strong>
            <div className="form-success-text">{error}</div>
          </div>
        </div>
      )}

      <div className="form-row form-row--2">
        <div className="field">
          <label htmlFor="cf3-name">{t('contact.name')}</label>
          <input
            type="text"
            id="cf3-name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('contact.namePlaceholder')}
          />
        </div>
        <div className="field">
          <label htmlFor="cf3-company">{t('contact.company')}</label>
          <input
            type="text"
            id="cf3-company"
            name="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder={t('contact.companyPlaceholder')}
          />
        </div>
      </div>

      <div className="form-row form-row--2" style={{ marginTop: '1rem' }}>
        <div className="field">
          <label htmlFor="cf3-email">{t('contact.email')}</label>
          <input
            type="email"
            id="cf3-email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
        <div className="field">
          <label htmlFor="cf3-product">{t('contact.product')}</label>
          <select
            id="cf3-product"
            name="product"
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
          >
            <option value="">{t('contact.selectProduct')}</option>
            <option value="pvc-leather">{t('product.pvcLeather')}</option>
            <option value="pvc-mats">{t('product.pvcMats')}</option>
            <option value="table-protector">{t('product.tableProtector')}</option>
            <option value="other">{t('product.other')}</option>
          </select>
        </div>
      </div>

      <div className="field" style={{ marginTop: '1rem' }}>
        <label htmlFor="cf3-message">{t('contact.message')}</label>
        <textarea
          id="cf3-message"
          name="message"
          rows={4}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder={t('contact.messagePlaceholder')}
        />
      </div>

      <button type="submit" className="btn btn--gradient btn--block btn--lg" style={{ marginTop: '1.25rem' }} disabled={submitting}>
        <span>{submitting ? t('contact.sending') : t('sendMessage')}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </form>
  )
}
