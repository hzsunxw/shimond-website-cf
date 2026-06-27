'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus, Upload, X, Languages, Sparkles } from 'lucide-react'

interface Product {
  id: string
  title: string
  titleEn: string | null
  titleEs: string | null
  titleAr: string | null
  slug: string
  summary: string | null
  summaryEn: string | null
  summaryEs: string | null
  summaryAr: string | null
  coverImage: string | null
  gallery: string[]
  description: string | null
  descriptionEn: string | null
  descriptionEs: string | null
  descriptionAr: string | null
  features: string[]
  featuresEn: string[]
  featuresEs: string[]
  featuresAr: string[]
  specs: { label: string; value: string }[]
  specsEn: { label: string; value: string }[]
  specsEs: { label: string; value: string }[]
  specsAr: { label: string; value: string }[]
  price: string | null
  priceUnit: string | null
  priceCurrency: string | null
  priceStrategy: string
  sortOrder: number
  status: string
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  seoTitleEn: string | null
  seoDescriptionEn: string | null
  seoKeywordsEn: string | null
  seoTitleEs: string | null
  seoDescriptionEs: string | null
  seoKeywordsEs: string | null
  seoTitleAr: string | null
  seoDescriptionAr: string | null
  seoKeywordsAr: string | null
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  title: '',
  titleEn: '',
  titleEs: '',
  titleAr: '',
  slug: '',
  summary: '',
  summaryEn: '',
  summaryEs: '',
  summaryAr: '',
  coverImage: '',
  gallery: [] as string[],
  description: '',
  descriptionEn: '',
  descriptionEs: '',
  descriptionAr: '',
  features: ['防水防潮', '耐磨损', '易清洁', '环保材料', '色彩丰富', '可定制尺寸'],
  featuresEn: [] as string[],
  featuresEs: [] as string[],
  featuresAr: [] as string[],
  specs: [
    { label: '材质', value: '100% PVC' },
    { label: '厚度', value: '0.6mm - 2.0mm' },
    { label: '宽度', value: '1.37m - 1.5m' },
    { label: '背衬', value: 'TC布 / 针织布 / 无纺布' },
    { label: '颜色', value: '可定制' },
    { label: '最小起订量', value: '1000米' },
    { label: '克重', value: '' },
    { label: '密度', value: '' },
  ],
  specsEn: [] as { label: string; value: string }[],
  specsEs: [] as { label: string; value: string }[],
  specsAr: [] as { label: string; value: string }[],
  price: '',
  priceUnit: '',
  priceCurrency: 'USD',
  priceStrategy: 'CONTACT',
  sortOrder: 0,
  status: 'ACTIVE',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoTitleEn: '',
  seoDescriptionEn: '',
  seoKeywordsEn: '',
  seoTitleEs: '',
  seoDescriptionEs: '',
  seoKeywordsEs: '',
  seoTitleAr: '',
  seoDescriptionAr: '',
  seoKeywordsAr: '',
}

type TabKey = 'basic' | 'content' | 'seo'

const languages = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getLangField(base: string, lang: string) {
  return lang === 'zh' ? base : `${base}${capitalize(lang)}`
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('basic')
  const [activeLang, setActiveLang] = useState('zh')
  const [translating, setTranslating] = useState(false)
  const [generatingSeo, setGeneratingSeo] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (err) {
      console.error('Fetch products error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setActiveLang('zh')
    setActiveTab('basic')
    setShowModal(true)
  }

  const openEdit = (item: Product) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      titleEn: item.titleEn || '',
      titleEs: item.titleEs || '',
      titleAr: item.titleAr || '',
      slug: item.slug,
      summary: item.summary || '',
      summaryEn: item.summaryEn || '',
      summaryEs: item.summaryEs || '',
      summaryAr: item.summaryAr || '',
      coverImage: item.coverImage || '',
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
      description: item.description || '',
      descriptionEn: item.descriptionEn || '',
      descriptionEs: item.descriptionEs || '',
      descriptionAr: item.descriptionAr || '',
        features: Array.isArray(item.features) && item.features.length > 0 ? item.features : emptyForm.features,
        featuresEn: Array.isArray(item.featuresEn) ? item.featuresEn : [],
        featuresEs: Array.isArray(item.featuresEs) ? item.featuresEs : [],
        featuresAr: Array.isArray(item.featuresAr) ? item.featuresAr : [],
        specs: Array.isArray(item.specs) && item.specs.length > 0 ? item.specs : emptyForm.specs,
        specsEn: Array.isArray(item.specsEn) ? item.specsEn : [],
        specsEs: Array.isArray(item.specsEs) ? item.specsEs : [],
        specsAr: Array.isArray(item.specsAr) ? item.specsAr : [],
        price: item.price || '',
      priceUnit: item.priceUnit || '',
      priceCurrency: item.priceCurrency || 'USD',
      priceStrategy: item.priceStrategy || 'CONTACT',
      sortOrder: item.sortOrder,
      status: item.status,
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords: item.seoKeywords || '',
      seoTitleEn: item.seoTitleEn || '',
      seoDescriptionEn: item.seoDescriptionEn || '',
      seoKeywordsEn: item.seoKeywordsEn || '',
      seoTitleEs: item.seoTitleEs || '',
      seoDescriptionEs: item.seoDescriptionEs || '',
      seoKeywordsEs: item.seoKeywordsEs || '',
      seoTitleAr: item.seoTitleAr || '',
      seoDescriptionAr: item.seoDescriptionAr || '',
      seoKeywordsAr: item.seoKeywordsAr || '',
    })
    setActiveLang('zh')
    setActiveTab('basic')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(emptyForm)
    setActiveLang('zh')
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: data })
      if (res.ok) {
        const result = await res.json()
        setForm((prev) => ({ ...prev, coverImage: result.url }))
      } else {
        const err = await res.json()
        alert(err.error || '\u4e0a\u4f20\u5931\u8d25')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('\u4e0a\u4f20\u5931\u8d25')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const data = new FormData()
        data.append('file', files[i])
        const res = await fetch('/api/upload', { method: 'POST', body: data })
        if (res.ok) {
          const result = await res.json()
          newUrls.push(result.url)
        }
      }
      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...newUrls] }))
    } catch (err) {
      console.error('Gallery upload error:', err)
      alert('\u4e0a\u4f20\u5931\u8d25')
    } finally {
      setUploading(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) return
    setSaving(true)
    try {
      const url = '/api/products'
      const method = editing ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        title: form.title,
        titleEn: form.titleEn || null,
        titleEs: form.titleEs || null,
        titleAr: form.titleAr || null,
        slug: form.slug,
        summary: form.summary || null,
        summaryEn: form.summaryEn || null,
        summaryEs: form.summaryEs || null,
        summaryAr: form.summaryAr || null,
        coverImage: form.coverImage || null,
        gallery: form.gallery,
        description: form.description || null,
        descriptionEn: form.descriptionEn || null,
        descriptionEs: form.descriptionEs || null,
        descriptionAr: form.descriptionAr || null,
        features: form.features,
        featuresEn: form.featuresEn,
        featuresEs: form.featuresEs,
        featuresAr: form.featuresAr,
        specs: form.specs,
        specsEn: form.specsEn,
        specsEs: form.specsEs,
        specsAr: form.specsAr,
        price: form.price ? parseFloat(form.price) : null,
        priceUnit: form.priceUnit || null,
        priceCurrency: form.priceCurrency || 'USD',
        priceStrategy: form.priceStrategy,
        sortOrder: form.sortOrder,
        status: form.status,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        seoKeywords: form.seoKeywords || null,
        seoTitleEn: form.seoTitleEn || null,
        seoDescriptionEn: form.seoDescriptionEn || null,
        seoKeywordsEn: form.seoKeywordsEn || null,
        seoTitleEs: form.seoTitleEs || null,
        seoDescriptionEs: form.seoDescriptionEs || null,
        seoKeywordsEs: form.seoKeywordsEs || null,
        seoTitleAr: form.seoTitleAr || null,
        seoDescriptionAr: form.seoDescriptionAr || null,
        seoKeywordsAr: form.seoKeywordsAr || null,
      }
      if (editing) {
        body.id = editing.id
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        closeModal()
        fetchProducts()
      } else {
        const err = await res.json()
        alert(err.error || '\u64cd\u4f5c\u5931\u8d25')
      }
    } catch (err) {
      console.error('Save product error:', err)
      alert('\u4fdd\u5b58\u5931\u8d25')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u4e2a\u4ea7\u54c1\u5417\uff1f')) return
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchProducts()
      } else {
        const err = await res.json()
        alert(err.error || '\u5220\u9664\u5931\u8d25')
      }
    } catch (err) {
      console.error('Delete product error:', err)
      alert('\u5220\u9664\u5931\u8d25')
    }
  }

  const getLangValue = (base: string, lang: string) => {
    const field = getLangField(base, lang)
    return ((form as unknown) as Record<string, string>)[field] || ''
  }

  const setLangValue = (base: string, lang: string, value: string) => {
    const field = getLangField(base, lang)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Get the features array for the active language
  const getLangFeatures = (): string[] => {
    const field = `features${activeLang === 'zh' ? '' : capitalize(activeLang)}`
    const arr = (form as unknown as Record<string, string[]>)[field]
    return Array.isArray(arr) ? arr : []
  }

  // Get the specs array for the active language
  const getLangSpecs = (): { label: string; value: string }[] => {
    const field = `specs${activeLang === 'zh' ? '' : capitalize(activeLang)}`
    const arr = (form as unknown as Record<string, { label: string; value: string }[]>)[field]
    return Array.isArray(arr) ? arr : []
  }

  // Set features array for the active language
  const setLangFeatures = (next: string[]) => {
    const field = `features${activeLang === 'zh' ? '' : capitalize(activeLang)}`
    setForm((prev) => ({ ...prev, [field]: next }))
  }

  // Set specs array for the active language
  const setLangSpecs = (next: { label: string; value: string }[]) => {
    const field = `specs${activeLang === 'zh' ? '' : capitalize(activeLang)}`
    setForm((prev) => ({ ...prev, [field]: next }))
  }

  const handleAiTranslate = async () => {
    const targetLangs = languages.filter((l) => l.code !== activeLang).map((l) => l.code)
    const fields: Record<string, string> = {}
    const fieldMap: Record<string, string> = {
      title: getLangField('title', activeLang),
      summary: getLangField('summary', activeLang),
      description: getLangField('description', activeLang),
      seoTitle: getLangField('seoTitle', activeLang),
      seoDescription: getLangField('seoDescription', activeLang),
      seoKeywords: getLangField('seoKeywords', activeLang),
    }

    for (const [key, formKey] of Object.entries(fieldMap)) {
      const value = ((form as unknown) as Record<string, string>)[formKey]
      if (value?.trim()) {
        fields[key] = value
      }
    }

    // Collect features (comma-separated) for the active language
    const featuresField = `features${activeLang === 'zh' ? '' : capitalize(activeLang)}`
    const featuresArr = (form as unknown as Record<string, string[]>)[featuresField]
    if (Array.isArray(featuresArr) && featuresArr.length > 0) {
      fields.features = featuresArr.join(', ')
    }

    // Collect specs (label: value per line) for the active language
    const specsField = `specs${activeLang === 'zh' ? '' : capitalize(activeLang)}`
    const specsArr = (form as unknown as Record<string, { label: string; value: string }[]>)[specsField]
    if (Array.isArray(specsArr) && specsArr.length > 0) {
      fields.specs = specsArr.map((s) => `${s.label}: ${s.value}`).join('\n')
    }

    if (Object.keys(fields).length === 0) {
      alert('当前语言没有可翻译的内容，请先填写字段')
      return
    }

    if (!confirm(`将以「${languages.find((l) => l.code === activeLang)?.label}」为基准，翻译到其余 ${targetLangs.length} 种语言。现有内容将被覆盖，是否继续？`)) {
      return
    }

    setTranslating(true)
    try {
      const res = await fetch('/api/ai/translate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang: activeLang,
          targetLangs,
          fields,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        alert(result.error || result.detail || 'AI 翻译失败')
        return
      }

      const newForm = { ...form }
      const formRec = (newForm as unknown) as Record<string, unknown>
      for (const lang of targetLangs) {
        const trans = result.translations[lang]
        if (!trans) continue
        const suffix = lang === 'zh' ? '' : capitalize(lang)
        if (trans.title) formRec[`title${suffix}`] = trans.title
        if (trans.summary) formRec[`summary${suffix}`] = trans.summary
        if (trans.description) formRec[`description${suffix}`] = trans.description
        if (trans.seoTitle) formRec[`seoTitle${suffix}`] = trans.seoTitle
        if (trans.seoDescription) formRec[`seoDescription${suffix}`] = trans.seoDescription
        if (trans.seoKeywords) formRec[`seoKeywords${suffix}`] = trans.seoKeywords
        // Parse translated features (comma-separated → array)
        if (trans.features) {
          formRec[`features${suffix}`] = trans.features.split(',').map((f: string) => f.trim()).filter(Boolean)
        }
        // Parse translated specs ("Label: Value" per line → array of {label, value})
        if (trans.specs) {
          formRec[`specs${suffix}`] = trans.specs.split('\n').map((line: string) => {
            const idx = line.indexOf(': ')
            if (idx === -1) return { label: line.trim(), value: '' }
            return { label: line.slice(0, idx).trim(), value: line.slice(idx + 2).trim() }
          }).filter((s: { label: string }) => s.label)
        }
      }
      setForm(newForm)
      alert('AI 翻译完成！已填充到其他语言，请检查。')
    } catch (err) {
      console.error('AI translate error:', err)
      alert('AI 翻译失败')
    } finally {
      setTranslating(false)
    }
  }

  const handleAiGenerateSeo = async () => {
    const title = getLangValue('title', activeLang)
    const summary = getLangValue('summary', activeLang)
    const description = getLangValue('description', activeLang)

    if (!title.trim()) {
      alert('请先在「基本信息」标签页填写标题，才能生成 SEO 内容')
      return
    }

    setGeneratingSeo(true)
    try {
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary: summary || undefined,
          description: description || undefined,
          lang: activeLang,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        console.error('[AI Generate SEO] server error:', result.error, 'raw:', result.raw)
        alert(result.error || result.detail || 'AI 生成失败')
        return
      }

      setForm((prev) => ({
        ...prev,
        [getLangField('seoTitle', activeLang)]: result.seoTitle || '',
        [getLangField('seoDescription', activeLang)]: result.seoDescription || '',
        [getLangField('seoKeywords', activeLang)]: result.seoKeywords || '',
      }))
      alert('AI SEO 生成完成！')
    } catch (err) {
      console.error('AI generate SEO error:', err)
      alert('AI 生成失败')
    } finally {
      setGeneratingSeo(false)
    }
  }

  const renderPrice = (item: Product) => {
    if (item.priceStrategy === 'CONTACT') return '\u8054\u7cfb\u8be2\u4ef7'
    if (item.price) {
      return `${item.price} ${item.priceCurrency || 'USD'}`
    }
    return '--'
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'basic', label: '\u57fa\u672c\u4fe1\u606f' },
    { key: 'content', label: '\u8be6\u7ec6\u5185\u5bb9' },
    { key: 'seo', label: 'SEO' },
  ]

  const inputCls =
    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
  const selectCls =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

  return (
    <>
      <header className='bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>{'\u4ea7\u54c1\u7ba1\u7406'}</h2>
        <Button onClick={openCreate}>
          <Plus className='w-4 h-4 mr-1' />
          {'\u65b0\u5efa\u4ea7\u54c1'}
        </Button>
      </header>

      <div className='p-8'>
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u5c01\u9762'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u6807\u9898'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Slug</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u4ef7\u683c'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u72b6\u6001'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u6392\u5e8f'}</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{'\u64cd\u4f5c'}</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {products.map((item) => (
                <tr key={item.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className='w-16 h-10 object-cover rounded border border-gray-200' />
                    ) : (
                      <span className='text-gray-400'>--</span>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{item.title}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{item.slug}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{renderPrice(item)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.status === 'ACTIVE' ? '\u5df2\u53d1\u5e03' : '\u672a\u53d1\u5e03'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{item.sortOrder}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm space-x-2'>
                    <button onClick={() => openEdit(item)} className='text-sky-600 hover:text-sky-800 font-medium inline-flex items-center gap-1'>
                      <Pencil className='w-3 h-3' />
                      {'\u7f16\u8f91'}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className='text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1'>
                      <Trash2 className='w-3 h-3' />
                      {'\u5220\u9664'}
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className='px-6 py-4 text-center text-sm text-gray-500'>{'\u6682\u65e0\u6570\u636e\uff0c\u70b9\u51fb\u53f3\u4e0a\u89d2\u65b0\u5efa\u4ea7\u54c1\u6dfb\u52a0'}</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className='px-6 py-4 text-center text-sm text-gray-500'>{'\u52a0\u8f7d\u4e2d...'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {editing ? '\u7f16\u8f91\u4ea7\u54c1' : '\u65b0\u5efa\u4ea7\u54c1'}
              </h3>
              <button onClick={closeModal} className='text-gray-400 hover:text-gray-600 text-2xl leading-none'>
                &times;
              </button>
            </div>

            <div className='flex items-center justify-between px-6 py-2 bg-gray-50 border-b border-gray-200'>
              <div className='flex items-center gap-1'>
                <Languages className='w-4 h-4 text-gray-400 mr-1' />
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type='button'
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeLang === lang.code
                        ? 'bg-white text-sky-600 shadow-sm border border-gray-200 font-medium'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
              <button
                type='button'
                onClick={handleAiTranslate}
                disabled={translating}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-purple-200'
              >
                <Sparkles className='w-3.5 h-3.5' />
                {translating ? 'AI 翻译中...' : '🤖 AI 翻译到其他语言'}
              </button>
            </div>

            <div className='flex border-b border-gray-200'>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className={`px-6 py-4 space-y-4 ${activeLang === 'ar' ? 'text-right' : ''}`}
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
            >
              {activeTab === 'basic' && (
                <>
                  {/* 封面图片 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{'封面图片'}</label>
                    {form.coverImage && (
                      <div className='mb-2 relative inline-block'>
                        <img src={form.coverImage} alt='cover' className='w-48 h-32 object-cover rounded-lg border border-gray-200' />
                        <button
                          type='button'
                          onClick={() => setForm({ ...form, coverImage: '' })}
                          className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600'
                        >
                          &times;
                        </button>
                      </div>
                    )}
                    <label className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload className='w-4 h-4' />
                      {uploading ? '上传中...' : '选择图片'}
                      <input type='file' accept='image/*' className='hidden' onChange={handleCoverUpload} disabled={uploading} />
                    </label>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {activeLang === 'zh' ? '标题' : activeLang === 'en' ? 'Title' : activeLang === 'es' ? 'Título' : 'العنوان'}
                      {activeLang === 'zh' ? ' *' : ''}
                    </label>
                    <Input
                      value={getLangValue('title', activeLang)}
                      onChange={(e) => setLangValue('title', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? '请输入产品标题'
                          : activeLang === 'en'
                            ? 'Enter product title'
                            : activeLang === 'es'
                              ? 'Ingrese el título del producto'
                              : 'أدخل عنوان المنتج'
                      }
                      required={activeLang === 'zh'}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Slug *</label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder='URL 标识，如: hydraulic-press'
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>{'状态'}</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className={selectCls}
                      >
                        <option value='ACTIVE'>{'已发布'}</option>
                        <option value='INACTIVE'>{'未发布'}</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>{'排序'}</label>
                      <Input
                        type='number'
                        value={form.sortOrder}
                        onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {activeLang === 'zh' ? '摘要' : activeLang === 'en' ? 'Summary' : activeLang === 'es' ? 'Resumen' : 'الملخص'}
                    </label>
                    <textarea
                      value={getLangValue('summary', activeLang)}
                      onChange={(e) => setLangValue('summary', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? '简短描述'
                          : activeLang === 'en'
                            ? 'Short description'
                            : activeLang === 'es'
                              ? 'Descripción breve'
                              : 'وصف مختصر'
                      }
                      rows={3}
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              {activeTab === 'content' && (
                <>
                  {/* Features / 特性标签 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {activeLang === 'zh' ? '产品特性' : activeLang === 'en' ? 'Features' : activeLang === 'es' ? 'Características' : 'الميزات'}
                    </label>
                    <div className='flex flex-wrap gap-2 mb-2'>
                      {getLangFeatures().map((feature, index) => (
                        <span key={index} className='inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm border border-sky-200'>
                          {feature}
                          <button
                            type='button'
                            onClick={() => {
                              const next = [...getLangFeatures()]
                              next.splice(index, 1)
                              setLangFeatures(next)
                            }}
                            className='text-sky-400 hover:text-sky-600 ml-1'
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className='flex gap-2'>
                      <input
                        className={inputCls}
                        placeholder={
                          activeLang === 'zh' ? '输入特性后按回车添加' : activeLang === 'en' ? 'Type feature and press Enter' : activeLang === 'es' ? 'Escriba y presione Enter' : 'اكتب الميزة ثم اضغط Enter'
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = (e.target as HTMLInputElement).value.trim()
                            if (val) {
                              setLangFeatures([...getLangFeatures(), val])
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Specs / 规格参数 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {activeLang === 'zh' ? '技术规格' : activeLang === 'en' ? 'Technical Specifications' : activeLang === 'es' ? 'Especificaciones Técnicas' : 'المواصفات الفنية'}
                    </label>
                    <div className='space-y-2'>
                      {getLangSpecs().map((spec, index) => {
                        const currentSpecs = getLangSpecs()
                        return (
                        <div key={index} className='flex gap-2 items-start'>
                          <input
                            className={`${inputCls} flex-1`}
                            value={spec.label}
                            onChange={(e) => {
                              const next = [...currentSpecs]
                              next[index] = { ...next[index], label: e.target.value }
                              setLangSpecs(next)
                            }}
                            placeholder={activeLang === 'zh' ? '参数名' : activeLang === 'en' ? 'Parameter' : 'Parámetro'}
                          />
                          <input
                            className={`${inputCls} flex-1`}
                            value={spec.value}
                            onChange={(e) => {
                              const next = [...currentSpecs]
                              next[index] = { ...next[index], value: e.target.value }
                              setLangSpecs(next)
                            }}
                            placeholder={activeLang === 'zh' ? '参数值' : activeLang === 'en' ? 'Value' : 'Valor'}
                          />
                          <button
                            type='button'
                            onClick={() => {
                              setLangSpecs(currentSpecs.filter((_, i) => i !== index))
                            }}
                            className='px-2 py-2 text-red-400 hover:text-red-600'
                          >
                            &times;
                          </button>
                        </div>
                        )
                      })}
                      <button
                        type='button'
                        onClick={() => setLangSpecs([...getLangSpecs(), { label: '', value: '' }])}
                        className='text-sm text-sky-500 hover:text-sky-600 font-medium'
                      >
                        + {activeLang === 'zh' ? '添加参数' : activeLang === 'en' ? 'Add Parameter' : 'Añadir Parámetro'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {activeLang === 'zh'
                        ? '详细描述'
                        : activeLang === 'en'
                          ? 'Detailed Description'
                          : activeLang === 'es'
                            ? 'Descripción Detallada'
                            : 'الوصف التفصيلي'}
                    </label>
                    <textarea
                      value={getLangValue('description', activeLang)}
                      onChange={(e) => setLangValue('description', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? '产品详细介绍'
                          : activeLang === 'en'
                            ? 'Detailed product description'
                            : activeLang === 'es'
                              ? 'Descripción detallada del producto'
                              : 'وصف تفصيلي للمنتج'
                      }
                      rows={12}
                      className={inputCls}
                    />
                  </div>
                </>
              )}

              {activeTab === 'seo' && (
                <>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-sm text-gray-500'>
                      {activeLang === 'zh'
                        ? '当前语言：中文'
                        : activeLang === 'en'
                          ? 'Current language: English'
                          : activeLang === 'es'
                            ? 'Idioma actual: Español'
                            : 'اللغة الحالية: العربية'}
                    </p>
                    <button
                      type='button'
                      onClick={handleAiGenerateSeo}
                      disabled={generatingSeo}
                      className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-emerald-200'
                    >
                      <Sparkles className='w-3.5 h-3.5' />
                      {generatingSeo ? 'AI 生成中...' : '✨ AI 自动生成 SEO'}
                    </button>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Title</label>
                    <Input
                      value={getLangValue('seoTitle', activeLang)}
                      onChange={(e) => setLangValue('seoTitle', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? 'SEO 标题'
                          : activeLang === 'en'
                            ? 'SEO Title'
                            : activeLang === 'es'
                              ? 'Título SEO'
                              : 'عنوان SEO'
                      }
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Description</label>
                    <textarea
                      value={getLangValue('seoDescription', activeLang)}
                      onChange={(e) => setLangValue('seoDescription', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? 'SEO 描述'
                          : activeLang === 'en'
                            ? 'SEO Description'
                            : activeLang === 'es'
                              ? 'Descripción SEO'
                              : 'وصف SEO'
                      }
                      rows={4}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>SEO Keywords</label>
                    <Input
                      value={getLangValue('seoKeywords', activeLang)}
                      onChange={(e) => setLangValue('seoKeywords', activeLang, e.target.value)}
                      placeholder={
                        activeLang === 'zh'
                          ? '关键词，逗号分隔'
                          : activeLang === 'en'
                            ? 'Keywords, comma separated'
                            : activeLang === 'es'
                              ? 'Palabras clave, separadas por comas'
                              : 'الكلمات الرئيسية، مفصولة بفواصل'
                      }
                    />
                  </div>
                </>
              )}

              <div className='pt-4 flex justify-end space-x-3 border-t border-gray-200'>
                <Button type='button' variant='outline' onClick={closeModal}>
                  {'\u53d6\u6d88'}
                </Button>
                <Button type='submit' disabled={saving}>
                  {saving ? '\u4fdd\u5b58\u4e2d...' : '\u4fdd\u5b58'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
